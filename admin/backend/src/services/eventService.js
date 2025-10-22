const eventRepository = require('../database/repositories/eventRepository');
const skillRepository = require('../database/repositories/skillRepository');
const userRepository = require('../database/repositories/userRepository');
const historyRepository = require('../database/repositories/historyRepository');

// Event metadata - these are static values
const eventCategories = [
  { id: 'community', name: 'Community Service' },
  { id: 'education', name: 'Education' },
  { id: 'environment', name: 'Environment' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'animals', name: 'Animal Welfare' },
  { id: 'arts', name: 'Arts & Culture' },
  { id: 'disaster', name: 'Disaster Relief' },
  { id: 'other', name: 'Other' }
];

const urgencyLevels = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
  { id: 'critical', name: 'Critical' }
];

const eventStatuses = [
  { id: 'draft', name: 'Draft' },
  { id: 'published', name: 'Published' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'completed', name: 'Completed' },
  { id: 'cancelled', name: 'Cancelled' }
];

/**
 * Event Service
 * Handles event management operations
 * Updated to use Prisma database
 */
class EventService {
  /**
   * Get all events with optional filtering and pagination
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Object} Events data with metadata
   */
  async getEvents(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;

    // Get events from repository with filters and pagination
    const { events, total } = await eventRepository.findAll(filters, { page, limit });

    // Enhance events with additional data
    const eventsWithDetails = await Promise.all(
      events.map(event => this.enhanceEventData(event))
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
          hasNext: (page * limit) < total,
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
    const event = await eventRepository.findById(eventId);
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
    const newEvent = await eventRepository.create({
      ...eventData,
      createdBy: adminId,
      status: eventData.status || 'draft',
      currentVolunteers: 0
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
    const existingEvent = await eventRepository.findById(eventId);
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
    const updatedEvent = await eventRepository.update(eventId, updateData);
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
    const existingEvent = await eventRepository.findById(eventId);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Check if event can be deleted (not in progress or completed with assignments)
    const status = existingEvent.status.toLowerCase().replace('_', '-');
    if (status === 'in-progress') {
      throw new Error('Cannot delete event that is in progress');
    }

    const assignments = await eventRepository.getAssignments(eventId);
    if (assignments.length > 0 && status === 'completed') {
      throw new Error('Cannot delete completed event with volunteer assignments');
    }

    const deletedEvent = await eventRepository.delete(eventId);

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
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const assignments = await eventRepository.getAssignments(eventId);

    // Enhance assignments with volunteer data and history from Prisma includes
    const assignmentsWithVolunteers = assignments.map(assignment => {
      return {
        id: assignment.id,
        volunteerId: assignment.volunteerId,
        eventId: assignment.eventId,
        status: assignment.status.toLowerCase(),
        assignedAt: assignment.assignedAt,
        hoursWorked: 0, // Will be populated from history if available
        performanceRating: null,
        feedback: null,
        adminNotes: null,
        participationDate: assignment.assignedAt,
        volunteer: assignment.volunteer ? {
          id: assignment.volunteer.id,
          username: assignment.volunteer.username,
          email: assignment.volunteer.email,
          profile: assignment.volunteer.profile ? {
            firstName: assignment.volunteer.profile.firstName,
            lastName: assignment.volunteer.profile.lastName,
            phone: assignment.volunteer.profile.phone,
            skills: assignment.volunteer.profile.skills || []
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
        confirmedVolunteers: assignmentsWithVolunteers.filter(a => a.status === 'confirmed').length,
        pendingVolunteers: assignmentsWithVolunteers.filter(a => a.status === 'pending').length
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
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const volunteer = await userRepository.findById(volunteerId);
    if (!volunteer) {
      throw new Error('Volunteer not found');
    }

    if (volunteer.role.toUpperCase() !== 'VOLUNTEER') {
      throw new Error('User is not a volunteer');
    }

    // Check if event is accepting volunteers
    const eventStatus = event.status.toLowerCase().replace('_', '-');
    if (eventStatus !== 'published') {
      throw new Error('Event is not accepting volunteers');
    }

    // Check capacity
    if (event.currentVolunteers >= event.maxVolunteers) {
      throw new Error('Event is at capacity');
    }

    // Check if volunteer is already assigned
    const existingAssignments = await eventRepository.getVolunteerAssignments(volunteerId);
    const existingAssignment = existingAssignments.find(a => a.eventId === eventId);

    // If there's an active (non-cancelled) assignment, prevent duplicate
    if (existingAssignment && existingAssignment.status.toLowerCase() !== 'cancelled') {
      throw new Error('Volunteer is already assigned to this event');
    }

    let assignment;

    // If there's a cancelled assignment, reactivate it instead of creating new
    if (existingAssignment && existingAssignment.status.toLowerCase() === 'cancelled') {
      // Reactivate the cancelled assignment by updating its status, notes, and matchScore
      const prisma = require('../database/prisma');
      assignment = await prisma.assignment.update({
        where: { id: existingAssignment.id },
        data: {
          status: (assignmentData.status || 'pending').toUpperCase(),
          notes: assignmentData.notes || '',
          matchScore: assignmentData.matchScore || 0,
          updatedAt: new Date()
        },
        include: {
          event: true,
          volunteer: true
        }
      });
    } else {
      // Create new assignment
      assignment = await eventRepository.createAssignment({
        eventId,
        volunteerId,
        status: assignmentData.status || 'pending',
        matchScore: assignmentData.matchScore || 0,
        notes: assignmentData.notes || ''
      });
    }

    // Increment the event's currentVolunteers count
    await eventRepository.update(eventId, {
      currentVolunteers: event.currentVolunteers + 1
    });

    // Send assignment notification to volunteer
    try {
      const notificationRepository = require('../database/repositories/notificationRepository');

      console.log('Creating ASSIGNMENT notification for user:', volunteerId, 'event:', event.title);

      const notification = await notificationRepository.create({
        userId: volunteerId,
        type: 'ASSIGNMENT',
        priority: 'HIGH',
        title: `Joined: ${event.title}`,
        message: `You have successfully joined ${event.title}. Check your schedule for details.`,
        eventId: event.id,
        actionUrl: `/dashboard/schedule`
      });

      console.log('Notification created successfully:', notification.id);
    } catch (notificationError) {
      // Log error but don't fail the assignment if notification fails
      console.error('Failed to send assignment notification:', notificationError);
    }

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

    const updatedAssignment = await eventRepository.updateAssignmentStatus(assignmentId, status, notes);
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
    const assignments = await eventRepository.getVolunteerAssignments(volunteerId);

    let volunteerEvents = assignments
      .filter(assignment => {
        // Include cancelled assignments if specifically requested (for history page)
        if (filters.includeCancelled === 'true' || filters.includeCancelled === true) {
          return true;
        }
        // Otherwise exclude cancelled assignments
        return assignment.status.toLowerCase() !== 'cancelled';
      })
      .map(assignment => {
        const event = assignment.event;
        return {
          ...event,
          assignment: {
            id: assignment.id,
            status: assignment.status.toLowerCase(),
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
    const stats = await eventRepository.getEventStats();

    // Get all events for additional statistics
    const { events } = await eventRepository.findAll({}, { page: 1, limit: 10000 });
    const now = new Date();

    const eventsByCategory = eventCategories.map(category => ({
      category: category.name,
      count: events.filter(e => e.category === category.id).length
    }));

    const eventsByUrgency = urgencyLevels.map(level => ({
      urgency: level.name,
      count: events.filter(e => e.urgencyLevel && e.urgencyLevel.toLowerCase() === level.id).length
    }));

    const recentEvents = events.filter(e =>
      new Date(e.createdAt) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      success: true,
      data: {
        totalEvents: stats.total,
        ...stats.byStatus,
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
    // Prisma includes assignments via _count or direct include
    const assignmentCount = event._count?.assignments || event.assignments?.length || 0;

    // Get required skills with details - Prisma includes skill via relation
    const requiredSkillsWithDetails = (event.requirements || []).map(reqSkill => {
      return {
        skillId: reqSkill.skillId,
        minLevel: reqSkill.minLevel.toLowerCase(),
        isRequired: reqSkill.isRequired,
        skillName: reqSkill.skill ? reqSkill.skill.name : 'Unknown Skill',
        skillCategory: reqSkill.skill ? reqSkill.skill.category : 'unknown',
        skillDescription: reqSkill.skill ? reqSkill.skill.description : ''
      };
    });

    // Creator information - Prisma includes via relation
    const creator = event.creator;

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

    // Normalize status from Prisma enum format
    const normalizedStatus = event.status.toLowerCase().replace('_', '-');
    const normalizedUrgency = event.urgencyLevel ? event.urgencyLevel.toLowerCase() : 'medium';

    return {
      ...event,
      status: normalizedStatus,
      urgencyLevel: normalizedUrgency,
      requiredSkills: requiredSkillsWithDetails,
      assignments: assignmentCount,
      spotsRemaining,
      fillPercentage,
      timeStatus,
      creator: creator ? {
        id: creator.id,
        username: creator.username,
        email: creator.email
      } : null,
      category: eventCategories.find(c => c.id === event.category) || { id: event.category, name: event.category },
      urgency: urgencyLevels.find(u => u.id === normalizedUrgency) || { id: normalizedUrgency, name: normalizedUrgency },
      statusInfo: eventStatuses.find(s => s.id === normalizedStatus) || { id: normalizedStatus, name: normalizedStatus }
    };
  }

  /**
   * Get recommended events based on user's availability
   * @param {string} userId - User ID
   * @param {Array} availability - User's availability slots
   * @param {number} limit - Maximum number of recommendations
   * @returns {Object} Recommended events
   */
  async getRecommendedEventsByAvailability(userId, availability, limit = 10) {
    // Get all published events that are upcoming
    const { events } = await eventRepository.findAll(
      { status: 'published' },
      { page: 1, limit: 1000 }
    );

    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.startDate) > now);

    // Get user's existing event assignments to exclude them
    const userAssignments = await eventRepository.getVolunteerAssignments(userId);
    const assignedEventIds = userAssignments
      .filter(a => a.status.toLowerCase() !== 'cancelled')
      .map(a => a.eventId);

    // Filter out events user is already assigned to
    const availableEvents = upcomingEvents.filter(
      event => !assignedEventIds.includes(event.id)
    );

    // Match events with user's availability
    const recommendedEvents = [];

    for (const event of availableEvents) {
      const eventDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);

      // Extract just the date part (YYYY-MM-DD) for matching
      const eventDateStr = eventDate.toISOString().split('T')[0];

      // Check if user has availability on this date
      const hasAvailability = availability.some(slot => {
        // Check specific date availability
        if (!slot.isRecurring && slot.specificDate) {
          // Convert Date object to string if needed
          const slotDateStr = slot.specificDate instanceof Date
            ? slot.specificDate.toISOString().split('T')[0]
            : slot.specificDate.split('T')[0];
          return slotDateStr === eventDateStr;
        }

        // Check recurring availability (day of week matching)
        if (slot.isRecurring !== false && slot.dayOfWeek) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const eventDayOfWeek = dayNames[eventDate.getDay()];
          return slot.dayOfWeek === eventDayOfWeek;
        }

        return false;
      });

      if (hasAvailability) {
        // Calculate a match score based on various factors
        let matchScore = 50; // Base score

        // Bonus for urgency
        if (event.urgencyLevel) {
          const urgency = event.urgencyLevel.toLowerCase();
          if (urgency === 'critical') matchScore += 30;
          else if (urgency === 'high') matchScore += 20;
          else if (urgency === 'medium') matchScore += 10;
        }

        // Bonus for events that need more volunteers
        const fillPercentage = (event.currentVolunteers / event.maxVolunteers) * 100;
        if (fillPercentage < 25) matchScore += 20;
        else if (fillPercentage < 50) matchScore += 15;
        else if (fillPercentage < 75) matchScore += 10;

        // Add days until event (sooner events get higher score)
        const daysUntilEvent = Math.floor((eventDate - now) / (1000 * 60 * 60 * 24));
        if (daysUntilEvent <= 7) matchScore += 15;
        else if (daysUntilEvent <= 14) matchScore += 10;
        else if (daysUntilEvent <= 30) matchScore += 5;

        recommendedEvents.push({
          event,
          matchScore,
          matchReason: `Event on ${eventDateStr} matches your availability`
        });
      }
    }

    // Sort by match score (highest first)
    recommendedEvents.sort((a, b) => b.matchScore - a.matchScore);

    // Limit results
    const limitedRecommendations = recommendedEvents.slice(0, limit);

    // Enhance event data
    const enhancedRecommendations = await Promise.all(
      limitedRecommendations.map(async rec => ({
        ...await this.enhanceEventData(rec.event),
        matchScore: rec.matchScore,
        matchReason: rec.matchReason
      }))
    );

    return {
      success: true,
      data: {
        events: enhancedRecommendations,
        totalRecommendations: enhancedRecommendations.length,
        availabilitySlots: availability.length
      }
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

    const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];

    for (const reqSkill of requiredSkills) {
      if (!reqSkill.skillId || !reqSkill.minLevel) {
        throw new Error('Each required skill must have skillId and minLevel');
      }

      // Check if skill exists
      const skill = await skillRepository.findById(reqSkill.skillId);
      if (!skill) {
        throw new Error(`Skill with ID ${reqSkill.skillId} not found`);
      }

      // Check if proficiency level is valid
      if (!validProficiencies.includes(reqSkill.minLevel.toLowerCase())) {
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