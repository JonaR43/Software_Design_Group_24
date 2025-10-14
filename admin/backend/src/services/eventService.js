const { eventHelpers, eventCategories, urgencyLevels, eventStatuses } = require('../data/events');
const { skillHelpers } = require('../data/skills');
const { userHelpers } = require('../data/users');

/**
 * Event Service
 * Handles event management operations
 */
class EventService {
  /**
   * Get all events with optional filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Object} Events data with metadata
   */
  async getEvents(filters = {}, pagination = {}) {
    const { page = 1, limit = 10, sortBy = 'startDate', sortOrder = 'asc' } = pagination;

    // Apply filters
    let filteredEvents = eventHelpers.filterEvents(filters);

    // Apply search if provided
    if (filters.search) {
      filteredEvents = eventHelpers.searchEvents(filters.search);
    }

    // Sort events
    filteredEvents.sort((a, b) => {
      const aValue = new Date(a[sortBy]) || a[sortBy];
      const bValue = new Date(b[sortBy]) || b[sortBy];

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    // Apply pagination
    const total = filteredEvents.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    // Enhance events with additional data
    const eventsWithDetails = await Promise.all(
      paginatedEvents.map(event => this.enhanceEventData(event))
    );

    return {
      success: true,
      data: {
        events: eventsWithDetails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1
        },
        filters,
        metadata: {
          totalEvents: total,
          categories: eventCategories,
          urgencyLevels,
          statuses: eventStatuses
        }
      }
    };
  }

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @returns {Object} Event data
   */
  async getEventById(eventId) {
    const event = eventHelpers.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const enhancedEvent = await this.enhanceEventData(event);

    return {
      success: true,
      data: enhancedEvent
    };
  }

  /**
   * Create new event (admin only)
   * @param {string} adminId - Admin user ID
   * @param {Object} eventData - Event creation data
   * @returns {Object} Created event
   */
  async createEvent(adminId, eventData) {
    // Validate required skills if provided
    if (eventData.requiredSkills) {
      await this.validateRequiredSkills(eventData.requiredSkills);
    }

    // Validate dates
    this.validateEventDates(eventData.startDate, eventData.endDate);

    // Create event
    const newEvent = eventHelpers.createEvent({
      ...eventData,
      createdBy: adminId,
      status: eventData.status || 'draft'
    });

    const enhancedEvent = await this.enhanceEventData(newEvent);

    return {
      success: true,
      message: 'Event created successfully',
      data: enhancedEvent
    };
  }

  /**
   * Update event (admin only)
   * @param {string} eventId - Event ID
   * @param {string} adminId - Admin user ID
   * @param {Object} updateData - Update data
   * @returns {Object} Updated event
   */
  async updateEvent(eventId, adminId, updateData) {
    const existingEvent = eventHelpers.findById(eventId);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Validate required skills if provided
    if (updateData.requiredSkills) {
      await this.validateRequiredSkills(updateData.requiredSkills);
    }

    // Validate dates if provided
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate || existingEvent.startDate;
      const endDate = updateData.endDate || existingEvent.endDate;
      this.validateEventDates(startDate, endDate);
    }

    // Update event
    const updatedEvent = eventHelpers.updateEvent(eventId, updateData);
    if (!updatedEvent) {
      throw new Error('Failed to update event');
    }

    const enhancedEvent = await this.enhanceEventData(updatedEvent);

    return {
      success: true,
      message: 'Event updated successfully',
      data: enhancedEvent
    };
  }

  /**
   * Delete event (admin only)
   * @param {string} eventId - Event ID
   * @param {string} adminId - Admin user ID
   * @returns {Object} Success response
   */
  async deleteEvent(eventId, adminId) {
    const existingEvent = eventHelpers.findById(eventId);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Check if event can be deleted (not in progress or completed with assignments)
    if (existingEvent.status === 'in-progress') {
      throw new Error('Cannot delete event that is in progress');
    }

    const assignments = eventHelpers.getEventAssignments(eventId);
    if (assignments.length > 0 && existingEvent.status === 'completed') {
      throw new Error('Cannot delete completed event with volunteer assignments');
    }

    const deletedEvent = eventHelpers.deleteEvent(eventId);

    return {
      success: true,
      message: 'Event deleted successfully',
      data: {
        deletedEvent,
        removedAssignments: assignments.length
      }
    };
  }

