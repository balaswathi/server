const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  logout,
  verifyColor,
  verifySport,
  verifyGraphical
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/verify-color', verifyColor);
router.post('/verify-sport', verifySport);
router.post('/verify-graphical', verifyGraphical);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

module.exports = router;