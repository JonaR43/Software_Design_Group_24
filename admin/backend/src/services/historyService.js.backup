const { volunteerHistory, participationStatuses, attendanceTypes, historyHelpers } = require('../data/history');
const { users, userHelpers } = require('../data/users');
const { events, eventHelpers } = require('../data/events');

/**
 * Volunteer History Service
 * Handles all business logic for tracking volunteer participation history
 */

class HistoryService {
  /**
   * Get volunteer's participation history
   */
  async getVolunteerHistory(volunteerId, filters = {}, options = {}) {
    try {
      // Validate volunteer exists
      const volunteer = userHelpers.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      // Get history with filters
      let history = historyHelpers.getVolunteerHistory(volunteerId, filters);

      // Apply pagination
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedHistory = history.slice(startIndex, endIndex);

      // Enrich with event and user data
      const enrichedHistory = paginatedHistory.map(record => ({
        ...record,
        event: eventHelpers.findById(record.eventId),
        recordedByUser: record.recordedBy ? userHelpers.findById(record.recordedBy) : null
      }));

      return {
        success: true,
        data: {
          history: enrichedHistory,
          pagination: {
            page,
            limit,
            total: history.length,
            totalPages: Math.ceil(history.length / limit),
            hasMore: endIndex < history.length
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get volunteer history: ${error.message}`);
    }
  }

  /**
   * Get current user's history (for volunteer self-service)
   */
  async getMyHistory(userId, filters = {}, options = {}) {
    return this.getVolunteerHistory(userId, filters, options);
  }

  /**
   * Record volunteer participation (admin only)
   */
  async recordParticipation(participationData, recordedBy) {
    try {
      // Validate required fields
      const { volunteerId, eventId, status, hoursWorked, attendance } = participationData;

      if (!volunteerId || !eventId || !status || hoursWorked === undefined || !attendance) {
        throw new Error('Missing required fields: volunteerId, eventId, status, hoursWorked, attendance');
      }

      // Validate volunteer exists
      const volunteer = userHelpers.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      // Validate event exists
      const event = eventHelpers.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Validate status
      if (!participationStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${participationStatuses.join(', ')}`);
      }

      // Validate attendance
      if (!attendanceTypes.includes(attendance)) {
        throw new Error(`Invalid attendance. Must be one of: ${attendanceTypes.join(', ')}`);
      }

      // Validate hours worked
      if (typeof hoursWorked !== 'number' || hoursWorked < 0 || hoursWorked > 24) {
        throw new Error('Hours worked must be a number between 0 and 24');
      }

      // Validate performance rating if provided
      if (participationData.performanceRating !== undefined) {
        const rating = participationData.performanceRating;
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
          throw new Error('Performance rating must be a number between 1 and 5');
        }
      }

      // Check for existing history record for this volunteer/event combination
      const existingRecord = volunteerHistory.find(
        record => record.volunteerId === volunteerId && record.eventId === eventId
      );

      if (existingRecord && status !== 'cancelled') {
        throw new Error('History record already exists for this volunteer and event');
      }

      // Create history record
      const historyRecord = {
        volunteerId,
        eventId,
        assignmentId: participationData.assignmentId || null,
        status,
        hoursWorked,
        performanceRating: participationData.performanceRating || null,
        feedback: participationData.feedback || null,
        attendance,
        skills_utilized: participationData.skillsUtilized || [],
        participationDate: participationData.participationDate || event.startDate,
        completionDate: status === 'completed' ? (participationData.completionDate || new Date()) : null,
        recordedBy,
        adminNotes: participationData.adminNotes || null
      };

      const newRecord = historyHelpers.addHistoryRecord(historyRecord);

      return {
        success: true,
        message: 'Participation recorded successfully',
        data: {
          ...newRecord,
          event: event,
          volunteer: volunteer
        }
      };
    } catch (error) {
      throw new Error(`Failed to record participation: ${error.message}`);
    }
  }

