const User = require('../models/User');

// @desc    Get password metrics
// @route   GET /api/admin/password-metrics
// @access  Private/Admin
const getPasswordMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const passwordStrengthMetrics = await User.aggregate([
      {
        $group: {
          _id: "$passwordStrength", // Assuming you have a field for password strength
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      totalUsers,
      passwordMetrics: passwordStrengthMetrics
    });
  } catch (err) {
    console.error('Error fetching password metrics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/user-stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        adminUsers,
        regularUsers,
        newUsersToday
      }
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get user feedback (assuming feedback is stored in User model)
const getUserFeedback = async (req, res) => {
  try {
    const users = await User.find().select('feedback'); // Adjust based on your feedback structure
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ error: err.message });
  }
};

// Log the function after it has been defined
console.log('Admin controller loaded');
console.log('getPasswordMetrics:', getPasswordMetrics);

module.exports = {
  getPasswordMetrics,
  getUserStats,
  getAllUsers,
  deleteUser,
  getUserFeedback
};