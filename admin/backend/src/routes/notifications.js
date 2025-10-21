const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

/**
 * Notification Management Routes
 */

// User notification routes (require authentication)

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for current user
 * @access  Private
 */
router.get('/',
  authenticate,
  notificationController.getNotifications
);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences for current user
 * @access  Private
 */
router.get('/preferences',
  authenticate,
  notificationController.getPreferences
);

/**
 * @route   PUT /api/notifications/all/read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/all/read',
  authenticate,
  notificationController.markAllAsRead
);

/**
 * @route   PUT /api/notifications/bulk/read
 * @desc    Mark multiple notifications as read
 * @access  Private
 */
router.put('/bulk/read',
  authenticate,
  notificationController.markMultipleAsRead
);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get notification by ID
 * @access  Private
 */
router.get('/:id',
  authenticate,
  notificationController.getNotificationById
);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read',
  authenticate,
  notificationController.markAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id',
  authenticate,
  notificationController.deleteNotification
);

/**
 * @route   DELETE /api/notifications/bulk
 * @desc    Delete multiple notifications
 * @access  Private
 */
router.delete('/bulk',
  authenticate,
  notificationController.deleteMultiple
);

// Admin-only notification routes

/**
 * @route   GET /api/notifications/admin/stats
 * @desc    Get notification statistics
 * @access  Private (Admin only)
 */
router.get('/admin/stats',
  authenticate,
  authorize('admin'),
  notificationController.getAdminStats
);

/**
 * @route   POST /api/notifications/admin/create
 * @desc    Create notification
 * @access  Private (Admin only)
 */
router.post('/admin/create',
  authenticate,
  authorize('admin'),
  notificationController.createNotification
);

/**
 * @route   POST /api/notifications/admin/assignment
 * @desc    Send assignment notification
 * @access  Private (Admin only)
 */
router.post('/admin/assignment',
  authenticate,
  authorize('admin'),
  notificationController.sendAssignmentNotification
);

/**
 * @route   POST /api/notifications/admin/reminder
 * @desc    Send reminder notification
 * @access  Private (Admin only)
 */
router.post('/admin/reminder',
  authenticate,
  authorize('admin'),
  notificationController.sendReminderNotification
);

/**
 * @route   POST /api/notifications/admin/event-update
 * @desc    Send event update notification
 * @access  Private (Admin only)
 */
router.post('/admin/event-update',
  authenticate,
  authorize('admin'),
  notificationController.sendEventUpdateNotification
);

/**
 * @route   POST /api/notifications/admin/matching-suggestion
 * @desc    Send matching suggestion notification
 * @access  Private (Admin only)
 */
router.post('/admin/matching-suggestion',
  authenticate,
  authorize('admin'),
  notificationController.sendMatchingSuggestionNotification
);

/**
 * @route   POST /api/notifications/admin/bulk
 * @desc    Send bulk notifications
 * @access  Private (Admin only)
 */
router.post('/admin/bulk',
  authenticate,
  authorize('admin'),
  notificationController.sendBulkNotifications
);

/**
 * Error handling for notification routes
 */
router.use((error, req, res, next) => {
  console.error('Notification Route Error:', {
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