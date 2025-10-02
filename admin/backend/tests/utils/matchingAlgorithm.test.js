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