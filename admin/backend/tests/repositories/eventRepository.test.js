const EventRepository = require('../../src/database/repositories/eventRepository');
const prisma = require('../../src/database/prisma');

jest.mock('../../src/database/prisma', () => ({
  event: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  assignment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn()
  },
  eventAssignment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn()
  },
  eventRequiredSkill: {
    createMany: jest.fn(),
    deleteMany: jest.fn()
  },
  eventRequirement: {
    createMany: jest.fn(),
    deleteMany: jest.fn()
  }
}));

describe('EventRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should find all events', async () => {
      const mockEvents = [
        { id: '1', title: 'Event 1', description: 'Description 1' },
        { id: '2', title: 'Event 2', description: 'Description 2' }
      ];

      prisma.event.count.mockResolvedValue(2);
      prisma.event.findMany.mockResolvedValue(mockEvents);

      const result = await EventRepository.findAll();

      expect(result.events).toEqual(mockEvents);
      expect(result.total).toBe(2);
      expect(prisma.event.findMany).toHaveBeenCalled();
      expect(prisma.event.count).toHaveBeenCalled();
    });

    it('should find events with filters', async () => {
      const filters = { status: 'PUBLISHED', category: 'community' };
      prisma.event.count.mockResolvedValue(1);
      prisma.event.findMany.mockResolvedValue([{ id: '1', title: 'Filtered Event' }]);

      const result = await EventRepository.findAll(filters);

      expect(result.events).toHaveLength(1);
      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining(filters)
        })
      );
    });

    it('should find events with pagination', async () => {
      const options = { page: 2, limit: 10 };
      prisma.event.count.mockResolvedValue(25);
      prisma.event.findMany.mockResolvedValue([]);

      const result = await EventRepository.findAll({}, options);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(25);
      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10
        })
      );
    });
  });

  describe('findById', () => {
    it('should find event by ID', async () => {
      const mockEvent = {
        id: '1',
        title: 'Test Event',
        description: 'Test Description'
      };

      prisma.event.findUnique.mockResolvedValue(mockEvent);

      const result = await EventRepository.findById('1');

      expect(result).toEqual(mockEvent);
      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object)
      });
    });

    it('should return null for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      const result = await EventRepository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create event successfully', async () => {
      const eventData = {
        title: 'New Event',
        description: 'Event description',
        address: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        startDate: new Date(),
        endDate: new Date(),
        maxVolunteers: 20,
        category: 'community'
      };

      const mockEvent = { id: 'new-id', ...eventData };
      prisma.event.create.mockResolvedValue(mockEvent);

      const result = await EventRepository.create(eventData);

      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining(eventData),
        include: expect.any(Object)
      });
    });

    it('should create event with required skills', async () => {
      const eventData = {
        title: 'New Event',
        description: 'Event description',
        address: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        startDate: new Date(),
        endDate: new Date(),
        maxVolunteers: 20,
        category: 'community',
        requiredSkills: [
          { skillId: 'skill-1', minLevel: 'intermediate', required: true }
        ]
      };

      const mockEvent = { id: 'new-id', title: eventData.title };
      prisma.event.create.mockResolvedValue(mockEvent);

      const result = await EventRepository.create(eventData);

      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update event successfully', async () => {
      const updateData = { title: 'Updated Title', description: 'Updated Description' };
      const mockUpdatedEvent = { id: '1', ...updateData };

      prisma.event.update.mockResolvedValue(mockUpdatedEvent);

      const result = await EventRepository.update('1', updateData);

      expect(result).toEqual(mockUpdatedEvent);
      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining(updateData),
        include: expect.any(Object)
      });
    });

    it('should update event with new required skills', async () => {
      const updateData = {
        title: 'Updated Event',
        requiredSkills: [
          { skillId: 'skill-2', minLevel: 'advanced', required: true }
        ]
      };

      const mockEvent = { id: '1', title: updateData.title };
      prisma.eventRequiredSkill.deleteMany.mockResolvedValue({ count: 1 });
      prisma.event.update.mockResolvedValue(mockEvent);

      const result = await EventRepository.update('1', updateData);

      expect(result).toEqual(mockEvent);
      expect(prisma.eventRequirement.deleteMany).toHaveBeenCalledWith({
        where: { eventId: '1' }
      });
    });
  });

  describe('delete', () => {
    it('should delete event successfully', async () => {
      const mockDeletedEvent = { id: '1', title: 'Deleted Event' };
      prisma.event.delete.mockResolvedValue(mockDeletedEvent);

      const result = await EventRepository.delete('1');

      expect(result).toEqual(mockDeletedEvent);
      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });

    it('should handle deletion of non-existent event', async () => {
      prisma.event.delete.mockRejectedValue(new Error('Record not found'));

      await expect(EventRepository.delete('nonexistent')).rejects.toThrow();
    });
  });

  describe('getAssignments', () => {
    it('should get event assignments', async () => {
      const mockAssignments = [
        { id: '1', eventId: 'event-1', volunteerId: 'user-1' },
        { id: '2', eventId: 'event-1', volunteerId: 'user-2' }
      ];

      prisma.assignment.findMany.mockResolvedValue(mockAssignments);

      const result = await EventRepository.getAssignments('event-1');

      expect(result).toEqual(mockAssignments);
      expect(prisma.assignment.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-1' },
        include: expect.any(Object)
      });
    });

    it('should return empty array for event with no assignments', async () => {
      prisma.assignment.findMany.mockResolvedValue([]);

      const result = await EventRepository.getAssignments('event-1');

      expect(result).toEqual([]);
    });
  });

  describe('assignVolunteer', () => {
    it('should assign volunteer to event', async () => {
      const mockAssignment = {
        id: 'assignment-1',
        eventId: 'event-1',
        volunteerId: 'user-1',
        status: 'CONFIRMED'
      };

      prisma.assignment.create.mockResolvedValue(mockAssignment);

      const result = await EventRepository.assignVolunteer('event-1', 'user-1');

      expect(result).toEqual(mockAssignment);
      expect(prisma.assignment.create).toHaveBeenCalledWith({
        data: {
          eventId: 'event-1',
          volunteerId: 'user-1',
          status: 'CONFIRMED'
        },
        include: expect.any(Object)
      });
    });

    it('should handle duplicate assignment error', async () => {
      prisma.assignment.create.mockRejectedValue(new Error('Unique constraint failed'));

      await expect(EventRepository.assignVolunteer('event-1', 'user-1')).rejects.toThrow();
    });
  });

  describe('unassignVolunteer', () => {
    it('should unassign volunteer from event', async () => {
      const mockDeleted = { id: 'assignment-1', eventId: 'event-1', volunteerId: 'user-1' };
      prisma.assignment.delete.mockResolvedValue(mockDeleted);

      const result = await EventRepository.unassignVolunteer('event-1', 'user-1');

      expect(result).toEqual(mockDeleted);
      expect(prisma.assignment.delete).toHaveBeenCalledWith({
        where: {
          eventId_volunteerId: {
            eventId: 'event-1',
            volunteerId: 'user-1'
          }
        }
      });
    });

    it('should handle unassigning non-existent assignment', async () => {
      prisma.assignment.delete.mockRejectedValue(new Error('Record not found'));

      await expect(EventRepository.unassignVolunteer('event-1', 'user-1')).rejects.toThrow();
    });
  });

  describe('findByVolunteer', () => {
    it('should find events by volunteer', async () => {
      const mockAssignments = [
        {
          event: { id: '1', title: 'Event 1' },
          status: 'CONFIRMED'
        },
        {
          event: { id: '2', title: 'Event 2' },
          status: 'CONFIRMED'
        }
      ];

      prisma.assignment.findMany.mockResolvedValue(mockAssignments);

      const result = await EventRepository.findByVolunteer('user-1');

      expect(result).toHaveLength(2);
      expect(prisma.assignment.findMany).toHaveBeenCalledWith({
        where: { volunteerId: 'user-1' },
        include: expect.any(Object)
      });
    });
  });

  describe('count', () => {
    it('should count all events', async () => {
      prisma.event.count.mockResolvedValue(42);

      const result = await EventRepository.count();

      expect(result).toBe(42);
      expect(prisma.event.count).toHaveBeenCalled();
    });

    it('should count events with filters', async () => {
      const filters = { status: 'PUBLISHED' };
      prisma.event.count.mockResolvedValue(25);

      const result = await EventRepository.count(filters);

      expect(result).toBe(25);
      expect(prisma.event.count).toHaveBeenCalledWith({
        where: filters
      });
    });
  });

  describe('findByDateRange', () => {
    it('should find events by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const mockEvents = [
        { id: '1', title: 'Event 1', startDate: new Date('2024-06-15') }
      ];

      prisma.event.findMany.mockResolvedValue(mockEvents);

      const result = await EventRepository.findByDateRange(startDate, endDate);

      expect(result).toEqual(mockEvents);
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: {
          startDate: {
            gte: startDate,
            lte: endDate
          }
        },
        include: expect.any(Object)
      });
    });
  });

  describe('isVolunteerAssigned', () => {
    it('should return true if volunteer is assigned', async () => {
      prisma.assignment.findUnique.mockResolvedValue({
        id: 'assignment-1',
        eventId: 'event-1',
        volunteerId: 'user-1'
      });

      const result = await EventRepository.isVolunteerAssigned('event-1', 'user-1');

      expect(result).toBe(true);
      expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
        where: {
          eventId_volunteerId: {
            eventId: 'event-1',
            volunteerId: 'user-1'
          }
        }
      });
    });

    it('should return false if volunteer is not assigned', async () => {
      prisma.assignment.findUnique.mockResolvedValue(null);

      const result = await EventRepository.isVolunteerAssigned('event-1', 'user-1');

      expect(result).toBe(false);
    });
  });

  describe('getVolunteerCount', () => {
    it('should get volunteer count for event', async () => {
      prisma.assignment.count.mockResolvedValue(15);

      const result = await EventRepository.getVolunteerCount('event-1');

      expect(result).toBe(15);
      expect(prisma.assignment.count).toHaveBeenCalledWith({
        where: {
          eventId: 'event-1',
          status: 'CONFIRMED'
        }
      });
    });

    it('should return 0 for event with no volunteers', async () => {
      prisma.assignment.count.mockResolvedValue(0);

      const result = await EventRepository.getVolunteerCount('event-1');

      expect(result).toBe(0);
    });
  });
});
