/**
 * Unit Tests for Event Controller
 */

const request = require('supertest');
const express = require('express');
const eventController = require('../../src/controllers/eventController');

// Mock the event service
jest.mock('../../src/services/eventService');
const eventService = require('../../src/services/eventService');

const app = express();
app.use(express.json());

// Setup routes with mock middleware for authentication
const mockAuth = (req, res, next) => {
  req.user = { id: 'user_001', role: 'admin' }; // Mock authenticated admin
  next();
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: err.message
  });
};

app.get('/events', mockAuth, eventController.getEvents);
app.get('/events/:id', mockAuth, eventController.getEventById);
app.post('/events', mockAuth, eventController.createEvent);
app.put('/events/:id', mockAuth, eventController.updateEvent);
app.delete('/events/:id', mockAuth, eventController.deleteEvent);
app.get('/events/:id/assignments', mockAuth, eventController.getEventAssignments);
app.post('/events/:eventId/assign/:volunteerId', mockAuth, eventController.assignVolunteer);
app.get('/my-events', mockAuth, eventController.getMyEvents);
app.post('/events/:id/join', (req, res, next) => {
  req.user = { id: 'user_001', role: 'volunteer' }; // Volunteer for join/leave
  next();
}, eventController.joinEvent);
app.post('/events/:id/leave', (req, res, next) => {
  req.user = { id: 'user_001', role: 'volunteer' }; // Volunteer for join/leave
  next();
}, eventController.leaveEvent);

// Add error handler after all routes
app.use(errorHandler);

