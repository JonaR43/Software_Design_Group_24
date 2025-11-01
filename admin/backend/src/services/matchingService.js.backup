const matchingAlgorithm = require('../utils/matchingAlgorithm');
const { eventHelpers } = require('../data/events');
const { userHelpers } = require('../data/users');

/**
 * Matching Service
 * Handles volunteer-to-event matching operations
 */
class MatchingService {
  /**
   * Find best volunteer matches for an event
   * @param {string} eventId - Event ID
   * @param {Object} options - Matching options
   * @returns {Object} Matching results
   */
  async findMatchesForEvent(eventId, options = {}) {
    const { limit = 20, minScore = 0, includeAssigned = false } = options;

    const event = eventHelpers.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Get all available volunteers
    const availableVolunteers = await this.getAvailableVolunteers(eventId, includeAssigned);

    if (availableVolunteers.length === 0) {
      return {
        success: true,
        data: {
          eventId,
          matches: [],
          totalVolunteers: 0,
          message: 'No available volunteers found'
        }
      };
    }

    // Calculate match scores for all volunteers
    const matches = [];
    for (const volunteer of availableVolunteers) {
      try {
        const matchResult = matchingAlgorithm.calculateMatchScore(volunteer, event);

        if (matchResult.totalScore >= minScore) {
          matches.push({
            volunteer: {
              id: volunteer.id,
              username: volunteer.username,
              email: volunteer.email,
              profile: {
                firstName: volunteer.profile.firstName,
                lastName: volunteer.profile.lastName,
                phone: volunteer.profile.phone,
                skills: volunteer.profile.skills,
                availability: volunteer.profile.availability,
                preferences: volunteer.profile.preferences
              }
            },
            matchScore: matchResult.totalScore,
            scoreBreakdown: matchResult.scoreBreakdown,
            matchQuality: matchResult.matchQuality,
            recommendations: matchResult.recommendations,
            calculatedAt: matchResult.calculatedAt
          });
        }
      } catch (error) {
        console.error(`Error calculating match for volunteer ${volunteer.id}:`, error);
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply limit
    const limitedMatches = matches.slice(0, limit);

    // Generate summary statistics
    const stats = this.generateMatchingStats(matches, event);

    return {
      success: true,
      data: {
        eventId,
        event: {
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          maxVolunteers: event.maxVolunteers,
          currentVolunteers: event.currentVolunteers,
          spotsRemaining: event.maxVolunteers - event.currentVolunteers,
          requiredSkills: event.requiredSkills
        },
        matches: limitedMatches,
        totalMatches: matches.length,
        totalVolunteers: availableVolunteers.length,
        stats,
        options
      }
    };
  }

  /**
   * Find best event matches for a volunteer
   * @param {string} volunteerId - Volunteer ID
   * @param {Object} options - Matching options
   * @returns {Object} Matching results
   */
  async findMatchesForVolunteer(volunteerId, options = {}) {
    const { limit = 10, minScore = 0, statusFilter = 'published' } = options;

    const volunteer = userHelpers.findById(volunteerId);
    if (!volunteer) {
      throw new Error('Volunteer not found');
    }

    if (volunteer.role !== 'volunteer') {
      throw new Error('User is not a volunteer');
    }

    const profile = userHelpers.getProfile(volunteerId);
    if (!profile) {
      throw new Error('Volunteer profile not found');
    }

    const volunteerData = { ...volunteer, profile };

    // Get available events
    const availableEvents = this.getAvailableEvents(volunteerId, statusFilter);

    if (availableEvents.length === 0) {
      return {
        success: true,
        data: {
          volunteerId,
          matches: [],
          totalEvents: 0,
          message: 'No available events found'
        }
      };
    }

    // Calculate match scores for all events
    const matches = [];
    for (const event of availableEvents) {
      try {
        const matchResult = matchingAlgorithm.calculateMatchScore(volunteerData, event);

        if (matchResult.totalScore >= minScore) {
          matches.push({
            event: {
              id: event.id,
              title: event.title,
              description: event.description,
              location: event.location,
              startDate: event.startDate,
              endDate: event.endDate,
              maxVolunteers: event.maxVolunteers,
              currentVolunteers: event.currentVolunteers,
              urgencyLevel: event.urgencyLevel,
              category: event.category,
              requiredSkills: event.requiredSkills,
              spotsRemaining: event.maxVolunteers - event.currentVolunteers
            },
            matchScore: matchResult.totalScore,
            scoreBreakdown: matchResult.scoreBreakdown,
            matchQuality: matchResult.matchQuality,
            recommendations: matchResult.recommendations,
            calculatedAt: matchResult.calculatedAt
          });
        }
      } catch (error) {
        console.error(`Error calculating match for event ${event.id}:`, error);
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply limit
    const limitedMatches = matches.slice(0, limit);

    return {
      success: true,
      data: {
        volunteerId,
        volunteer: {
          id: volunteer.id,
          username: volunteer.username,
          email: volunteer.email,
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            skills: profile.skills,
            availability: profile.availability,
            preferences: profile.preferences
          }
        },
        matches: limitedMatches,
        totalMatches: matches.length,
        totalEvents: availableEvents.length,
        options
      }
    };
  }

  /**
   * Calculate match score between specific volunteer and event
   * @param {string} volunteerId - Volunteer ID
   * @param {string} eventId - Event ID
   * @returns {Object} Match score result
   */
  async calculateMatch(volunteerId, eventId) {
    const volunteer = userHelpers.findById(volunteerId);
    if (!volunteer) {
      throw new Error('Volunteer not found');
    }

    const event = eventHelpers.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const profile = userHelpers.getProfile(volunteerId);
    if (!profile) {
      throw new Error('Volunteer profile not found');
    }

    const volunteerData = { ...volunteer, profile };
    const matchResult = matchingAlgorithm.calculateMatchScore(volunteerData, event);

    return {
      success: true,
      data: {
        volunteer: {
          id: volunteer.id,
          username: volunteer.username,
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName
          }
        },
        event: {
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate
        },
        matchScore: matchResult.totalScore,
        scoreBreakdown: matchResult.scoreBreakdown,
        matchQuality: matchResult.matchQuality,
        recommendations: matchResult.recommendations,
        weights: matchResult.weights,
        calculatedAt: matchResult.calculatedAt
      }
    };
  }

  /**
   * Get automatic matching suggestions for all events
   * @param {Object} options - Options for batch matching
   * @returns {Object} Batch matching results
   */
  async getAutomaticSuggestions(options = {}) {
    const { minScore = 70, maxSuggestionsPerEvent = 5 } = options;

    const events = eventHelpers.getEventsNeedingVolunteers();
    const suggestions = [];

    for (const event of events) {
      try {
        const eventMatches = await this.findMatchesForEvent(event.id, {
          limit: maxSuggestionsPerEvent,
          minScore,
          includeAssigned: false
        });

        if (eventMatches.data.matches.length > 0) {
          suggestions.push({
            eventId: event.id,
            eventTitle: event.title,
            spotsNeeded: event.maxVolunteers - event.currentVolunteers,
            urgencyLevel: event.urgencyLevel,
            suggestions: eventMatches.data.matches.map(match => ({
              volunteerId: match.volunteer.id,
              volunteerName: `${match.volunteer.profile.firstName} ${match.volunteer.profile.lastName}`,
              matchScore: match.matchScore,
              matchQuality: match.matchQuality,
              topRecommendation: match.recommendations[0]?.message || 'No specific recommendations'
            }))
          });
        }
      } catch (error) {
        console.error(`Error generating suggestions for event ${event.id}:`, error);
      }
    }

    // Sort events by urgency (urgent first, then by spots needed)
    suggestions.sort((a, b) => {
      const urgencyOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const urgencyDiff = urgencyOrder[b.urgencyLevel] - urgencyOrder[a.urgencyLevel];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.spotsNeeded - a.spotsNeeded;
    });

    return {
      success: true,
      data: {
        suggestions,
        totalEvents: events.length,
        eventsWithSuggestions: suggestions.length,
        options,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Optimize volunteer assignments using matching scores
   * @param {string} eventId - Event ID
   * @param {Object} options - Optimization options
   * @returns {Object} Optimization results
   */
  async optimizeAssignments(eventId, options = {}) {
    const { maxAssignments, preserveConfirmed = true } = options;

    const event = eventHelpers.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const currentAssignments = eventHelpers.getEventAssignments(eventId);
    const availableSlots = event.maxVolunteers -
      (preserveConfirmed ? currentAssignments.filter(a => a.status === 'confirmed').length : 0);

    if (availableSlots <= 0) {
      return {
        success: true,
        data: {
          eventId,
          message: 'Event is at capacity',
          currentAssignments: currentAssignments.length,
          availableSlots: 0
        }
      };
    }

    // Get best matches
    const matchResults = await this.findMatchesForEvent(eventId, {
      limit: Math.min(availableSlots * 2, 50), // Get more options than slots
      minScore: 60, // Minimum reasonable score
      includeAssigned: false
    });

    const optimizedAssignments = [];
    const assignmentCount = Math.min(
      maxAssignments || availableSlots,
      availableSlots,
      matchResults.data.matches.length
    );

    for (let i = 0; i < assignmentCount; i++) {
      const match = matchResults.data.matches[i];
      optimizedAssignments.push({
        volunteerId: match.volunteer.id,
        volunteerName: `${match.volunteer.profile.firstName} ${match.volunteer.profile.lastName}`,
        matchScore: match.matchScore,
        matchQuality: match.matchQuality,
        recommendedStatus: match.matchScore >= 80 ? 'confirmed' : 'pending',
        assignmentReason: `Automatic optimization - ${match.matchQuality.toLowerCase()} match (${match.matchScore}%)`,
        recommendations: match.recommendations
      });
    }

    return {
      success: true,
      data: {
        eventId,
        eventTitle: event.title,
        optimizedAssignments,
        totalSlotsAvailable: availableSlots,
        totalAssignmentsMade: optimizedAssignments.length,
        averageMatchScore: optimizedAssignments.length > 0 ?
          Math.round(optimizedAssignments.reduce((sum, a) => sum + a.matchScore, 0) / optimizedAssignments.length) : 0,
        optimizationDate: new Date().toISOString()
      }
    };
  }

  /**
   * Get available volunteers for an event
   * @param {string} eventId - Event ID
   * @param {boolean} includeAssigned - Include already assigned volunteers
   * @returns {Array} Available volunteers
   */
  async getAvailableVolunteers(eventId, includeAssigned = false) {
    const volunteers = userHelpers.getVolunteerProfiles();

    if (!includeAssigned) {
      // Exclude volunteers already assigned to this event
      const assignments = eventHelpers.getEventAssignments(eventId);
      const assignedVolunteerIds = assignments.map(a => a.volunteerId);

      return volunteers
        .filter(v => !assignedVolunteerIds.includes(v.userId))
        .map(v => ({
          ...v.user,
          profile: v
        }));
    }

    return volunteers.map(v => ({
      ...v.user,
      profile: v
    }));
  }

  /**
   * Get available events for a volunteer
   * @param {string} volunteerId - Volunteer ID
   * @param {string} statusFilter - Event status filter
   * @returns {Array} Available events
   */
  getAvailableEvents(volunteerId, statusFilter = 'published') {
    const events = eventHelpers.getByStatus(statusFilter);
    const assignments = eventHelpers.getVolunteerAssignments(volunteerId);
    const assignedEventIds = assignments.map(a => a.eventId);

    // Filter out events the volunteer is already assigned to
    return events.filter(event =>
      !assignedEventIds.includes(event.id) &&
      event.currentVolunteers < event.maxVolunteers
    );
  }

  /**
   * Generate matching statistics
   * @param {Array} matches - Match results
   * @param {Object} event - Event data
   * @returns {Object} Statistics
   */
  generateMatchingStats(matches, event) {
    if (matches.length === 0) {
      return {
        averageScore: 0,
        scoreDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
        skillsCoverage: 0,
        locationAverageScore: 0,
        availabilityAverageScore: 0
      };
    }

    const totalScore = matches.reduce((sum, match) => sum + match.matchScore, 0);
    const averageScore = Math.round(totalScore / matches.length);

    const scoreDistribution = {
      excellent: matches.filter(m => m.matchScore >= 90).length,
      good: matches.filter(m => m.matchScore >= 70 && m.matchScore < 90).length,
      fair: matches.filter(m => m.matchScore >= 50 && m.matchScore < 70).length,
      poor: matches.filter(m => m.matchScore < 50).length
    };

    const locationScores = matches.map(m => m.scoreBreakdown.location);
    const availabilityScores = matches.map(m => m.scoreBreakdown.availability);

    const locationAverageScore = Math.round(
      locationScores.reduce((sum, score) => sum + score, 0) / locationScores.length
    );

    const availabilityAverageScore = Math.round(
      availabilityScores.reduce((sum, score) => sum + score, 0) / availabilityScores.length
    );

    // Calculate skills coverage
    const requiredSkills = event.requiredSkills || [];
    let skillsCoverage = 0;

    if (requiredSkills.length > 0) {
      const skillMatches = matches.filter(m => m.scoreBreakdown.skills >= 70);
      skillsCoverage = Math.round((skillMatches.length / matches.length) * 100);
    } else {
      skillsCoverage = 100; // No skills required
    }

    return {
      averageScore,
      scoreDistribution,
      skillsCoverage,
      locationAverageScore,
      availabilityAverageScore,
      topMatches: matches.slice(0, 3).map(m => ({
        volunteerId: m.volunteer.id,
        score: m.matchScore,
        quality: m.matchQuality
      }))
    };
  }

  /**
   * Get matching statistics for admin dashboard
   * @returns {Object} Overall matching statistics
   */
  async getMatchingStats() {
    const events = eventHelpers.getAllEvents();
    const volunteers = userHelpers.getVolunteers();
    const assignments = eventHelpers.getAllEvents()
      .flatMap(event => eventHelpers.getEventAssignments(event.id));

    const confirmedAssignments = assignments.filter(a => a.status === 'confirmed');
    const averageMatchScore = confirmedAssignments.length > 0 ?
      Math.round(confirmedAssignments.reduce((sum, a) => sum + (a.matchScore || 0), 0) / confirmedAssignments.length) : 0;

    const eventsNeedingVolunteers = eventHelpers.getEventsNeedingVolunteers();
    const totalSlotsAvailable = eventsNeedingVolunteers.reduce(
      (sum, event) => sum + (event.maxVolunteers - event.currentVolunteers), 0
    );

    return {
      success: true,
      data: {
        totalEvents: events.length,
        totalVolunteers: volunteers.length,
        totalAssignments: assignments.length,
        confirmedAssignments: confirmedAssignments.length,
        averageMatchScore,
        eventsNeedingVolunteers: eventsNeedingVolunteers.length,
        totalSlotsAvailable,
        matchingEfficiency: volunteers.length > 0 ?
          Math.round((confirmedAssignments.length / volunteers.length) * 100) : 0
      }
    };
  }
}

module.exports = new MatchingService();