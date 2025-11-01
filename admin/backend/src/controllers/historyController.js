const historyService = require('../services/historyService');

/**
 * Volunteer History Controller
 * Handles HTTP requests for volunteer participation history
 */

class HistoryController {
  /**
   * Get volunteer's participation history
   * GET /api/history?page=1&limit=10&status=completed&startDate=2024-01-01&endDate=2024-12-31
   */
  async getVolunteerHistory(req, res) {
    try {
      const { volunteerId } = req.params;
      const { page, limit, status, startDate, endDate } = req.query;

      // Authorization check - volunteers can only see their own history
      if (req.user.role === 'volunteer' && req.user.id !== volunteerId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own history'
        });
      }

      const filters = {};
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const options = { page, limit };

      const result = await historyService.getVolunteerHistory(volunteerId, filters, options);

      res.status(200).json({
        success: true,
        message: 'Volunteer history retrieved successfully',
        ...result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current user's history (volunteer self-service)
   * GET /api/history/my-history
   */
  async getMyHistory(req, res) {
    try {
      const { page, limit, status, startDate, endDate } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const options = { page, limit };

      const result = await historyService.getMyHistory(req.user.id, filters, options);

      res.status(200).json({
        success: true,
        message: 'Your history retrieved successfully',
        ...result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Record volunteer participation (admin only)
   * POST /api/history/record
   */
  async recordParticipation(req, res) {
    try {
      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const result = await historyService.recordParticipation(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update history record (admin only)
   * PUT /api/history/:historyId
   */
  async updateHistoryRecord(req, res) {
    try {
      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { historyId } = req.params;
      const result = await historyService.updateHistoryRecord(historyId, req.body, req.user.id);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get volunteer statistics
   * GET /api/history/stats/:volunteerId
   */
  async getVolunteerStats(req, res) {
    try {
      const { volunteerId } = req.params;

      // Authorization check - volunteers can only see their own stats
      if (req.user.role === 'volunteer' && req.user.id !== volunteerId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own statistics'
        });
      }

      const result = await historyService.getVolunteerStats(volunteerId);

      res.status(200).json({
        success: true,
        message: 'Volunteer statistics retrieved successfully',
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current user's statistics (volunteer self-service)
   * GET /api/history/my-stats
   */
  async getMyStats(req, res) {
    try {
      const result = await historyService.getVolunteerStats(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Your statistics retrieved successfully',
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get performance metrics for a volunteer
   * GET /api/history/performance/:volunteerId?months=6
   */
  async getPerformanceMetrics(req, res) {
    try {
      const { volunteerId } = req.params;
      const { months } = req.query;

      // Authorization check - volunteers can only see their own performance
      if (req.user.role === 'volunteer' && req.user.id !== volunteerId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own performance metrics'
        });
      }

      const result = await historyService.getPerformanceMetrics(volunteerId, months);

      res.status(200).json({
        success: true,
        message: 'Performance metrics retrieved successfully',
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current user's performance metrics (volunteer self-service)
   * GET /api/history/my-performance?months=6
   */
  async getMyPerformance(req, res) {
    try {
      const { months } = req.query;
      const result = await historyService.getPerformanceMetrics(req.user.id, months);

      res.status(200).json({
        success: true,
        message: 'Your performance metrics retrieved successfully',
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all volunteer statistics (admin only)
   * GET /api/history/admin/all-stats?sortBy=totalHours
   */
  async getAllVolunteerStats(req, res) {
    try {
      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { sortBy } = req.query;
      const result = await historyService.getAllVolunteerStats({ sortBy });

      res.status(200).json({
        success: true,
        message: 'All volunteer statistics retrieved successfully',
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get event participation history (admin only)
   * GET /api/history/event/:eventId
   */
  async getEventHistory(req, res) {
    try {
      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { eventId } = req.params;
      const result = await historyService.getEventHistory(eventId);

      res.status(200).json({
        success: true,
        message: 'Event history retrieved successfully',
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get dashboard statistics (admin only)
   * GET /api/history/admin/dashboard
   */
  async getDashboardStats(req, res) {
    try {
      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const result = await historyService.getDashboardStats();

      res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get available participation statuses and attendance types
   * GET /api/history/metadata
   */
  async getMetadata(req, res) {
    try {
      const { participationStatuses, attendanceTypes } = require('../data/history');

      res.status(200).json({
        success: true,
        message: 'History metadata retrieved successfully',
        data: {
          participationStatuses,
          attendanceTypes,
          performanceRatingScale: {
            min: 1,
            max: 5,
            description: '1 = Poor, 2 = Fair, 3 = Good, 4 = Very Good, 5 = Excellent'
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new HistoryController();