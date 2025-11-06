const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

/**
 * Attendance Management Routes
 * Handles volunteer check-in/check-out and admin attendance tracking
 */

// ============================================================
// VOLUNTEER ENDPOINTS
// ============================================================

/**
 * Check in to an event
 * POST /api/attendance/events/:eventId/check-in
 */
router.post('/events/:eventId/check-in', auth.authenticate, attendanceController.checkIn);

/**
 * Check out from an event
 * POST /api/attendance/events/:eventId/check-out
 */
router.post('/events/:eventId/check-out', auth.authenticate, attendanceController.checkOut);

/**
 * Get my attendance status for an event
 * GET /api/attendance/events/:eventId/my-status
 */
router.get('/events/:eventId/my-status', auth.authenticate, attendanceController.getMyAttendanceStatus);

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

/**
 * Get event attendance roster with all volunteers
 * GET /api/attendance/events/:eventId/roster
 */
router.get('/events/:eventId/roster', auth.authenticate, auth.authorize('admin'), attendanceController.getEventRoster);

/**
 * Update volunteer attendance record (mark as present/late/absent/no-show)
 * PUT /api/attendance/events/:eventId/volunteers/:volunteerId
 */
router.put(
  '/events/:eventId/volunteers/:volunteerId',
  auth.authenticate,
  auth.authorize('admin'),
  attendanceController.updateAttendance
);

/**
 * Bulk update attendance for multiple volunteers
 * POST /api/attendance/events/:eventId/bulk-update
 */
router.post(
  '/events/:eventId/bulk-update',
  auth.authenticate,
  auth.authorize('admin'),
  attendanceController.bulkUpdateAttendance
);

/**
 * Finalize event attendance (mark event as completed, calculate final hours)
 * POST /api/attendance/events/:eventId/finalize
 */
router.post(
  '/events/:eventId/finalize',
  auth.authenticate,
  auth.authorize('admin'),
  attendanceController.finalizeEventAttendance
);

/**
 * Mark volunteer as no-show
 * POST /api/attendance/events/:eventId/volunteers/:volunteerId/no-show
 */
router.post(
  '/events/:eventId/volunteers/:volunteerId/no-show',
  auth.authenticate,
  auth.authorize('admin'),
  attendanceController.markNoShow
);

module.exports = router;
