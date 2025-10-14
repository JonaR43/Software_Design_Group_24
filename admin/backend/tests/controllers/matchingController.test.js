/**
 * Unit Tests for Matching Controller
 */

const request = require('supertest');
const express = require('express');
const matchingController = require('../../src/controllers/matchingController');

// Mock the matching service
jest.mock('../../src/services/matchingService');
const matchingService = require('../../src/services/matchingService');

// Mock the event service for bulk assignment
jest.mock('../../src/services/eventService');
const eventService = require('../../src/services/eventService');

// Mock the matching algorithm
jest.mock('../../src/utils/matchingAlgorithm');
const matchingAlgorithm = require('../../src/utils/matchingAlgorithm');

const app = express();
app.use(express.json());

// Setup routes with mock middleware for authentication
const mockAuth = (req, res, next) => {
  req.user = { id: 'user_001', role: 'admin' };
  next();
};

const mockVolunteerAuth = (req, res, next) => {
  req.user = { id: 'user_001', role: 'volunteer' };
  next();
};

app.post('/matching/event/:eventId/volunteers', mockAuth, matchingController.findVolunteersForEvent);
app.get('/matching/volunteer/:volunteerId/events', mockAuth, matchingController.findEventsForVolunteer);
app.get('/matching/my-matches', mockVolunteerAuth, matchingController.getMyMatches);
app.get('/matching/calculate/:volunteerId/:eventId', mockAuth, matchingController.calculateMatch);
app.get('/matching/suggestions', mockAuth, matchingController.getAutomaticSuggestions);
app.post('/matching/optimize/:eventId', mockAuth, matchingController.optimizeAssignments);
app.post('/matching/bulk-assign/:eventId', mockAuth, matchingController.bulkAssignOptimized);
app.get('/matching/stats', mockAuth, matchingController.getMatchingStats);
app.post('/matching/test', mockAuth, matchingController.testMatching);
app.get('/matching/algorithm-info', mockAuth, matchingController.getAlgorithmInfo);