  /**
   * Get event assignments
   * @param {string} eventId - Event ID
   * @returns {Object} Event assignments
   */
  async getEventAssignments(eventId) {
    const event = eventHelpers.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const assignments = eventHelpers.getEventAssignments(eventId);
    const { volunteerHistory } = require('../data/history');

    // Enhance assignments with volunteer data and history
    const assignmentsWithVolunteers = assignments.map(assignment => {
      const volunteer = userHelpers.findById(assignment.volunteerId);
      const profile = userHelpers.getProfile(assignment.volunteerId);

      // Find corresponding history record for this volunteer and event
      const historyRecord = volunteerHistory.find(
        h => h.eventId === eventId && h.volunteerId === assignment.volunteerId
      );

      return {
        id: assignment.id,
        volunteerId: assignment.volunteerId,
        eventId: assignment.eventId,
        status: historyRecord?.status || assignment.status,
        assignedAt: assignment.assignedAt,
        hoursWorked: historyRecord?.hoursWorked || 0,
        performanceRating: historyRecord?.performanceRating || null,
        feedback: historyRecord?.feedback || null,
        adminNotes: historyRecord?.adminNotes || null,
        participationDate: historyRecord?.participationDate || assignment.assignedAt,
        volunteer: volunteer ? {
          id: volunteer.id,
          username: volunteer.username,
          email: volunteer.email,
          profile: profile ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            skills: profile.skills
          } : null
        } : null
      };
    });

