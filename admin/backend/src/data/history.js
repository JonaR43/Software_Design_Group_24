/**
 * Hardcoded Volunteer History Data for Assignment 3
 * Tracks volunteer participation history and performance
 */

// Sample volunteer history records
const volunteerHistory = [
  {
    id: 'history_001',
    volunteerId: 'user_002',
    eventId: 'event_001',
    assignmentId: 'assignment_001',
    status: 'completed',
    hoursWorked: 8.0,
    performanceRating: 5,
    feedback: 'Excellent work! John was very helpful in organizing the food drive and showed great leadership.',
    attendance: 'present',
    skills_utilized: ['skill_009', 'skill_011'],
    participationDate: new Date('2024-12-15T09:00:00Z'),
    completionDate: new Date('2024-12-15T17:00:00Z'),
    recordedBy: 'user_001',
    recordedAt: new Date('2024-12-15T18:00:00Z'),
    adminNotes: 'Outstanding volunteer performance, recommend for future leadership roles'
  },
  {
    id: 'history_002',
    volunteerId: 'user_003',
    eventId: 'event_001',
    assignmentId: 'assignment_002',
    status: 'completed',
    hoursWorked: 7.5,
    performanceRating: 4,
    feedback: 'Sarah did a great job helping with the food sorting and was very punctual.',
    attendance: 'present',
    skills_utilized: ['skill_009'],
    participationDate: new Date('2024-12-15T09:00:00Z'),
    completionDate: new Date('2024-12-15T16:30:00Z'),
    recordedBy: 'user_001',
    recordedAt: new Date('2024-12-15T18:00:00Z'),
    adminNotes: 'Reliable volunteer, good team player'
  },
  {
    id: 'history_003',
    volunteerId: 'user_004',
    eventId: 'event_002',
    assignmentId: 'assignment_003',
    status: 'no_show',
    hoursWorked: 0,
    performanceRating: null,
    feedback: null,
    attendance: 'absent',
    skills_utilized: [],
    participationDate: new Date('2024-11-20T08:00:00Z'),
    completionDate: null,
    recordedBy: 'user_001',
    recordedAt: new Date('2024-11-20T10:00:00Z'),
    adminNotes: 'No show - need to follow up'
  },
  {
    id: 'history_004',
    volunteerId: 'user_002',
    eventId: 'event_003',
    assignmentId: 'assignment_004',
    status: 'in_progress',
    hoursWorked: 0,
    performanceRating: null,
    feedback: null,
    attendance: 'pending',
    skills_utilized: [],
    participationDate: new Date('2025-01-10T14:00:00Z'),
    completionDate: null,
    recordedBy: null,
    recordedAt: new Date('2024-12-01T10:00:00Z'),
    adminNotes: 'Upcoming event assignment'
  },
  {
    id: 'history_005',
    volunteerId: 'user_003',
    eventId: 'event_002',
    assignmentId: 'assignment_005',
    status: 'completed',
    hoursWorked: 6.0,
    performanceRating: 5,
    feedback: 'Sarah showed exceptional dedication during the park cleanup. Very thorough work.',
    attendance: 'present',
    skills_utilized: ['skill_001', 'skill_014'],
    participationDate: new Date('2024-11-20T08:00:00Z'),
    completionDate: new Date('2024-11-20T14:00:00Z'),
    recordedBy: 'user_001',
    recordedAt: new Date('2024-11-20T15:00:00Z'),
    adminNotes: 'Great environmental awareness and work ethic'
  },
  {
    id: 'history_006',
    volunteerId: 'user_005',
    eventId: 'event_001',
    assignmentId: 'assignment_006',
    status: 'completed',
    hoursWorked: 4.5,
    performanceRating: 4,
    feedback: 'Good work on the food drive. Showed up on time and helped with organization.',
    attendance: 'present',
    skills_utilized: ['skill_009', 'skill_002'],
    participationDate: new Date('2024-12-15T13:00:00Z'),
    completionDate: new Date('2024-12-15T17:30:00Z'),
    recordedBy: 'user_001',
    recordedAt: new Date('2024-12-15T18:00:00Z'),
    adminNotes: 'New volunteer, good start'
  },
  {
    id: 'history_007',
    volunteerId: 'user_005',
    eventId: 'event_003',
    assignmentId: 'assignment_007',
    status: 'in_progress',
    hoursWorked: 0,
    performanceRating: null,
    feedback: null,
    attendance: 'pending',
    skills_utilized: [],
    participationDate: new Date('2025-01-10T14:00:00Z'),
    completionDate: null,
    recordedBy: null,
    recordedAt: new Date('2024-12-20T10:00:00Z'),
    adminNotes: 'Upcoming community cleanup event'
  },
  {
    id: 'history_008',
    volunteerId: 'user_005',
    eventId: 'event_002',
    assignmentId: 'assignment_008',
    status: 'completed',
    hoursWorked: 3.0,
    performanceRating: 5,
    feedback: 'Excellent work! Very helpful with the park cleanup and showed great initiative.',
    attendance: 'present',
    skills_utilized: ['skill_001', 'skill_009'],
    participationDate: new Date('2024-11-25T09:00:00Z'),
    completionDate: new Date('2024-11-25T12:00:00Z'),
    recordedBy: 'user_001',
    recordedAt: new Date('2024-11-25T13:00:00Z'),
    adminNotes: 'Great improvement in performance'
  }
];

