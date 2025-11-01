const notificationService = require('../services/notificationService');

/**
 * Notification Controller
 * Handles HTTP requests for notification management operations
 */
class NotificationController {
  /**
   * Get notifications for current user
   * GET /api/notifications
   */
  async getNotifications(req, res, next) {
    try {
      const filters = {
        type: req.query.type,
        priority: req.query.priority,
        read: req.query.read,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await notificationService.getNotifications(req.user.id, filters, pagination);

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
   * Get notification by ID
   * GET /api/notifications/:id
   */
  async getNotificationById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await notificationService.getNotificationById(id, req.user.id);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Notification not found') {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const result = await notificationService.markAsRead(id, req.user.id);

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Notification not found') {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  }

  /**
   * Mark multiple notifications as read
   * PUT /api/notifications/bulk/read
   */
  async markMultipleAsRead(req, res, next) {
    try {
      const { notificationIds } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({
          status: 'error',
          message: 'notificationIds array is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await notificationService.markMultipleAsRead(notificationIds, req.user.id);

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/all/read
   */
  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const result = await notificationService.deleteNotification(id, req.user.id);

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'Notification not found') {
        return res.status(404).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      next(error);
    }
  }

  /**
   * Delete multiple notifications
   * DELETE /api/notifications/bulk
   */
  async deleteMultiple(req, res, next) {
    try {
      const { notificationIds } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({
          status: 'error',
          message: 'notificationIds array is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await notificationService.deleteMultiple(notificationIds, req.user.id);

      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification preferences
   * GET /api/notifications/preferences
   */
  async getPreferences(req, res, next) {
    try {
      const result = await notificationService.getNotificationPreferences(req.user.id);

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin-only endpoints

  /**
   * Create notification (admin only)
   * POST /api/notifications/admin/create
   */
  async createNotification(req, res, next) {
    try {
      const result = await notificationService.createNotification(req.body);

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (error.message === 'User not found' ||
          error.message.includes('required')) {
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
   * Send assignment notification (admin only)
   * POST /api/notifications/admin/assignment
   */
  async sendAssignmentNotification(req, res, next) {
    try {
      const { userId, eventData, assignmentData } = req.body;

      if (!userId || !eventData || !assignmentData) {
        return res.status(400).json({
          status: 'error',
          message: 'userId, eventData, and assignmentData are required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await notificationService.sendAssignmentNotification(
        userId,
        eventData,
        assignmentData
      );

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send reminder notification (admin only)
   * POST /api/notifications/admin/reminder
   */
  async sendReminderNotification(req, res, next) {
    try {
      const { userId, eventData, reminderType } = req.body;

      if (!userId || !eventData) {
        return res.status(400).json({
          status: 'error',
          message: 'userId and eventData are required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await notificationService.sendReminderNotification(
        userId,
        eventData,
        reminderType || '24h'
      );

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send event update notification (admin only)
   * POST /api/notifications/admin/event-update
   */
  async sendEventUpdateNotification(req, res, next) {
    try {
      const { userId, eventData, updateData } = req.body;

      if (!userId || !eventData || !updateData) {
        return res.status(400).json({
          status: 'error',
          message: 'userId, eventData, and updateData are required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await notificationService.sendEventUpdateNotification(
        userId,
        eventData,
        updateData
      );

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send matching suggestion notification (admin only)
   * POST /api/notifications/admin/matching-suggestion
   */
  async sendMatchingSuggestionNotification(req, res, next) {
    try {
      const { userId, eventData, matchData } = req.body;

      if (!userId || !eventData || !matchData) {
        return res.status(400).json({
          status: 'error',
          message: 'userId, eventData, and matchData are required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await notificationService.sendMatchingSuggestionNotification(
        userId,
        eventData,
        matchData
      );

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send bulk notifications (admin only)
   * POST /api/notifications/admin/bulk
   */
  async sendBulkNotifications(req, res, next) {
    try {
      const { userIds, notificationData } = req.body;

      if (!userIds || !Array.isArray(userIds) || !notificationData) {
        return res.status(400).json({
          status: 'error',
          message: 'userIds array and notificationData are required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await notificationService.sendBulkNotifications(userIds, notificationData);

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin notification statistics (admin only)
   * GET /api/notifications/admin/stats
   */
  async getAdminStats(req, res, next) {
    try {
      const result = await notificationService.getAdminStats();

      res.status(200).json({
        status: 'success',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();