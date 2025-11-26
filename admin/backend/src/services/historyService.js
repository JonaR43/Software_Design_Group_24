const historyRepository = require('../database/repositories/historyRepository');
const userRepository = require('../database/repositories/userRepository');
const eventRepository = require('../database/repositories/eventRepository');
const prisma = require('../database/prisma');

// Static constants
const participationStatuses = ['registered', 'confirmed', 'completed', 'no_show', 'cancelled'];
const attendanceTypes = ['present', 'absent', 'late', 'excused'];

/**
 * Volunteer History Service
 * Handles all business logic for tracking volunteer participation history
 * Updated to use Prisma database
 */

class HistoryService {
  /**
   * Get volunteer's participation history
   */
  async getVolunteerHistory(volunteerId, filters = {}, options = {}) {
    try {
      // Validate volunteer exists
      const volunteer = await userRepository.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      // Get completed history records
      const historyRecords = await historyRepository.getVolunteerHistory(volunteerId, filters);

      // Get active assignments (upcoming events) - these should also appear in the attendance page
      const assignments = await prisma.assignment.findMany({
        where: {
          volunteerId,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        },
        include: {
          event: {
            include: {
              creator: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          },
          volunteer: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: true
            }
          }
        }
      });

      // Transform assignments to look like history records
      const transformedAssignments = assignments.map(assignment => ({
        id: assignment.id,
        volunteerId: assignment.volunteerId,
        eventId: assignment.eventId,
        assignmentId: assignment.id,
        status: assignment.status, // PENDING or CONFIRMED
        hoursWorked: 0,
        performanceRating: null,
        feedback: null,
        attendance: 'PENDING',
        skillsUtilized: [],
        participationDate: assignment.event.startDate,
        completionDate: null,
        recordedBy: null,
        adminNotes: null,
        event: assignment.event,
        volunteer: assignment.volunteer,
        createdAt: assignment.assignedAt,
        updatedAt: assignment.updatedAt
      }));

      // Combine history records and assignments
      const allHistory = [...historyRecords, ...transformedAssignments];

      // Sort by participation date (descending)
      allHistory.sort((a, b) => new Date(b.participationDate) - new Date(a.participationDate));

      // Apply pagination
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedHistory = allHistory.slice(startIndex, endIndex);

      // Normalize enum values to lowercase
      const normalizedHistory = paginatedHistory.map(record => ({
        ...record,
        status: record.status.toLowerCase().replace('_', '-'),
        attendance: record.attendance.toLowerCase(),
        event: record.event,
        volunteer: record.volunteer,
        recordedByUser: record.recordedBy ? { id: record.recordedBy } : null
      }));

      return {
        success: true,
        data: {
          history: normalizedHistory,
          pagination: {
            page,
            limit,
            total: allHistory.length,
            totalPages: Math.ceil(allHistory.length / limit),
            hasMore: endIndex < allHistory.length
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
      const volunteer = await userRepository.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      // Validate event exists
      const event = await eventRepository.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Validate status
      if (!participationStatuses.includes(status.toLowerCase())) {
        throw new Error(`Invalid status. Must be one of: ${participationStatuses.join(', ')}`);
      }

      // Validate attendance
      if (!attendanceTypes.includes(attendance.toLowerCase())) {
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
      const exists = await historyRepository.existsForVolunteerAndEvent(volunteerId, eventId);

      if (exists && status.toLowerCase() !== 'cancelled') {
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
        skillsUtilized: participationData.skillsUtilized || [],
        participationDate: participationData.participationDate || event.startDate,
        completionDate: status.toLowerCase() === 'completed' ? (participationData.completionDate || new Date()) : null,
        recordedBy,
        adminNotes: participationData.adminNotes || null
      };

      const newRecord = await historyRepository.create(historyRecord);

      return {
        success: true,
        message: 'Participation recorded successfully',
        data: {
          ...newRecord,
          status: newRecord.status.toLowerCase().replace('_', '-'),
          attendance: newRecord.attendance.toLowerCase()
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
      const existingRecord = await historyRepository.findById(historyId);
      if (!existingRecord) {
        throw new Error('History record not found');
      }

      // Validate status if provided
      if (updateData.status && !participationStatuses.includes(updateData.status.toLowerCase())) {
        throw new Error(`Invalid status. Must be one of: ${participationStatuses.join(', ')}`);
      }

      // Validate attendance if provided
      if (updateData.attendance && !attendanceTypes.includes(updateData.attendance.toLowerCase())) {
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

      // Update record
      const updatedRecord = await historyRepository.update(historyId, updateData);

      return {
        success: true,
        message: 'History record updated successfully',
        data: {
          ...updatedRecord,
          status: updatedRecord.status.toLowerCase().replace('_', '-'),
          attendance: updatedRecord.attendance.toLowerCase()
        }
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
      const volunteer = await userRepository.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      const stats = await historyRepository.getVolunteerStats(volunteerId);

      return {
        success: true,
        data: {
          volunteerId,
          volunteerName: volunteer.username,
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
      const volunteer = await userRepository.findById(volunteerId);
      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      const trends = await historyRepository.getPerformanceTrends(volunteerId, months);
      const stats = await historyRepository.getVolunteerStats(volunteerId);

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
      const allStats = await historyRepository.getAllVolunteerStats();

      // Sort by total hours or reliability score
      const sortBy = options.sortBy || 'totalHours';
      allStats.sort((a, b) => {
        if (sortBy === 'reliabilityScore') {
          return b.reliabilityScore - a.reliabilityScore;
        }
        return b.totalHours - a.totalHours;
      });

      return {
        success: true,
        data: {
          volunteers: allStats,
          summary: {
            totalVolunteers: allStats.length,
            totalEvents: allStats.reduce((sum, v) => sum + v.totalEvents, 0),
            totalHours: allStats.reduce((sum, v) => sum + v.totalHours, 0),
            averageReliability: allStats.length > 0
              ? allStats.reduce((sum, v) => sum + v.reliabilityScore, 0) / allStats.length
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
      const event = await eventRepository.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const eventHistory = await historyRepository.getEventHistory(eventId);

      // Normalize enums to lowercase
      const normalizedHistory = eventHistory.map(record => ({
        ...record,
        status: record.status.toLowerCase().replace('_', '-'),
        attendance: record.attendance.toLowerCase()
      }));

      // Calculate event statistics
      const completedParticipants = normalizedHistory.filter(record => record.status === 'completed');
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
          participation: normalizedHistory,
          statistics: {
            totalParticipants: normalizedHistory.length,
            completedParticipants: completedParticipants.length,
            totalHours,
            averageRating: Math.round(averageRating * 100) / 100,
            attendanceRate: normalizedHistory.length > 0
              ? (normalizedHistory.filter(record => record.attendance === 'present').length / normalizedHistory.length) * 100
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
      const allStats = await historyRepository.getAllVolunteerStats();

      // Get all history for calculations
      const allHistory = await prisma.volunteerHistory.findMany();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentHistory = allHistory.filter(record =>
        new Date(record.participationDate) >= thirtyDaysAgo
      );

      const completedEvents = allHistory.filter(record => record.status === 'COMPLETED');
      const totalHours = completedEvents.reduce((sum, record) => sum + record.hoursWorked, 0);

      return {
        success: true,
        data: {
          overview: {
            totalVolunteers: allStats.length,
            totalEvents: [...new Set(allHistory.map(record => record.eventId))].length,
            totalHours,
            averageReliability: allStats.length > 0
              ? allStats.reduce((sum, v) => sum + v.reliabilityScore, 0) / allStats.length
              : 0
          },
          recentActivity: {
            last30Days: recentHistory.length,
            completedLast30Days: recentHistory.filter(record => record.status === 'COMPLETED').length,
            hoursLast30Days: recentHistory
              .filter(record => record.status === 'COMPLETED')
              .reduce((sum, record) => sum + record.hoursWorked, 0)
          },
          topPerformers: allStats
            .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
            .slice(0, 5)
            .map(stats => ({
              volunteerId: stats.volunteerId,
              name: stats.volunteerName,
              reliabilityScore: stats.reliabilityScore,
              totalHours: stats.totalHours,
              completedEvents: stats.completedEvents
            }))
        }
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard statistics: ${error.message}`);
    }
  }
}

module.exports = new HistoryService();