  /**
   * Update existing history record (admin only)
   */
  async updateHistoryRecord(historyId, updateData, updatedBy) {
    try {
      // Validate history record exists
      const existingRecord = historyHelpers.getHistoryById(historyId);
      if (!existingRecord) {
        throw new Error('History record not found');
      }

      // Validate status if provided
      if (updateData.status && !participationStatuses.includes(updateData.status)) {
        throw new Error(`Invalid status. Must be one of: ${participationStatuses.join(', ')}`);
      }

      // Validate attendance if provided
      if (updateData.attendance && !attendanceTypes.includes(updateData.attendance)) {
        throw new Error(`Invalid attendance. Must be one of: ${attendanceTypes.join(', ')}`);
      }

      // Validate hours worked if provided
      if (updateData.hoursWorked !== undefined) {
        if (typeof updateData.hoursWorked !== 'number' || updateData.hoursWorked < 0 || updateData.hoursWorked > 24) {
          throw new Error('Hours worked must be a number between 0 and 24');
        }
      }

      // Validate performance rating if provided
      if (updateData.performanceRating !== undefined && updateData.performanceRating !== null) {
        const rating = updateData.performanceRating;
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
          throw new Error('Performance rating must be a number between 1 and 5');
        }
      }

      // Add metadata
      const dataToUpdate = {
        ...updateData,
        updatedBy,
        lastUpdatedAt: new Date()
      };

      const updatedRecord = historyHelpers.updateHistoryRecord(historyId, dataToUpdate);

      return {
        success: true,
        message: 'History record updated successfully',
        data: updatedRecord
      };
    } catch (error) {
      throw new Error(`Failed to update history record: ${error.message}`);
    }
  }

  /**
   * Get volunteer statistics
   */
  async getVolunteerStats(volunteerId) {
    try {
      // Validate volunteer exists
      const volunteer = userHelpers.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      const stats = historyHelpers.calculateVolunteerStats(volunteerId);

      return {
        success: true,
        data: {
          volunteerId,
          volunteerName: `${volunteer.username}`,
          ...stats
        }
      };
    } catch (error) {
      throw new Error(`Failed to get volunteer statistics: ${error.message}`);
    }
  }

  /**
   * Get performance metrics for a volunteer
   */
  async getPerformanceMetrics(volunteerId, months = 6) {
    try {
      // Validate volunteer exists
      const volunteer = userHelpers.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      const trends = historyHelpers.getPerformanceTrends(volunteerId, months);
      const stats = historyHelpers.calculateVolunteerStats(volunteerId);

      return {
        success: true,
        data: {
          volunteerId,
          volunteerName: volunteer.username,
          overallStats: stats,
          monthlyTrends: trends,
          periodMonths: months
        }
      };
    } catch (error) {
      throw new Error(`Failed to get performance metrics: ${error.message}`);
    }
  }

  /**
   * Get all volunteer statistics (admin only)
   */
  async getAllVolunteerStats(options = {}) {
    try {
      const allStats = historyHelpers.getAllVolunteerStats();

      // Enrich with volunteer information
      const enrichedStats = allStats.map(stats => {
        const volunteer = userHelpers.findById(stats.volunteerId);
        return {
          ...stats,
          volunteerName: volunteer ? volunteer.username : 'Unknown',
          volunteerEmail: volunteer ? volunteer.email : 'Unknown'
        };
      });

      // Sort by total hours or reliability score
      const sortBy = options.sortBy || 'totalHours';
      enrichedStats.sort((a, b) => {
        if (sortBy === 'reliabilityScore') {
          return b.reliabilityScore - a.reliabilityScore;
        }
        return b.totalHours - a.totalHours;
      });

      return {
        success: true,
        data: {
          volunteers: enrichedStats,
          summary: {
            totalVolunteers: enrichedStats.length,
            totalEvents: enrichedStats.reduce((sum, v) => sum + v.totalEvents, 0),
            totalHours: enrichedStats.reduce((sum, v) => sum + v.totalHours, 0),
            averageReliability: enrichedStats.length > 0
              ? enrichedStats.reduce((sum, v) => sum + v.reliabilityScore, 0) / enrichedStats.length
              : 0
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get all volunteer statistics: ${error.message}`);
    }
  }

  /**
   * Get event participation summary (admin only)
   */
  async getEventHistory(eventId) {
    try {
      // Validate event exists
      const event = eventHelpers.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const eventHistory = historyHelpers.getEventHistory(eventId);

      // Enrich with volunteer information
      const enrichedHistory = eventHistory.map(record => {
        const volunteer = userHelpers.findById(record.volunteerId);
        return {
          ...record,
          volunteer: volunteer ? {
            id: volunteer.id,
            username: volunteer.username,
            email: volunteer.email
          } : null
        };
      });

      // Calculate event statistics
      const completedParticipants = enrichedHistory.filter(record => record.status === 'completed');
      const totalHours = completedParticipants.reduce((sum, record) => sum + record.hoursWorked, 0);
      const averageRating = completedParticipants.length > 0
        ? completedParticipants.reduce((sum, record) => sum + (record.performanceRating || 0), 0) / completedParticipants.length
        : 0;

      return {
        success: true,
        data: {
          event: {
            id: event.id,
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate
          },
          participation: enrichedHistory,
          statistics: {
            totalParticipants: enrichedHistory.length,
            completedParticipants: completedParticipants.length,
            totalHours,
            averageRating: Math.round(averageRating * 100) / 100,
            attendanceRate: enrichedHistory.length > 0
              ? (enrichedHistory.filter(record => record.attendance === 'present').length / enrichedHistory.length) * 100
              : 0
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to get event history: ${error.message}`);
    }
  }

  /**
   * Get dashboard statistics for admin
   */
  async getDashboardStats() {
    try {
      const allStats = historyHelpers.getAllVolunteerStats();
      const recentHistory = volunteerHistory
        .filter(record => {
          const recordDate = new Date(record.participationDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return recordDate >= thirtyDaysAgo;
        });

      const completedEvents = volunteerHistory.filter(record => record.status === 'completed');
      const totalHours = completedEvents.reduce((sum, record) => sum + record.hoursWorked, 0);

      return {
        success: true,
        data: {
          overview: {
            totalVolunteers: allStats.length,
            totalEvents: [...new Set(volunteerHistory.map(record => record.eventId))].length,
            totalHours,
            averageReliability: allStats.length > 0
              ? allStats.reduce((sum, v) => sum + v.reliabilityScore, 0) / allStats.length
              : 0
          },
          recentActivity: {
            last30Days: recentHistory.length,
            completedLast30Days: recentHistory.filter(record => record.status === 'completed').length,
            hoursLast30Days: recentHistory
              .filter(record => record.status === 'completed')
              .reduce((sum, record) => sum + record.hoursWorked, 0)
          },
          topPerformers: allStats
            .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
            .slice(0, 5)
            .map(stats => {
              const volunteer = userHelpers.findById(stats.volunteerId);
              return {
                volunteerId: stats.volunteerId,
                name: volunteer ? volunteer.username : 'Unknown',
                reliabilityScore: stats.reliabilityScore,
                totalHours: stats.totalHours,
                completedEvents: stats.completedEvents
              };
            })
        }
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard statistics: ${error.message}`);
    }
  }
}

module.exports = new HistoryService();