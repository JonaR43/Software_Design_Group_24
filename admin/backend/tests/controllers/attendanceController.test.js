/**
 * Tests for Attendance Controller
 */

const controller = require('../../src/controllers/attendanceController');
const attendanceService = require('../../src/services/attendanceService');

jest.mock('../../src/services/attendanceService');

describe('AttendanceController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user-123', role: 'ADMIN' },
      params: {},
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('checkIn', () => {
    it('should check in volunteer successfully', async () => {
      req.params.eventId = 'event-123';
      req.body = { latitude: 40.7128, longitude: -74.0060 };

      const mockResult = {
        id: 'history-111',
        volunteerId: req.user.id,
        eventId: req.params.eventId,
        status: 'CONFIRMED',
        attendance: 'PRESENT'
      };

      attendanceService.checkIn.mockResolvedValue(mockResult);

      await controller.checkIn(req, res);

      expect(attendanceService.checkIn).toHaveBeenCalledWith(
        req.params.eventId,
        req.user.id,
        { latitude: 40.7128, longitude: -74.0060 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully checked in to event',
        data: mockResult
      });
    });

    it('should handle check-in errors', async () => {
      req.params.eventId = 'event-123';

      attendanceService.checkIn.mockRejectedValue(new Error('Event not found'));

      await controller.checkIn(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event not found'
      });
    });
  });

  describe('checkOut', () => {
    it('should check out volunteer successfully', async () => {
      req.params.eventId = 'event-123';
      req.body = { feedback: 'Great event!' };

      const mockResult = {
        id: 'history-111',
        volunteerId: req.user.id,
        eventId: req.params.eventId,
        status: 'COMPLETED',
        hoursWorked: 5
      };

      attendanceService.checkOut.mockResolvedValue(mockResult);

      await controller.checkOut(req, res);

      expect(attendanceService.checkOut).toHaveBeenCalledWith(
        req.params.eventId,
        req.user.id,
        { feedback: 'Great event!' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully checked out from event',
        data: mockResult
      });
    });

    it('should handle checkout errors', async () => {
      req.params.eventId = 'event-123';

      attendanceService.checkOut.mockRejectedValue(new Error('No check-in record found'));

      await controller.checkOut(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No check-in record found'
      });
    });
  });

  describe('getMyAttendanceStatus', () => {
    it('should get attendance status successfully', async () => {
      req.params.eventId = 'event-123';

      const mockStatus = {
        volunteerId: req.user.id,
        eventId: req.params.eventId,
        checkedIn: true,
        checkedOut: false,
        checkInTime: new Date()
      };

      attendanceService.getAttendanceStatus.mockResolvedValue(mockStatus);

      await controller.getMyAttendanceStatus(req, res);

      expect(attendanceService.getAttendanceStatus).toHaveBeenCalledWith(
        req.params.eventId,
        req.user.id
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStatus
      });
    });

    it('should handle get status errors', async () => {
      req.params.eventId = 'event-123';

      attendanceService.getAttendanceStatus.mockRejectedValue(new Error('Event not found'));

      await controller.getMyAttendanceStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event not found'
      });
    });
  });

  describe('getEventRoster', () => {
    it('should get event roster successfully', async () => {
      req.params.eventId = 'event-123';

      const mockRoster = [
        {
          volunteerId: 'volunteer-1',
          name: 'John Doe',
          status: 'PRESENT',
          checkInTime: new Date()
        },
        {
          volunteerId: 'volunteer-2',
          name: 'Jane Smith',
          status: 'ABSENT'
        }
      ];

      attendanceService.getEventRoster.mockResolvedValue(mockRoster);

      await controller.getEventRoster(req, res);

      expect(attendanceService.getEventRoster).toHaveBeenCalledWith(req.params.eventId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event roster retrieved successfully',
        data: mockRoster
      });
    });

    it('should handle get roster errors', async () => {
      req.params.eventId = 'event-123';

      attendanceService.getEventRoster.mockRejectedValue(new Error('Event not found'));

      await controller.getEventRoster(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event not found'
      });
    });
  });

  describe('updateAttendance', () => {
    it('should update attendance successfully', async () => {
      req.params.eventId = 'event-123';
      req.params.volunteerId = 'volunteer-456';
      req.body = {
        attendance: 'PRESENT',
        hoursWorked: 5,
        performanceRating: 4
      };

      const mockResult = {
        id: 'history-111',
        volunteerId: req.params.volunteerId,
        eventId: req.params.eventId,
        ...req.body
      };

      attendanceService.updateAttendance.mockResolvedValue(mockResult);

      await controller.updateAttendance(req, res);

      expect(attendanceService.updateAttendance).toHaveBeenCalledWith(
        req.params.eventId,
        req.params.volunteerId,
        req.body,
        req.user.id
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Attendance updated successfully',
        data: mockResult
      });
    });

    it('should handle update attendance errors', async () => {
      req.params.eventId = 'event-123';
      req.params.volunteerId = 'volunteer-456';
      req.body = { attendance: 'PRESENT' };

      attendanceService.updateAttendance.mockRejectedValue(new Error('Invalid data'));

      await controller.updateAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid data'
      });
    });
  });

  describe('bulkUpdateAttendance', () => {
    it('should bulk update attendance successfully', async () => {
      req.params.eventId = 'event-123';
      req.body = {
        updates: [
          { volunteerId: 'volunteer-1', attendance: 'PRESENT', hoursWorked: 5 },
          { volunteerId: 'volunteer-2', attendance: 'ABSENT', hoursWorked: 0 }
        ]
      };

      const mockResult = {
        updated: 2,
        results: [
          { volunteerId: 'volunteer-1', success: true },
          { volunteerId: 'volunteer-2', success: true }
        ]
      };

      attendanceService.bulkUpdateAttendance.mockResolvedValue(mockResult);

      await controller.bulkUpdateAttendance(req, res);

      expect(attendanceService.bulkUpdateAttendance).toHaveBeenCalledWith(
        req.params.eventId,
        req.body.updates,
        req.user.id
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Updated attendance for 2 volunteer(s)',
        data: mockResult
      });
    });

    it('should handle bulk update errors', async () => {
      req.params.eventId = 'event-123';
      req.body = { updates: [] };

      attendanceService.bulkUpdateAttendance.mockRejectedValue(new Error('No updates provided'));

      await controller.bulkUpdateAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No updates provided'
      });
    });
  });

  describe('finalizeEventAttendance', () => {
    it('should finalize event attendance successfully', async () => {
      req.params.eventId = 'event-123';

      const mockResult = {
        eventId: req.params.eventId,
        finalized: true,
        totalVolunteers: 10,
        presentCount: 8,
        absentCount: 2
      };

      attendanceService.finalizeEventAttendance.mockResolvedValue(mockResult);

      await controller.finalizeEventAttendance(req, res);

      expect(attendanceService.finalizeEventAttendance).toHaveBeenCalledWith(
        req.params.eventId,
        req.user.id
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event attendance finalized successfully',
        data: mockResult
      });
    });

    it('should handle finalize errors', async () => {
      req.params.eventId = 'event-123';

      attendanceService.finalizeEventAttendance.mockRejectedValue(new Error('Event not found'));

      await controller.finalizeEventAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Event not found'
      });
    });
  });

  describe('markNoShow', () => {
    it('should mark volunteer as no-show successfully', async () => {
      req.params.eventId = 'event-123';
      req.params.volunteerId = 'volunteer-456';
      req.body = {
        sendNotification: true,
        adminNotes: 'Did not show up'
      };

      const mockResult = {
        id: 'history-111',
        volunteerId: req.params.volunteerId,
        eventId: req.params.eventId,
        attendance: 'NO_SHOW',
        adminNotes: 'Did not show up'
      };

      attendanceService.markNoShow.mockResolvedValue(mockResult);

      await controller.markNoShow(req, res);

      expect(attendanceService.markNoShow).toHaveBeenCalledWith(
        req.params.eventId,
        req.params.volunteerId,
        req.user.id,
        { sendNotification: true, adminNotes: 'Did not show up' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Volunteer marked as no-show',
        data: mockResult
      });
    });

    it('should use default notification value', async () => {
      req.params.eventId = 'event-123';
      req.params.volunteerId = 'volunteer-456';
      req.body = { adminNotes: 'Did not show up' };

      const mockResult = {
        id: 'history-111',
        attendance: 'NO_SHOW'
      };

      attendanceService.markNoShow.mockResolvedValue(mockResult);

      await controller.markNoShow(req, res);

      expect(attendanceService.markNoShow).toHaveBeenCalledWith(
        req.params.eventId,
        req.params.volunteerId,
        req.user.id,
        { sendNotification: true, adminNotes: 'Did not show up' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle mark no-show errors', async () => {
      req.params.eventId = 'event-123';
      req.params.volunteerId = 'volunteer-456';
      req.body = {};

      attendanceService.markNoShow.mockRejectedValue(new Error('Volunteer not found'));

      await controller.markNoShow(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Volunteer not found'
      });
    });
  });
});
