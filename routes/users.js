const express = require('express');
const {
  getUsers,
  getUser,
  updateProfile,
  deleteUser
} = require('../controllers/users');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/profile', protect, updateProfile);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;