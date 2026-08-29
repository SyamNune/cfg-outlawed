const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getExpertRequests,
  reviewExpertRequest,
  assignCase,
  getVolunteerPerformance
} = require('../controllers/caseManagerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard-metrics', getDashboardMetrics);
router.get('/expert-requests', getExpertRequests);
router.post('/expert-requests/:id/review', reviewExpertRequest);
router.post('/cases/:id/assign', assignCase);
router.get('/volunteer-performance', getVolunteerPerformance);

module.exports = router;
