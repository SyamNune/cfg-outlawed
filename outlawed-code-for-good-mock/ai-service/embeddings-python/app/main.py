"""Local knowledge-retrieval microservice for the OutLawed hackathon."""

import hashlib
import os
import re
import uuid
import certifi
from contextlib import asynccontextmanager
from pathlib import Path

import torch
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pypdf import PdfReader
from pymongo import MongoClient
from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer

SERVICE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(SERVICE_DIR / ".env")

MODEL_NAME = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "outlawed")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "legal_chunks")
SOURCE_PDF_DIR = (SERVICE_DIR / os.getenv("SOURCE_PDF_DIR", "../data/source-pdfs")).resolve()
VECTOR_DIMENSIONS = 1024
CHUNK_SIZE, CHUNK_OVERLAP = 2800, 350

embedding_model = None
active_device = None
mongo_client = None
qdrant_client = None


def choose_device():
    if configured_device := os.getenv("EMBEDDING_DEVICE"):
        return configured_device
    if torch.backends.mps.is_available():
        return "mps"
    return "cuda" if torch.cuda.is_available() else "cpu"


def chunk_text(text):
    text = re.sub(r"\s+", " ", text).strip()
    chunks, start = [], 0
    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        if end < len(text):
            boundary = text.rfind(". ", start + CHUNK_SIZE // 2, end)
            if boundary != -1:
                end = boundary + 1
        chunks.append(text[start:end].strip())
        if end == len(text):
            break
        start = max(end - CHUNK_OVERLAP, start + 1)
    return [chunk for chunk in chunks if chunk]


def dependencies():
    if not all([embedding_model, mongo_client, qdrant_client, active_device]):
        raise HTTPException(status_code=503, detail="Knowledge service is still loading.")
    return embedding_model, mongo_client, qdrant_client, active_device


def ensure_collection(client):
    names = {item.name for item in client.get_collections().collections}
    if QDRANT_COLLECTION not in names:
        client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=models.VectorParams(size=VECTOR_DIMENSIONS, distance=models.Distance.COSINE),
        )
    try:
        client.create_payload_index(
            collection_name=QDRANT_COLLECTION,
            field_name="documentId",
            field_schema=models.PayloadSchemaType.KEYWORD,
        )
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app):
    global embedding_model, active_device, mongo_client, qdrant_client
    active_device = choose_device()
    # Initialize MongoDB client
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
    mongo_client.admin.command("ping")
    qdrant_client = QdrantClient(
        url=QDRANT_URL, 
        api_key=QDRANT_API_KEY if QDRANT_API_KEY else None,
        timeout=60
    )
    ensure_collection(qdrant_client)
    embedding_model = SentenceTransformer(MODEL_NAME, device=active_device)
    yield
    mongo_client.close()


app = FastAPI(title="OutLawed Knowledge Service", version="0.2.0", lifespan=lifespan)


class EmbedRequest(BaseModel):
    texts: list[str] = Field(min_length=1, max_length=32)


class IngestRequest(BaseModel):
    source_file: str
    category: str = "general"
    language: str = "en"


class SearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=12000)
    limit: int = Field(default=5, ge=1, le=10)
    category: str | None = None


def embed_texts(model, texts):
    return model.encode(texts, normalize_embeddings=True, show_progress_bar=False, convert_to_numpy=True)


@app.get("/health")
def health():
    return {"status": "ok" if embedding_model else "starting", "model": MODEL_NAME, "device": active_device, "vectorDimensions": VECTOR_DIMENSIONS}


@app.post("/embed")
def embed(request: EmbedRequest):
    model, _, _, device = dependencies()
    texts = [text.strip() for text in request.texts]
    if any(not text for text in texts):
        raise HTTPException(status_code=400, detail="Each text must be non-empty.")
    vectors = embed_texts(model, texts)
    return {"model": MODEL_NAME, "device": device, "dimensions": int(vectors.shape[1]), "embeddings": vectors.tolist()}


@app.post("/v1/documents/ingest")
def ingest_document(request: IngestRequest):
    model, mongo, qdrant, _ = dependencies()
    source_path = (SOURCE_PDF_DIR / request.source_file).resolve()
    if SOURCE_PDF_DIR not in source_path.parents or source_path.suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="source_file must be a PDF inside data/source-pdfs.")
    if not source_path.is_file():
        raise HTTPException(status_code=404, detail="PDF not found in data/source-pdfs.")
    try:
        reader = PdfReader(str(source_path))
        chunks = chunk_text("\n".join(page.extract_text() or "" for page in reader.pages))
    except Exception as error:
        raise HTTPException(status_code=422, detail=f"Could not read this PDF: {error}") from error
    if not chunks:
        raise HTTPException(status_code=422, detail="No extractable text found; this PDF may require OCR.")

    document_id = hashlib.sha256(request.source_file.encode()).hexdigest()
    title = reader.metadata.title if reader.metadata and reader.metadata.title else source_path.stem
    mongo[MONGODB_DATABASE].documents.update_one(
        {"_id": document_id},
        {"$set": {"sourceFile": request.source_file, "title": title, "pageCount": len(reader.pages), "category": request.category, "language": request.language, "chunkCount": len(chunks), "embeddingModel": MODEL_NAME}},
        upsert=True,
    )
    qdrant.delete(
        collection_name=QDRANT_COLLECTION,
        points_selector=models.FilterSelector(filter=models.Filter(must=[models.FieldCondition(key="documentId", match=models.MatchValue(value=document_id))])),
        wait=True,
    )
    points = []
    for offset in range(0, len(chunks), 8):
        batch = chunks[offset:offset + 8]
        for index, (chunk, vector) in enumerate(zip(batch, embed_texts(model, batch)), start=offset):
            points.append(models.PointStruct(id=str(uuid.uuid4()), vector=vector.tolist(), payload={"documentId": document_id, "sourceFile": request.source_file, "title": title, "category": request.category, "language": request.language, "chunkIndex": index, "text": chunk}))
    qdrant.upsert(collection_name=QDRANT_COLLECTION, points=points, wait=True)
    return {"documentId": document_id, "sourceFile": request.source_file, "chunksIndexed": len(chunks)}


@app.post("/v1/search")
def search(request: SearchRequest):
    model, _, qdrant, _ = dependencies()
    vector = embed_texts(model, [request.query.strip()])[0]
    query_filter = None
    if request.category:
        query_filter = models.Filter(must=[models.FieldCondition(key="category", match=models.MatchValue(value=request.category))])
    # Fetch extra points so we have room to deduplicate
    fetch_limit = request.limit * 5
    response = qdrant.query_points(collection_name=QDRANT_COLLECTION, query=vector.tolist(), query_filter=query_filter, limit=fetch_limit, with_payload=True)
    
    # Deduplicate by documentId so we return distinct court cases
    seen_docs = set()
    unique_results = []
    for point in response.points:
        doc_id = point.payload.get("documentId")
        # Fallback to title if documentId is somehow missing
        dedup_key = doc_id if doc_id else point.payload.get("title")
        if dedup_key not in seen_docs:
            seen_docs.add(dedup_key)
            unique_results.append(point)
            if len(unique_results) >= request.limit:
                break

    return {"query": request.query, "results": [{"score": point.score, "source": point.payload.get("sourceFile"), "title": point.payload.get("title"), "text": point.payload.get("text"), "category": point.payload.get("category")} for point in unique_results]}
