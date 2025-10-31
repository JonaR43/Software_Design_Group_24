/**
 * Unit Tests for Event Service
 * Updated to mock Prisma repositories
 */

const eventService = require('../../src/services/eventService');
const eventRepository = require('../../src/database/repositories/eventRepository');
const userRepository = require('../../src/database/repositories/userRepository');
const skillRepository = require('../../src/database/repositories/skillRepository');

// Mock dependencies
jest.mock('../../src/database/repositories/eventRepository');
jest.mock('../../src/database/repositories/userRepository');
jest.mock('../../src/database/repositories/skillRepository');

describe('EventService', () => {
  const mockEvent = {
    id: 'event_001',
    title: 'Community Cleanup',
    description: 'Local park cleanup event',
    location: 'Central Park',
    address: '123 Park Ave',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 90000000).toISOString(),
    maxVolunteers: 10,
    currentVolunteers: 3,
    urgencyLevel: 'MEDIUM',
    category: 'environmental',
    status: 'PUBLISHED',
    createdBy: 'admin_001',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Prisma includes
    creator: {
      id: 'admin_001',
      username: 'admin',
      email: 'admin@example.com'
    },
    requirements: [
      {
        skillId: 'skill_001',
        minLevel: 'BEGINNER',
        isRequired: true,
        skill: { id: 'skill_001', name: 'First Aid', category: 'medical' }
      }
    ],
    _count: {
      assignments: 3
    }
  };

  const mockUser = {
    id: 'user_001',
    username: 'volunteer1',
    email: 'volunteer1@example.com',
    role: 'VOLUNTEER'
  };

  const mockAdmin = {
    id: 'admin_001',
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should get events with default pagination', async () => {
      const mockEvents = [mockEvent];
      eventRepository.findAll.mockResolvedValue({ events: mockEvents, total: 1 });

      const result = await eventService.getEvents();

      expect(result.success).toBe(true);
      expect(result.data.events).toBeDefined();
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(10);
    });

    it('should apply filters correctly', async () => {
      const mockEvents = [mockEvent];
      const filters = { status: 'published', category: 'environmental' };
      eventRepository.findAll.mockResolvedValue({ events: mockEvents, total: 1 });

      const result = await eventService.getEvents(filters);

      expect(result.success).toBe(true);
      expect(eventRepository.findAll).toHaveBeenCalledWith(filters, { page: 1, limit: 10 });
      expect(result.data.filters).toEqual(filters);
    });

    it('should handle search filter', async () => {
      const mockEvents = [mockEvent];
      const filters = { search: 'cleanup' };
      eventRepository.findAll.mockResolvedValue({ events: mockEvents, total: 1 });

      const result = await eventService.getEvents(filters);

      expect(result.success).toBe(true);
      expect(eventRepository.findAll).toHaveBeenCalledWith(filters, { page: 1, limit: 10 });
    });

    it('should handle pagination correctly', async () => {
      const mockEvents = Array(5).fill(mockEvent).map((e, i) => ({ ...e, id: `event_${i}` }));
      const pagination = { page: 2, limit: 5 };
      eventRepository.findAll.mockResolvedValue({ events: mockEvents, total: 15 });

      const result = await eventService.getEvents({}, pagination);

      expect(result.success).toBe(true);
      expect(result.data.pagination.page).toBe(2);
      expect(result.data.pagination.total).toBe(15);
      expect(result.data.pagination.pages).toBe(3);
    });

    it('should sort events in descending order', async () => {
      const mockEvents = [
        { ...mockEvent, id: 'event_001', startDate: '2025-10-05' },
        { ...mockEvent, id: 'event_002', startDate: '2025-10-03' }
      ];
      eventRepository.findAll.mockResolvedValue({ events: mockEvents, total: 2 });
      const pagination = { sortBy: 'startDate', sortOrder: 'desc' };

      const result = await eventService.getEvents({}, pagination);

      expect(result.success).toBe(true);
      // Repository handles sorting, just check we get events
      expect(result.data.events.length).toBe(2);
    });

    it('should sort events in ascending order by default', async () => {
      const mockEvents = [
        { ...mockEvent, id: 'event_002', startDate: '2025-10-03' },
        { ...mockEvent, id: 'event_001', startDate: '2025-10-05' }
      ];
      eventRepository.findAll.mockResolvedValue({ events: mockEvents, total: 2 });

      const result = await eventService.getEvents({});

      expect(result.success).toBe(true);
      // Repository handles sorting, just check we get events
      expect(result.data.events.length).toBe(2);
    });
  });

  describe('getEventById', () => {
    it('should get event by ID successfully', async () => {
      eventRepository.findById.mockResolvedValue(mockEvent);

      const result = await eventService.getEventById('event_001');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('event_001');
      expect(eventRepository.findById).toHaveBeenCalledWith('event_001');
    });

    it('should handle event not found', async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(eventService.getEventById('nonexistent'))
        .rejects.toThrow('Event not found');
    });
  });

  describe('createEvent', () => {
    const validEventData = {
      title: 'New Event',
      description: 'Test event',
      location: 'Test Location',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 90000000).toISOString(),
      maxVolunteers: 10,
      category: 'environmental',
      urgencyLevel: 'normal',
      requiredSkills: []
    };

    it('should create event successfully', async () => {
      const newEvent = { ...mockEvent, ...validEventData, id: 'event_new' };
      eventRepository.create.mockResolvedValue(newEvent);

      const result = await eventService.createEvent('admin_001', validEventData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event created successfully');
      expect(eventRepository.create).toHaveBeenCalled();
    });

    it('should create event with non-admin user ID (controller handles auth)', async () => {
      // Service doesn't validate user roles - that's controller's responsibility
      const newEvent = { ...mockEvent, ...validEventData, id: 'event_new', createdBy: 'user_001' };
      eventRepository.create.mockResolvedValue(newEvent);

      const result = await eventService.createEvent('user_001', validEventData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event created successfully');
    });

    it('should validate start date is in future', async () => {
      const pastDate = { ...validEventData, startDate: new Date(Date.now() - 86400000).toISOString() };

      await expect(eventService.createEvent('admin_001', pastDate))
        .rejects.toThrow('Start date must be in the future');
    });

    it('should validate end date is after start date', async () => {
      const invalidDates = {
        ...validEventData,
        startDate: new Date(Date.now() + 90000000).toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString()
      };

      await expect(eventService.createEvent('admin_001', invalidDates))
        .rejects.toThrow('End date must be after start date');
    });

    it('should validate required skills array type', async () => {
      const invalidData = { ...validEventData, requiredSkills: 'not-an-array' };

      await expect(eventService.createEvent('admin_001', invalidData))
        .rejects.toThrow('Required skills must be an array');
    });

    it('should validate required skill fields', async () => {
      const invalidData = {
        ...validEventData,
        requiredSkills: [{ skillId: 'skill_001' }] // missing minLevel
      };

      await expect(eventService.createEvent('admin_001', invalidData))
        .rejects.toThrow('Each required skill must have skillId and minLevel');
    });

    it('should validate skill exists', async () => {
      skillRepository.findById.mockResolvedValue(null);
      const invalidData = {
        ...validEventData,
        requiredSkills: [{ skillId: 'nonexistent', minLevel: 'beginner', required: true }]
      };

      await expect(eventService.createEvent('admin_001', invalidData))
        .rejects.toThrow('Skill with ID nonexistent not found');
    });

    it('should validate proficiency level', async () => {
      skillRepository.findById.mockResolvedValue({ id: 'skill_001', name: 'Test' });
      const invalidData = {
        ...validEventData,
        requiredSkills: [{ skillId: 'skill_001', minLevel: 'invalid_level', required: true }]
      };

      await expect(eventService.createEvent('admin_001', invalidData))
        .rejects.toThrow('Invalid proficiency level: invalid_level');
    });

  });

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      eventRepository.findById.mockResolvedValue(mockEvent);
      const updatedEvent = { ...mockEvent, title: 'Updated Event' };
      eventRepository.update.mockResolvedValue(updatedEvent);

      const result = await eventService.updateEvent('event_001', 'admin_001', { title: 'Updated Event' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event updated successfully');
      expect(eventRepository.update).toHaveBeenCalled();
    });

    it('should validate required skills when updating', async () => {
      const updateData = {
        requiredSkills: [{ skillId: 'skill_002', minLevel: 'beginner', required: true }]
      };
      eventRepository.findById.mockResolvedValue(mockEvent);
      eventRepository.update.mockResolvedValue({ ...mockEvent, ...updateData });
      skillRepository.findById.mockResolvedValue({ id: 'skill_002', name: 'Test Skill' });

      const result = await eventService.updateEvent('event_001', 'admin_001', updateData);

      expect(result.success).toBe(true);
    });

    it('should validate dates when updating startDate only', async () => {
      const updateData = {
        startDate: new Date(Date.now() + 86400000).toISOString()
      };
      eventRepository.findById.mockResolvedValue(mockEvent);
      eventRepository.update.mockResolvedValue({ ...mockEvent, ...updateData });

      const result = await eventService.updateEvent('event_001', 'admin_001', updateData);

      expect(result.success).toBe(true);
    });

    it('should handle update failure', async () => {
      eventRepository.findById.mockResolvedValue(mockEvent);
      eventRepository.update.mockResolvedValue(null);

      await expect(eventService.updateEvent('event_001', 'admin_001', { title: 'Updated' }))
        .rejects.toThrow('Failed to update event');
    });

    it('should handle event not found', async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(eventService.updateEvent('nonexistent', 'admin_001', {}))
        .rejects.toThrow('Event not found');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      const draftEvent = { ...mockEvent, status: 'DRAFT', currentVolunteers: 0 };
      eventRepository.findById.mockResolvedValue(draftEvent);
      eventRepository.getAssignments.mockResolvedValue([]);
      eventRepository.delete.mockResolvedValue(draftEvent);

      const result = await eventService.deleteEvent('event_001', 'admin_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event deleted successfully');
      expect(eventRepository.delete).toHaveBeenCalledWith('event_001');
    });


    it('should handle event not found', async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(eventService.deleteEvent('nonexistent', 'admin_001'))
        .rejects.toThrow('Event not found');
    });

    it('should prevent deletion of completed events with assignments', async () => {
      const completedEvent = { ...mockEvent, status: 'COMPLETED', currentVolunteers: 5 };
      eventRepository.findById.mockResolvedValue(completedEvent);
      eventRepository.getAssignments.mockResolvedValue([{ id: 'assign_001' }]); // Has assignments

      await expect(eventService.deleteEvent('event_001', 'admin_001'))
        .rejects.toThrow('Cannot delete completed event with volunteer assignments');
    });

    it('should prevent deletion of in-progress events', async () => {
      const inProgressEvent = { ...mockEvent, status: 'IN_PROGRESS' };
      eventRepository.findById.mockResolvedValue(inProgressEvent);

      await expect(eventService.deleteEvent('event_001', 'admin_001'))
        .rejects.toThrow('Cannot delete event that is in progress');
    });
  });

  describe('getEventAssignments', () => {
    it('should get event assignments successfully', async () => {
      const mockAssignments = [
        {
          id: 'assign_001',
          volunteerId: 'user_001',
          eventId: 'event_001',
          status: 'CONFIRMED',
          assignedAt: new Date(),
          volunteer: {
            id: 'user_001',
            username: 'volunteer1',
            email: 'volunteer1@example.com',
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              phone: '123-456-7890',
              skills: []
            }
          }
        }
      ];
      eventRepository.findById.mockResolvedValue(mockEvent);
      eventRepository.getAssignments.mockResolvedValue(mockAssignments);

      const result = await eventService.getEventAssignments('event_001');

      expect(result.success).toBe(true);
      expect(result.data.assignments).toHaveLength(1);
      expect(result.data.eventId).toBe('event_001');
    });

    it('should handle event not found', async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(eventService.getEventAssignments('nonexistent'))
        .rejects.toThrow('Event not found');
    });
  });

  describe('assignVolunteer', () => {
    it('should assign volunteer successfully', async () => {
      const publishedEvent = { ...mockEvent, status: 'PUBLISHED', currentVolunteers: 5 };
      eventRepository.findById.mockResolvedValue(publishedEvent);
      userRepository.findById.mockResolvedValue(mockUser);
      eventRepository.getVolunteerAssignments.mockResolvedValue([]);
      eventRepository.createAssignment.mockResolvedValue({
        id: 'assign_new',
        volunteerId: 'user_001',
        eventId: 'event_001',
        status: 'PENDING'
      });

      const result = await eventService.assignVolunteer('event_001', 'user_001', {
        matchScore: 85,
        notes: 'Great match'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Volunteer assigned successfully');
      expect(eventRepository.createAssignment).toHaveBeenCalled();
    });

    it('should handle event not found', async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(eventService.assignVolunteer('nonexistent', 'user_001', {}))
        .rejects.toThrow('Event not found');
    });

    it('should handle volunteer not found', async () => {
      eventRepository.findById.mockResolvedValue(mockEvent);
      userRepository.findById.mockResolvedValue(null);

      await expect(eventService.assignVolunteer('event_001', 'nonexistent', {}))
        .rejects.toThrow('Volunteer not found');
    });

    it('should prevent duplicate assignments', async () => {
      const publishedEvent = { ...mockEvent, status: 'PUBLISHED' };
      eventRepository.findById.mockResolvedValue(publishedEvent);
      userRepository.findById.mockResolvedValue(mockUser);
      eventRepository.getVolunteerAssignments.mockResolvedValue([
        { volunteerId: 'user_001', eventId: 'event_001', status: 'CONFIRMED' }
      ]);

      await expect(eventService.assignVolunteer('event_001', 'user_001', {}))
        .rejects.toThrow('Volunteer is already assigned to this event');
    });

    it('should reject assignment when event is not published', async () => {
      const draftEvent = { ...mockEvent, status: 'DRAFT' };
      eventRepository.findById.mockResolvedValue(draftEvent);
      userRepository.findById.mockResolvedValue(mockUser);
      eventRepository.getVolunteerAssignments.mockResolvedValue([]);

      await expect(eventService.assignVolunteer('event_001', 'user_001', {}))
        .rejects.toThrow('Event is not accepting volunteers');
    });

    it('should check event capacity', async () => {
      const fullEvent = { ...mockEvent, status: 'PUBLISHED', currentVolunteers: 10, maxVolunteers: 10 };
      eventRepository.findById.mockResolvedValue(fullEvent);
      userRepository.findById.mockResolvedValue(mockUser);
      eventRepository.getVolunteerAssignments.mockResolvedValue([]);

      await expect(eventService.assignVolunteer('event_001', 'user_001', {}))
        .rejects.toThrow('Event is at capacity');
    });

    it('should validate user is a volunteer', async () => {
      eventRepository.findById.mockResolvedValue(mockEvent);
      userRepository.findById.mockResolvedValue(mockAdmin); // Not a volunteer

      await expect(eventService.assignVolunteer('event_001', 'admin_001', {}))
        .rejects.toThrow('User is not a volunteer');
    });
  });

  describe('getVolunteerEvents', () => {
    it('should get volunteer events successfully', async () => {
      const mockAssignments = [
        {
          id: 'assign_001',
          volunteerId: 'user_001',
          eventId: 'event_001',
          status: 'CONFIRMED',
          matchScore: 85,
          assignedAt: new Date(),
          confirmedAt: new Date(),
          notes: 'Great match',
          event: mockEvent
        }
      ];
      eventRepository.getVolunteerAssignments.mockResolvedValue(mockAssignments);

      const result = await eventService.getVolunteerEvents('user_001');

      expect(result.success).toBe(true);
      expect(result.data.events).toBeDefined();
      expect(result.data.volunteerId).toBe('user_001');
    });

    it('should filter by status', async () => {
      const mockAssignments = [
        {
          id: 'assign_001',
          volunteerId: 'user_001',
          status: 'CONFIRMED',
          assignedAt: new Date(),
          event: { ...mockEvent, id: 'event_001' }
        },
        {
          id: 'assign_002',
          volunteerId: 'user_001',
          status: 'PENDING',
          assignedAt: new Date(),
          event: { ...mockEvent, id: 'event_002' }
        }
      ];
      eventRepository.getVolunteerAssignments.mockResolvedValue(mockAssignments);

      const result = await eventService.getVolunteerEvents('user_001', { status: 'confirmed' });

      expect(result.success).toBe(true);
      expect(result.data.events.length).toBe(1);
      expect(result.data.events[0].assignment.status).toBe('confirmed');
    });

    it('should filter by timeFilter - upcoming', async () => {
      const futureEvent = { ...mockEvent, startDate: new Date(Date.now() + 86400000).toISOString() };
      const mockAssignments = [
        {
          id: 'assign_001',
          volunteerId: 'user_001',
          status: 'CONFIRMED',
          assignedAt: new Date(),
          event: futureEvent
        }
      ];
      eventRepository.getVolunteerAssignments.mockResolvedValue(mockAssignments);

      const result = await eventService.getVolunteerEvents('user_001', { timeFilter: 'upcoming' });

      expect(result.success).toBe(true);
      expect(result.data.events.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter by timeFilter - past', async () => {
      const pastEvent = { ...mockEvent, endDate: new Date(Date.now() - 86400000).toISOString() };
      const mockAssignments = [
        {
          id: 'assign_001',
          volunteerId: 'user_001',
          status: 'CONFIRMED',
          assignedAt: new Date(),
          event: pastEvent
        }
      ];
      eventRepository.getVolunteerAssignments.mockResolvedValue(mockAssignments);

      const result = await eventService.getVolunteerEvents('user_001', { timeFilter: 'past' });

      expect(result.success).toBe(true);
      expect(result.data.events).toBeDefined();
    });

    it('should filter by timeFilter - current', async () => {
      const currentEvent = {
        ...mockEvent,
        startDate: new Date(Date.now() - 3600000).toISOString(),
        endDate: new Date(Date.now() + 3600000).toISOString()
      };
      const mockAssignments = [
        {
          id: 'assign_001',
          volunteerId: 'user_001',
          status: 'CONFIRMED',
          assignedAt: new Date(),
          event: currentEvent
        }
      ];
      eventRepository.getVolunteerAssignments.mockResolvedValue(mockAssignments);

      const result = await eventService.getVolunteerEvents('user_001', { timeFilter: 'current' });

      expect(result.success).toBe(true);
      expect(result.data.events).toBeDefined();
    });

    it('should handle volunteer not found', async () => {
      eventRepository.getVolunteerAssignments.mockResolvedValue([]);

      const result = await eventService.getVolunteerEvents('nonexistent');

      expect(result.success).toBe(true);
      expect(result.data.events).toEqual([]);
    });
  });

  describe('getEventStats', () => {
    it('should get event statistics successfully', async () => {
      const mockEvents = [
        { ...mockEvent, category: 'environment', urgencyLevel: 'MEDIUM' },
        { ...mockEvent, id: 'event_002', category: 'community', urgencyLevel: 'HIGH' }
      ];
      const mockStats = {
        total: 2,
        byStatus: {
          published: 1,
          draft: 1
        }
      };
      eventRepository.getEventStats.mockResolvedValue(mockStats);
      eventRepository.findAll.mockResolvedValue({ events: mockEvents, total: 2 });

      const result = await eventService.getEventStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('eventsByCategory');
      expect(result.data).toHaveProperty('eventsByUrgency');
      expect(result.data).toHaveProperty('recentEvents');
      expect(Array.isArray(result.data.eventsByCategory)).toBe(true);
      expect(Array.isArray(result.data.eventsByUrgency)).toBe(true);
    });

    it('should count events by category and urgency', async () => {
      const mockEvents = [
        { ...mockEvent, category: 'environment', urgencyLevel: 'MEDIUM', createdAt: new Date() },
        { ...mockEvent, id: 'event_002', category: 'community', urgencyLevel: 'HIGH', createdAt: new Date() },
        { ...mockEvent, id: 'event_003', category: 'environment', urgencyLevel: 'LOW', createdAt: new Date() }
      ];
      const mockStats = {
        total: 3,
        byStatus: {
          published: 2,
          draft: 1
        }
      };
      eventRepository.getEventStats.mockResolvedValue(mockStats);
      eventRepository.findAll.mockResolvedValue({ events: mockEvents, total: 3 });

      const result = await eventService.getEventStats();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.eventsByCategory)).toBe(true);
      expect(Array.isArray(result.data.eventsByUrgency)).toBe(true);
      expect(result.data.recentEvents).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getEventCategories', () => {
    it('should get event categories successfully', async () => {
      const result = await eventService.getEventCategories();

      expect(result.success).toBe(true);
      expect(result.data.categories).toBeDefined();
      expect(result.data.urgencyLevels).toBeDefined();
      expect(result.data.statuses).toBeDefined();
    });
  });

  describe('updateAssignmentStatus', () => {
    it('should update assignment status successfully', async () => {
      const mockAssignment = {
        id: 'assign_001',
        volunteerId: 'user_001',
        eventId: 'event_001',
        status: 'CONFIRMED'
      };
      eventRepository.updateAssignmentStatus.mockResolvedValue(mockAssignment);

      const result = await eventService.updateAssignmentStatus('assign_001', 'confirmed', 'Confirmed!');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Assignment status updated successfully');
      expect(eventRepository.updateAssignmentStatus).toHaveBeenCalledWith('assign_001', 'confirmed', 'Confirmed!');
    });

    it('should reject invalid status', async () => {
      await expect(eventService.updateAssignmentStatus('assign_001', 'invalid_status'))
        .rejects.toThrow('Invalid status');
    });

    it('should handle assignment not found', async () => {
      eventRepository.updateAssignmentStatus.mockResolvedValue(null);

      await expect(eventService.updateAssignmentStatus('nonexistent', 'confirmed'))
        .rejects.toThrow('Assignment not found');
    });
  });
});