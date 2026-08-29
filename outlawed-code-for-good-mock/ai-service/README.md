# OutLawed AI Service

This independent service is the first integration point for the OutLawed knowledge assistant. It currently returns deterministic mock similar-case results so the frontend and backend can be built and demonstrated before MongoDB Vector Search is ready.

## Run locally

```bash
cd ai-service
npm install
cp .env.example .env
npm run dev
```

The service listens on `http://localhost:5001` by default.

## Endpoints

- `GET /health` — service status.
- `POST /search` — retrieves similar organizational knowledge records.

Example request:

```json
{
  "query": "We have a land dispute and the client is missing property documents.",
  "limit": 3
}
```

## Next integration step

The Express backend should proxy `POST /api/knowledge/search` to this service. When MongoDB is connected, replace `data/mockKnowledge.js` and the keyword scoring in `routes/search.js` with document chunking, embeddings, and MongoDB Vector Search. Keep the returned response shape stable so the frontend does not need to change.

For local multilingual embeddings, start the companion [Python BGE-M3 service](./embeddings-python/README.md). Its `POST /embed` endpoint will be used by the ingestion and real-search code once MongoDB is connected.
