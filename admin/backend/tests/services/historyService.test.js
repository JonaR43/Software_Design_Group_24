/**
 * Unit Tests for History Service
 */

const historyService = require('../../src/services/historyService');
const { volunteerHistory, historyHelpers } = require('../../src/data/history');
const { userHelpers } = require('../../src/data/users');
const { eventHelpers } = require('../../src/data/events');

// Mock dependencies
jest.mock('../../src/data/users');
jest.mock('../../src/data/events');

describe('HistoryService', () => {
  const mockUser = {
    id: 'user_002',
    username: 'johnsmith',
    email: 'john.smith@email.com',
    role: 'volunteer'
  };

  const mockEvent = {
    id: 'event_001',
    title: 'Community Food Drive',
    startDate: new Date('2024-12-15T09:00:00Z'),
    endDate: new Date('2024-12-15T17:00:00Z')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userHelpers.findById.mockReturnValue(mockUser);
    eventHelpers.findById.mockReturnValue(mockEvent);
  });

  describe('getVolunteerHistory', () => {
    it('should get volunteer history successfully', async () => {
      const result = await historyService.getVolunteerHistory('user_002');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('history');
      expect(result.data).toHaveProperty('pagination');
      expect(Array.isArray(result.data.history)).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      const options = { page: 1, limit: 2 };
      const result = await historyService.getVolunteerHistory('user_002', {}, options);

      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(2);
      expect(result.data.pagination.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should apply filters correctly', async () => {
      const filters = { status: 'completed' };
      const result = await historyService.getVolunteerHistory('user_002', filters);

      expect(result.success).toBe(true);
      // All returned records should have status 'completed'
      result.data.history.forEach(record => {
        expect(record.status).toBe('completed');
      });
    });

    it('should filter by date range', async () => {
      const filters = {
        startDate: new Date(Date.now() - 86400000).toISOString(),
        endDate: new Date().toISOString()
      };
      const result = await historyService.getVolunteerHistory('user_002', filters);

      expect(result.success).toBe(true);
    });

    it('should reject request for non-existent volunteer', async () => {
      userHelpers.findById.mockReturnValue(null);

      await expect(historyService.getVolunteerHistory('non-existent'))
        .rejects.toThrow('Volunteer not found');
    });
  });

  describe('recordParticipation', () => {
    const validParticipationData = {
      volunteerId: 'user_999',
      eventId: 'event_999',
      status: 'completed',
      hoursWorked: 8,
      attendance: 'present',
      performanceRating: 5,
      feedback: 'Excellent work!'
    };

    it('should record participation successfully', async () => {
      const result = await historyService.recordParticipation(validParticipationData, 'admin_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Participation recorded successfully');
      expect(result.data).toHaveProperty('id');
      expect(result.data.volunteerId).toBe(validParticipationData.volunteerId);
      expect(result.data.eventId).toBe(validParticipationData.eventId);
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        volunteerId: 'user_002'
        // Missing required fields
      };

      await expect(historyService.recordParticipation(incompleteData, 'admin_001'))
        .rejects.toThrow('Missing required fields');
    });

    it('should validate volunteer exists', async () => {
      userHelpers.findById.mockReturnValue(null);

      await expect(historyService.recordParticipation(validParticipationData, 'admin_001'))
        .rejects.toThrow('Volunteer not found');
    });

    it('should validate event exists', async () => {
      eventHelpers.findById.mockReturnValue(null);

      await expect(historyService.recordParticipation(validParticipationData, 'admin_001'))
        .rejects.toThrow('Event not found');
    });

    it('should validate status values', async () => {
      const invalidStatusData = { ...validParticipationData, status: 'invalid_status' };

      await expect(historyService.recordParticipation(invalidStatusData, 'admin_001'))
        .rejects.toThrow('Invalid status');
    });

    it('should validate attendance values', async () => {
      const invalidAttendanceData = { ...validParticipationData, attendance: 'invalid_attendance' };

      await expect(historyService.recordParticipation(invalidAttendanceData, 'admin_001'))
        .rejects.toThrow('Invalid attendance');
    });

    it('should validate hours worked range', async () => {
      const invalidHoursData = { ...validParticipationData, hoursWorked: -1 };

      await expect(historyService.recordParticipation(invalidHoursData, 'admin_001'))
        .rejects.toThrow('Hours worked must be a number between 0 and 24');
    });

    it('should validate performance rating range', async () => {
      const invalidRatingData = { ...validParticipationData, performanceRating: 6 };

      await expect(historyService.recordParticipation(invalidRatingData, 'admin_001'))
        .rejects.toThrow('Performance rating must be a number between 1 and 5');
    });
  });

  describe('updateHistoryRecord', () => {
    it('should update history record successfully', async () => {
      // Mock existing history record
      jest.spyOn(historyHelpers, 'getHistoryById').mockReturnValue({
        id: 'history_001',
        volunteerId: 'user_002',
        eventId: 'event_001'
      });

      jest.spyOn(historyHelpers, 'updateHistoryRecord').mockReturnValue({
        id: 'history_001',
        status: 'completed',
        performanceRating: 4
      });

      const updateData = { performanceRating: 4 };
      const result = await historyService.updateHistoryRecord('history_001', updateData, 'admin_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('History record updated successfully');
    });

    it('should reject update for non-existent record', async () => {
      jest.spyOn(historyHelpers, 'getHistoryById').mockReturnValue(null);

      await expect(historyService.updateHistoryRecord('non-existent', {}, 'admin_001'))
        .rejects.toThrow('History record not found');
    });
  });

  describe('getVolunteerStats', () => {
    it('should calculate volunteer statistics correctly', async () => {
      const result = await historyService.getVolunteerStats('user_002');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('volunteerId');
      expect(result.data).toHaveProperty('volunteerName');
      expect(result.data).toHaveProperty('totalEvents');
      expect(result.data).toHaveProperty('completedEvents');
      expect(result.data).toHaveProperty('totalHours');
      expect(result.data).toHaveProperty('averageRating');
      expect(result.data).toHaveProperty('attendanceRate');
      expect(result.data).toHaveProperty('reliabilityScore');
    });

    it('should reject stats for non-existent volunteer', async () => {
      userHelpers.findById.mockReturnValue(null);

      await expect(historyService.getVolunteerStats('non-existent'))
        .rejects.toThrow('Volunteer not found');
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should get performance metrics successfully', async () => {
      const result = await historyService.getPerformanceMetrics('user_002', 6);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('volunteerId');
      expect(result.data).toHaveProperty('overallStats');
      expect(result.data).toHaveProperty('monthlyTrends');
      expect(result.data).toHaveProperty('periodMonths');
      expect(result.data.periodMonths).toBe(6);
    });
  });

  describe('getAllVolunteerStats', () => {
    it('should get all volunteer statistics', async () => {
      const result = await historyService.getAllVolunteerStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('volunteers');
      expect(result.data).toHaveProperty('summary');
      expect(Array.isArray(result.data.volunteers)).toBe(true);
    });

    it('should sort volunteers by specified criteria', async () => {
      const result = await historyService.getAllVolunteerStats({ sortBy: 'reliabilityScore' });

      expect(result.success).toBe(true);
      // Check if sorted by reliability score (descending)
      const volunteers = result.data.volunteers;
      for (let i = 0; i < volunteers.length - 1; i++) {
        expect(volunteers[i].reliabilityScore).toBeGreaterThanOrEqual(volunteers[i + 1].reliabilityScore);
      }
    });
  });

  describe('getEventHistory', () => {
    it('should get event history successfully', async () => {
      const result = await historyService.getEventHistory('event_001');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('event');
      expect(result.data).toHaveProperty('participation');
      expect(result.data).toHaveProperty('statistics');
    });

    it('should reject request for non-existent event', async () => {
      eventHelpers.findById.mockReturnValue(null);

      await expect(historyService.getEventHistory('non-existent'))
        .rejects.toThrow('Event not found');
    });
  });

  describe('getMyHistory', () => {
    it('should get current user history successfully', async () => {
      const result = await historyService.getMyHistory('user_002');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('history');
      expect(result.data).toHaveProperty('pagination');
    });

    it('should apply filters to my history', async () => {
      const filters = { status: 'completed' };
      const result = await historyService.getMyHistory('user_002', filters);

      expect(result.success).toBe(true);
      result.data.history.forEach(record => {
        expect(record.status).toBe('completed');
      });
    });
  });

  describe('getDashboardStats', () => {
    it('should get dashboard statistics successfully', async () => {
      const result = await historyService.getDashboardStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('overview');
      expect(result.data).toHaveProperty('recentActivity');
      expect(result.data).toHaveProperty('topPerformers');
      expect(result.data.overview).toHaveProperty('totalVolunteers');
      expect(result.data.overview).toHaveProperty('totalEvents');
      expect(result.data.overview).toHaveProperty('totalHours');
      expect(result.data.overview).toHaveProperty('averageReliability');
    });
  });
});