const express = require('express');
const eventController = require('../controllers/eventController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

/**
 * Event Management Routes
 */

// Public and optional auth routes

/**
 * @route   GET /api/events/categories
 * @desc    Get event categories and metadata
 * @access  Public
 */
router.get('/categories', eventController.getEventCategories);

// Protected routes (authentication required)

/**
 * @route   GET /api/events/my-events
 * @desc    Get current user's events
 * @access  Private (Volunteers only)
 */
router.get('/my-events',
  authenticate,
  authorize('volunteer'),
  eventController.getMyEvents
);

/**
 * @route   GET /api/events/recommended
 * @desc    Get recommended events based on user's availability
 * @access  Private (Volunteers only)
 */
router.get('/recommended',
  authenticate,
  authorize('volunteer'),
  eventController.getRecommendedEvents
);

// Admin-only routes first (before generic routes)

/**
 * @route   GET /api/events/stats
 * @desc    Get event statistics
 * @access  Private (Admin only)
 */
router.get('/stats',
  authenticate,
  authorize('admin'),
  eventController.getEventStats
);

/**
 * @route   GET /api/events/volunteer/:volunteerId
 * @desc    Get volunteer's events (admin can view any, volunteers only their own)
 * @access  Private
 */
router.get('/volunteer/:volunteerId',
  authenticate,
  eventController.getVolunteerEvents
);

/**
 * @route   GET /api/events
 * @desc    Get all events with filtering and pagination
 * @access  Public (with optional auth for personalization)
 */
router.get('/',
  optionalAuth,
  eventController.getEvents
);

// NOTE: Specific routes like /:id/something must come BEFORE /:id
// to avoid the :id route catching them

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 * NOTE: This route must be AFTER all specific string routes like /recommended, /stats, etc.
 */
router.get('/:id', eventController.getEventById);

/**
 * @route   POST /api/events/:id/join
 * @desc    Join event (volunteer self-assignment)
 * @access  Private (Volunteers only)
 */
router.post('/:id/join',
  authenticate,
  authorize('volunteer'),
  eventController.joinEvent
);

/**
 * @route   DELETE /api/events/:id/leave
 * @desc    Leave event (volunteer self-removal)
 * @access  Private (Volunteers only)
 */
router.delete('/:id/leave',
  authenticate,
  authorize('volunteer'),
  eventController.leaveEvent
);

/**
 * @route   PUT /api/events/:id/update-notes
 * @desc    Update volunteer's own assignment notes
 * @access  Private (Volunteers only)
 */
router.put('/:id/update-notes',
  authenticate,
  authorize('volunteer'),
  eventController.updateVolunteerNotes
);

/**
 * @route   GET /api/events/:id/assignments
 * @desc    Get event assignments
 * @access  Private
 */
router.get('/:id/assignments',
  authenticate,
  eventController.getEventAssignments
);

// More admin-only routes

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Private (Admin only)
 */
router.post('/',
  authenticate,
  authorize('admin'),
  validate(schemas.createEvent),
  eventController.createEvent
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private (Admin only)
 */
router.put('/:id',
  authenticate,
  authorize('admin'),
  validate(schemas.updateEvent),
  eventController.updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authenticate,
  authorize('admin'),
  eventController.deleteEvent
);

/**
 * @route   POST /api/events/:id/assign
 * @desc    Assign volunteer to event
 * @access  Private (Admin only)
 */
router.post('/:id/assign',
  authenticate,
  authorize('admin'),
  validate(schemas.assignVolunteer),
  eventController.assignVolunteer
);

/**
 * @route   PUT /api/events/assignments/:assignmentId
 * @desc    Update assignment status
 * @access  Private (Admin only)
 */
router.put('/assignments/:assignmentId',
  authenticate,
  authorize('admin'),
  eventController.updateAssignmentStatus
);

/**
 * @route   PUT /api/events/:eventId/volunteers/:volunteerId/review
 * @desc    Update volunteer review and feedback for an event
 * @access  Private (Admin only)
 */
router.put('/:eventId/volunteers/:volunteerId/review',
  authenticate,
  authorize('admin'),
  eventController.updateVolunteerReview
);

/**
 * @route   POST /api/events/:id/duplicate
 * @desc    Duplicate event
 * @access  Private (Admin only)
 */
router.post('/:id/duplicate',
  authenticate,
  authorize('admin'),
  eventController.duplicateEvent
);

/**
 * Error handling for event routes
 */
router.use((error, req, res, next) => {
  // Log event errors
  console.error('Event Route Error:', {
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