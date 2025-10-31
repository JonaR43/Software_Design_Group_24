const jwt = require('jsonwebtoken');
const userRepository = require('../database/repositories/userRepository');

/**
 * Authentication Middleware
 * Verifies JWT tokens and sets user information in req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in database
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Add user info to request object
    // Normalize Prisma enum to lowercase for consistency
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
      username: user.username
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

/**
 * Authorization Middleware
 * Checks if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Sets user info if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.userId);

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role.toLowerCase(),
          username: user.username
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};