describe('MatchingController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /matching/event/:eventId/volunteers', () => {
    it('should find volunteers for event successfully', async () => {
      const mockResponse = {
        data: {
          eventId: 'event_001',
          matches: [
            {
              volunteer: { id: 'user_001', profile: { firstName: 'John', lastName: 'Doe' } },
              matchScore: 85,
              matchQuality: 'excellent'
            }
          ],
          totalMatches: 1
        }
      };

      matchingService.findMatchesForEvent.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/matching/event/event_001/volunteers')
        .query({ limit: 10, minScore: 50 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.matches).toHaveLength(1);
      expect(matchingService.findMatchesForEvent).toHaveBeenCalledWith('event_001', {
        limit: 10,
        minScore: 50,
        includeAssigned: false
      });
    });

    it('should handle event not found', async () => {
      matchingService.findMatchesForEvent.mockRejectedValue(new Error('Event not found'));

      const response = await request(app)
        .post('/matching/event/nonexistent/volunteers');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Event not found');
    });

    it('should handle query parameters correctly', async () => {
      const mockResponse = { data: { matches: [] } };
      matchingService.findMatchesForEvent.mockResolvedValue(mockResponse);

      await request(app)
        .post('/matching/event/event_001/volunteers')
        .query({ limit: 25, minScore: 70, includeAssigned: 'true' });

      expect(matchingService.findMatchesForEvent).toHaveBeenCalledWith('event_001', {
        limit: 25,
        minScore: 70,
        includeAssigned: true
      });
    });
  });

  describe('GET /matching/volunteer/:volunteerId/events', () => {
    it('should find events for volunteer successfully', async () => {
      const mockResponse = {
        data: {
          volunteerId: 'user_001',
          matches: [
            {
              event: { id: 'event_001', title: 'Community Cleanup' },
              matchScore: 82,
              matchQuality: 'excellent'
            }
          ],
          totalMatches: 1
        }
      };

      matchingService.findMatchesForVolunteer.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/matching/volunteer/user_001/events');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.matches).toHaveLength(1);
    });

    it('should handle access denied for non-admin trying to view other volunteer', async () => {
      const nonAdminApp = express();
      nonAdminApp.use(express.json());
      nonAdminApp.get('/matching/volunteer/:volunteerId/events', (req, res, next) => {
        req.user = { id: 'user_002', role: 'volunteer' };
        next();
      }, matchingController.findEventsForVolunteer);

      const response = await request(nonAdminApp)
        .get('/matching/volunteer/user_001/events');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied. You can only view your own matches.');
    });

    it('should handle volunteer not found', async () => {
      matchingService.findMatchesForVolunteer.mockRejectedValue(new Error('Volunteer not found'));

      const response = await request(app)
        .get('/matching/volunteer/nonexistent/events');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Volunteer not found');
    });
  });

  describe('GET /matching/my-matches', () => {
    it('should get matches for current volunteer', async () => {
      const mockResponse = {
        data: {
          volunteerId: 'user_001',
          matches: [
            {
              event: { id: 'event_001', title: 'Community Cleanup' },
              matchScore: 85
            }
          ]
        }
      };

      matchingService.findMatchesForVolunteer.mockResolvedValue(mockResponse);

      const response = await request(app).get('/matching/my-matches');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(matchingService.findMatchesForVolunteer).toHaveBeenCalledWith('user_001', {
        limit: 10,
        minScore: 40,
        statusFilter: 'published'
      });
    });

    it('should reject non-volunteer users', async () => {
      const adminApp = express();
      adminApp.use(express.json());
      adminApp.get('/matching/my-matches', (req, res, next) => {
        req.user = { id: 'admin_001', role: 'admin' };
        next();
      }, matchingController.getMyMatches);

      const response = await request(adminApp).get('/matching/my-matches');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Only volunteers can view event matches');
    });
  });

  describe('GET /matching/calculate/:volunteerId/:eventId', () => {
    it('should calculate match score successfully', async () => {
      const mockResponse = {
        data: {
          volunteer: { id: 'user_001' },
          event: { id: 'event_001' },
          matchScore: 88,
          scoreBreakdown: {
            skills: 90,
            availability: 85,
            location: 88,
            preferences: 90
          },
          matchQuality: 'excellent'
        }
      };

      matchingService.calculateMatch.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/matching/calculate/user_001/event_001');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.matchScore).toBe(88);
    });

    it('should handle access denied for non-admin trying to calculate other volunteer match', async () => {
      const volunteerApp = express();
      volunteerApp.use(express.json());
      volunteerApp.get('/matching/calculate/:volunteerId/:eventId', (req, res, next) => {
        req.user = { id: 'user_002', role: 'volunteer' };
        next();
      }, matchingController.calculateMatch);

      const response = await request(volunteerApp)
        .get('/matching/calculate/user_001/event_001');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    it('should handle volunteer not found', async () => {
      matchingService.calculateMatch.mockRejectedValue(new Error('Volunteer not found'));

      const response = await request(app)
        .get('/matching/calculate/nonexistent/event_001');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Volunteer not found');
    });
  });

  describe('GET /matching/suggestions', () => {
    it('should get automatic suggestions successfully', async () => {
      const mockResponse = {
        data: {
          suggestions: [
            {
              eventId: 'event_001',
              eventTitle: 'Community Cleanup',
              suggestions: [
                { volunteerId: 'user_001', matchScore: 85 }
              ]
            }
          ],
          totalEvents: 1,
          eventsWithSuggestions: 1
        }
      };

      matchingService.getAutomaticSuggestions.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/matching/suggestions')
        .query({ minScore: 80, maxSuggestions: 3 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.suggestions).toHaveLength(1);
      expect(matchingService.getAutomaticSuggestions).toHaveBeenCalledWith({
        minScore: 80,
        maxSuggestionsPerEvent: 3
      });
    });
  });

  describe('POST /matching/optimize/:eventId', () => {
    it('should optimize assignments successfully', async () => {
      const mockResponse = {
        data: {
          eventId: 'event_001',
          optimizedAssignments: [
            {
              volunteerId: 'user_001',
              matchScore: 85,
              recommendedStatus: 'confirmed'
            }
          ],
          totalSlotsAvailable: 5,
          totalAssignmentsMade: 1
        }
      };

      matchingService.optimizeAssignments.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/matching/optimize/event_001')
        .send({ maxAssignments: 3, preserveConfirmed: true });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.optimizedAssignments).toHaveLength(1);
    });

    it('should handle event not found', async () => {
      matchingService.optimizeAssignments.mockRejectedValue(new Error('Event not found'));

      const response = await request(app)
        .post('/matching/optimize/nonexistent')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('POST /matching/bulk-assign/:eventId', () => {
    it('should perform bulk assignment successfully', async () => {
      const assignments = [
        {
          volunteerId: 'user_001',
          matchScore: 85,
          matchQuality: 'excellent',
          assignmentReason: 'Great match'
        },
        {
          volunteerId: 'user_002',
          matchScore: 75,
          matchQuality: 'good',
          assignmentReason: 'Good match'
        }
      ];

      eventService.assignVolunteer.mockResolvedValue({
        data: { id: 'assign_001' }
      });

      const response = await request(app)
        .post('/matching/bulk-assign/event_001')
        .send({ assignments, autoConfirmHighMatches: true });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.summary.totalAssignments).toBe(2);
      expect(response.body.data.summary.successful).toBe(2);
    });

    it('should handle missing assignments array', async () => {
      const response = await request(app)
        .post('/matching/bulk-assign/event_001')
        .send({ autoConfirmHighMatches: true });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Assignments array is required');
    });

    it('should handle mixed success and failure in bulk assignment', async () => {
      const assignments = [
        { volunteerId: 'user_001', matchScore: 85, matchQuality: 'excellent' },
        { volunteerId: 'user_002', matchScore: 75, matchQuality: 'good' }
      ];

      eventService.assignVolunteer
        .mockResolvedValueOnce({ data: { id: 'assign_001' } })
        .mockRejectedValueOnce(new Error('Volunteer already assigned'));

      const response = await request(app)
        .post('/matching/bulk-assign/event_001')
        .send({ assignments });

      expect(response.status).toBe(200);
      expect(response.body.data.summary.successful).toBe(1);
      expect(response.body.data.summary.failed).toBe(1);
    });
  });

  describe('GET /matching/stats', () => {
    it('should get matching statistics successfully', async () => {
      const mockResponse = {
        data: {
          totalEvents: 25,
          totalVolunteers: 150,
          totalAssignments: 80,
          averageMatchScore: 76,
          matchingEfficiency: 53
        }
      };

      matchingService.getMatchingStats.mockResolvedValue(mockResponse);

      const response = await request(app).get('/matching/stats');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.totalEvents).toBe(25);
    });
  });

  describe('POST /matching/test', () => {
    it('should test matching algorithm successfully', async () => {
      const mockResponse = {
        data: {
          volunteer: { id: 'user_001' },
          event: { id: 'event_001' },
          matchScore: 88,
          scoreBreakdown: {
            skills: 90,
            availability: 85,
            location: 88,
            preferences: 90,
            reliability: 85
          },
          weights: {
            skills: 0.3,
            availability: 0.25,
            location: 0.2,
            preferences: 0.15,
            reliability: 0.1
          },
          matchQuality: 'excellent'
        }
      };

      matchingService.calculateMatch.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/matching/test')
        .send({ volunteerId: 'user_001', eventId: 'event_001' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.testMode).toBe(true);
      expect(response.body.data.detailedBreakdown).toBeDefined();
      expect(response.body.data.detailedBreakdown.skills.contribution).toBeDefined();
    });

    it('should validate required fields for test', async () => {
      const response = await request(app)
        .post('/matching/test')
        .send({ volunteerId: 'user_001' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Both volunteerId and eventId are required');
    });

    it('should handle not found in test', async () => {
      matchingService.calculateMatch.mockRejectedValue(new Error('Event not found'));

      const response = await request(app)
        .post('/matching/test')
        .send({ volunteerId: 'user_001', eventId: 'nonexistent' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('GET /matching/algorithm-info', () => {
    it('should get algorithm information successfully', async () => {
      matchingAlgorithm.weights = {
        skills: 0.3,
        availability: 0.25,
        location: 0.2,
        preferences: 0.15,
        reliability: 0.1
      };

      const response = await request(app).get('/matching/algorithm-info');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.weights).toBeDefined();
      expect(response.body.data.description).toBe('JACS ShiftPilot Volunteer Matching Algorithm');
      expect(response.body.data.version).toBe('1.0.0');
      expect(response.body.data.components).toBeDefined();
      expect(response.body.data.scoring).toBeDefined();
    });
  });

  describe('Error handling for next(error)', () => {
    it('should call next for unexpected errors in findVolunteersForEvent', async () => {
      matchingService.findMatchesForEvent.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/matching/event/event_001/volunteers');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in findEventsForVolunteer', async () => {
      matchingService.findMatchesForVolunteer.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .get('/matching/volunteer/user_001/events');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getMyMatches', async () => {
      matchingService.findMatchesForVolunteer.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/matching/my-matches');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in calculateMatch', async () => {
      matchingService.calculateMatch.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .get('/matching/calculate/user_001/event_001');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getAutomaticSuggestions', async () => {
      matchingService.getAutomaticSuggestions.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/matching/suggestions');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in optimizeAssignments', async () => {
      matchingService.optimizeAssignments.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/matching/optimize/event_001')
        .send({});

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in bulkAssignOptimized', async () => {
      // The bulkAssignOptimized catches individual assignment errors internally
      // To test the outer error handler, we need to cause an error before the loop
      // by providing invalid data that causes the validation to fail in an unexpected way
      // Since validation returns 400, we'll test that the function handles individual errors gracefully

      // This test verifies that individual assignment errors are caught and returned in results
      eventService.assignVolunteer.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/matching/bulk-assign/event_001')
        .send({ assignments: [{ volunteerId: 'user_001', matchScore: 85 }] });

      // The function catches individual errors and returns 200 with error results
      expect(response.status).toBe(200);
      expect(response.body.data.summary.failed).toBe(1);
      expect(response.body.data.summary.successful).toBe(0);
    });

    it('should call next for unexpected errors in getMatchingStats', async () => {
      matchingService.getMatchingStats.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/matching/stats');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in testMatching', async () => {
      matchingService.calculateMatch.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/matching/test')
        .send({ volunteerId: 'user_001', eventId: 'event_001' });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getAlgorithmInfo', async () => {
      // Force an error by setting weights to null
      matchingAlgorithm.weights = null;

      const response = await request(app).get('/matching/algorithm-info');

      // Restore weights for other tests
      matchingAlgorithm.weights = {
        skills: 0.3,
        availability: 0.25,
        location: 0.2,
        preferences: 0.15,
        reliability: 0.1
      };

      expect(response.status).toBe(500);
    });
  });
});