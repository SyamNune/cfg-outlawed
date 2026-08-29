const express = require('express');
const router = express.Router();
const { chatWithAI, findSimilar, getKnowledgeArticles, getAIStatus } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/status', getAIStatus);
router.post('/chat', chatWithAI);
router.post('/find-similar', findSimilar);
router.get('/knowledge', getKnowledgeArticles);

module.exports = router;
