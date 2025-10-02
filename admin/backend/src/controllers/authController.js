const authService = require('../services/authService');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 */
class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Check for specific error types
      if (error.message.includes('already exists') || error.message.includes('already taken')) {
        return res.status(409).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Handle authentication errors
      if (error.message.includes('Invalid email or password') ||
          error.message.includes('verify your email')) {
        return res.status(401).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const result = await authService.logout(req.user.id);

      res.status(200).json({
        status: 'success',
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify JWT token
   * GET /api/auth/verify
   */
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'No token provided',
          timestamp: new Date().toISOString()
        });
      }

      const token = authHeader.substring(7);
      const result = await authService.verifyToken(token);

      res.status(200).json({
        status: 'success',
        message: 'Token is valid',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Change user password
   * PUT /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const result = await authService.changePassword(req.user.id, req.body);

      res.status(200).json({
        status: 'success',
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('Current password is incorrect')) {
        return res.status(400).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const result = await authService.getUserProfile(req.user.id);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authentication statistics (admin only)
   * GET /api/auth/stats
   */
  async getAuthStats(req, res, next) {
    try {
      const result = authService.getAuthStats();

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      // In a real application, this would use refresh tokens
      // For Assignment 3, we'll just generate a new token with current user
      const newToken = authService.generateToken(req.user.id);

      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate registration data
   * POST /api/auth/validate-registration
   */
  async validateRegistration(req, res, next) {
    try {
      const errors = authService.validateRegistrationData(req.body);

      if (errors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.map(error => ({ message: error })),
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Registration data is valid',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check email availability
   * POST /api/auth/check-email
   */
  async checkEmailAvailability(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is required',
          timestamp: new Date().toISOString()
        });
      }

      const { userHelpers } = require('../data/users');
      const existingUser = userHelpers.findByEmail(email);

      res.status(200).json({
        status: 'success',
        data: {
          available: !existingUser,
          message: existingUser ? 'Email is already registered' : 'Email is available'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check username availability
   * POST /api/auth/check-username
   */
  async checkUsernameAvailability(req, res, next) {
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({
          status: 'error',
          message: 'Username is required',
          timestamp: new Date().toISOString()
        });
      }

      const { userHelpers } = require('../data/users');
      const existingUser = userHelpers.findByUsername(username);

      res.status(200).json({
        status: 'success',
        data: {
          available: !existingUser,
          message: existingUser ? 'Username is already taken' : 'Username is available'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();