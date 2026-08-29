const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'outlawed-ai-service',
    retrievalMode: process.env.RETRIEVAL_MODE || 'mock',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
