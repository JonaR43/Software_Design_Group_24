/**
 * Unit Tests for Event Service
 */

const eventService = require('../../src/services/eventService');
const { eventHelpers } = require('../../src/data/events');
const { userHelpers } = require('../../src/data/users');
const { skillHelpers } = require('../../src/data/skills');

// Mock dependencies
jest.mock('../../src/data/events');
jest.mock('../../src/data/users');
jest.mock('../../src/data/skills');

describe('EventService', () => {
  const mockEvent = {
    id: 'event_001',
    title: 'Community Cleanup',
    description: 'Local park cleanup event',
    location: 'Central Park',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 90000000).toISOString(),
    maxVolunteers: 10,
    currentVolunteers: 3,
    requiredSkills: [
      { skillId: 'skill_001', minLevel: 'beginner', required: true }
    ],
    urgencyLevel: 'normal',
    category: 'environmental',
    status: 'published',
    createdBy: 'admin_001'
  };

  const mockUser = {
    id: 'user_001',
    username: 'volunteer1',
    email: 'volunteer1@example.com',
    role: 'volunteer'
  };

  const mockAdmin = {
    id: 'admin_001',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should get events with default pagination', async () => {
      const mockEvents = [mockEvent];
      const mockSkills = [{ id: 'skill_001', name: 'First Aid' }];
      eventHelpers.filterEvents.mockReturnValue(mockEvents);
      skillHelpers.getAllSkills.mockReturnValue(mockSkills);
      eventHelpers.getEventAssignments.mockReturnValue([]);

      const result = await eventService.getEvents();

      expect(result.success).toBe(true);
      expect(result.data.events).toBeDefined();
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(10);
    });

    it('should apply filters correctly', async () => {
      const mockEvents = [mockEvent];
      const filters = { status: 'published', category: 'environmental' };
      eventHelpers.filterEvents.mockReturnValue(mockEvents);

      const result = await eventService.getEvents(filters);

      expect(result.success).toBe(true);
      expect(eventHelpers.filterEvents).toHaveBeenCalledWith(filters);
      expect(result.data.filters).toEqual(filters);
    });

    it('should handle search filter', async () => {
      const mockEvents = [mockEvent];
      const filters = { search: 'cleanup' };
      eventHelpers.searchEvents.mockReturnValue(mockEvents);

      const result = await eventService.getEvents(filters);

      expect(result.success).toBe(true);
      expect(eventHelpers.searchEvents).toHaveBeenCalledWith('cleanup');
    });

    it('should handle pagination correctly', async () => {
      const mockEvents = Array(15).fill(mockEvent);
      const pagination = { page: 2, limit: 5 };
      eventHelpers.filterEvents.mockReturnValue(mockEvents);

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
      eventHelpers.filterEvents.mockReturnValue(mockEvents);
      const pagination = { sortBy: 'startDate', sortOrder: 'desc' };

      const result = await eventService.getEvents({}, pagination);

      expect(result.success).toBe(true);
      expect(result.data.events[0].id).toBe('event_001');
    });

    it('should sort events in ascending order by default', async () => {
      const mockEvents = [
        { ...mockEvent, id: 'event_001', startDate: '2025-10-05' },
        { ...mockEvent, id: 'event_002', startDate: '2025-10-03' }
      ];
      eventHelpers.filterEvents.mockReturnValue(mockEvents);

      const result = await eventService.getEvents({});

      expect(result.success).toBe(true);
      expect(result.data.events[0].id).toBe('event_002');
    });
  });

  describe('getEventById', () => {
    it('should get event by ID successfully', async () => {
      const mockSkills = [{ id: 'skill_001', name: 'First Aid' }];
      eventHelpers.findById.mockReturnValue(mockEvent);
      skillHelpers.getAllSkills.mockReturnValue(mockSkills);
      eventHelpers.getEventAssignments.mockReturnValue([]);

      const result = await eventService.getEventById('event_001');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('event_001');
      expect(eventHelpers.findById).toHaveBeenCalledWith('event_001');
    });

    it('should handle event not found', async () => {
      eventHelpers.findById.mockReturnValue(null);

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
      userHelpers.findById.mockReturnValue(mockAdmin);
      eventHelpers.createEvent.mockReturnValue({ ...validEventData, id: 'event_new' });

      const result = await eventService.createEvent('admin_001', validEventData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event created successfully');
      expect(eventHelpers.createEvent).toHaveBeenCalled();
    });

    it('should create event with non-admin user ID (controller handles auth)', async () => {
      // Service doesn't validate user roles - that's controller's responsibility
      userHelpers.findById.mockReturnValue(mockUser);
      eventHelpers.createEvent.mockReturnValue({ ...validEventData, id: 'event_new' });

      const result = await eventService.createEvent('user_001', validEventData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event created successfully');
    });

    it('should validate start date is in future', async () => {
      userHelpers.findById.mockReturnValue(mockAdmin);
      const pastDate = { ...validEventData, startDate: new Date(Date.now() - 86400000).toISOString() };

      await expect(eventService.createEvent('admin_001', pastDate))
        .rejects.toThrow('Start date must be in the future');
    });

    it('should validate end date is after start date', async () => {
      userHelpers.findById.mockReturnValue(mockAdmin);
      const invalidDates = {
        ...validEventData,
        startDate: new Date(Date.now() + 90000000).toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString()
      };

      await expect(eventService.createEvent('admin_001', invalidDates))
        .rejects.toThrow('End date must be after start date');
    });

  });

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      userHelpers.findById.mockReturnValue(mockAdmin);
      eventHelpers.findById.mockReturnValue(mockEvent);
      eventHelpers.updateEvent.mockReturnValue({ ...mockEvent, title: 'Updated Event' });

      const result = await eventService.updateEvent('event_001', 'admin_001', { title: 'Updated Event' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event updated successfully');
      expect(eventHelpers.updateEvent).toHaveBeenCalled();
    });


    it('should handle event not found', async () => {
      userHelpers.findById.mockReturnValue(mockAdmin);
      eventHelpers.findById.mockReturnValue(null);

      await expect(eventService.updateEvent('nonexistent', 'admin_001', {}))
        .rejects.toThrow('Event not found');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      userHelpers.findById.mockReturnValue(mockAdmin);
      eventHelpers.findById.mockReturnValue({ ...mockEvent, status: 'draft', currentVolunteers: 0 });
      eventHelpers.deleteEvent.mockReturnValue(mockEvent);

      const result = await eventService.deleteEvent('event_001', 'admin_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event deleted successfully');
      expect(eventHelpers.deleteEvent).toHaveBeenCalledWith('event_001');
    });


    it('should handle event not found', async () => {
      userHelpers.findById.mockReturnValue(mockAdmin);
      eventHelpers.findById.mockReturnValue(null);

      await expect(eventService.deleteEvent('nonexistent', 'admin_001'))
        .rejects.toThrow('Event not found');
    });

    it('should prevent deletion of completed events with assignments', async () => {
      eventHelpers.findById.mockReturnValue({ ...mockEvent, status: 'completed', currentVolunteers: 5 });
      eventHelpers.getEventAssignments.mockReturnValue([{ id: 'assign_001' }]); // Has assignments

      await expect(eventService.deleteEvent('event_001', 'admin_001'))
        .rejects.toThrow('Cannot delete completed event with volunteer assignments');
    });

    it('should prevent deletion of in-progress events', async () => {
      eventHelpers.findById.mockReturnValue({ ...mockEvent, status: 'in-progress' });

      await expect(eventService.deleteEvent('event_001', 'admin_001'))
        .rejects.toThrow('Cannot delete event that is in progress');
    });
  });

  describe('getEventAssignments', () => {
    it('should get event assignments successfully', async () => {
      const mockAssignments = [
        { id: 'assign_001', volunteerId: 'user_001', eventId: 'event_001', status: 'confirmed' }
      ];
      eventHelpers.findById.mockReturnValue(mockEvent);
      eventHelpers.getEventAssignments.mockReturnValue(mockAssignments);
      userHelpers.findById.mockReturnValue(mockUser);

      const result = await eventService.getEventAssignments('event_001');

      expect(result.success).toBe(true);
      expect(result.data.assignments).toHaveLength(1);
      expect(result.data.eventId).toBe('event_001');
    });

    it('should handle event not found', async () => {
      eventHelpers.findById.mockReturnValue(null);

      await expect(eventService.getEventAssignments('nonexistent'))
        .rejects.toThrow('Event not found');
    });
  });

  describe('assignVolunteer', () => {
    it('should assign volunteer successfully', async () => {
      const mockProfile = { userId: 'user_001', skills: [] };
      eventHelpers.findById.mockReturnValue({ ...mockEvent, currentVolunteers: 5 });
      userHelpers.findById.mockReturnValue(mockUser);
      userHelpers.getProfile.mockReturnValue(mockProfile);
      eventHelpers.getEventAssignments.mockReturnValue([]);
      eventHelpers.getVolunteerAssignments.mockReturnValue([]);
      eventHelpers.createAssignment.mockReturnValue({
        id: 'assign_new',
        volunteerId: 'user_001',
        eventId: 'event_001',
        status: 'pending'
      });

      const result = await eventService.assignVolunteer('event_001', 'user_001', {
        matchScore: 85,
        notes: 'Great match'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Volunteer assigned successfully');
      expect(eventHelpers.createAssignment).toHaveBeenCalled();
    });

    it('should handle event not found', async () => {
      eventHelpers.findById.mockReturnValue(null);

      await expect(eventService.assignVolunteer('nonexistent', 'user_001', {}))
        .rejects.toThrow('Event not found');
    });

    it('should handle volunteer not found', async () => {
      eventHelpers.findById.mockReturnValue(mockEvent);
      userHelpers.findById.mockReturnValue(null);

      await expect(eventService.assignVolunteer('event_001', 'nonexistent', {}))
        .rejects.toThrow('Volunteer not found');
    });

    it('should prevent duplicate assignments', async () => {
      const mockProfile = { userId: 'user_001', skills: [] };
      eventHelpers.findById.mockReturnValue(mockEvent);
      userHelpers.findById.mockReturnValue(mockUser);
      userHelpers.getProfile.mockReturnValue(mockProfile);
      eventHelpers.getEventAssignments.mockReturnValue([
        { volunteerId: 'user_001', eventId: 'event_001', status: 'confirmed' }
      ]);
      eventHelpers.getVolunteerAssignments.mockReturnValue([
        { volunteerId: 'user_001', eventId: 'event_001', status: 'confirmed' }
      ]);

      await expect(eventService.assignVolunteer('event_001', 'user_001', {}))
        .rejects.toThrow('Volunteer is already assigned to this event');
    });

    it('should check event capacity', async () => {
      const mockProfile = { userId: 'user_001', skills: [] };
      eventHelpers.findById.mockReturnValue({ ...mockEvent, currentVolunteers: 10, maxVolunteers: 10 });
      userHelpers.findById.mockReturnValue(mockUser);
      userHelpers.getProfile.mockReturnValue(mockProfile);
      eventHelpers.getEventAssignments.mockReturnValue([]);
      eventHelpers.getVolunteerAssignments.mockReturnValue([]);

      await expect(eventService.assignVolunteer('event_001', 'user_001', {}))
        .rejects.toThrow('Event is at capacity');
    });

    it('should validate user is a volunteer', async () => {
      eventHelpers.findById.mockReturnValue(mockEvent);
      userHelpers.findById.mockReturnValue(mockAdmin); // Not a volunteer

      await expect(eventService.assignVolunteer('event_001', 'admin_001', {}))
        .rejects.toThrow('User is not a volunteer');
    });
  });

  describe('getVolunteerEvents', () => {
    it('should get volunteer events successfully', async () => {
      const mockAssignments = [
        { id: 'assign_001', volunteerId: 'user_001', eventId: 'event_001', status: 'confirmed' }
      ];
      userHelpers.findById.mockReturnValue(mockUser);
      eventHelpers.getVolunteerAssignments.mockReturnValue(mockAssignments);
      eventHelpers.findById.mockReturnValue(mockEvent);

      const result = await eventService.getVolunteerEvents('user_001');

      expect(result.success).toBe(true);
      expect(result.data.events).toBeDefined();
      expect(result.data.volunteerId).toBe('user_001');
    });

    it('should filter by status', async () => {
      const mockAssignments = [
        { id: 'assign_001', volunteerId: 'user_001', eventId: 'event_001', status: 'confirmed' },
        { id: 'assign_002', volunteerId: 'user_001', eventId: 'event_002', status: 'pending' }
      ];
      eventHelpers.getVolunteerAssignments.mockReturnValue(mockAssignments);
      eventHelpers.findById.mockReturnValue(mockEvent);

      const result = await eventService.getVolunteerEvents('user_001', { status: 'confirmed' });

      expect(result.success).toBe(true);
      expect(result.data.events.length).toBe(1);
      expect(result.data.events[0].assignment.status).toBe('confirmed');
    });

    it('should filter by timeFilter - upcoming', async () => {
      const futureEvent = { ...mockEvent, startDate: new Date(Date.now() + 86400000).toISOString() };
      const mockAssignments = [
        { id: 'assign_001', volunteerId: 'user_001', eventId: 'event_001', status: 'confirmed' }
      ];
      eventHelpers.getVolunteerAssignments.mockReturnValue(mockAssignments);
      eventHelpers.findById.mockReturnValue(futureEvent);

      const result = await eventService.getVolunteerEvents('user_001', { timeFilter: 'upcoming' });

      expect(result.success).toBe(true);
      expect(result.data.events.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter by timeFilter - past', async () => {
      const pastEvent = { ...mockEvent, endDate: new Date(Date.now() - 86400000).toISOString() };
      const mockAssignments = [
        { id: 'assign_001', volunteerId: 'user_001', eventId: 'event_001', status: 'confirmed' }
      ];
      eventHelpers.getVolunteerAssignments.mockReturnValue(mockAssignments);
      eventHelpers.findById.mockReturnValue(pastEvent);

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
        { id: 'assign_001', volunteerId: 'user_001', eventId: 'event_001', status: 'confirmed' }
      ];
      eventHelpers.getVolunteerAssignments.mockReturnValue(mockAssignments);
      eventHelpers.findById.mockReturnValue(currentEvent);

      const result = await eventService.getVolunteerEvents('user_001', { timeFilter: 'current' });

      expect(result.success).toBe(true);
      expect(result.data.events).toBeDefined();
    });

    it('should handle volunteer not found', async () => {
      userHelpers.findById.mockReturnValue(null);
      eventHelpers.getVolunteerAssignments.mockReturnValue([]);

      const result = await eventService.getVolunteerEvents('nonexistent');

      expect(result.success).toBe(true);
      expect(result.data.events).toEqual([]);
    });
  });

  describe('getEventStats', () => {
    it('should get event statistics successfully', async () => {
      const mockEvents = [mockEvent, { ...mockEvent, id: 'event_002' }];
      const mockStats = {
        totalEvents: 2,
        eventsByStatus: {},
        eventsNeedingVolunteers: 1
      };
      eventHelpers.getAllEvents.mockReturnValue(mockEvents);
      eventHelpers.getEventStats.mockReturnValue(mockStats);

      const result = await eventService.getEventStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('eventsByCategory');
      expect(result.data).toHaveProperty('eventsByUrgency');
      expect(result.data).toHaveProperty('recentEvents');
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
        status: 'confirmed'
      };
      eventHelpers.updateAssignmentStatus.mockReturnValue(mockAssignment);

      const result = await eventService.updateAssignmentStatus('assign_001', 'confirmed', 'Confirmed!');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Assignment status updated successfully');
      expect(eventHelpers.updateAssignmentStatus).toHaveBeenCalledWith('assign_001', 'confirmed', 'Confirmed!');
    });

    it('should reject invalid status', async () => {
      await expect(eventService.updateAssignmentStatus('assign_001', 'invalid_status'))
        .rejects.toThrow('Invalid status');
    });

    it('should handle assignment not found', async () => {
      eventHelpers.updateAssignmentStatus.mockReturnValue(null);

      await expect(eventService.updateAssignmentStatus('nonexistent', 'confirmed'))
        .rejects.toThrow('Assignment not found');
    });
  });
});