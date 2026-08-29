const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getMe,
  seedDemoData,
  getUsersList
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/seed-demo', seedDemoData);
router.get('/seed-demo', seedDemoData); // allow GET for easy browser testing
router.get('/me', protect, getMe);
router.get('/users', protect, getUsersList);

module.exports = router;
