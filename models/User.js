const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  colorPreference: {
    type: String,
    required: [true, 'Please select a color preference']
  },
  sportPreference: {
    type: String,
    required: [true, 'Please select a sport preference']
  },
  graphicalPassword: {
    imageId: {
      type: String,
      required: [true, 'Please select an image']
    },
    points: [
      {
        x: {
          type: Number,
          required: true
        },
        y: {
          type: Number,
          required: true
        }
      }
    ]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  try {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });
  } catch (err) {
    console.error('JWT generation error:', err);
    throw new Error('Failed to generate authentication token');
  }
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Validate graphical password points
UserSchema.methods.validateGraphicalPassword = function(enteredPoints) {
  if (enteredPoints.length !== this.graphicalPassword.points.length) {
    return false;
  }
  
  // Allow for approximation in point selection (15px tolerance)
  const TOLERANCE = 15;
  
  // Check if all entered points are close to stored points
  for (let i = 0; i < enteredPoints.length; i++) {
    const enteredPoint = enteredPoints[i];
    let matched = false;
    
    // Check against each stored point
    for (let j = 0; j < this.graphicalPassword.points.length; j++) {
      const storedPoint = this.graphicalPassword.points[j];
      
      const xDiff = Math.abs(enteredPoint.x - storedPoint.x);
      const yDiff = Math.abs(enteredPoint.y - storedPoint.y);
      
      if (xDiff <= TOLERANCE && yDiff <= TOLERANCE) {
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      return false;
    }
  }
  
  return true;
};

module.exports = mongoose.model('User', UserSchema);