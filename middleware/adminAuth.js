const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcryptjs'); // Import bcrypt for password comparison

const adminAuth = async (req, res, next) => {
  console.log('Request body:', req.body); // Log the request body
  const { username, password } = req.body;

  try {
    // Find the admin user in the database
    const adminUser = await User.findOne({ email: username });
    console.log('Admin user found:', adminUser); // Log the found user

    if (adminUser) {
      const isMatch = await bcrypt.compare(password, adminUser.password);
      console.log('Password match:', isMatch); // Log the password comparison result

      if (isMatch) {
        // Generate a token for the admin
        const token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ success: true, token });
      }
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error('Error during admin authentication:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = adminAuth; 