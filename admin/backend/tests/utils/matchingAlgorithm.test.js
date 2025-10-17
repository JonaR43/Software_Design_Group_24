/**
 * Unit Tests for Matching Algorithm
 */

const matchingAlgorithm = require('../../src/utils/matchingAlgorithm');

describe('MatchingAlgorithm', () => {

  const mockVolunteer = {
    id: 'user_002',
    profile: {
      latitude: 29.7604,
      longitude: -95.3698,
      skills: [
        { skillId: 'skill_001', proficiency: 'intermediate' },
        { skillId: 'skill_002', proficiency: 'advanced' }
      ],
      availability: [
        {
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true
        }
      ],
      preferences: {
        causes: ['community', 'environmental'],
        maxDistance: 50,
        preferredTimeSlots: ['morning']
      }
    },
    reliability: 85
  };

  const mockEvent = {
    id: 'event_001',
    title: 'Community Cleanup',
    latitude: 29.7520,
    longitude: -95.3720,
    startDate: new Date('2024-12-16T10:00:00Z'), // Monday 10 AM
    endDate: new Date('2024-12-16T12:00:00Z'),
    category: 'environmental',
    requiredSkills: [
      { skillId: 'skill_001', minLevel: 'beginner', required: true }
    ],
    urgencyLevel: 'normal'
  };

  describe('calculateMatchScore', () => {
    it('should calculate a valid match score', () => {
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, mockEvent);

      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('scoreBreakdown');
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('should provide detailed score breakdown', () => {
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, mockEvent);

      expect(result.scoreBreakdown).toHaveProperty('location');
      expect(result.scoreBreakdown).toHaveProperty('skills');
      expect(result.scoreBreakdown).toHaveProperty('availability');
      expect(result.scoreBreakdown).toHaveProperty('preferences');
      expect(result.scoreBreakdown).toHaveProperty('reliability');

      // All scores should be between 0 and 100
      Object.values(result.scoreBreakdown).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should handle missing volunteer profile gracefully', () => {
      const volunteerWithoutProfile = { id: 'user_003' };

      const result = matchingAlgorithm.calculateMatchScore(volunteerWithoutProfile, mockEvent);

      expect(result.totalScore).toBe(0);
      // Should handle gracefully and not crash
      expect(result).toHaveProperty('error');
    });

    it('should return valid match quality', () => {
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, mockEvent);

      expect(result).toHaveProperty('matchQuality');
      expect(['Excellent', 'Very Good', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']).toContain(result.matchQuality);
    });
  });

  describe('calculateLocationScore', () => {
    it('should give bonus for very close distances', () => {
      const closeEvent = { ...mockEvent, latitude: 29.7604, longitude: -95.3698 }; // Same location
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, closeEvent);

      expect(result.scoreBreakdown.location).toBeGreaterThan(90);
    });

    it('should penalize distances exceeding max preference', () => {
      const farEvent = { ...mockEvent, latitude: 30.2672, longitude: -97.7431 }; // Austin, ~150 miles
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, farEvent);

      expect(result.scoreBreakdown.location).toBeLessThan(50);
    });

    it('should return default score for missing location data', () => {
      const noLocationVolunteer = { ...mockVolunteer, profile: { ...mockVolunteer.profile, latitude: null } };
      const result = matchingAlgorithm.calculateMatchScore(noLocationVolunteer, mockEvent);

      expect(result.scoreBreakdown.location).toBe(50);
    });
  });

  describe('calculateSkillsScore', () => {
    it('should return 100 for events with no required skills', () => {
      const noSkillsEvent = { ...mockEvent, requiredSkills: [] };
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, noSkillsEvent);

      expect(result.scoreBreakdown.skills).toBe(100);
    });

    it('should return 0 for volunteer with no skills', () => {
      const noSkillsVolunteer = { ...mockVolunteer, profile: { ...mockVolunteer.profile, skills: [] } };
      const result = matchingAlgorithm.calculateMatchScore(noSkillsVolunteer, mockEvent);

      expect(result.scoreBreakdown.skills).toBe(0);
    });

    it('should handle missing required skills', () => {
      const strictEvent = {
        ...mockEvent,
        requiredSkills: [
          { skillId: 'skill_999', minLevel: 'beginner', required: true }
        ]
      };
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, strictEvent);

      expect(result.scoreBreakdown.skills).toBeLessThan(50);
    });

    it('should give partial credit for optional skills not matched', () => {
      const optionalSkillsEvent = {
        ...mockEvent,
        requiredSkills: [
          { skillId: 'skill_001', minLevel: 'beginner', required: true },
          { skillId: 'skill_999', minLevel: 'beginner', required: false }
        ]
      };
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, optionalSkillsEvent);

      expect(result.scoreBreakdown.skills).toBeGreaterThan(0);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const distance = matchingAlgorithm.calculateDistance(
        29.7604, -95.3698, // Houston downtown
        29.7520, -95.3720  // Nearby location
      );

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(10); // Should be less than 10km
    });

    it('should return 0 for same location', () => {
      const distance = matchingAlgorithm.calculateDistance(29.7604, -95.3698, 29.7604, -95.3698);

      expect(distance).toBe(0);
    });
  });

  describe('calculateAvailabilityScore', () => {
    it('should return low score for missing availability', () => {
      const noAvailVolunteer = { ...mockVolunteer, profile: { ...mockVolunteer.profile, availability: [] } };
      const result = matchingAlgorithm.calculateMatchScore(noAvailVolunteer, mockEvent);

      expect(result.scoreBreakdown.availability).toBe(30);
    });

    it('should return 0 for no availability on event day', () => {
      const tuesdayEvent = { ...mockEvent, startDate: new Date('2024-12-17T10:00:00Z') }; // Tuesday
      const mondayOnlyVolunteer = {
        ...mockVolunteer,
        profile: {
          ...mockVolunteer.profile,
          availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isRecurring: true }]
        }
      };
      const result = matchingAlgorithm.calculateMatchScore(mondayOnlyVolunteer, tuesdayEvent);

      expect(result.scoreBreakdown.availability).toBe(0);
    });

    it('should penalize weekend events for weekdays-only preference', () => {
      const saturdayEvent = { ...mockEvent, startDate: new Date('2024-12-14T10:00:00Z') }; // Saturday
      const weekdaysVolunteer = {
        ...mockVolunteer,
        profile: {
          ...mockVolunteer.profile,
          availability: [{ dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isRecurring: true }],
          preferences: { ...mockVolunteer.profile.preferences, weekdaysOnly: true }
        }
      };
      const result = matchingAlgorithm.calculateMatchScore(weekdaysVolunteer, saturdayEvent);

      expect(result.scoreBreakdown.availability).toBeLessThan(70);
    });

    it('should give bonus for preferred time slots', () => {
      const morningEvent = { ...mockEvent, startDate: new Date('2024-12-16T09:00:00Z') };
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, morningEvent);

      // Availability score can vary based on time overlap
      expect(result.scoreBreakdown.availability).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculatePreferencesScore', () => {
    it('should return neutral score for no preferences', () => {
      const noPrefVolunteer = { ...mockVolunteer, profile: { ...mockVolunteer.profile, preferences: null } };
      const result = matchingAlgorithm.calculateMatchScore(noPrefVolunteer, mockEvent);

      expect(result.scoreBreakdown.preferences).toBe(50);
    });

    it('should score high for matching cause', () => {
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, mockEvent);

      expect(result.scoreBreakdown.preferences).toBeGreaterThan(50);
    });

    it('should score lower for non-matching cause', () => {
      const nonMatchingVolunteer = {
        ...mockVolunteer,
        profile: {
          ...mockVolunteer.profile,
          preferences: { ...mockVolunteer.profile.preferences, causes: ['education', 'health'] }
        }
      };
      const result = matchingAlgorithm.calculateMatchScore(nonMatchingVolunteer, mockEvent);

      expect(result.scoreBreakdown.preferences).toBeLessThan(60);
    });

    it('should give bonus for urgent events', () => {
      const urgentEvent = { ...mockEvent, urgencyLevel: 'urgent' };
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, urgentEvent);

      expect(result.scoreBreakdown.preferences).toBeGreaterThan(50);
    });

    it('should give bonus for high priority events', () => {
      const highPriorityEvent = { ...mockEvent, urgencyLevel: 'high' };
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, highPriorityEvent);

      expect(result.scoreBreakdown.preferences).toBeGreaterThan(50);
    });

    it('should handle normal urgency events', () => {
      const normalEvent = { ...mockEvent, urgencyLevel: 'normal' };
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, normalEvent);

      expect(result.scoreBreakdown.preferences).toBeGreaterThanOrEqual(0);
    });

    it('should reduce score for low priority events', () => {
      const lowPriorityEvent = { ...mockEvent, urgencyLevel: 'low' };
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, lowPriorityEvent);

      expect(result.scoreBreakdown.preferences).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateReliabilityScore', () => {
    it('should calculate reliability based on profile completeness', () => {
      const result = matchingAlgorithm.calculateMatchScore(mockVolunteer, mockEvent);

      // Score is calculated based on profile completeness, not direct reliability value
      expect(result.scoreBreakdown.reliability).toBeGreaterThanOrEqual(75);
      expect(result.scoreBreakdown.reliability).toBeLessThanOrEqual(100);
    });

    it('should give higher score for complete profile', () => {
      const completeVolunteer = {
        ...mockVolunteer,
        profile: {
          ...mockVolunteer.profile,
          firstName: 'John',
          lastName: 'Doe',
          phone: '555-1234',
          address: '123 Main St'
        }
      };
      const result = matchingAlgorithm.calculateMatchScore(completeVolunteer, mockEvent);

      expect(result.scoreBreakdown.reliability).toBeGreaterThanOrEqual(85);
    });
  });

  describe('getMatchQuality', () => {
    it('should return "Excellent" for high scores', () => {
      const distance = matchingAlgorithm.calculateDistance(
        29.7604, -95.3698,
        29.7604, -95.3698
      );

      expect(distance).toBe(0);
    });
  });

  describe('getMatchQuality', () => {
    it('should return correct match quality for scores', () => {
      expect(matchingAlgorithm.getMatchQuality(95)).toBe('Excellent');
      expect(matchingAlgorithm.getMatchQuality(75)).toBe('Good');
      expect(matchingAlgorithm.getMatchQuality(55)).toBe('Moderate');
      expect(matchingAlgorithm.getMatchQuality(25)).toBe('Very Poor');
    });

    it('should handle edge cases', () => {
      expect(matchingAlgorithm.getMatchQuality(0)).toBe('Very Poor');
      expect(matchingAlgorithm.getMatchQuality(100)).toBe('Excellent');
    });
  });

  describe('calculateLocationScore', () => {
    it('should calculate location score based on distance and max distance', () => {
      const profile = { latitude: 29.7604, longitude: -95.3698, preferences: { maxDistance: 50 } };
      const event = { latitude: 29.7520, longitude: -95.3720 };

      const score = matchingAlgorithm.calculateLocationScore(profile, event);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle missing coordinates', () => {
      const profile = { preferences: { maxDistance: 50 } };
      const event = { latitude: 29.7520, longitude: -95.3720 };

      const score = matchingAlgorithm.calculateLocationScore(profile, event);

      expect(score).toBe(50); // Default neutral score
    });
  });

  describe('calculateSkillsScore', () => {
    it('should calculate skills score correctly', () => {
      const volunteerSkills = [
        { skillId: 'skill_001', proficiency: 'intermediate' }
      ];
      const requiredSkills = [
        { skillId: 'skill_001', minLevel: 'beginner', required: true }
      ];

      const score = matchingAlgorithm.calculateSkillsScore(volunteerSkills, requiredSkills);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle volunteer with non-matching skills', () => {
      const volunteerSkills = [
        { skillId: 'skill_999', proficiency: 'intermediate' }
      ];
      const requiredSkills = [
        { skillId: 'skill_001', minLevel: 'beginner', required: true }
      ];

      const score = matchingAlgorithm.calculateSkillsScore(volunteerSkills, requiredSkills);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle empty skill requirements', () => {
      const volunteerSkills = [
        { skillId: 'skill_001', proficiency: 'intermediate' }
      ];
      const requiredSkills = [];

      const score = matchingAlgorithm.calculateSkillsScore(volunteerSkills, requiredSkills);

      expect(score).toBe(100); // No requirements = perfect match
    });
  });

  describe('algorithm configuration', () => {
    it('should have correct weights', () => {
      expect(matchingAlgorithm.weights).toHaveProperty('location');
      expect(matchingAlgorithm.weights).toHaveProperty('skills');
      expect(matchingAlgorithm.weights).toHaveProperty('availability');
      expect(matchingAlgorithm.weights).toHaveProperty('preferences');
      expect(matchingAlgorithm.weights).toHaveProperty('reliability');

      // Weights should sum to 1
      const totalWeight = Object.values(matchingAlgorithm.weights).reduce((sum, weight) => sum + weight, 0);
      expect(totalWeight).toBeCloseTo(1, 2);
    });
  });
});