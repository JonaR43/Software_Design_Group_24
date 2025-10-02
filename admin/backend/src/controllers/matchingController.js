const matchingService = require('../services/matchingService');

/**
 * Matching Controller
 * Handles HTTP requests for volunteer matching operations
 */
class MatchingController {
  /**
   * Find volunteer matches for an event
   * POST /api/matching/event/:eventId/volunteers
   */
  async findVolunteersForEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const options = {
        limit: parseInt(req.query.limit) || 20,
        minScore: parseInt(req.query.minScore) || 0,
        includeAssigned: req.query.includeAssigned === 'true'
      };

      const result = await matchingService.findMatchesForEvent(eventId, options);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Event not found') {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Find event matches for a volunteer
   * GET /api/matching/volunteer/:volunteerId/events
   */
  async findEventsForVolunteer(req, res, next) {
    try {
      const { volunteerId } = req.params;

      // Check authorization - volunteers can only see their own matches
      if (req.user.role !== 'admin' && req.user.id !== volunteerId) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only view your own matches.',
          timestamp: new Date().toISOString()
        });
      }

      const options = {
        limit: parseInt(req.query.limit) || 10,
        minScore: parseInt(req.query.minScore) || 0,
        statusFilter: req.query.status || 'published'
      };

      const result = await matchingService.findMatchesForVolunteer(volunteerId, options);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('not a volunteer')) {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Get events for current volunteer
   * GET /api/matching/my-matches
   */
  async getMyMatches(req, res, next) {
    try {
      if (req.user.role !== 'volunteer') {
        return res.status(403).json({
          status: 'error',
          message: 'Only volunteers can view event matches',
          timestamp: new Date().toISOString()
        });
      }

      const options = {
        limit: parseInt(req.query.limit) || 10,
        minScore: parseInt(req.query.minScore) || 40, // Higher minimum for recommendations
        statusFilter: req.query.status || 'published'
      };

      const result = await matchingService.findMatchesForVolunteer(req.user.id, options);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate match score between volunteer and event
   * GET /api/matching/calculate/:volunteerId/:eventId
   */
  async calculateMatch(req, res, next) {
    try {
      const { volunteerId, eventId } = req.params;

      // Check authorization
      if (req.user.role !== 'admin' && req.user.id !== volunteerId) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const result = await matchingService.calculateMatch(volunteerId, eventId);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Get automatic matching suggestions for all events (admin only)
   * GET /api/matching/suggestions
   */
  async getAutomaticSuggestions(req, res, next) {
    try {
      const options = {
        minScore: parseInt(req.query.minScore) || 70,
        maxSuggestionsPerEvent: parseInt(req.query.maxSuggestions) || 5
      };

      const result = await matchingService.getAutomaticSuggestions(options);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Optimize volunteer assignments for an event (admin only)
   * POST /api/matching/optimize/:eventId
   */
  async optimizeAssignments(req, res, next) {
    try {
      const { eventId } = req.params;
      const options = {
        maxAssignments: req.body.maxAssignments,
        preserveConfirmed: req.body.preserveConfirmed !== false // Default to true
      };

      const result = await matchingService.optimizeAssignments(eventId, options);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Event not found') {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Bulk assign optimized volunteers to an event (admin only)
   * POST /api/matching/bulk-assign/:eventId
   */
  async bulkAssignOptimized(req, res, next) {
    try {
      const { eventId } = req.params;
      const { assignments, autoConfirmHighMatches = true } = req.body;

      if (!assignments || !Array.isArray(assignments)) {
        return res.status(400).json({
          status: 'error',
          message: 'Assignments array is required',
          timestamp: new Date().toISOString()
        });
      }

      const results = [];
      const eventService = require('../services/eventService');

      for (const assignment of assignments) {
        try {
          const status = autoConfirmHighMatches && assignment.matchScore >= 80 ?
            'confirmed' : 'pending';

          const assignResult = await eventService.assignVolunteer(
            eventId,
            assignment.volunteerId,
            {
              matchScore: assignment.matchScore,
              notes: assignment.assignmentReason || `Bulk assignment - ${assignment.matchQuality} match`,
              status
            }
          );

          results.push({
            volunteerId: assignment.volunteerId,
            success: true,
            status,
            matchScore: assignment.matchScore,
            assignmentId: assignResult.data.id
          });
        } catch (error) {
          results.push({
            volunteerId: assignment.volunteerId,
            success: false,
            error: error.message,
            matchScore: assignment.matchScore
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      res.status(200).json({
        status: 'success',
        message: `Bulk assignment completed: ${successCount} successful, ${errorCount} failed`,
        data: {
          eventId,
          results,
          summary: {
            totalAssignments: assignments.length,
            successful: successCount,
            failed: errorCount,
            successRate: Math.round((successCount / assignments.length) * 100)
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get matching statistics (admin only)
   * GET /api/matching/stats
   */
  async getMatchingStats(req, res, next) {
    try {
      const result = await matchingService.getMatchingStats();

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test matching algorithm with sample data
   * POST /api/matching/test
   */
  async testMatching(req, res, next) {
    try {
      const { volunteerId, eventId } = req.body;

      if (!volunteerId || !eventId) {
        return res.status(400).json({
          status: 'error',
          message: 'Both volunteerId and eventId are required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await matchingService.calculateMatch(volunteerId, eventId);

      // Add additional test information
      const testData = {
        ...result.data,
        testMode: true,
        algorithmWeights: result.data.weights,
        detailedBreakdown: {
          location: {
            score: result.data.scoreBreakdown.location,
            weight: result.data.weights.location,
            contribution: Math.round(result.data.scoreBreakdown.location * result.data.weights.location)
          },
          skills: {
            score: result.data.scoreBreakdown.skills,
            weight: result.data.weights.skills,
            contribution: Math.round(result.data.scoreBreakdown.skills * result.data.weights.skills)
          },
          availability: {
            score: result.data.scoreBreakdown.availability,
            weight: result.data.weights.availability,
            contribution: Math.round(result.data.scoreBreakdown.availability * result.data.weights.availability)
          },
          preferences: {
            score: result.data.scoreBreakdown.preferences,
            weight: result.data.weights.preferences,
            contribution: Math.round(result.data.scoreBreakdown.preferences * result.data.weights.preferences)
          },
          reliability: {
            score: result.data.scoreBreakdown.reliability,
            weight: result.data.weights.reliability,
            contribution: Math.round(result.data.scoreBreakdown.reliability * result.data.weights.reliability)
          }
        }
      };

      res.status(200).json({
        status: 'success',
        data: testData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Get algorithm configuration and weights
   * GET /api/matching/algorithm-info
   */
  async getAlgorithmInfo(req, res, next) {
    try {
      const matchingAlgorithm = require('../utils/matchingAlgorithm');

      res.status(200).json({
        status: 'success',
        data: {
          weights: matchingAlgorithm.weights,
          description: 'JACS ShiftPilot Volunteer Matching Algorithm',
          version: '1.0.0',
          components: {
            location: {
              weight: matchingAlgorithm.weights.location,
              description: 'Distance-based scoring with volunteer preference consideration'
            },
            skills: {
              weight: matchingAlgorithm.weights.skills,
              description: 'Skill alignment with proficiency level matching'
            },
            availability: {
              weight: matchingAlgorithm.weights.availability,
              description: 'Schedule compatibility and time preference alignment'
            },
            preferences: {
              weight: matchingAlgorithm.weights.preferences,
              description: 'Cause interest and event type preferences'
            },
            reliability: {
              weight: matchingAlgorithm.weights.reliability,
              description: 'Volunteer history and profile completeness'
            }
          },
          scoring: {
            range: '0-100',
            excellent: '90-100',
            veryGood: '80-89',
            good: '70-79',
            fair: '60-69',
            moderate: '50-59',
            poor: '40-49',
            veryPoor: '0-39'
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MatchingController();