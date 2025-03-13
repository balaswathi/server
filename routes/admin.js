const express = require('express');
const {
  getPasswordMetrics,
  getUserStats,
  getAllUsers,
  deleteUser,
  getUserFeedback
} = require('../controllers/admin');
const adminAuth = require('../middleware/adminAuth');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin login route
router.post('/login', adminAuth);

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

router.get('/password-metrics', getPasswordMetrics);
router.get('/user-stats', getUserStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/feedback', getUserFeedback);

module.exports = router;