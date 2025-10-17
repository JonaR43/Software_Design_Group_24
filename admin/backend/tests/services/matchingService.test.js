/**
 * Unit Tests for Matching Service
 */

const matchingService = require('../../src/services/matchingService');
const matchingAlgorithm = require('../../src/utils/matchingAlgorithm');
const { eventHelpers } = require('../../src/data/events');
const { userHelpers } = require('../../src/data/users');

// Mock dependencies
jest.mock('../../src/utils/matchingAlgorithm');
jest.mock('../../src/data/events');
jest.mock('../../src/data/users');

describe('MatchingService', () => {
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
    status: 'published'
  };

  const mockVolunteerProfile = {
    userId: 'user_001',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1-555-0123',
    skills: [
      { skillId: 'skill_001', proficiency: 'intermediate' }
    ],
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isRecurring: true }
    ],
    preferences: {
      maxDistance: 25,
      causes: ['environmental'],
      weekdaysOnly: false
    },
    user: {
      id: 'user_001',
      username: 'volunteer1',
      email: 'volunteer1@example.com',
      verified: true
    }
  };

  const mockUser = {
    id: 'user_001',
    username: 'volunteer1',
    email: 'volunteer1@example.com',
    role: 'volunteer',
    verified: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findMatchesForEvent', () => {
    it('should find matches for event successfully', async () => {
      eventHelpers.findById.mockReturnValue(mockEvent);
      userHelpers.getVolunteerProfiles.mockReturnValue([mockVolunteerProfile]);
      eventHelpers.getEventAssignments.mockReturnValue([]);
      matchingAlgorithm.calculateMatchScore.mockReturnValue({
        totalScore: 85,
        scoreBreakdown: {
          skills: 90,
          availability: 80,
          location: 85,
          preferences: 85
        },
        matchQuality: 'excellent',
        recommendations: ['Great skill match'],
        calculatedAt: new Date().toISOString()
      });

      const result = await matchingService.findMatchesForEvent('event_001');

      expect(result.success).toBe(true);
      expect(result.data.matches).toHaveLength(1);
      expect(result.data.matches[0].matchScore).toBe(85);
      expect(result.data.totalVolunteers).toBe(1);
      expect(result.data.event.id).toBe('event_001');
    });

    it('should handle event not found', async () => {
      eventHelpers.findById.mockReturnValue(null);

      await expect(matchingService.findMatchesForEvent('nonexistent'))
        .rejects.toThrow('Event not found');
    });

    it('should handle match calculation errors gracefully', async () => {
      eventHelpers.findById.mockReturnValue(mockEvent);
      userHelpers.getVolunteerProfiles.mockReturnValue([mockVolunteerProfile]);
      eventHelpers.getEventAssignments.mockReturnValue([]);
      matchingAlgorithm.calculateMatchScore.mockImplementation(() => {
        throw new Error('Calculation error');
      });

      const result = await matchingService.findMatchesForEvent('event_001');

      expect(result.success).toBe(true);
      expect(result.data.matches).toHaveLength(0);
    });
  });

  describe('findMatchesForVolunteer', () => {
    it('should handle volunteer profile not found', async () => {
      userHelpers.findById.mockReturnValue(mockUser);
      userHelpers.getProfile.mockReturnValue(null);

      await expect(matchingService.findMatchesForVolunteer('user_001'))
        .rejects.toThrow('Volunteer profile not found');
    });

    it('should return empty matches when no events available', async () => {
      userHelpers.findById.mockReturnValue(mockUser);
      userHelpers.getProfile.mockReturnValue(mockVolunteerProfile);
      eventHelpers.getAllEvents.mockReturnValue([]);
      eventHelpers.getByStatus.mockReturnValue([]);
      eventHelpers.getVolunteerAssignments.mockReturnValue([]);

      const result = await matchingService.findMatchesForVolunteer('user_001');

      expect(result.success).toBe(true);
      expect(result.data.matches).toEqual([]);
      expect(result.data.message).toBe('No available events found');
    });

    it('should apply minimum score filter', async () => {
      eventHelpers.findById.mockReturnValue(mockEvent);
      userHelpers.getVolunteerProfiles.mockReturnValue([mockVolunteerProfile]);
      eventHelpers.getEventAssignments.mockReturnValue([]);
      matchingAlgorithm.calculateMatchScore.mockReturnValue({
        totalScore: 45, // Below minimum
        scoreBreakdown: { skills: 40, availability: 50, location: 45, preferences: 45 },
        matchQuality: 'poor',
        recommendations: [],
        calculatedAt: new Date().toISOString()
      });

      const result = await matchingService.findMatchesForEvent('event_001', { minScore: 50 });

      expect(result.success).toBe(true);
      expect(result.data.matches).toHaveLength(0);
    });

    it('should handle no available volunteers', async () => {
      eventHelpers.findById.mockReturnValue(mockEvent);
      userHelpers.getVolunteerProfiles.mockReturnValue([]);
      eventHelpers.getEventAssignments.mockReturnValue([]);

      const result = await matchingService.findMatchesForEvent('event_001');

      expect(result.success).toBe(true);
      expect(result.data.matches).toHaveLength(0);
      expect(result.data.totalVolunteers).toBe(0);
      expect(result.data.message).toContain('No available volunteers found');
    });
  });

  describe('findMatchesForVolunteer', () => {
    it('should find events for volunteer successfully', async () => {
      userHelpers.findById.mockReturnValue(mockUser);
      userHelpers.getProfile.mockReturnValue(mockVolunteerProfile);
      jest.spyOn(matchingService, 'getAvailableEvents').mockReturnValue([mockEvent]);
      matchingAlgorithm.calculateMatchScore.mockReturnValue({
        totalScore: 82,
        scoreBreakdown: {
          skills: 85,
          availability: 80,
          location: 82,
          preferences: 85
        },
        matchQuality: 'excellent',
        recommendations: ['Perfect timing match'],
        calculatedAt: new Date().toISOString()
      });

      const result = await matchingService.findMatchesForVolunteer('user_001');

      expect(result.success).toBe(true);
      expect(result.data.matches).toHaveLength(1);
      expect(result.data.matches[0].matchScore).toBe(82);
      expect(result.data.totalEvents).toBe(1);
    });

    it('should handle volunteer not found', async () => {
      userHelpers.findById.mockReturnValue(null);

      await expect(matchingService.findMatchesForVolunteer('nonexistent'))
        .rejects.toThrow('Volunteer not found');
    });

    it('should handle non-volunteer user', async () => {
      const mockAdmin = { ...mockUser, role: 'admin' };
      userHelpers.findById.mockReturnValue(mockAdmin);

      await expect(matchingService.findMatchesForVolunteer('admin_001'))
        .rejects.toThrow('User is not a volunteer');
    });
  });

  describe('calculateMatch', () => {
    it('should calculate match between volunteer and event', async () => {
      userHelpers.findById.mockReturnValue(mockUser);
      eventHelpers.findById.mockReturnValue(mockEvent);
      userHelpers.getProfile.mockReturnValue(mockVolunteerProfile);
      matchingAlgorithm.calculateMatchScore.mockReturnValue({
        totalScore: 88,
        scoreBreakdown: {
          skills: 90,
          availability: 85,
          location: 88,
          preferences: 90
        },
        matchQuality: 'excellent',
        recommendations: ['Excellent overall match'],
        weights: { skills: 0.3, availability: 0.3, location: 0.2, preferences: 0.2 },
        calculatedAt: new Date().toISOString()
      });

      const result = await matchingService.calculateMatch('user_001', 'event_001');

      expect(result.success).toBe(true);
      expect(result.data.matchScore).toBe(88);
      expect(result.data.volunteer.id).toBe('user_001');
      expect(result.data.event.id).toBe('event_001');
    });

    it('should handle volunteer not found', async () => {
      userHelpers.findById.mockReturnValue(null);

      await expect(matchingService.calculateMatch('nonexistent', 'event_001'))
        .rejects.toThrow('Volunteer not found');
    });

    it('should handle event not found', async () => {
      userHelpers.findById.mockReturnValue(mockUser);
      eventHelpers.findById.mockReturnValue(null);

      await expect(matchingService.calculateMatch('user_001', 'nonexistent'))
        .rejects.toThrow('Event not found');
    });
  });

  describe('getAutomaticSuggestions', () => {
    it('should get automatic suggestions successfully', async () => {
      const mockEventsNeedingVolunteers = [mockEvent];
      eventHelpers.getEventsNeedingVolunteers.mockReturnValue(mockEventsNeedingVolunteers);

      // Mock the findMatchesForEvent method call
      jest.spyOn(matchingService, 'findMatchesForEvent').mockResolvedValue({
        data: {
          matches: [{
            volunteer: {
              id: 'user_001',
              profile: { firstName: 'John', lastName: 'Doe' }
            },
            matchScore: 85,
            matchQuality: 'excellent',
            recommendations: [{ message: 'Perfect skill match' }]
          }]
        }
      });

      const result = await matchingService.getAutomaticSuggestions();

      expect(result.success).toBe(true);
      expect(result.data.suggestions).toHaveLength(1);
      expect(result.data.totalEvents).toBe(1);
      expect(result.data.eventsWithSuggestions).toBe(1);
    });
  });

  describe('optimizeAssignments', () => {
    it('should optimize assignments successfully', async () => {
      eventHelpers.findById.mockReturnValue(mockEvent);
      eventHelpers.getEventAssignments.mockReturnValue([]);

      // Mock the findMatchesForEvent method call
      jest.spyOn(matchingService, 'findMatchesForEvent').mockResolvedValue({
        data: {
          matches: [{
            volunteer: {
              id: 'user_001',
              profile: { firstName: 'John', lastName: 'Doe' }
            },
            matchScore: 85,
            matchQuality: 'excellent',
            recommendations: ['Great match']
          }]
        }
      });

      const result = await matchingService.optimizeAssignments('event_001');

      expect(result.success).toBe(true);
      expect(result.data.eventId).toBe('event_001');
      expect(result.data.optimizedAssignments).toHaveLength(1);
    });

    it('should handle event not found', async () => {
      eventHelpers.findById.mockReturnValue(null);

      await expect(matchingService.optimizeAssignments('nonexistent'))
        .rejects.toThrow('Event not found');
    });
  });

  describe('getMatchingStats', () => {
    it('should get matching statistics successfully', async () => {
      const mockEvents = [mockEvent];
      const mockVolunteers = [mockUser];
      const mockAssignments = [{
        id: 'assign_001',
        volunteerId: 'user_001',
        eventId: 'event_001',
        status: 'confirmed',
        matchScore: 85
      }];

      eventHelpers.getAllEvents.mockReturnValue(mockEvents);
      userHelpers.getVolunteers.mockReturnValue(mockVolunteers);
      eventHelpers.getEventAssignments.mockReturnValue(mockAssignments);
      eventHelpers.getEventsNeedingVolunteers.mockReturnValue([mockEvent]);

      const result = await matchingService.getMatchingStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalEvents');
      expect(result.data).toHaveProperty('totalVolunteers');
      expect(result.data).toHaveProperty('totalAssignments');
      expect(result.data).toHaveProperty('averageMatchScore');
    });
  });

  describe('findMatchesForVolunteer - error handling', () => {
    it('should handle calculation errors gracefully', async () => {
      userHelpers.findById.mockReturnValue(mockUser);
      userHelpers.getProfile.mockReturnValue(mockVolunteerProfile);
      jest.spyOn(matchingService, 'getAvailableEvents').mockReturnValue([mockEvent]);
      matchingAlgorithm.calculateMatchScore.mockImplementation(() => {
        throw new Error('Calculation error');
      });

      const result = await matchingService.findMatchesForVolunteer('user_001');

      expect(result.success).toBe(true);
      expect(result.data.matches).toHaveLength(0);
    });
  });

  describe('calculateMatch - profile validation', () => {
    it('should handle volunteer profile not found', async () => {
      userHelpers.findById.mockReturnValue(mockUser);
      eventHelpers.findById.mockReturnValue(mockEvent);
      userHelpers.getProfile.mockReturnValue(null);

      await expect(matchingService.calculateMatch('user_001', 'event_001'))
        .rejects.toThrow('Volunteer profile not found');
    });
  });

  describe('getAutomaticSuggestions - error handling', () => {
    it('should handle errors gracefully during suggestion generation', async () => {
      const mockEventsNeedingVolunteers = [mockEvent];
      eventHelpers.getEventsNeedingVolunteers.mockReturnValue(mockEventsNeedingVolunteers);

      jest.spyOn(matchingService, 'findMatchesForEvent').mockRejectedValue(new Error('Matching error'));

      const result = await matchingService.getAutomaticSuggestions();

      expect(result.success).toBe(true);
      expect(result.data.suggestions).toHaveLength(0);
    });

    it('should handle events with no matches', async () => {
      const mockEventsNeedingVolunteers = [mockEvent];
      eventHelpers.getEventsNeedingVolunteers.mockReturnValue(mockEventsNeedingVolunteers);

      jest.spyOn(matchingService, 'findMatchesForEvent').mockResolvedValue({
        data: {
          matches: []
        }
      });

      const result = await matchingService.getAutomaticSuggestions();

      expect(result.success).toBe(true);
      expect(result.data.suggestions).toHaveLength(0);
    });

    it('should sort suggestions by urgency and spots needed', async () => {
      const urgentEvent = { ...mockEvent, id: 'event_002', urgencyLevel: 'urgent', maxVolunteers: 20, currentVolunteers: 5 };
      const normalEvent = { ...mockEvent, id: 'event_003', urgencyLevel: 'normal', maxVolunteers: 10, currentVolunteers: 5 };

      eventHelpers.getEventsNeedingVolunteers.mockReturnValue([normalEvent, urgentEvent]);

      jest.spyOn(matchingService, 'findMatchesForEvent').mockResolvedValue({
        data: {
          matches: [{
            volunteer: {
              id: 'user_001',
              profile: { firstName: 'John', lastName: 'Doe' }
            },
            matchScore: 85,
            matchQuality: 'excellent',
            recommendations: [{ message: 'Perfect skill match' }]
          }]
        }
      });

      const result = await matchingService.getAutomaticSuggestions();

      expect(result.success).toBe(true);
      expect(result.data.suggestions[0].urgencyLevel).toBe('urgent');
    });
  });

  describe('optimizeAssignments - edge cases', () => {
    it('should handle event at capacity', async () => {
      const fullEvent = { ...mockEvent, currentVolunteers: 10, maxVolunteers: 10 };
      eventHelpers.findById.mockReturnValue(fullEvent);
      // Return 10 confirmed assignments to fill all spots
      const assignments = Array.from({ length: 10 }, (_, i) => ({
        volunteerId: `user_${i}`,
        status: 'confirmed'
      }));
      eventHelpers.getEventAssignments.mockReturnValue(assignments);

      const result = await matchingService.optimizeAssignments('event_001', { preserveConfirmed: true });

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Event is at capacity');
      expect(result.data.availableSlots).toBe(0);
    });

    it('should handle event with confirmed assignments when preserveConfirmed is true', async () => {
      eventHelpers.findById.mockReturnValue(mockEvent);
      eventHelpers.getEventAssignments.mockReturnValue([
        { volunteerId: 'user_001', status: 'confirmed' },
        { volunteerId: 'user_002', status: 'confirmed' }
      ]);

      jest.spyOn(matchingService, 'findMatchesForEvent').mockResolvedValue({
        data: {
          matches: [{
            volunteer: {
              id: 'user_003',
              profile: { firstName: 'Jane', lastName: 'Smith' }
            },
            matchScore: 90,
            matchQuality: 'excellent',
            recommendations: ['Great match']
          }]
        }
      });

      const result = await matchingService.optimizeAssignments('event_001', { preserveConfirmed: true });

      expect(result.success).toBe(true);
      expect(result.data.totalSlotsAvailable).toBe(8);
    });
  });

  describe('getAvailableVolunteers - includeAssigned flag', () => {
    it('should include assigned volunteers when includeAssigned is true', async () => {
      userHelpers.getVolunteerProfiles.mockReturnValue([mockVolunteerProfile]);

      const result = await matchingService.getAvailableVolunteers('event_001', true);

      expect(result).toHaveLength(1);
      expect(eventHelpers.getEventAssignments).not.toHaveBeenCalled();
    });
  });

  describe('generateMatchingStats - edge cases', () => {
    it('should handle empty matches array', () => {
      const stats = matchingService.generateMatchingStats([], mockEvent);

      expect(stats.averageScore).toBe(0);
      expect(stats.scoreDistribution.excellent).toBe(0);
      expect(stats.skillsCoverage).toBe(0);
    });

    it('should handle event with no required skills', () => {
      const eventNoSkills = { ...mockEvent, requiredSkills: [] };
      const matches = [{
        volunteer: { id: 'user_001' },
        matchScore: 85,
        scoreBreakdown: { skills: 50, availability: 85, location: 85 }
      }];

      const stats = matchingService.generateMatchingStats(matches, eventNoSkills);

      expect(stats.skillsCoverage).toBe(100);
    });
  });

  describe('getMatchingStats - edge cases', () => {
    it('should handle no confirmed assignments', async () => {
      const mockEvents = [mockEvent];
      const mockVolunteers = [mockUser];
      const mockAssignments = [];

      eventHelpers.getAllEvents.mockReturnValue(mockEvents);
      userHelpers.getVolunteers.mockReturnValue(mockVolunteers);
      eventHelpers.getEventAssignments.mockReturnValue(mockAssignments);
      eventHelpers.getEventsNeedingVolunteers.mockReturnValue([mockEvent]);

      const result = await matchingService.getMatchingStats();

      expect(result.success).toBe(true);
      expect(result.data.averageMatchScore).toBe(0);
    });

    it('should handle no volunteers', async () => {
      const mockEvents = [mockEvent];
      const mockVolunteers = [];

      eventHelpers.getAllEvents.mockReturnValue(mockEvents);
      userHelpers.getVolunteers.mockReturnValue(mockVolunteers);
      eventHelpers.getEventAssignments.mockReturnValue([]);
      eventHelpers.getEventsNeedingVolunteers.mockReturnValue([mockEvent]);

      const result = await matchingService.getMatchingStats();

      expect(result.success).toBe(true);
      expect(result.data.matchingEfficiency).toBe(0);
    });
  });
});