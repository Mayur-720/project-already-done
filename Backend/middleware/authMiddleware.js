
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Special handling for admin token
      if (decoded.id === 'admin123') {
        req.user = {
          _id: 'admin123',
          username: 'admin',
          role: 'admin',
        };
        next();
        return;
      }

      // Regular user token verification
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Token expired, please log in again');
      }
      res.status(401);
      throw new Error('Not authorized, invalid token');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Update socket auth to handle admin tokens
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle admin socket auth
    if (decoded.id === 'admin123') {
      socket.user = {
        _id: 'admin123',
        username: 'admin',
        role: 'admin',
      };
      next();
      return;
    }

    // Regular user socket auth
    User.findById(decoded.id)
      .select('-password')
      .then((user) => {
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }
        socket.user = user;
        next();
      })
      .catch(() => next(new Error('Authentication error: Invalid token')));
  } catch (error) {
    return next(new Error('Authentication error: Token verification failed'));
  }
};

module.exports = { protect, socketAuth };
