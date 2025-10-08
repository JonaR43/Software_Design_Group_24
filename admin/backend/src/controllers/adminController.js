const bcrypt = require('bcryptjs');
const { userHelpers } = require('../data/users');

/**
 * Admin Controller
 * Handles HTTP requests for admin user management operations
 */
class AdminController {
  /**
   * Get all users
   * GET /api/admin/users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = userHelpers.getAllUsers();

      res.status(200).json({
        status: 'success',
        data: {
          users
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/admin/users/:userId
   */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      const user = userHelpers.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      const profile = userHelpers.getProfile(userId);

      res.status(200).json({
        status: 'success',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          verified: user.verified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: profile ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zipCode: profile.zipCode
          } : null
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user
   * POST /api/admin/users
   */
  async createUser(req, res, next) {
    try {
      const { username, email, password, role = 'volunteer' } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Username, email, and password are required',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user already exists
      const existingUserByEmail = userHelpers.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          status: 'error',
          message: 'User with this email already exists',
          timestamp: new Date().toISOString()
        });
      }

      const existingUserByUsername = userHelpers.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({
          status: 'error',
          message: 'Username already taken',
          timestamp: new Date().toISOString()
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const newUser = userHelpers.createUser({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        verified: true
      });

      // Create initial profile
      userHelpers.createProfile(newUser.id, {
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        bio: '',
        skills: [],
        availability: [],
        preferences: {
          causes: [],
          maxDistance: 50,
          weekdaysOnly: false,
          preferredTimeSlots: []
        }
      });

      res.status(201).json({
        status: 'success',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          verified: newUser.verified,
          createdAt: newUser.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   * PUT /api/admin/users/:userId
   */
  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { username, email, role, verified, password } = req.body;

      const user = userHelpers.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if new email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = userHelpers.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            status: 'error',
            message: 'Email already in use by another user',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Check if new username is already taken by another user
      if (username && username !== user.username) {
        const existingUser = userHelpers.findByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            status: 'error',
            message: 'Username already taken',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (username !== undefined) updateData.username = username.toLowerCase();
      if (email !== undefined) updateData.email = email.toLowerCase();
      if (role !== undefined) updateData.role = role;
      if (verified !== undefined) updateData.verified = verified;

      // Hash new password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      // Update user
      const updatedUser = userHelpers.updateUser(userId, updateData);

      res.status(200).json({
        status: 'success',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          verified: updatedUser.verified,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/admin/users/:userId
   */
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = userHelpers.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      // Prevent deleting yourself
      if (req.user && req.user.id === userId) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot delete your own account',
          timestamp: new Date().toISOString()
        });
      }

      const deleted = userHelpers.deleteUser(userId);

      if (deleted) {
        res.status(200).json({
          status: 'success',
          message: 'User deleted successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Failed to delete user',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
