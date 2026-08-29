# Local BGE-M3 embedding service

This local knowledge microservice creates BGE-M3 embeddings, stores PDF metadata in local MongoDB, and stores searchable chunks in local Qdrant. It uses Apple Silicon's MPS GPU when available and falls back to CPU.

## Setup

Start MongoDB and Qdrant from the repository root:

```bash
docker compose up -d
```

Then, from `ai-service/embeddings-python`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

The first launch downloads the `BAAI/bge-m3` model. This is several gigabytes and can take a while; later launches use the local model cache. Qdrant is available at `http://localhost:6333/dashboard`.

## Test in Postman

- Method: `POST`
- URL: `http://127.0.0.1:8001/embed`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "input_type": "passage",
  "texts": [
    "The client does not have all property ownership documents."
  ]
}
```

The result has one normalized 1024-dimension vector per submitted text.

## Ingest a local PDF

Keep PDFs inside `ai-service/data/source-pdfs/`; paths outside it are rejected.

```json
POST http://127.0.0.1:8001/v1/documents/ingest

{
  "source_file": "A_K_Gopalan_vs_The_State_Of_Madras_Union_Of_India__on_19_May_1950_1.PDF",
  "category": "constitutional_rights",
  "language": "en"
}
```

## Search indexed cases

```json
POST http://127.0.0.1:8001/v1/search

{
  "query": "What cases discuss detention and personal liberty?",
  "limit": 5,
  "category": "constitutional_rights"
}
```

## MongoDB contract

MongoDB stores the `documents` collection. Qdrant stores document chunks and their 1024-dimension embeddings. Do not store personal identifiers in the text passed to the endpoint; redact names, phone numbers, addresses, and government ID numbers during ingestion.
