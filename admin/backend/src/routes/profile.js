const express = require('express');
const profileController = require('../controllers/profileController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

/**
 * Profile Management Routes
 * All routes require authentication
 */

// Apply authentication to all profile routes
router.use(authenticate);

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/', profileController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/',
  validate(schemas.updateProfile),
  profileController.updateProfile
);

/**
 * @route   GET /api/profile/skills
 * @desc    Get available skills
 * @access  Private
 */
router.get('/skills', profileController.getAvailableSkills);

/**
 * @route   GET /api/profile/skills/search
 * @desc    Search skills by query
 * @access  Private
 */
router.get('/skills/search', profileController.searchSkills);

/**
 * @route   POST /api/profile/skills
 * @desc    Add skills to profile
 * @access  Private
 */
router.post('/skills', profileController.addSkills);

/**
 * @route   POST /api/profile/create-skill
 * @desc    Create a new custom skill
 * @access  Private
 */
router.post('/create-skill', profileController.createCustomSkill);

/**
 * @route   DELETE /api/profile/skills
 * @desc    Remove skills from profile
 * @access  Private
 */
router.delete('/skills', profileController.removeSkills);

/**
 * @route   GET /api/profile/proficiency-levels
 * @desc    Get available proficiency levels
 * @access  Private
 */
router.get('/proficiency-levels', profileController.getProficiencyLevels);

/**
 * @route   GET /api/profile/availability
 * @desc    Get user availability
 * @access  Private
 */
router.get('/availability', profileController.getAvailability);

/**
 * @route   PUT /api/profile/availability
 * @desc    Update user availability
 * @access  Private
 */
router.put('/availability', profileController.updateAvailability);

/**
 * @route   PUT /api/profile/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', profileController.updatePreferences);

/**
 * @route   POST /api/profile/avatar
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/avatar', profileController.uploadAvatar);

/**
 * @route   DELETE /api/profile/avatar
 * @desc    Delete profile picture
 * @access  Private
 */
router.delete('/avatar', profileController.deleteAvatar);

/**
 * @route   POST /api/profile/validate
 * @desc    Validate profile data
 * @access  Private
 */
router.post('/validate', profileController.validateProfile);

// Admin-only routes

/**
 * @route   GET /api/profile/user/:userId
 * @desc    Get profile by user ID (admin only)
 * @access  Private (Admin only)
 */
router.get('/user/:userId',
  authorize('admin'),
  profileController.getProfileByUserId
);

/**
 * @route   GET /api/profile/stats
 * @desc    Get profile statistics (admin only)
 * @access  Private (Admin only)
 */
router.get('/stats',
  authorize('admin'),
  profileController.getProfileStats
);

/**
 * Error handling for profile routes
 */
router.use((error, req, res, next) => {
  // Log profile errors
  console.error('Profile Route Error:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Pass to global error handler
  next(error);
});

module.exports = router;