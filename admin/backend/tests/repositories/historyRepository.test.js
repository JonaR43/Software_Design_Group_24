const HistoryRepository = require('../../src/database/repositories/historyRepository');
const prisma = require('../../src/database/prisma');

jest.mock('../../src/database/prisma', () => ({
  volunteerHistory: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn()
  }
}));

describe('HistoryRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVolunteerHistory', () => {
    it('should get volunteer history', async () => {
      const mockHistory = [
        {
          id: '1',
          volunteerId: 'user-1',
          eventId: 'event-1',
          status: 'COMPLETED',
          hoursWorked: 5
        },
        {
          id: '2',
          volunteerId: 'user-1',
          eventId: 'event-2',
          status: 'COMPLETED',
          hoursWorked: 3
        }
      ];

      prisma.volunteerHistory.findMany.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.getVolunteerHistory('user-1');

      expect(result).toEqual(mockHistory);
      expect(prisma.volunteerHistory.findMany).toHaveBeenCalledWith({
        where: { volunteerId: 'user-1' },
        include: expect.any(Object),
        orderBy: expect.any(Object)
      });
    });

    it('should return empty array for volunteer with no history', async () => {
      prisma.volunteerHistory.findMany.mockResolvedValue([]);

      const result = await HistoryRepository.getVolunteerHistory('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getEventHistory', () => {
    it('should get event history', async () => {
      const mockHistory = [
        {
          id: '1',
          volunteerId: 'user-1',
          eventId: 'event-1',
          status: 'COMPLETED'
        },
        {
          id: '2',
          volunteerId: 'user-2',
          eventId: 'event-1',
          status: 'COMPLETED'
        }
      ];

      prisma.volunteerHistory.findMany.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.getEventHistory('event-1');

      expect(result).toEqual(mockHistory);
      expect(prisma.volunteerHistory.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-1' },
        include: expect.any(Object),
        orderBy: expect.any(Object)
      });
    });
  });

  describe('create', () => {
    it('should create history record', async () => {
      const historyData = {
        volunteerId: 'user-1',
        eventId: 'event-1',
        status: 'COMPLETED',
        hoursWorked: 4,
        participationDate: new Date(),
        completionDate: new Date()
      };

      const mockHistory = { id: 'history-1', ...historyData };
      prisma.volunteerHistory.create.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.create(historyData);

      expect(result).toEqual(mockHistory);
      expect(prisma.volunteerHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          volunteerId: historyData.volunteerId,
          eventId: historyData.eventId,
          status: historyData.status,
          hoursWorked: historyData.hoursWorked
        }),
        include: expect.any(Object)
      });
    });

    it('should handle duplicate history record', async () => {
      const historyData = {
        volunteerId: 'user-1',
        eventId: 'event-1',
        status: 'COMPLETED'
      };

      prisma.volunteerHistory.create.mockRejectedValue(new Error('Unique constraint failed'));

      await expect(HistoryRepository.create(historyData)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update history record', async () => {
      const updateData = {
        status: 'COMPLETED',
        hoursWorked: 5,
        performanceRating: 4.5
      };

      const mockUpdated = { id: 'history-1', ...updateData };
      prisma.volunteerHistory.update.mockResolvedValue(mockUpdated);

      const result = await HistoryRepository.update('history-1', updateData);

      expect(result).toEqual(mockUpdated);
      expect(prisma.volunteerHistory.update).toHaveBeenCalledWith({
        where: { id: 'history-1' },
        data: updateData,
        include: expect.any(Object)
      });
    });

    it('should handle update of non-existent record', async () => {
      prisma.volunteerHistory.update.mockRejectedValue(new Error('Record not found'));

      await expect(HistoryRepository.update('nonexistent', {})).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete history record', async () => {
      const mockDeleted = { id: 'history-1', volunteerId: 'user-1' };
      prisma.volunteerHistory.delete.mockResolvedValue(mockDeleted);

      const result = await HistoryRepository.delete('history-1');

      expect(result).toEqual(mockDeleted);
      expect(prisma.volunteerHistory.delete).toHaveBeenCalledWith({
        where: { id: 'history-1' }
      });
    });

    it('should handle deletion of non-existent record', async () => {
      prisma.volunteerHistory.delete.mockRejectedValue(new Error('Record not found'));

      await expect(HistoryRepository.delete('nonexistent')).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find history record by ID', async () => {
      const mockHistory = {
        id: 'history-1',
        volunteerId: 'user-1',
        eventId: 'event-1',
        status: 'COMPLETED'
      };

      prisma.volunteerHistory.findUnique.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.findById('history-1');

      expect(result).toEqual(mockHistory);
      expect(prisma.volunteerHistory.findUnique).toHaveBeenCalledWith({
        where: { id: 'history-1' },
        include: expect.any(Object)
      });
    });

    it('should return null for non-existent record', async () => {
      prisma.volunteerHistory.findUnique.mockResolvedValue(null);

      const result = await HistoryRepository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all history records', async () => {
      const mockHistory = [
        { id: '1', volunteerId: 'user-1', eventId: 'event-1' },
        { id: '2', volunteerId: 'user-2', eventId: 'event-2' }
      ];

      prisma.volunteerHistory.findMany.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.findAll();

      expect(result).toEqual(mockHistory);
      expect(prisma.volunteerHistory.findMany).toHaveBeenCalled();
    });

    it('should find history with filters', async () => {
      const filters = { status: 'COMPLETED', hoursWorked: { gte: 5 } };
      const mockHistory = [{ id: '1', status: 'COMPLETED', hoursWorked: 6 }];

      prisma.volunteerHistory.findMany.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.findAll(filters);

      expect(result).toEqual(mockHistory);
      expect(prisma.volunteerHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: filters })
      );
    });
  });

  describe('count', () => {
    it('should count all history records', async () => {
      prisma.volunteerHistory.count.mockResolvedValue(150);

      const result = await HistoryRepository.count();

      expect(result).toBe(150);
      expect(prisma.volunteerHistory.count).toHaveBeenCalled();
    });

    it('should count history with filters', async () => {
      const filters = { status: 'COMPLETED' };
      prisma.volunteerHistory.count.mockResolvedValue(100);

      const result = await HistoryRepository.count(filters);

      expect(result).toBe(100);
      expect(prisma.volunteerHistory.count).toHaveBeenCalledWith({
        where: filters
      });
    });
  });

  describe('getTotalHours', () => {
    it('should get total hours for volunteer', async () => {
      const mockHistory = [
        { hoursWorked: 5 },
        { hoursWorked: 3 },
        { hoursWorked: 7 }
      ];

      prisma.volunteerHistory.findMany.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.getTotalHours('user-1');

      expect(result).toBe(15);
      expect(prisma.volunteerHistory.findMany).toHaveBeenCalledWith({
        where: { volunteerId: 'user-1', status: 'COMPLETED' },
        select: { hoursWorked: true }
      });
    });

    it('should return 0 for volunteer with no history', async () => {
      prisma.volunteerHistory.findMany.mockResolvedValue([]);

      const result = await HistoryRepository.getTotalHours('user-1');

      expect(result).toBe(0);
    });

    it('should handle null hoursWorked values', async () => {
      const mockHistory = [
        { hoursWorked: 5 },
        { hoursWorked: null },
        { hoursWorked: 3 }
      ];

      prisma.volunteerHistory.findMany.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.getTotalHours('user-1');

      expect(result).toBe(8);
    });
  });

  describe('getAverageRating', () => {
    it('should get average performance rating for volunteer', async () => {
      const mockHistory = [
        { performanceRating: 4.5 },
        { performanceRating: 5.0 },
        { performanceRating: 4.0 }
      ];

      prisma.volunteerHistory.findMany.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.getAverageRating('user-1');

      expect(result).toBe(4.5);
      expect(prisma.volunteerHistory.findMany).toHaveBeenCalledWith({
        where: {
          volunteerId: 'user-1',
          performanceRating: { not: null }
        },
        select: { performanceRating: true }
      });
    });

    it('should return 0 for volunteer with no ratings', async () => {
      prisma.volunteerHistory.findMany.mockResolvedValue([]);

      const result = await HistoryRepository.getAverageRating('user-1');

      expect(result).toBe(0);
    });
  });

  describe('findByDateRange', () => {
    it('should find history by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const mockHistory = [
        { id: '1', participationDate: new Date('2024-06-15') }
      ];

      prisma.volunteerHistory.findMany.mockResolvedValue(mockHistory);

      const result = await HistoryRepository.findByDateRange(startDate, endDate);

      expect(result).toEqual(mockHistory);
      expect(prisma.volunteerHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            participationDate: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      );
    });
  });

  describe('getCompletedEventsCount', () => {
    it('should count completed events for volunteer', async () => {
      prisma.volunteerHistory.count.mockResolvedValue(25);

      const result = await HistoryRepository.getCompletedEventsCount('user-1');

      expect(result).toBe(25);
      expect(prisma.volunteerHistory.count).toHaveBeenCalledWith({
        where: {
          volunteerId: 'user-1',
          status: 'COMPLETED'
        }
      });
    });

    it('should return 0 for volunteer with no completed events', async () => {
      prisma.volunteerHistory.count.mockResolvedValue(0);

      const result = await HistoryRepository.getCompletedEventsCount('user-1');

      expect(result).toBe(0);
    });
  });
});
