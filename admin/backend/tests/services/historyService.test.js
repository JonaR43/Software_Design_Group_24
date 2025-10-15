/**
 * Unit Tests for History Service
 * Updated to mock Prisma repositories
 */

const historyService = require('../../src/services/historyService');
const historyRepository = require('../../src/database/repositories/historyRepository');
const userRepository = require('../../src/database/repositories/userRepository');
const eventRepository = require('../../src/database/repositories/eventRepository');
const prisma = require('../../src/database/prisma');

// Mock dependencies
jest.mock('../../src/database/repositories/historyRepository');
jest.mock('../../src/database/repositories/userRepository');
jest.mock('../../src/database/repositories/eventRepository');
jest.mock('../../src/database/prisma', () => ({
  volunteerHistory: {
    findMany: jest.fn()
  }
}));

describe('HistoryService', () => {
  const mockUser = {
    id: 'user_002',
    username: 'johnsmith',
    email: 'john.smith@email.com',
    role: 'VOLUNTEER'
  };

  const mockEvent = {
    id: 'event_001',
    title: 'Community Food Drive',
    startDate: new Date('2024-12-15T09:00:00Z'),
    endDate: new Date('2024-12-15T17:00:00Z')
  };

  const mockHistoryRecord = {
    id: 'history_001',
    volunteerId: 'user_002',
    eventId: 'event_001',
    status: 'COMPLETED',
    hoursWorked: 8,
    performanceRating: 5,
    feedback: 'Great work',
    attendance: 'PRESENT',
    skillsUtilized: [],
    participationDate: new Date('2024-12-15T09:00:00Z'),
    completionDate: new Date('2024-12-15T17:00:00Z'),
    recordedBy: 'admin_001',
    adminNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    event: mockEvent,
    volunteer: mockUser
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository.findById.mockResolvedValue(mockUser);
    eventRepository.findById.mockResolvedValue(mockEvent);
  });

  describe('getVolunteerHistory', () => {
    it('should get volunteer history successfully', async () => {
      historyRepository.getVolunteerHistory.mockResolvedValue([mockHistoryRecord]);

      const result = await historyService.getVolunteerHistory('user_002');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('history');
      expect(result.data).toHaveProperty('pagination');
      expect(Array.isArray(result.data.history)).toBe(true);
      expect(historyRepository.getVolunteerHistory).toHaveBeenCalledWith('user_002', {});
    });

    it('should handle pagination correctly', async () => {
      const mockRecords = Array(5).fill(mockHistoryRecord).map((r, i) => ({ ...r, id: `history_${i}` }));
      historyRepository.getVolunteerHistory.mockResolvedValue(mockRecords);

      const options = { page: 1, limit: 2 };
      const result = await historyService.getVolunteerHistory('user_002', {}, options);

      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(2);
      expect(result.data.pagination.totalPages).toBe(3);
      expect(result.data.history.length).toBe(2);
    });

    it('should apply filters correctly', async () => {
      const completedRecord = { ...mockHistoryRecord, status: 'COMPLETED' };
      historyRepository.getVolunteerHistory.mockResolvedValue([completedRecord]);

      const filters = { status: 'completed' };
      const result = await historyService.getVolunteerHistory('user_002', filters);

      expect(result.success).toBe(true);
      // All returned records should have status 'completed'
      result.data.history.forEach(record => {
        expect(record.status).toBe('completed');
      });
      expect(historyRepository.getVolunteerHistory).toHaveBeenCalledWith('user_002', filters);
    });

    it('should filter by date range', async () => {
      historyRepository.getVolunteerHistory.mockResolvedValue([mockHistoryRecord]);

      const filters = {
        startDate: new Date(Date.now() - 86400000).toISOString(),
        endDate: new Date().toISOString()
      };
      const result = await historyService.getVolunteerHistory('user_002', filters);

      expect(result.success).toBe(true);
      expect(historyRepository.getVolunteerHistory).toHaveBeenCalledWith('user_002', filters);
    });

    it('should reject request for non-existent volunteer', async () => {
      userRepository.findById.mockResolvedValue(null);

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
      const mockUser = { id: 'user_999', username: 'testuser', role: 'VOLUNTEER' };
      const mockEvent = { id: 'event_999', title: 'Test Event', startDate: new Date() };

      userRepository.findById.mockResolvedValue(mockUser);
      eventRepository.findById.mockResolvedValue(mockEvent);
      historyRepository.existsForVolunteerAndEvent.mockResolvedValue(false);
      historyRepository.create.mockResolvedValue({
        ...mockHistoryRecord,
        volunteerId: 'user_999',
        eventId: 'event_999',
        status: 'COMPLETED',
        attendance: 'PRESENT'
      });

      const result = await historyService.recordParticipation(validParticipationData, 'admin_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Participation recorded successfully');
      expect(result.data).toHaveProperty('id');
      expect(result.data.volunteerId).toBe(validParticipationData.volunteerId);
      expect(result.data.eventId).toBe(validParticipationData.eventId);
      expect(historyRepository.create).toHaveBeenCalled();
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
      userRepository.findById.mockResolvedValue(null);

      await expect(historyService.recordParticipation(validParticipationData, 'admin_001'))
        .rejects.toThrow('Volunteer not found');
    });

    it('should validate event exists', async () => {
      eventRepository.findById.mockResolvedValue(null);

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
      historyRepository.findById.mockResolvedValue(mockHistoryRecord);
      historyRepository.update.mockResolvedValue({
        ...mockHistoryRecord,
        status: 'COMPLETED',
        performanceRating: 4,
        attendance: 'PRESENT'
      });

      const updateData = { performanceRating: 4 };
      const result = await historyService.updateHistoryRecord('history_001', updateData, 'admin_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('History record updated successfully');
      expect(historyRepository.update).toHaveBeenCalledWith('history_001', updateData);
    });

    it('should reject update for non-existent record', async () => {
      historyRepository.findById.mockResolvedValue(null);

      await expect(historyService.updateHistoryRecord('non-existent', {}, 'admin_001'))
        .rejects.toThrow('History record not found');
    });
  });

  describe('getVolunteerStats', () => {
    it('should calculate volunteer statistics correctly', async () => {
      const mockStats = {
        totalEvents: 10,
        completedEvents: 8,
        totalHours: 64,
        averageRating: 4.5,
        attendanceRate: 95,
        reliabilityScore: 95
      };
      historyRepository.getVolunteerStats.mockResolvedValue(mockStats);

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
      expect(historyRepository.getVolunteerStats).toHaveBeenCalledWith('user_002');
    });

    it('should reject stats for non-existent volunteer', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(historyService.getVolunteerStats('non-existent'))
        .rejects.toThrow('Volunteer not found');
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should get performance metrics successfully', async () => {
      const mockStats = {
        totalEvents: 10,
        completedEvents: 8,
        totalHours: 64,
        averageRating: 4.5,
        attendanceRate: 95,
        reliabilityScore: 95
      };
      const mockTrends = [
        { month: '2024-11', events: 3, hoursWorked: 24, averageRating: 4.5 },
        { month: '2024-12', events: 2, hoursWorked: 16, averageRating: 4.0 }
      ];

      historyRepository.getVolunteerStats.mockResolvedValue(mockStats);
      historyRepository.getPerformanceTrends.mockResolvedValue(mockTrends);

      const result = await historyService.getPerformanceMetrics('user_002', 6);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('volunteerId');
      expect(result.data).toHaveProperty('overallStats');
      expect(result.data).toHaveProperty('monthlyTrends');
      expect(result.data).toHaveProperty('periodMonths');
      expect(result.data.periodMonths).toBe(6);
      expect(historyRepository.getPerformanceTrends).toHaveBeenCalledWith('user_002', 6);
    });
  });

  describe('getAllVolunteerStats', () => {
    it('should get all volunteer statistics', async () => {
      const mockAllStats = [
        { volunteerId: 'user_001', volunteerName: 'John', totalEvents: 10, totalHours: 80, reliabilityScore: 95 },
        { volunteerId: 'user_002', volunteerName: 'Jane', totalEvents: 8, totalHours: 64, reliabilityScore: 90 }
      ];
      historyRepository.getAllVolunteerStats.mockResolvedValue(mockAllStats);

      const result = await historyService.getAllVolunteerStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('volunteers');
      expect(result.data).toHaveProperty('summary');
      expect(Array.isArray(result.data.volunteers)).toBe(true);
    });

    it('should sort volunteers by specified criteria', async () => {
      const mockAllStats = [
        { volunteerId: 'user_001', volunteerName: 'John', totalEvents: 10, totalHours: 80, reliabilityScore: 90 },
        { volunteerId: 'user_002', volunteerName: 'Jane', totalEvents: 8, totalHours: 64, reliabilityScore: 95 }
      ];
      historyRepository.getAllVolunteerStats.mockResolvedValue(mockAllStats);

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
      const mockEventHistory = [
        { ...mockHistoryRecord, status: 'COMPLETED', attendance: 'PRESENT' }
      ];
      historyRepository.getEventHistory.mockResolvedValue(mockEventHistory);

      const result = await historyService.getEventHistory('event_001');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('event');
      expect(result.data).toHaveProperty('participation');
      expect(result.data).toHaveProperty('statistics');
      expect(historyRepository.getEventHistory).toHaveBeenCalledWith('event_001');
    });

    it('should reject request for non-existent event', async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(historyService.getEventHistory('non-existent'))
        .rejects.toThrow('Event not found');
    });
  });

  describe('getMyHistory', () => {
    it('should get current user history successfully', async () => {
      historyRepository.getVolunteerHistory.mockResolvedValue([mockHistoryRecord]);

      const result = await historyService.getMyHistory('user_002');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('history');
      expect(result.data).toHaveProperty('pagination');
    });

    it('should apply filters to my history', async () => {
      const completedRecord = { ...mockHistoryRecord, status: 'COMPLETED' };
      historyRepository.getVolunteerHistory.mockResolvedValue([completedRecord]);

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
      const mockAllStats = [
        { volunteerId: 'user_001', volunteerName: 'John', totalEvents: 10, totalHours: 80, reliabilityScore: 95, completedEvents: 8 }
      ];
      historyRepository.getAllVolunteerStats.mockResolvedValue(mockAllStats);
      prisma.volunteerHistory.findMany.mockResolvedValue([
        { ...mockHistoryRecord, status: 'COMPLETED', participationDate: new Date() }
      ]);

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

  describe('recordParticipation - additional validation', () => {
    const validParticipationData = {
      volunteerId: 'user_999',
      eventId: 'event_999',
      status: 'completed',
      hoursWorked: 8,
      attendance: 'present',
      performanceRating: 5
    };

    it('should handle existing record with cancelled status', async () => {
      const mockUser = { id: 'user_002', username: 'testuser', role: 'VOLUNTEER' };
      const mockEvent = { id: 'event_001', title: 'Test Event', startDate: new Date() };

      userRepository.findById.mockResolvedValue(mockUser);
      eventRepository.findById.mockResolvedValue(mockEvent);
      historyRepository.existsForVolunteerAndEvent.mockResolvedValue(true);
      historyRepository.create.mockResolvedValue({
        ...mockHistoryRecord,
        volunteerId: 'user_002',
        eventId: 'event_001',
        status: 'CANCELLED',
        attendance: 'ABSENT',
        hoursWorked: 0
      });

      const dataWithCancelled = {
        volunteerId: 'user_002',
        eventId: 'event_001',
        status: 'cancelled',
        hoursWorked: 0,
        attendance: 'absent'
      };

      const result = await historyService.recordParticipation(dataWithCancelled, 'admin_001');

      expect(result.success).toBe(true);
    });
  });

  describe('updateHistoryRecord - validation branches', () => {
    it('should handle updating with null performance rating', async () => {
      historyRepository.findById.mockResolvedValue(mockHistoryRecord);
      historyRepository.update.mockResolvedValue({
        ...mockHistoryRecord,
        performanceRating: null,
        status: 'COMPLETED',
        attendance: 'PRESENT'
      });

      const updateData = { performanceRating: null };
      const result = await historyService.updateHistoryRecord('history_001', updateData, 'admin_001');

      expect(result.success).toBe(true);
    });

    it('should validate attendance when updating', async () => {
      historyRepository.findById.mockResolvedValue(mockHistoryRecord);

      const updateData = { attendance: 'invalid_attendance' };

      await expect(historyService.updateHistoryRecord('history_001', updateData, 'admin_001'))
        .rejects.toThrow('Invalid attendance');
    });

    it('should validate status when updating', async () => {
      historyRepository.findById.mockResolvedValue(mockHistoryRecord);

      const updateData = { status: 'invalid_status' };

      await expect(historyService.updateHistoryRecord('history_001', updateData, 'admin_001'))
        .rejects.toThrow('Invalid status');
    });

    it('should validate hours worked when updating', async () => {
      historyRepository.findById.mockResolvedValue(mockHistoryRecord);

      const updateData = { hoursWorked: 25 };

      await expect(historyService.updateHistoryRecord('history_001', updateData, 'admin_001'))
        .rejects.toThrow('Hours worked must be a number between 0 and 24');
    });

    it('should validate performance rating when updating', async () => {
      historyRepository.findById.mockResolvedValue(mockHistoryRecord);

      const updateData = { performanceRating: 6 };

      await expect(historyService.updateHistoryRecord('history_001', updateData, 'admin_001'))
        .rejects.toThrow('Performance rating must be a number between 1 and 5');
    });
  });

  describe('getAllVolunteerStats - sorting', () => {
    it('should sort by totalHours when sortBy is not reliabilityScore', async () => {
      const mockAllStats = [
        { volunteerId: 'user_001', volunteerName: 'John', totalEvents: 10, totalHours: 64, reliabilityScore: 95 },
        { volunteerId: 'user_002', volunteerName: 'Jane', totalEvents: 8, totalHours: 80, reliabilityScore: 90 }
      ];
      historyRepository.getAllVolunteerStats.mockResolvedValue(mockAllStats);

      const result = await historyService.getAllVolunteerStats({ sortBy: 'totalHours' });

      expect(result.success).toBe(true);
      const volunteers = result.data.volunteers;
      for (let i = 0; i < volunteers.length - 1; i++) {
        expect(volunteers[i].totalHours).toBeGreaterThanOrEqual(volunteers[i + 1].totalHours);
      }
    });
  });

  describe('getEventHistory - statistics calculation', () => {
    it('should calculate averageRating as 0 when no completed participants', async () => {
      const mockEvent = {
        id: 'event_001',
        title: 'Test Event',
        startDate: new Date(),
        endDate: new Date()
      };
      const mockEventHistory = [
        { ...mockHistoryRecord, volunteerId: 'user_001', status: 'CANCELLED', performanceRating: null, hoursWorked: 0, attendance: 'ABSENT' }
      ];

      eventRepository.findById.mockResolvedValue(mockEvent);
      historyRepository.getEventHistory.mockResolvedValue(mockEventHistory);

      const result = await historyService.getEventHistory('event_001');

      expect(result.success).toBe(true);
      expect(result.data.statistics.averageRating).toBe(0);
      expect(result.data.statistics.completedParticipants).toBe(0);
    });

    it('should calculate attendanceRate as 0 when no participants', async () => {
      const mockEvent = {
        id: 'event_002',
        title: 'Test Event',
        startDate: new Date(),
        endDate: new Date()
      };

      eventRepository.findById.mockResolvedValue(mockEvent);
      historyRepository.getEventHistory.mockResolvedValue([]);

      const result = await historyService.getEventHistory('event_002');

      expect(result.success).toBe(true);
      expect(result.data.statistics.attendanceRate).toBe(0);
    });
  });

  describe('getDashboardStats - edge cases', () => {
    it('should handle averageReliability as 0 when no volunteers', async () => {
      historyRepository.getAllVolunteerStats.mockResolvedValue([]);
      prisma.volunteerHistory.findMany.mockResolvedValue([]);

      const result = await historyService.getDashboardStats();

      expect(result.success).toBe(true);
      expect(result.data.overview.averageReliability).toBe(0);
    });
  });
});