// Valid status values for volunteer participation
const participationStatuses = [
  'assigned',      // Volunteer is assigned to event but hasn't started
  'confirmed',     // Volunteer confirmed attendance
  'in_progress',   // Event is currently happening
  'completed',     // Volunteer completed their assignment
  'cancelled',     // Assignment was cancelled
  'no_show',       // Volunteer didn't show up
  'left_early',    // Volunteer left before completion
  'rescheduled'    // Assignment was moved to different time
];

// Valid attendance values
const attendanceTypes = [
  'pending',       // Attendance not yet determined
  'present',       // Volunteer attended
  'absent',        // Volunteer did not attend
  'late',          // Volunteer arrived late
  'left_early'     // Volunteer left before end time
];

// Helper functions for history data management
const historyHelpers = {
  /**
   * Get all history records for a specific volunteer
   */
  getVolunteerHistory: (volunteerId, filters = {}) => {
    let history = volunteerHistory.filter(record => record.volunteerId === volunteerId);

    // Apply filters
    if (filters.status) {
      history = history.filter(record => record.status === filters.status);
    }

    if (filters.startDate) {
      history = history.filter(record =>
        new Date(record.participationDate) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      history = history.filter(record =>
        new Date(record.participationDate) <= new Date(filters.endDate)
      );
    }

    // Sort by participation date (most recent first)
    return history.sort((a, b) => new Date(b.participationDate) - new Date(a.participationDate));
  },

  /**
   * Get history record by ID
   */
  getHistoryById: (historyId) => {
    return volunteerHistory.find(record => record.id === historyId);
  },

  /**
   * Get all history records for a specific event
   */
  getEventHistory: (eventId) => {
    return volunteerHistory.filter(record => record.eventId === eventId);
  },

  /**
   * Add new history record
   */
  addHistoryRecord: (historyData) => {
    const newRecord = {
      id: `history_${String(volunteerHistory.length + 1).padStart(3, '0')}`,
      ...historyData,
      recordedAt: new Date()
    };

    volunteerHistory.push(newRecord);
    return newRecord;
  },

  /**
   * Update existing history record
   */
  updateHistoryRecord: (historyId, updateData) => {
    const index = volunteerHistory.findIndex(record => record.id === historyId);
    if (index === -1) return null;

    volunteerHistory[index] = {
      ...volunteerHistory[index],
      ...updateData,
      updatedAt: new Date()
    };

    return volunteerHistory[index];
  },

  /**
   * Calculate volunteer statistics
   */
  calculateVolunteerStats: (volunteerId) => {
    const history = historyHelpers.getVolunteerHistory(volunteerId);
    const completedEvents = history.filter(record => record.status === 'COMPLETED');

    const totalHours = completedEvents.reduce((sum, record) => sum + record.hoursWorked, 0);
    const averageRating = completedEvents.length > 0
      ? completedEvents.reduce((sum, record) => sum + (record.performanceRating || 0), 0) / completedEvents.length
      : 0;

    const attendanceRate = history.length > 0
      ? (history.filter(record => record.attendance === 'present').length / history.length) * 100
      : 0;

    const reliabilityScore = calculateReliabilityScore(history);

    return {
      totalEvents: history.length,
      completedEvents: completedEvents.length,
      totalHours: totalHours,
      averageRating: Math.round(averageRating * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      reliabilityScore: reliabilityScore,
      noShowCount: history.filter(record => record.status === 'NO_SHOW').length,
      cancelledCount: history.filter(record => record.status === 'cancelled').length
    };
  },

  /**
   * Get all volunteer statistics (admin view)
   */
  getAllVolunteerStats: () => {
    const allVolunteers = [...new Set(volunteerHistory.map(record => record.volunteerId))];

    return allVolunteers.map(volunteerId => ({
      volunteerId,
      ...historyHelpers.calculateVolunteerStats(volunteerId)
    }));
  },

  /**
   * Get performance trends for a volunteer
   */
  getPerformanceTrends: (volunteerId, months = 6) => {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    const recentHistory = historyHelpers.getVolunteerHistory(volunteerId)
      .filter(record => new Date(record.participationDate) >= cutoffDate)
      .filter(record => record.status === 'completed');

    // Group by month
    const monthlyStats = {};
    recentHistory.forEach(record => {
      const monthKey = new Date(record.participationDate).toISOString().slice(0, 7); // YYYY-MM

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          hours: 0,
          events: 0,
          totalRating: 0,
          ratedEvents: 0
        };
      }

      monthlyStats[monthKey].hours += record.hoursWorked;
      monthlyStats[monthKey].events += 1;

      if (record.performanceRating) {
        monthlyStats[monthKey].totalRating += record.performanceRating;
        monthlyStats[monthKey].ratedEvents += 1;
      }
    });

    // Calculate averages and sort by month
    return Object.values(monthlyStats)
      .map(stats => ({
        ...stats,
        averageRating: stats.ratedEvents > 0 ? stats.totalRating / stats.ratedEvents : null
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
};

/**
 * Calculate reliability score based on volunteer history
 * Factors: attendance rate, completion rate, consistency
 */
function calculateReliabilityScore(history) {
  if (history.length === 0) return 0;

  const attendanceRate = (history.filter(record => record.attendance === 'present').length / history.length) * 100;
  const completionRate = (history.filter(record => record.status === 'completed').length / history.length) * 100;
  const noShowPenalty = history.filter(record => record.status === 'NO_SHOW').length * 10;

  // Base score from attendance and completion
  let score = (attendanceRate * 0.4) + (completionRate * 0.6);

  // Apply penalties
  score -= noShowPenalty;

  // Bonus for consistency (more events = more reliable data)
  if (history.length >= 5) score += 5;
  if (history.length >= 10) score += 5;

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = {
  volunteerHistory,
  participationStatuses,
  attendanceTypes,
  historyHelpers
};