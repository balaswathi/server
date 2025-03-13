const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    console.log('Register request body:', req.body);
    
    const { name, email, password, colorPreference, sportPreference, graphicalPassword } = req.body;
    
    // Validate data
    if (!name || !email || !password || !colorPreference || !sportPreference || 
        !graphicalPassword || !graphicalPassword.imageId || !graphicalPassword.points) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    if (graphicalPassword.points.length !== 4) {
      console.log('Invalid number of graphical password points');
      return res.status(400).json({ error: 'Please select exactly 4 points for the graphical password' });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      colorPreference,
      sportPreference,
      graphicalPassword
    });
    
    console.log('User created:', user._id);
    
    try {
      // Generate token and send response
      sendTokenResponse(user, 200, res);
    } catch (tokenErr) {
      console.error('Token generation error:', tokenErr);
      return res.status(500).json({ error: 'Authentication token generation failed', details: tokenErr.message });
    }
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, graphicalPassword } = req.body;

    // Validate email & password
    if (!email || !password || !graphicalPassword || !graphicalPassword.points) {
      return res.status(400).json({ error: 'Please provide email, password and graphical password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify graphical password
    const isGraphicalValid = user.validateGraphicalPassword(graphicalPassword.points);

    if (!isGraphicalValid) {
      return res.status(401).json({ error: 'Invalid graphical password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
const logout = (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Verify color preference
// @route   POST /api/auth/verify-color
// @access  Public
const verifyColor = async (req, res, next) => {
  try {
    const { email, colorPreference } = req.body;
    
    // Validate input
    if (!email || !colorPreference) {
      return res.status(400).json({ error: 'Please provide email and color preference' });
    }
    
    const user = await User.findOne({ email }).select('+colorPreference');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if color preference matches
    if (user.colorPreference !== colorPreference) {
      return res.status(401).json({ error: 'Invalid color preference' });
    }
    
    res.status(200).json({ success: true, email, userId: user._id });
  } catch (err) {
    console.error('Error in verifyColor:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Verify sport preference
// @route   POST /api/auth/verify-sport
// @access  Public
const verifySport = async (req, res, next) => {
  try {
    const { email, sportPreference, password } = req.body;
    
    if (!email || !sportPreference || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    const user = await User.findOne({ email }).select('+password +sportPreference');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if sport preference matches
    if (user.sportPreference !== sportPreference) {
      return res.status(401).json({ error: 'Invalid sport preference' });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    res.status(200).json({ 
      success: true, 
      imageId: user.graphicalPassword.imageId 
    });
  } catch (err) {
    console.error('Error in verifySport:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Verify graphical password
// @route   POST /api/auth/verify-graphical
// @access  Public
const verifyGraphical = async (req, res, next) => {
  try {
    const { email, points } = req.body;
    
    if (!email || !points) {
      return res.status(400).json({ error: 'Please provide email and graphical password points' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Validate graphical password
    const isValid = user.validateGraphicalPassword(points);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid graphical password' });
    }
    
    // Generate token and send response
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Error in verifyGraphical:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  try {
    // Create token
    const token = user.getSignedJwtToken();
    
    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true
    };
    
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
    
    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token
      });
  } catch (err) {
    console.error('Error in sendTokenResponse:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  verifyColor,
  verifySport,
  verifyGraphical
};