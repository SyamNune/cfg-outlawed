"""Script to ingest Parquet datasets into Qdrant and MongoDB."""

import argparse
import hashlib
import os
import uuid
import certifi
from pathlib import Path

import pandas as pd
from pymongo import MongoClient
from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer

from main import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    MODEL_NAME,
    MONGODB_DATABASE,
    MONGODB_URI,
    QDRANT_COLLECTION,
    QDRANT_URL,
    VECTOR_DIMENSIONS,
    choose_device,
    chunk_text,
    embed_texts,
    ensure_collection,
)

QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

SERVICE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = (SERVICE_DIR.parent / "data" / "indjudgements").resolve()


def ingest_parquet(limit: int = 50):
    print(f"Loading environment and model {MODEL_NAME}...")
    device = choose_device()
    embedding_model = SentenceTransformer(MODEL_NAME, device=device)
    
    print(f"Connecting to MongoDB at {MONGODB_URI}...")
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
    mongo_client.admin.command("ping")
    
    print(f"Connecting to Qdrant at {QDRANT_URL}...")
    qdrant_client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY if QDRANT_API_KEY else None,
        timeout=60
    )
    ensure_collection(qdrant_client)
    
    parquet_files = list(DATA_DIR.glob("*.parquet"))
    if not parquet_files:
        print(f"No parquet files found in {DATA_DIR}")
        return

    print(f"Found {len(parquet_files)} parquet files. Starting ingestion (limit={limit})...")
    
    processed_count = 0
    
    for file_path in parquet_files:
        if processed_count >= limit:
            break
            
        print(f"Reading {file_path.name}...")
        try:
            df = pd.read_parquet(file_path, engine="fastparquet")
            
            # Slice the dataframe to not process more than the limit
            remaining = limit - processed_count
            df_subset = df.head(remaining)
            
            for index, row in df_subset.iterrows():
                try:
                    judgement_text = str(row.get("Text", ""))
                    if not judgement_text or len(judgement_text.strip()) < 50 or judgement_text.lower() == "nan":
                        continue
                        
                    chunks = chunk_text(judgement_text)
                    if not chunks:
                        continue
                        
                    # Create a unique ID for this judgement
                    # Using a hash of the text since there's no obvious ID column
                    doc_hash_input = judgement_text[:1000] + str(row.get("Court_Name_Normalized", ""))
                    document_id = hashlib.sha256(doc_hash_input.encode()).hexdigest()
                    
                    title = str(row.get("Titles", f"Case from {row.get('Court_Name_Normalized', 'Unknown Court')}"))
                    if title == "nan" or not title:
                        title = f"Case from {row.get('Court_Name_Normalized', 'Unknown Court')}"
                    category = str(row.get("Case_Type", "general"))
                    
                    # Check if already exists to avoid re-embedding
                    if mongo_client[MONGODB_DATABASE].documents.count_documents({"_id": document_id}) > 0:
                        continue
                        
                    # 1. Store metadata in MongoDB
                    mongo_client[MONGODB_DATABASE].documents.update_one(
                        {"_id": document_id},
                        {"$set": {
                            "documentId": document_id,
                            "sourceFile": file_path.name,
                            "title": title,
                            "category": category,
                            "language": "en",
                            "chunkCount": len(chunks),
                            "embeddingModel": MODEL_NAME,
                            "court": str(row.get("Court_Name_Normalized", "")),
                            "docSize": int(row.get("Doc_size", 0))
                        }},
                        upsert=True,
                    )
                    
                    # 2. Delete existing Qdrant points for this doc
                    qdrant_client.delete(
                        collection_name=QDRANT_COLLECTION,
                        points_selector=models.FilterSelector(
                            filter=models.Filter(must=[models.FieldCondition(key="documentId", match=models.MatchValue(value=document_id))])
                        ),
                        wait=True,
                    )
                    
                    # 3. Embed and upsert chunks
                    points = []
                    for offset in range(0, len(chunks), 128):
                        batch = chunks[offset:offset + 128]
                        vectors = embed_texts(embedding_model, batch)
                        
                        for idx, (chunk, vector) in enumerate(zip(batch, vectors), start=offset):
                            points.append(models.PointStruct(
                                id=str(uuid.uuid4()), 
                                vector=vector.tolist(), 
                                payload={
                                    "documentId": document_id, 
                                    "sourceFile": file_path.name, 
                                    "title": title, 
                                    "category": category, 
                                    "language": "en", 
                                    "chunkIndex": idx, 
                                    "text": chunk
                                }
                            ))
                            
                    qdrant_client.upsert(collection_name=QDRANT_COLLECTION, points=points, wait=True)
                    
                    processed_count += 1
                    print(f"[{processed_count}/{limit}] Ingested document {document_id[:8]}... ({len(chunks)} chunks)")
                    
                except Exception as e:
                    print(f"Error processing row {index} in {file_path.name}: {e}")
                    
        except Exception as e:
            print(f"Error reading {file_path.name}: {e}")

    print("Ingestion complete.")
    mongo_client.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Parquet judgements into Qdrant/MongoDB.")
    parser.add_argument("--limit", type=int, default=50, help="Maximum number of cases to ingest.")
    args = parser.parse_args()
    
    ingest_parquet(limit=args.limit)
