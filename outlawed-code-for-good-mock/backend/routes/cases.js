const express = require('express');
const router = express.Router();
const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  addFieldVisit,
  addCaseUpdate,
  addDocument,
  requestLegalExpert,
  provideExpertGuidance,
  getSimilarCases,
  runAIAnalysis
} = require('../controllers/caseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCases)
  .post(createCase);

router.route('/:id')
  .get(getCaseById)
  .put(updateCase);

router.post('/:id/field-visits', addFieldVisit);
router.post('/:id/updates', addCaseUpdate);
router.post('/:id/documents', addDocument);
router.post('/:id/request-expert', requestLegalExpert);
router.post('/:id/expert-guidance', provideExpertGuidance);
router.get('/:id/similar', getSimilarCases);
router.post('/:id/ai-analyze', runAIAnalysis);

module.exports = router;