describe('EventController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /events', () => {
    it('should get all events successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          events: [
            { id: 'event_001', title: 'Test Event', status: 'published' }
          ],
          pagination: { page: 1, limit: 10, totalPages: 1, totalEvents: 1 }
        }
      };

      eventService.getEvents.mockResolvedValue(mockResponse);

      const response = await request(app).get('/events');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.events).toHaveLength(1);
    });

    it('should handle filters and pagination', async () => {
      const mockResponse = {
        success: true,
        data: {
          events: [],
          pagination: { page: 2, limit: 5, totalPages: 3, totalEvents: 15 }
        }
      };

      eventService.getEvents.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/events')
        .query({
          status: 'published',
          page: 2,
          limit: 5,
          sortBy: 'title'
        });

      expect(response.status).toBe(200);
      expect(eventService.getEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published'
        }),
        expect.objectContaining({
          page: 2,
          limit: 5,
          sortBy: 'title'
        })
      );
    });

    it('should handle service errors', async () => {
      eventService.getEvents.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/events');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /events/:id', () => {
    it('should get event by ID successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          event: { id: 'event_001', title: 'Test Event', status: 'published' }
        }
      };

      eventService.getEventById.mockResolvedValue(mockResponse);

      const response = await request(app).get('/events/event_001');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.event.id).toBe('event_001');
    });

    it('should handle event not found', async () => {
      eventService.getEventById.mockRejectedValue(new Error('Event not found'));

      const response = await request(app).get('/events/nonexistent');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /events', () => {
    const validEventData = {
      title: 'New Test Event',
      description: 'Test event description',
      location: 'Test Location',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 90000000).toISOString(),
      maxVolunteers: 10,
      urgencyLevel: 'normal',
      category: 'community'
    };

    it('should create event successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Event created successfully',
        data: {
          event: { id: 'event_new', ...validEventData }
        }
      };

      eventService.createEvent.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/events')
        .send(validEventData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Event created successfully');
    });

    it('should handle skill validation errors', async () => {
      eventService.createEvent.mockRejectedValue(new Error('Skill not found'));

      const response = await request(app)
        .post('/events')
        .send(validEventData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle date validation errors', async () => {
      eventService.createEvent.mockRejectedValue(new Error('Start date must be in the future'));

      const response = await request(app)
        .post('/events')
        .send(validEventData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle proficiency validation errors', async () => {
      eventService.createEvent.mockRejectedValue(new Error('Invalid proficiency level'));

      const response = await request(app)
        .post('/events')
        .send(validEventData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle validation errors', async () => {
      eventService.createEvent.mockRejectedValue(new Error('Validation failed'));

      const response = await request(app)
        .post('/events')
        .send({ title: 'Incomplete Event' });

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /events/:id', () => {
    it('should update event successfully', async () => {
      const updateData = { title: 'Updated Event Title' };
      const mockResponse = {
        success: true,
        message: 'Event updated successfully',
        data: {
          event: { id: 'event_001', title: 'Updated Event Title' }
        }
      };

      eventService.updateEvent.mockResolvedValue(mockResponse);

      const response = await request(app)
        .put('/events/event_001')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Event updated successfully');
    });

    it('should handle update errors', async () => {
      eventService.updateEvent.mockRejectedValue(new Error('Event not found'));

      const response = await request(app)
        .put('/events/nonexistent')
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
    });

    it('should handle skill validation errors in update', async () => {
      eventService.updateEvent.mockRejectedValue(new Error('Skill not found'));

      const response = await request(app)
        .put('/events/event_001')
        .send({ requiredSkills: [] });

      expect(response.status).toBe(400);
    });

    it('should handle date validation errors in update', async () => {
      eventService.updateEvent.mockRejectedValue(new Error('End date must be after start date'));

      const response = await request(app)
        .put('/events/event_001')
        .send({ startDate: '2025-12-01' });

      expect(response.status).toBe(400);
    });

    it('should handle duration errors in update', async () => {
      eventService.updateEvent.mockRejectedValue(new Error('Event duration is invalid'));

      const response = await request(app)
        .put('/events/event_001')
        .send({ duration: -1 });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /events/:id', () => {
    it('should delete event successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Event deleted successfully'
      };

      eventService.deleteEvent.mockResolvedValue(mockResponse);

      const response = await request(app).delete('/events/event_001');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Event deleted successfully');
    });

    it('should handle delete errors', async () => {
      eventService.deleteEvent.mockRejectedValue(new Error('Event not found'));

      const response = await request(app).delete('/events/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should handle cannot delete event with assignments', async () => {
      eventService.deleteEvent.mockRejectedValue(new Error('Cannot delete event with volunteer assignments'));

      const response = await request(app).delete('/events/event_001');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle cannot delete in progress event', async () => {
      eventService.deleteEvent.mockRejectedValue(new Error('Cannot delete event in progress'));

      const response = await request(app).delete('/events/event_001');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /events/:id/assignments', () => {
    it('should get event assignments successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          assignments: [
            { id: 'assign_001', volunteerId: 'user_001', status: 'confirmed' }
          ]
        }
      };

      eventService.getEventAssignments.mockResolvedValue(mockResponse);

      const response = await request(app).get('/events/event_001/assignments');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.assignments).toHaveLength(1);
    });

    it('should handle event not found for assignments', async () => {
      eventService.getEventAssignments.mockRejectedValue(new Error('Event not found'));

      const response = await request(app).get('/events/nonexistent/assignments');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /events/:eventId/assign/:volunteerId', () => {
    it('should assign volunteer successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Volunteer assigned successfully',
        data: {
          assignment: { id: 'assign_001', volunteerId: 'user_002', eventId: 'event_001' }
        }
      };

      eventService.assignVolunteer.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/events/event_001/assign/user_002')
        .send({ volunteerId: 'user_002' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe(mockResponse.message);
    });

    it('should require volunteerId', async () => {
      const response = await request(app)
        .post('/events/event_001/assign/user_002')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Volunteer ID is required');
    });

    it('should handle event not found error', async () => {
      eventService.assignVolunteer.mockRejectedValue(new Error('Event not found'));

      const response = await request(app)
        .post('/events/event_001/assign/user_002')
        .send({ volunteerId: 'user_002' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle not a volunteer error', async () => {
      eventService.assignVolunteer.mockRejectedValue(new Error('User is not a volunteer'));

      const response = await request(app)
        .post('/events/event_001/assign/user_002')
        .send({ volunteerId: 'user_002' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle not accepting volunteers error', async () => {
      eventService.assignVolunteer.mockRejectedValue(new Error('Event is not accepting volunteers'));

      const response = await request(app)
        .post('/events/event_001/assign/user_002')
        .send({ volunteerId: 'user_002' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle capacity error', async () => {
      eventService.assignVolunteer.mockRejectedValue(new Error('Event is at capacity'));

      const response = await request(app)
        .post('/events/event_001/assign/user_002')
        .send({ volunteerId: 'user_002' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle already assigned error', async () => {
      eventService.assignVolunteer.mockRejectedValue(new Error('Volunteer is already assigned'));

      const response = await request(app)
        .post('/events/event_001/assign/user_002')
        .send({ volunteerId: 'user_002' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle other errors', async () => {
      eventService.assignVolunteer.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/events/event_001/assign/user_002')
        .send({ volunteerId: 'user_002' });

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /my-events', () => {
    it('should get user events successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          events: [
            { id: 'event_001', title: 'My Event', status: 'confirmed' }
          ]
        }
      };

      eventService.getVolunteerEvents.mockResolvedValue(mockResponse);

      const response = await request(app).get('/my-events');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.events).toHaveLength(1);
    });

    it('should handle errors in getting my events', async () => {
      eventService.getVolunteerEvents.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/my-events');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /events/:id/join', () => {
    it('should join event successfully', async () => {
      const mockResponse = {
        data: {
          assignment: { id: 'assign_001', volunteerId: 'user_001', eventId: 'event_001', status: 'pending' }
        }
      };

      eventService.assignVolunteer.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/events/event_001/join')
        .send({ notes: 'I would like to join' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Successfully applied to join event');
    });

    it('should handle join errors', async () => {
      eventService.assignVolunteer.mockRejectedValue(new Error('Event is already at capacity'));

      const response = await request(app).post('/events/event_001/join');

      expect([400, 500]).toContain(response.status);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /events/:id/leave', () => {
    it('should leave event successfully', async () => {
      const mockAssignmentResponse = {
        success: true,
        data: {
          assignments: [
            { id: 'assign_001', volunteerId: 'user_001', eventId: 'event_001' }
          ]
        }
      };

      const mockUpdateResponse = {
        success: true,
        message: 'Assignment cancelled successfully'
      };

      eventService.getEventAssignments.mockResolvedValue(mockAssignmentResponse);
      eventService.updateAssignmentStatus.mockResolvedValue(mockUpdateResponse);

      const response = await request(app).post('/events/event_001/leave');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Successfully left the event');
    });

    it('should handle not assigned to event', async () => {
      eventService.getEventAssignments.mockResolvedValue({
        success: true,
        data: { assignments: [] } // No assignments found
      });

      const response = await request(app).post('/events/event_001/leave');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('You are not assigned to this event');
    });

    it('should handle errors when leaving event', async () => {
      eventService.getEventAssignments.mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/events/event_001/leave');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /events/assignments/:id/status', () => {
    beforeEach(() => {
      app.post('/events/assignments/:id/status', mockAuth, eventController.updateAssignmentStatus);
    });

    it('should update assignment status successfully', async () => {
      const mockResponse = {
        message: 'Status updated successfully',
        data: { id: 'assign_001', status: 'confirmed' }
      };

      eventService.updateAssignmentStatus.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/events/assignments/assign_001/status')
        .send({ status: 'confirmed', notes: 'All good' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should require assignmentId and status', async () => {
      const response = await request(app)
        .post('/events/assignments/assign_001/status')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should handle assignment not found', async () => {
      eventService.updateAssignmentStatus.mockRejectedValue(new Error('Assignment not found'));

      const response = await request(app)
        .post('/events/assignments/invalid/status')
        .send({ status: 'confirmed' });

      expect(response.status).toBe(404);
    });

    it('should handle invalid status', async () => {
      eventService.updateAssignmentStatus.mockRejectedValue(new Error('Invalid status'));

      const response = await request(app)
        .post('/events/assignments/assign_001/status')
        .send({ status: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /events/volunteer/:volunteerId', () => {
    beforeEach(() => {
      app.get('/events/volunteer/:volunteerId', mockAuth, eventController.getVolunteerEvents);
    });

    it('should get volunteer events successfully', async () => {
      const mockResponse = {
        data: {
          events: [{ id: 'event_001', title: 'Test Event' }],
          volunteerId: 'user_001'
        }
      };

      eventService.getVolunteerEvents.mockResolvedValue(mockResponse);

      const response = await request(app).get('/events/volunteer/user_001');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should deny access to other volunteer events', async () => {
      const app2 = express();
      app2.use(express.json());
      const mockVolunteerAuth = (req, res, next) => {
        req.user = { id: 'user_002', role: 'volunteer' };
        next();
      };
      app2.get('/events/volunteer/:volunteerId', mockVolunteerAuth, eventController.getVolunteerEvents);

      const response = await request(app2).get('/events/volunteer/user_001');

      expect(response.status).toBe(403);
    });
  });

  describe('GET /stats', () => {
    beforeEach(() => {
      app.get('/stats', mockAuth, eventController.getEventStats);
    });

    it('should get event statistics', async () => {
      const mockResponse = {
        data: {
          totalEvents: 50,
          publishedEvents: 30,
          totalVolunteers: 200
        }
      };

      eventService.getEventStats.mockResolvedValue(mockResponse);

      const response = await request(app).get('/stats');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /categories', () => {
    beforeEach(() => {
      app.get('/categories', mockAuth, eventController.getEventCategories);
    });

    it('should get event categories', async () => {
      const mockResponse = {
        data: {
          categories: ['community', 'environmental', 'educational'],
          urgencyLevels: ['low', 'normal', 'high', 'urgent'],
          statuses: ['draft', 'published', 'completed']
        }
      };

      eventService.getEventCategories.mockResolvedValue(mockResponse);

      const response = await request(app).get('/categories');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });
});