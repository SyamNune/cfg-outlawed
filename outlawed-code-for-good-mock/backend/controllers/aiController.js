const AILegalService = require('../services/aiLegalService');
const KnowledgeArticle = require('../models/KnowledgeArticle');

// @desc    Interactive AI Legal Assistant Chat query (RAG)
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res, next) => {
  try {
    const { query, caseContext } = req.body;

    if (!query) {
      return res.status(400).json({ error: { message: 'Query is required for AI Assistant.' } });
    }

    const response = await AILegalService.answerLegalQuery(query, caseContext);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Find Similar Cases based on free-form text or category
// @route   POST /api/ai/find-similar
// @access  Private
const findSimilar = async (req, res, next) => {
  try {
    const { title, description, category, facts, district, priority } = req.body;

    const results = await AILegalService.findSimilarCases({
      title,
      description,
      facts,
      category,
      district,
      priority
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Knowledge Base articles list
// @route   GET /api/ai/knowledge
// @access  Private
const getKnowledgeArticles = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { relevanceKeywords: { $in: [search.toLowerCase()] } }
      ];
    }

    const articles = await KnowledgeArticle.find(filter).sort({ title: 1 });
    res.json({ count: articles.length, articles });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Engine & Vector Search Status
// @route   GET /api/ai/status
// @access  Private
const getAIStatus = async (req, res, next) => {
  try {
    const status = AILegalService.getStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAI,
  findSimilar,
  getKnowledgeArticles,
  getAIStatus
};
