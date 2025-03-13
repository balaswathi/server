const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private
exports.createFeedback = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const feedback = await Feedback.create(req.body);

    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate({
      path: 'user',
      select: 'name email'
    });

    res.status(200).json({ success: true, count: feedback.length, data: feedback });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get user feedback
// @route   GET /api/feedback/me
// @access  Private
exports.getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id });

    res.status(200).json({ success: true, count: feedback.length, data: feedback });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get feedback analytics
// @route   GET /api/feedback/analytics
// @access  Private/Admin
exports.getFeedbackAnalytics = async (req, res) => {
  try {
    // Aggregate ratings
    const ratingAnalytics = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get feedback count by date
    const feedbackByDate = await Feedback.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ratingAnalytics,
        feedbackByDate
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};