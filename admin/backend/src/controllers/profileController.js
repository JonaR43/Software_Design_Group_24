const profileService = require('../services/profileService');

/**
 * Profile Controller
 * Handles HTTP requests for profile management operations
 */
class ProfileController {
  /**
   * Get current user's profile
   * GET /api/profile
   */
  async getProfile(req, res, next) {
    try {
      const result = await profileService.getProfile(req.user.id);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Update current user's profile
   * PUT /api/profile
   */
  async updateProfile(req, res, next) {
    try {
      const result = await profileService.updateProfile(req.user.id, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes('Skill') ||
          error.message.includes('proficiency') ||
          error.message.includes('availability') ||
          error.message.includes('Time must be') ||
          error.message.includes('Overlapping')) {
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
   * Get available skills
   * GET /api/profile/skills
   */
  async getAvailableSkills(req, res, next) {
    try {
      const result = await profileService.getAvailableSkills();

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
   * Search skills
   * GET /api/profile/skills/search?q=query
   */
  async searchSkills(req, res, next) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          status: 'error',
          message: 'Search query (q) is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await profileService.searchSkills(q);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('at least 2 characters')) {
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
   * Get proficiency levels
   * GET /api/profile/proficiency-levels
   */
  async getProficiencyLevels(req, res, next) {
    try {
      const result = await profileService.getProficiencyLevels();

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
   * Add skills to profile
   * POST /api/profile/skills
   */
  async addSkills(req, res, next) {
    try {
      const { skills } = req.body;

      if (!skills || !Array.isArray(skills)) {
        return res.status(400).json({
          status: 'error',
          message: 'Skills array is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await profileService.addSkills(req.user.id, skills);

      res.status(200).json({
        status: 'success',
        message: 'Skills added successfully',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('Skill') || error.message.includes('proficiency')) {
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
   * Remove skills from profile
   * DELETE /api/profile/skills
   */
  async removeSkills(req, res, next) {
    try {
      const { skillIds } = req.body;

      if (!skillIds || !Array.isArray(skillIds)) {
        return res.status(400).json({
          status: 'error',
          message: 'Skill IDs array is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await profileService.removeSkills(req.user.id, skillIds);

      res.status(200).json({
        status: 'success',
        message: 'Skills removed successfully',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update availability
   * PUT /api/profile/availability
   */
  async updateAvailability(req, res, next) {
    try {
      const { availability } = req.body;

      if (!availability || !Array.isArray(availability)) {
        return res.status(400).json({
          status: 'error',
          message: 'Availability array is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await profileService.updateAvailability(req.user.id, availability);

      res.status(200).json({
        status: 'success',
        message: 'Availability updated successfully',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('dayOfWeek') ||
          error.message.includes('Time must be') ||
          error.message.includes('Overlapping') ||
          error.message.includes('End time must')) {
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
   * Get availability for date range
   * GET /api/profile/availability?start=2024-01-01&end=2024-01-31
   */
  async getAvailability(req, res, next) {
    try {
      const { start, end } = req.query;

      let startDate, endDate;

      if (start) {
        startDate = new Date(start);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid start date format',
            timestamp: new Date().toISOString()
          });
        }
      }

      if (end) {
        endDate = new Date(end);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid end date format',
            timestamp: new Date().toISOString()
          });
        }
      }

      const result = await profileService.getAvailability(req.user.id, startDate, endDate);

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
   * Update preferences
   * PUT /api/profile/preferences
   */
  async updatePreferences(req, res, next) {
    try {
      const result = await profileService.updatePreferences(req.user.id, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Preferences updated successfully',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile by user ID (admin only)
   * GET /api/profile/user/:userId
   */
  async getProfileByUserId(req, res, next) {
    try {
      const { userId } = req.params;

      const result = await profileService.getProfile(userId);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Get profile statistics (admin only)
   * GET /api/profile/stats
   */
  async getProfileStats(req, res, next) {
    try {
      const result = await profileService.getProfileStats();

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
   * Upload profile picture
   * POST /api/profile/avatar
   */
  async uploadAvatar(req, res, next) {
    try {
      // For Assignment 3, we'll just simulate file upload
      // In a real app, this would handle file upload to cloud storage

      const profilePicture = `https://example.com/avatars/${req.user.id}.jpg`;

      const result = await profileService.updateProfile(req.user.id, {
        profilePicture
      });

      res.status(200).json({
        status: 'success',
        message: 'Profile picture uploaded successfully',
        data: {
          profilePicture,
          profile: result.data
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete profile picture
   * DELETE /api/profile/avatar
   */
  async deleteAvatar(req, res, next) {
    try {
      const result = await profileService.updateProfile(req.user.id, {
        profilePicture: null
      });

      res.status(200).json({
        status: 'success',
        message: 'Profile picture deleted successfully',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate profile data
   * POST /api/profile/validate
   */
  async validateProfile(req, res, next) {
    try {
      // For Assignment 3, we'll do basic validation
      const { skills, availability } = req.body;

      if (skills) {
        await profileService.validateSkills(skills);
      }

      if (availability) {
        profileService.validateAvailability(availability);
      }

      res.status(200).json({
        status: 'success',
        message: 'Profile data is valid',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new ProfileController();