    return {
      success: true,
      data: {
        eventId,
        assignments: assignmentsWithVolunteers,
        totalAssignments: assignments.length,
        confirmedVolunteers: assignments.filter(a => a.status === 'confirmed').length,
        pendingVolunteers: assignments.filter(a => a.status === 'pending').length
      }
    };
  }

  /**
   * Assign volunteer to event
   * @param {string} eventId - Event ID
   * @param {string} volunteerId - Volunteer ID
   * @param {Object} assignmentData - Assignment details
   * @returns {Object} Assignment result
   */
  async assignVolunteer(eventId, volunteerId, assignmentData) {
    const event = eventHelpers.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const volunteer = userHelpers.findById(volunteerId);
    if (!volunteer) {
      throw new Error('Volunteer not found');
    }

    if (volunteer.role !== 'volunteer') {
      throw new Error('User is not a volunteer');
    }

    // Check if event is accepting volunteers
    if (event.status !== 'published') {
      throw new Error('Event is not accepting volunteers');
    }

    // Check capacity
    if (event.currentVolunteers >= event.maxVolunteers) {
      throw new Error('Event is at capacity');
    }

    // Check if volunteer is already assigned
    const existingAssignments = eventHelpers.getVolunteerAssignments(volunteerId);
    const alreadyAssigned = existingAssignments.some(a => a.eventId === eventId);
    if (alreadyAssigned) {
      throw new Error('Volunteer is already assigned to this event');
    }

    // Create assignment
    const assignment = eventHelpers.createAssignment({
      eventId,
      volunteerId,
      status: assignmentData.status || 'pending',
      matchScore: assignmentData.matchScore || 0,
      notes: assignmentData.notes || ''
    });

    return {
      success: true,
      message: 'Volunteer assigned successfully',
      data: assignment
    };
  }

  /**
   * Update assignment status
   * @param {string} assignmentId - Assignment ID
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   * @returns {Object} Updated assignment
   */
  async updateAssignmentStatus(assignmentId, status, notes = '') {
    const validStatuses = ['pending', 'confirmed', 'declined', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updatedAssignment = eventHelpers.updateAssignmentStatus(assignmentId, status, notes);
    if (!updatedAssignment) {
      throw new Error('Assignment not found');
    }

    return {
      success: true,
      message: 'Assignment status updated successfully',
      data: updatedAssignment
    };
  }

  /**
   * Get events for a specific volunteer
   * @param {string} volunteerId - Volunteer ID
   * @param {Object} filters - Filter options
   * @returns {Object} Volunteer's events
   */
  async getVolunteerEvents(volunteerId, filters = {}) {
    const assignments = eventHelpers.getVolunteerAssignments(volunteerId);

    let volunteerEvents = assignments.map(assignment => {
      const event = eventHelpers.findById(assignment.eventId);
      return {
        ...event,
        assignment: {
          id: assignment.id,
          status: assignment.status,
          matchScore: assignment.matchScore,
          assignedAt: assignment.assignedAt,
          confirmedAt: assignment.confirmedAt,
          notes: assignment.notes
        }
      };
    }).filter(event => event.id); // Filter out null events

    // Apply status filter if provided
    if (filters.status) {
      volunteerEvents = volunteerEvents.filter(event => event.assignment.status === filters.status);
    }

    // Apply time filter if provided
    if (filters.timeFilter) {
      const now = new Date();
      switch (filters.timeFilter) {
        case 'upcoming':
          volunteerEvents = volunteerEvents.filter(event => new Date(event.startDate) > now);
          break;
        case 'past':
          volunteerEvents = volunteerEvents.filter(event => new Date(event.endDate) < now);
          break;
        case 'current':
          volunteerEvents = volunteerEvents.filter(event =>
            new Date(event.startDate) <= now && new Date(event.endDate) >= now
          );
          break;
      }
    }

    return {
      success: true,
      data: {
        volunteerId,
        events: volunteerEvents,
        totalEvents: volunteerEvents.length,
        confirmedEvents: volunteerEvents.filter(e => e.assignment.status === 'confirmed').length,
        pendingEvents: volunteerEvents.filter(e => e.assignment.status === 'pending').length
      }
    };
  }

  /**
   * Get event statistics (admin only)
   * @returns {Object} Event statistics
   */
  async getEventStats() {
    const stats = eventHelpers.getEventStats();

    // Add additional statistics
    const events = eventHelpers.getAllEvents();
    const now = new Date();

    const eventsByCategory = eventCategories.map(category => ({
      category: category.name,
      count: events.filter(e => e.category === category.id).length
    }));

    const eventsByUrgency = urgencyLevels.map(level => ({
      urgency: level.name,
      count: events.filter(e => e.urgencyLevel === level.id).length
    }));

    const recentEvents = events.filter(e =>
      new Date(e.createdAt) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      success: true,
      data: {
        ...stats,
        eventsByCategory,
        eventsByUrgency,
        recentEvents
      }
    };
  }

  /**
   * Get available event categories
   * @returns {Object} Event categories
   */
  async getEventCategories() {
    return {
      success: true,
      data: {
        categories: eventCategories,
        urgencyLevels,
        statuses: eventStatuses
      }
    };
  }

  /**
   * Enhance event data with additional information
   * @param {Object} event - Base event data
   * @returns {Object} Enhanced event data
   */
  async enhanceEventData(event) {
    // Get assignments for this event
    const assignments = eventHelpers.getEventAssignments(event.id);

    // Get required skills with details
    const requiredSkillsWithDetails = event.requiredSkills.map(reqSkill => {
      const skill = skillHelpers.findById(reqSkill.skillId);
      return {
        ...reqSkill,
        skillName: skill ? skill.name : 'Unknown Skill',
        skillCategory: skill ? skill.category : 'unknown',
        skillDescription: skill ? skill.description : ''
      };
    });

    // Get creator information
    const creator = userHelpers.findById(event.createdBy);

    // Calculate additional metrics
    const spotsRemaining = event.maxVolunteers - event.currentVolunteers;
    const fillPercentage = Math.round((event.currentVolunteers / event.maxVolunteers) * 100);

    const now = new Date();
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    let timeStatus = 'upcoming';
    if (eventEnd < now) {
      timeStatus = 'past';
    } else if (eventStart <= now && eventEnd >= now) {
      timeStatus = 'current';
    }

    return {
      ...event,
      requiredSkills: requiredSkillsWithDetails,
      assignments: assignments.length,
      spotsRemaining,
      fillPercentage,
      timeStatus,
      creator: creator ? {
        id: creator.id,
        username: creator.username,
        email: creator.email
      } : null,
      category: eventCategories.find(c => c.id === event.category) || { id: event.category, name: event.category },
      urgency: urgencyLevels.find(u => u.id === event.urgencyLevel) || { id: event.urgencyLevel, name: event.urgencyLevel },
      statusInfo: eventStatuses.find(s => s.id === event.status) || { id: event.status, name: event.status }
    };
  }

  /**
   * Validate required skills
   * @param {Array} requiredSkills - Required skills array
   */
  async validateRequiredSkills(requiredSkills) {
    if (!Array.isArray(requiredSkills)) {
      throw new Error('Required skills must be an array');
    }

    for (const reqSkill of requiredSkills) {
      if (!reqSkill.skillId || !reqSkill.minLevel) {
        throw new Error('Each required skill must have skillId and minLevel');
      }

      // Check if skill exists
      const skill = skillHelpers.findById(reqSkill.skillId);
      if (!skill) {
        throw new Error(`Skill with ID ${reqSkill.skillId} not found`);
      }

      // Check if proficiency level is valid
      if (!skillHelpers.isValidProficiency(reqSkill.minLevel)) {
        throw new Error(`Invalid proficiency level: ${reqSkill.minLevel}`);
      }
    }
  }

  /**
   * Validate event dates
   * @param {Date} startDate - Event start date
   * @param {Date} endDate - Event end date
   */
  validateEventDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      throw new Error('End date must be after start date');
    }

    if (start < now) {
      throw new Error('Start date must be in the future');
    }

    // Check if event duration is reasonable (not more than 7 days)
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours > 168) { // 7 days
      throw new Error('Event duration cannot exceed 7 days');
    }
  }
}

module.exports = new EventService();