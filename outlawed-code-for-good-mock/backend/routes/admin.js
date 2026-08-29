const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  getSystemStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/users')
  .get(getAllUsers)
  .post(createUserByAdmin);

router.route('/users/:id')
  .put(updateUserByAdmin)
  .delete(deleteUserByAdmin);

router.get('/stats', getSystemStats);

module.exports = router;
