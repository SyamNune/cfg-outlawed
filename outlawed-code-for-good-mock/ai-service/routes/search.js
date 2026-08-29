const express = require('express');

const router = express.Router();
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8001';

router.post('/', async (req, res, next) => {
  try {
    const { query, limit = 5 } = req.body || {};

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        error: { message: 'A non-empty "query" string is required.' }
      });
    }

    const boundedLimit = Math.min(Math.max(Number(limit) || 5, 1), 10);

    // Call the Python embeddings service
    const response = await fetch(`${PYTHON_SERVICE_URL}/v1/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        limit: boundedLimit
      })
    });

    if (!response.ok) {
      throw new Error(`Python service responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // Map the results back to the expected frontend format
    const results = data.results.map((item, index) => {
      return {
        id: item.source || `result-${index}`,
        type: item.category || 'general',
        title: item.title || 'Parquet Document',
        summary: item.text || '',
        relevance: Math.round((item.score || 0) * 100),
        whyRelevant: `Semantic similarity score of ${Math.round((item.score || 0) * 100)}% based on the query.`,
        guidance: "Extracted from IndJudgements Parquet Dataset."
      };
    });

    return res.status(200).json({
      query: query.trim(),
      retrievalMode: 'semantic_search',
      answer: `Found ${results.length} related court judgement${results.length === 1 ? '' : 's'}.`,
      results,
      sources: results.map((result) => result.id),
      disclaimer: 'Data retrieved from the IndJudgements dataset via Qdrant/MongoDB Vector Search.'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
