const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../database/repositories/userRepository');
const emailService = require('./emailService');

/**
 * Authentication Service
 * Handles user registration, login, and authentication logic
 * Updated to use Prisma database
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Success response with user data (excluding password)
   */
  async register(userData) {
    const { username, email, password, role = 'volunteer' } = userData;

    // Check if user already exists
    const existingUserByEmail = await userRepository.findByEmail(email.toLowerCase());
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUserByUsername = await userRepository.findByUsername(username.toLowerCase());
    if (existingUserByUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await userRepository.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      verified: true // For Assignment 3, skip email verification
    });

    // Create initial profile
    const newProfile = await userRepository.createProfile(newUser.id, {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      bio: '',
      maxTravelDistance: 50,
      preferredDays: [],
      preferredTimeSlots: [],
      preferredCauses: [],
      emailNotifications: true,
      eventReminders: true,
      weekendsOnly: false,
      profileCompleteness: 0
    });

    // Send welcome email (async, don't wait for it)
    try {
      await emailService.sendWelcomeEmail(
        newUser.email,
        username // Use username as display name initially
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = this.generateToken(newUser.id);

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role.toLowerCase(),
          verified: newUser.verified,
          createdAt: newUser.createdAt
        },
        token,
        profile: newProfile
      }
    };
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Object} Success response with token and user data
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if user is verified
    if (!user.verified) {
      throw new Error('Please verify your email before logging in');
    }

    // Get user profile
    const profile = await userRepository.getProfile(user.id);

    console.log('=== LOGIN DEBUG ===');
    console.log('Profile data:', JSON.stringify(profile, null, 2));
    console.log('Profile completeness:', profile?.profileCompleteness);

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.toLowerCase(),
          verified: user.verified,
          lastLogin: new Date()
        },
        token,
        profile
      }
    };
  }

  /**
   * Logout user (in a real app, this would invalidate the token)
   * @param {string} userId - User ID
   * @returns {Object} Success response
   */
  async logout(userId) {
    // In a real application, we would:
    // 1. Add token to blacklist
    // 2. Update user's last logout time
    // 3. Clear any cached session data

    return {
      success: true,
      message: 'Logout successful'
    };
  }

  /**
   * Verify JWT token and return user data
   * @param {string} token - JWT token
   * @returns {Object} User data if token is valid
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role.toLowerCase(),
            verified: user.verified
          }
        }
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - Current and new password
   * @returns {Object} Success response
   */
  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await userRepository.update(userId, {
      password: hashedNewPassword
    });

    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  /**
   * Get user profile with statistics
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const profile = await userRepository.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Calculate profile completion percentage
    const requiredFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode'];
    const completedFields = requiredFields.filter(field => profile[field] && profile[field].trim() !== '');
    const profileCompletion = Math.round((completedFields.length / requiredFields.length) * 100);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.toLowerCase(),
          verified: user.verified,
          createdAt: user.createdAt
        },
        profile: {
          ...profile,
          profileCompletion,
          skillsCount: profile.skills ? profile.skills.length : 0,
          availabilitySlots: profile.availability ? profile.availability.length : 0
        }
      }
    };
  }

  /**
   * Generate JWT access token for user
   * @param {string} userId - User ID
   * @returns {string} JWT access token (short-lived)
   */
  generateToken(userId) {
    return jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  /**
   * Generate refresh token for user
   * @param {string} userId - User ID
   * @returns {string} JWT refresh token (long-lived)
   */
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Verify refresh token and generate new access token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const newAccessToken = this.generateToken(user.id);

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role.toLowerCase()
          }
        }
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Set authentication cookies
   * @param {Object} res - Express response object
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   */
  setAuthCookies(res, accessToken, refreshToken) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token cookie (short-lived)
    res.cookie('accessToken', accessToken, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: isProduction, // HTTPS only in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in production (requires secure=true)
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Refresh token cookie (long-lived)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in production (requires secure=true)
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  /**
   * Clear authentication cookies (logout)
   * @param {Object} res - Express response object
   */
  clearAuthCookies(res) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });
  }

  /**
   * Validate registration data
   * @param {Object} userData - User registration data
   * @returns {Array} Array of validation errors
   */
  validateRegistrationData(userData) {
    const errors = [];
    const { username, email, password } = userData;

    // Username validation
    if (!username || username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    // Email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    return errors;
  }

  /**
   * Get authentication statistics
   * @returns {Object} Authentication statistics
   */
  async getAuthStats() {
    const stats = await userRepository.getUserStats();

    return {
      success: true,
      data: {
        totalUsers: stats.totalUsers,
        totalVolunteers: stats.volunteers,
        totalAdmins: stats.admins,
        verifiedUsers: stats.verifiedUsers,
        verificationRate: stats.totalUsers > 0
          ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
          : 0
      }
    };
  }
}

module.exports = new AuthService();
