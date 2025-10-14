/**
 * History Repository
 * Handles all database operations for volunteer history
 */

const prisma = require('../prisma');

class HistoryRepository {
  /**
   * Get volunteer history
   */
  async getVolunteerHistory(volunteerId, filters = {}) {
    const where = { volunteerId };

    if (filters.status) {
      where.status = filters.status.toUpperCase();
    }

    if (filters.startDate) {
      where.participationDate = {
        gte: new Date(filters.startDate)
      };
    }

    if (filters.endDate) {
      where.participationDate = {
        ...where.participationDate,
        lte: new Date(filters.endDate)
      };
    }

    return await prisma.volunteerHistory.findMany({
      where,
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
      },
      orderBy: {
        participationDate: 'desc'
      }
    });
  }

  /**
   * Get event history
   */
  async getEventHistory(eventId) {
    return await prisma.volunteerHistory.findMany({
      where: { eventId },
      include: {
        volunteer: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        participationDate: 'desc'
      }
    });
  }

  /**
   * Find history record by ID
   */
  async findById(historyId) {
    return await prisma.volunteerHistory.findUnique({
      where: { id: historyId },
      include: {
        volunteer: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true
          }
        },
        event: true
      }
    });
  }

  /**
   * Create history record
   */
  async create(historyData) {
    return await prisma.volunteerHistory.create({
      data: {
        volunteerId: historyData.volunteerId,
        eventId: historyData.eventId,
        assignmentId: historyData.assignmentId || null,
        status: historyData.status.toUpperCase(),
        hoursWorked: historyData.hoursWorked,
        performanceRating: historyData.performanceRating || null,
        feedback: historyData.feedback || null,
        attendance: historyData.attendance.toUpperCase(),
        skillsUtilized: historyData.skillsUtilized || [],
        participationDate: new Date(historyData.participationDate),
        completionDate: historyData.completionDate ? new Date(historyData.completionDate) : null,
        recordedBy: historyData.recordedBy || null,
        adminNotes: historyData.adminNotes || null
      },
      include: {
        volunteer: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true
          }
        },
        event: true
      }
    });
  }

  /**
   * Update history record
   */
  async update(historyId, updateData) {
    const data = { ...updateData };

    if (data.status) {
      data.status = data.status.toUpperCase();
    }

    if (data.attendance) {
      data.attendance = data.attendance.toUpperCase();
    }

    if (data.completionDate) {
      data.completionDate = new Date(data.completionDate);
    }

    return await prisma.volunteerHistory.update({
      where: { id: historyId },
      data,
      include: {
        volunteer: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true
          }
        },
        event: true
      }
    });
  }

  /**
   * Delete history record
   */
  async delete(historyId) {
    return await prisma.volunteerHistory.delete({
      where: { id: historyId }
    });
  }

  /**
   * Get volunteer statistics
   */
  async getVolunteerStats(volunteerId) {
    const history = await prisma.volunteerHistory.findMany({
      where: { volunteerId }
    });

    const completed = history.filter(h => h.status === 'COMPLETED');
    const totalHours = completed.reduce((sum, h) => sum + h.hoursWorked, 0);
    const avgRating = completed.length > 0
      ? completed.reduce((sum, h) => sum + (h.performanceRating || 0), 0) / completed.length
      : 0;

    const present = history.filter(h => h.attendance === 'PRESENT').length;
    const attendanceRate = history.length > 0 ? (present / history.length) * 100 : 0;

    return {
      totalEvents: history.length,
      completedEvents: completed.length,
      totalHours,
      averageRating: Math.round(avgRating * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      reliabilityScore: Math.round(attendanceRate)
    };
  }

  /**
   * Get all volunteer statistics
   */
  async getAllVolunteerStats() {
    const volunteers = await prisma.user.findMany({
      where: { role: 'VOLUNTEER' },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    const statsPromises = volunteers.map(async (volunteer) => {
      const stats = await this.getVolunteerStats(volunteer.id);
      return {
        volunteerId: volunteer.id,
        volunteerName: volunteer.username,
        volunteerEmail: volunteer.email,
        ...stats
      };
    });

    return await Promise.all(statsPromises);
  }

  /**
   * Get performance trends for a volunteer
   */
  async getPerformanceTrends(volunteerId, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const history = await prisma.volunteerHistory.findMany({
      where: {
        volunteerId,
        participationDate: {
          gte: startDate
        }
      },
      orderBy: {
        participationDate: 'asc'
      }
    });

    // Group by month
    const monthlyData = {};
    history.forEach(record => {
      const monthKey = record.participationDate.toISOString().substring(0, 7); // YYYY-MM

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          events: 0,
          hoursWorked: 0,
          ratings: []
        };
      }

      monthlyData[monthKey].events += 1;
      monthlyData[monthKey].hoursWorked += record.hoursWorked;
      if (record.performanceRating) {
        monthlyData[monthKey].ratings.push(record.performanceRating);
      }
    });

    // Calculate averages
    return Object.values(monthlyData).map(month => ({
      month: month.month,
      events: month.events,
      hoursWorked: month.hoursWorked,
      averageRating: month.ratings.length > 0
        ? month.ratings.reduce((sum, r) => sum + r, 0) / month.ratings.length
        : 0
    }));
  }

  /**
   * Check if history record exists for volunteer and event
   */
  async existsForVolunteerAndEvent(volunteerId, eventId) {
    const record = await prisma.volunteerHistory.findFirst({
      where: {
        volunteerId,
        eventId
      }
    });

    return record !== null;
  }
}

module.exports = new HistoryRepository();
