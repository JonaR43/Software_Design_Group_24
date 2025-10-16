const eventService = require('../services/eventService');

/**
 * Event Controller
 * Handles HTTP requests for event management operations
 */
class EventController {
  /**
   * Get all events with filtering and pagination
   * GET /api/events
   */
  async getEvents(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        category: req.query.category,
        urgencyLevel: req.query.urgencyLevel,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        needsVolunteers: req.query.needsVolunteers === 'true',
        search: req.query.search
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'startDate',
        sortOrder: req.query.sortOrder || 'asc'
      };

      const result = await eventService.getEvents(filters, pagination);

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
   * Get event by ID
   * GET /api/events/:id
   */
  async getEventById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await eventService.getEventById(id);

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
   * Create new event (admin only)
   * POST /api/events
   */
  async createEvent(req, res, next) {
    try {
      const result = await eventService.createEvent(req.user.id, req.body);

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('Skill') ||
          error.message.includes('date') ||
          error.message.includes('duration') ||
          error.message.includes('proficiency')) {
        return res.status(400).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Update event (admin only)
   * PUT /api/events/:id
   */
  async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const result = await eventService.updateEvent(id, req.user.id, req.body);

      res.status(200).json({
        status: 'success',
        message: result.message,
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

      if (error.message.includes('Skill') ||
          error.message.includes('date') ||
          error.message.includes('duration') ||
          error.message.includes('proficiency')) {
        return res.status(400).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  }

  /**
   * Delete event (admin only)
   * DELETE /api/events/:id
   */
  async deleteEvent(req, res, next) {
    try {
      const { id } = req.params;
      const result = await eventService.deleteEvent(id, req.user.id);

      res.status(200).json({
        status: 'success',
        message: result.message,
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

      if (error.message.includes('Cannot delete') ||
          error.message.includes('in progress') ||
          error.message.includes('assignments')) {
        return res.status(400).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  }

  /**
   * Get event assignments
   * GET /api/events/:id/assignments
   */
  async getEventAssignments(req, res, next) {
    try {
      const { id } = req.params;
      const result = await eventService.getEventAssignments(id);

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
   * Assign volunteer to event
   * POST /api/events/:id/assign
   */
  async assignVolunteer(req, res, next) {
    try {
      const { id: eventId } = req.params;
      const { volunteerId, matchScore, notes } = req.body;

      if (!volunteerId) {
        return res.status(400).json({
          status: 'error',
          message: 'Volunteer ID is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await eventService.assignVolunteer(eventId, volunteerId, {
        matchScore,
        notes,
        status: 'pending'
      });

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found') ||
          error.message.includes('not a volunteer') ||
          error.message.includes('not accepting') ||
          error.message.includes('capacity') ||
          error.message.includes('already assigned')) {
        return res.status(400).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Update assignment status
   * PUT /api/events/assignments/:assignmentId
   */
  async updateAssignmentStatus(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await eventService.updateAssignmentStatus(assignmentId, status, notes || '');

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('Assignment not found')) {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes('Invalid status')) {
        return res.status(400).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  }

  /**
   * Get volunteer's events
   * GET /api/events/volunteer/:volunteerId
   */
  async getVolunteerEvents(req, res, next) {
    try {
      const { volunteerId } = req.params;
      const filters = {
        status: req.query.status,
        timeFilter: req.query.timeFilter // upcoming, past, current
      };

      // Only allow users to see their own events unless they're admin
      if (req.user.role !== 'admin' && req.user.id !== volunteerId) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only view your own events.',
          timestamp: new Date().toISOString()
        });
      }

      const result = await eventService.getVolunteerEvents(volunteerId, filters);

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
   * Get current user's events
   * GET /api/events/my-events
   */
  async getMyEvents(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        timeFilter: req.query.timeFilter
      };

      const result = await eventService.getVolunteerEvents(req.user.id, filters);

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
   * Join event (volunteer self-assignment)
   * POST /api/events/:id/join
   */
  async joinEvent(req, res, next) {
    try {
      const { id: eventId } = req.params;
      const { notes } = req.body;

      // Only volunteers can join events
      if (req.user.role !== 'volunteer') {
        return res.status(403).json({
          status: 'error',
          message: 'Only volunteers can join events',
          timestamp: new Date().toISOString()
        });
      }

      const result = await eventService.assignVolunteer(eventId, req.user.id, {
        notes: notes || '',
        status: 'pending',
        matchScore: 0 // Will be calculated later by matching algorithm
      });

      res.status(200).json({
        status: 'success',
        message: 'Successfully applied to join event',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('not found') ||
          error.message.includes('not accepting') ||
          error.message.includes('capacity') ||
          error.message.includes('already assigned')) {
        return res.status(400).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
      next(error);
    }
  }

  /**
   * Leave event (volunteer self-removal)
   * DELETE /api/events/:id/leave
   */
  async leaveEvent(req, res, next) {
    try {
      const { id: eventId } = req.params;

      // Find the assignment
      const assignmentResult = await eventService.getEventAssignments(eventId);
      const userAssignment = assignmentResult.data.assignments.find(
        assignment => assignment.volunteerId === req.user.id
      );

      if (!userAssignment) {
        return res.status(404).json({
          status: 'error',
          message: 'You are not assigned to this event',
          timestamp: new Date().toISOString()
        });
      }

      // Update assignment status to cancelled
      const result = await eventService.updateAssignmentStatus(
        userAssignment.id,
        'cancelled',
        'Volunteer cancelled their participation'
      );

      res.status(200).json({
        status: 'success',
        message: 'Successfully left the event',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event statistics (admin only)
   * GET /api/events/stats
   */
  async getEventStats(req, res, next) {
    try {
      const result = await eventService.getEventStats();

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
   * Get event categories and metadata
   * GET /api/events/categories
   */
  async getEventCategories(req, res, next) {
    try {
      const result = await eventService.getEventCategories();

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
   * Duplicate event (admin only)
   * POST /api/events/:id/duplicate
   */
  async duplicateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const { title, startDate, endDate } = req.body;

      const originalEvent = await eventService.getEventById(id);
      if (!originalEvent.success) {
        return res.status(404).json({
          status: 'error',
          message: 'Original event not found',
          timestamp: new Date().toISOString()
        });
      }

      const eventData = {
        ...originalEvent.data,
        title: title || `${originalEvent.data.title} (Copy)`,
        startDate: startDate || originalEvent.data.startDate,
        endDate: endDate || originalEvent.data.endDate,
        status: 'draft', // Always create as draft
        currentVolunteers: 0 // Reset volunteer count
      };

      // Remove fields that shouldn't be duplicated
      delete eventData.id;
      delete eventData.createdAt;
      delete eventData.updatedAt;
      delete eventData.assignments;
      delete eventData.creator;

      const result = await eventService.createEvent(req.user.id, eventData);

      res.status(201).json({
        status: 'success',
        message: 'Event duplicated successfully',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update volunteer review and feedback for an event
   * PUT /api/events/:eventId/volunteers/:volunteerId/review
   */
  async updateVolunteerReview(req, res, next) {
    try {
      const { eventId, volunteerId } = req.params;
      const { status, hoursWorked, performanceRating, feedback, adminNotes } = req.body;

      console.log('Update volunteer review request:', {
        eventId,
        volunteerId,
        body: req.body,
        user: req.user?.id
      });

      // Import historyRepository instead of in-memory data
      const historyRepository = require('../database/repositories/historyRepository');

      // Find the history record for this volunteer and event using repository
      const eventHistory = await historyRepository.getEventHistory(eventId);
      let historyRecord = eventHistory.find(h => h.volunteerId === volunteerId);

      console.log('Found history record:', historyRecord ? 'Yes' : 'No');

      let recordToUpdate;

      if (!historyRecord) {
        console.log('No history record found. Creating a new one...');

        // Check if the volunteer assignment exists using eventService
        const assignmentsResult = await eventService.getEventAssignments(eventId);
        const assignment = assignmentsResult.data.assignments.find(a => a.volunteerId === volunteerId);

        if (!assignment) {
          console.log('No assignment found either');
          return res.status(404).json({
            status: 'error',
            message: 'Volunteer is not assigned to this event',
            timestamp: new Date().toISOString()
          });
        }

        // Create a new history record using repository
        const newHistoryData = {
          volunteerId: volunteerId,
          eventId: eventId,
          assignmentId: assignment.id,
          status: status || 'CONFIRMED',
          hoursWorked: hoursWorked ? parseFloat(hoursWorked) : 0,
          performanceRating: performanceRating ? parseInt(performanceRating) : null,
          feedback: feedback || null,
          attendance: 'PENDING',
          participationDate: assignment.assignedAt || new Date(),
          completionDate: null,
          recordedBy: req.user.id,
          adminNotes: adminNotes || null
        };

        recordToUpdate = await historyRepository.create(newHistoryData);
        console.log('Created new history record:', recordToUpdate);
      } else {
        // Update existing history record using repository
        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (hoursWorked !== undefined) updateData.hoursWorked = parseFloat(hoursWorked);
        if (performanceRating !== undefined) updateData.performanceRating = parseInt(performanceRating);
        if (feedback !== undefined) updateData.feedback = feedback;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        updateData.recordedBy = req.user.id;

        // If marking as completed, set completion date
        if (status === 'completed' || status === 'COMPLETED') {
          updateData.completionDate = new Date();
          updateData.attendance = 'PRESENT';
        }

        recordToUpdate = await historyRepository.update(historyRecord.id, updateData);
        console.log('Updated existing history record');
      }

      console.log('Final record:', recordToUpdate);

      res.status(200).json({
        status: 'success',
        message: 'Volunteer review updated successfully',
        data: recordToUpdate,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in updateVolunteerReview:', error);
      next(error);
    }
  }
}

module.exports = new EventController();