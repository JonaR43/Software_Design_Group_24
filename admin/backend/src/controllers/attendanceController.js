const attendanceService = require('../services/attendanceService');

/**
 * Attendance Controller
 * Handles HTTP requests for volunteer check-in/check-out and attendance tracking
 */
class AttendanceController {
  /**
   * Volunteer checks in to an event
   * POST /api/attendance/events/:eventId/check-in
   */
  async checkIn(req, res) {
    try {
      const { eventId } = req.params;
      const volunteerId = req.user.id;
      const { latitude, longitude } = req.body; // Optional location verification

      const result = await attendanceService.checkIn(eventId, volunteerId, {
        latitude,
        longitude
      });

      res.status(200).json({
        success: true,
        message: 'Successfully checked in to event',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Volunteer checks out from an event
   * POST /api/attendance/events/:eventId/check-out
   */
  async checkOut(req, res) {
    try {
      const { eventId } = req.params;
      const volunteerId = req.user.id;
      const { feedback } = req.body; // Optional volunteer feedback

      const result = await attendanceService.checkOut(eventId, volunteerId, {
        feedback
      });

      res.status(200).json({
        success: true,
        message: 'Successfully checked out from event',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get volunteer's attendance status for an event
   * GET /api/attendance/events/:eventId/my-status
   */
  async getMyAttendanceStatus(req, res) {
    try {
      const { eventId } = req.params;
      const volunteerId = req.user.id;

      const result = await attendanceService.getAttendanceStatus(eventId, volunteerId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get event attendance roster (admin only)
   * GET /api/attendance/events/:eventId/roster
   */
  async getEventRoster(req, res) {
    try {
      const { eventId } = req.params;

      const result = await attendanceService.getEventRoster(eventId);

      res.status(200).json({
        success: true,
        message: 'Event roster retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update volunteer attendance (admin only)
   * PUT /api/attendance/events/:eventId/volunteers/:volunteerId
   */
  async updateAttendance(req, res) {
    try {
      const { eventId, volunteerId } = req.params;
      const updateData = req.body;
      const adminId = req.user.id;

      const result = await attendanceService.updateAttendance(
        eventId,
        volunteerId,
        updateData,
        adminId
      );

      res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bulk update attendance for multiple volunteers
   * POST /api/attendance/events/:eventId/bulk-update
   */
  async bulkUpdateAttendance(req, res) {
    try {
      const { eventId } = req.params;
      const { updates } = req.body; // Array of {volunteerId, attendance, hoursWorked, etc.}
      const adminId = req.user.id;

      const result = await attendanceService.bulkUpdateAttendance(
        eventId,
        updates,
        adminId
      );

      res.status(200).json({
        success: true,
        message: `Updated attendance for ${result.updated} volunteer(s)`,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Finalize event attendance (admin only)
   * POST /api/attendance/events/:eventId/finalize
   */
  async finalizeEventAttendance(req, res) {
    try {
      const { eventId } = req.params;
      const adminId = req.user.id;

      const result = await attendanceService.finalizeEventAttendance(eventId, adminId);

      res.status(200).json({
        success: true,
        message: 'Event attendance finalized successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Mark volunteer as no-show (admin only)
   * POST /api/attendance/events/:eventId/volunteers/:volunteerId/no-show
   */
  async markNoShow(req, res) {
    try {
      const { eventId, volunteerId } = req.params;
      const { sendNotification = true, adminNotes } = req.body;
      const adminId = req.user.id;

      const result = await attendanceService.markNoShow(
        eventId,
        volunteerId,
        adminId,
        { sendNotification, adminNotes }
      );

      res.status(200).json({
        success: true,
        message: 'Volunteer marked as no-show',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AttendanceController();
