const express = require('express');
const matchingController = require('../controllers/matchingController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

/**
 * Volunteer Matching Routes
 */

/**
 * @route   POST /api/matching/event/:eventId/volunteers
 * @desc    Find volunteer matches for an event
 * @access  Private (Admin only)
 */
router.post('/event/:eventId/volunteers',
  authenticate,
  authorize('admin'),
  matchingController.findVolunteersForEvent
);

/**
 * @route   GET /api/matching/volunteer/:volunteerId/events
 * @desc    Find event matches for a volunteer
 * @access  Private (Admin or own volunteer data)
 */
router.get('/volunteer/:volunteerId/events',
  authenticate,
  matchingController.findEventsForVolunteer
);

/**
 * @route   GET /api/matching/my-matches
 * @desc    Get events for current volunteer
 * @access  Private (Volunteers only)
 */
router.get('/my-matches',
  authenticate,
  authorize('volunteer'),
  matchingController.getMyMatches
);

/**
 * @route   GET /api/matching/calculate/:volunteerId/:eventId
 * @desc    Calculate match score between volunteer and event
 * @access  Private (Admin or own volunteer data)
 */
router.get('/calculate/:volunteerId/:eventId',
  authenticate,
  matchingController.calculateMatch
);

/**
 * @route   GET /api/matching/suggestions
 * @desc    Get automatic matching suggestions for all events
 * @access  Private (Admin only)
 */
router.get('/suggestions',
  authenticate,
  authorize('admin'),
  matchingController.getAutomaticSuggestions
);

/**
 * @route   POST /api/matching/optimize/:eventId
 * @desc    Optimize volunteer assignments for an event
 * @access  Private (Admin only)
 */
router.post('/optimize/:eventId',
  authenticate,
  authorize('admin'),
  matchingController.optimizeAssignments
);

/**
 * @route   POST /api/matching/bulk-assign/:eventId
 * @desc    Bulk assign optimized volunteers to an event
 * @access  Private (Admin only)
 */
router.post('/bulk-assign/:eventId',
  authenticate,
  authorize('admin'),
  matchingController.bulkAssignOptimized
);

/**
 * @route   GET /api/matching/stats
 * @desc    Get matching statistics
 * @access  Private (Admin only)
 */
router.get('/stats',
  authenticate,
  authorize('admin'),
  matchingController.getMatchingStats
);

/**
 * @route   POST /api/matching/test
 * @desc    Test matching algorithm with sample data
 * @access  Private (Admin only)
 */
router.post('/test',
  authenticate,
  authorize('admin'),
  matchingController.testMatching
);

/**
 * @route   GET /api/matching/algorithm-info
 * @desc    Get algorithm configuration and weights
 * @access  Private
 */
router.get('/algorithm-info',
  authenticate,
  matchingController.getAlgorithmInfo
);

/**
 * Error handling for matching routes
 */
router.use((error, req, res, next) => {
  console.error('Matching Route Error:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  next(error);
});

module.exports = router;