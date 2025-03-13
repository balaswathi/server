const express = require('express');
const {
  createFeedback,
  getAllFeedback,
  getUserFeedback,
  getFeedbackAnalytics
} = require('../controllers/feedback');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createFeedback);
router.get('/me', protect, getUserFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);
router.get('/analytics', protect, authorize('admin'), getFeedbackAnalytics);

module.exports = router;