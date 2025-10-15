const { notificationHelpers } = require('../data/notifications');
const { userHelpers } = require('../data/users');
const { eventHelpers } = require('../data/events');

/**
 * Notification Service
 * Handles notification management and delivery operations
 */
class NotificationService {
  /**
   * Get notifications for a user with filtering and pagination
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Object} Notification results
   */
  async getNotifications(userId, filters = {}, pagination = {}) {
    const {
      type,
      priority,
      read,
      startDate,
      endDate
    } = filters;

    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = pagination;

    // Get user notifications
    let notifications = notificationHelpers.getByUserId(userId);

    // Apply filters
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    if (priority) {
      notifications = notifications.filter(n => n.priority === priority);
    }

    if (read !== undefined) {
      const isRead = read === 'true' || read === true;
      notifications = notifications.filter(n => n.read === isRead);
    }

    if (startDate) {
      const start = new Date(startDate);
      notifications = notifications.filter(n => new Date(n.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      notifications = notifications.filter(n => new Date(n.createdAt) <= end);
    }

    // Sort notifications
    notifications.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortOrder === 'desc') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });

    // Apply pagination
    const total = notifications.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedNotifications = notifications.slice(offset, offset + limit);

    // Get user stats
    const stats = notificationHelpers.getStats(userId);

    return {
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1
        },
        stats,
        filters
      }
    };
  }

  /**
   * Get notification by ID
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} Notification result
   */
  async getNotificationById(notificationId, userId) {
    const notification = notificationHelpers.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check if user owns this notification
    if (notification.userId !== userId) {
      throw new Error('Access denied. You can only view your own notifications.');
    }

    return {
      success: true,
      data: notification
    };
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} Update result
   */
  async markAsRead(notificationId, userId) {
    const notification = notificationHelpers.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check if user owns this notification
    if (notification.userId !== userId) {
      throw new Error('Access denied. You can only modify your own notifications.');
    }

    const success = notificationHelpers.markAsRead(notificationId);

    if (!success) {
      throw new Error('Failed to mark notification as read');
    }

    return {
      success: true,
      message: 'Notification marked as read',
      data: notificationHelpers.findById(notificationId)
    };
  }

  /**
   * Mark multiple notifications as read
   * @param {Array} notificationIds - Array of notification IDs
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} Update result
   */
  async markMultipleAsRead(notificationIds, userId) {
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const id of notificationIds) {
      try {
        const notification = notificationHelpers.findById(id);

        if (!notification) {
          results.push({ id, success: false, error: 'Notification not found' });
          errorCount++;
          continue;
        }

        if (notification.userId !== userId) {
          results.push({ id, success: false, error: 'Access denied' });
          errorCount++;
          continue;
        }

        const success = notificationHelpers.markAsRead(id);
        results.push({ id, success });

        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        results.push({ id, success: false, error: error.message });
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Marked ${successCount} notifications as read, ${errorCount} failed`,
      data: {
        results,
        summary: {
          total: notificationIds.length,
          successful: successCount,
          failed: errorCount
        }
      }
    };
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Object} Update result
   */
  async markAllAsRead(userId) {
    const count = notificationHelpers.markAllAsReadByUserId(userId);

    return {
      success: true,
      message: `Marked ${count} notifications as read`,
      data: {
        markedCount: count,
        stats: notificationHelpers.getStats(userId)
      }
    };
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} Delete result
   */
  async deleteNotification(notificationId, userId) {
    const notification = notificationHelpers.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check if user owns this notification
    if (notification.userId !== userId) {
      throw new Error('Access denied. You can only delete your own notifications.');
    }

    const deleted = notificationHelpers.delete(notificationId);

    if (!deleted) {
      throw new Error('Failed to delete notification');
    }

    return {
      success: true,
      message: 'Notification deleted successfully',
      data: deleted
    };
  }

  /**
   * Delete multiple notifications
   * @param {Array} notificationIds - Array of notification IDs
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} Delete result
   */
  async deleteMultiple(notificationIds, userId) {
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const id of notificationIds) {
      try {
        const notification = notificationHelpers.findById(id);

        if (!notification) {
          results.push({ id, success: false, error: 'Notification not found' });
          errorCount++;
          continue;
        }

        if (notification.userId !== userId) {
          results.push({ id, success: false, error: 'Access denied' });
          errorCount++;
          continue;
        }

        const deleted = notificationHelpers.delete(id);
        results.push({
          id,
          success: deleted !== null,
          deleted: deleted ? { id: deleted.id, title: deleted.title } : null
        });

        if (deleted) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        results.push({ id, success: false, error: error.message });
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Deleted ${successCount} notifications, ${errorCount} failed`,
      data: {
        results,
        summary: {
          total: notificationIds.length,
          successful: successCount,
          failed: errorCount
        }
      }
    };
  }

  /**
   * Create notification (admin only)
   * @param {Object} notificationData - Notification data
   * @returns {Object} Creation result
   */
  async createNotification(notificationData) {
    const { userId, type, title, message, data, priority } = notificationData;

    // Validate user exists
    const user = userHelpers.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate required fields
    if (!type || !title || !message) {
      throw new Error('Type, title, and message are required');
    }

    const notification = notificationHelpers.create({
      userId,
      type,
      title,
      message,
      data: data || {},
      priority: priority || 'normal'
    });

    return {
      success: true,
      message: 'Notification created successfully',
      data: notification
    };
  }

  /**
   * Send assignment notification
   * @param {string} userId - User ID
   * @param {Object} eventData - Event data
   * @param {Object} assignmentData - Assignment data
   * @returns {Object} Creation result
   */
  async sendAssignmentNotification(userId, eventData, assignmentData) {
    const notification = notificationHelpers.createAssignmentNotification(
      userId,
      eventData,
      assignmentData
    );

    return {
      success: true,
      message: 'Assignment notification sent',
      data: notification
    };
  }

  /**
   * Send reminder notification
   * @param {string} userId - User ID
   * @param {Object} eventData - Event data
   * @param {string} reminderType - Type of reminder (24h, 2h, 1w)
   * @returns {Object} Creation result
   */
  async sendReminderNotification(userId, eventData, reminderType = '24h') {
    const notification = notificationHelpers.createReminderNotification(
      userId,
      eventData,
      reminderType
    );

    return {
      success: true,
      message: 'Reminder notification sent',
      data: notification
    };
  }

  /**
   * Send event update notification
   * @param {string} userId - User ID
   * @param {Object} eventData - Event data
   * @param {Object} updateData - Update data
   * @returns {Object} Creation result
   */
  async sendEventUpdateNotification(userId, eventData, updateData) {
    const notification = notificationHelpers.createEventUpdateNotification(
      userId,
      eventData,
      updateData
    );

    return {
      success: true,
      message: 'Event update notification sent',
      data: notification
    };
  }

  /**
   * Send matching suggestion notification
   * @param {string} userId - User ID
   * @param {Object} eventData - Event data
   * @param {Object} matchData - Match data
   * @returns {Object} Creation result
   */
  async sendMatchingSuggestionNotification(userId, eventData, matchData) {
    const notification = notificationHelpers.createMatchingSuggestionNotification(
      userId,
      eventData,
      matchData
    );

    return {
      success: true,
      message: 'Matching suggestion notification sent',
      data: notification
    };
  }

  /**
   * Send bulk notifications to multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {Object} notificationData - Notification data template
   * @returns {Object} Bulk send result
   */
  async sendBulkNotifications(userIds, notificationData) {
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const userId of userIds) {
      try {
        const user = userHelpers.findById(userId);
        if (!user) {
          results.push({ userId, success: false, error: 'User not found' });
          errorCount++;
          continue;
        }

        const notification = notificationHelpers.create({
          ...notificationData,
          userId
        });

        results.push({ userId, success: true, notificationId: notification.id });
        successCount++;
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Sent notifications to ${successCount} users, ${errorCount} failed`,
      data: {
        results,
        summary: {
          total: userIds.length,
          successful: successCount,
          failed: errorCount
        }
      }
    };
  }

  /**
   * Get notification statistics for admin
   * @returns {Object} Statistics
   */
  async getAdminStats() {
    const allNotifications = notificationHelpers.getAllNotifications();
    const users = userHelpers.getVolunteers();

    const stats = {
      totalNotifications: allNotifications.length,
      unreadNotifications: allNotifications.filter(n => !n.read).length,
      notificationsByType: {},
      notificationsByPriority: {},
      notificationsByUser: {},
      recentActivity: allNotifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(n => ({
          id: n.id,
          userId: n.userId,
          type: n.type,
          title: n.title,
          priority: n.priority,
          read: n.read,
          createdAt: n.createdAt
        }))
    };

    // Count by type
    const types = ['assignment', 'reminder', 'event_update', 'matching_suggestion', 'assignment_cancelled'];
    types.forEach(type => {
      stats.notificationsByType[type] = allNotifications.filter(n => n.type === type).length;
    });

    // Count by priority
    const priorities = ['high', 'normal', 'low'];
    priorities.forEach(priority => {
      stats.notificationsByPriority[priority] = allNotifications.filter(n => n.priority === priority).length;
    });

    // Count by user
    users.forEach(user => {
      const userNotifications = allNotifications.filter(n => n.userId === user.id);
      stats.notificationsByUser[user.id] = {
        userId: user.id,
        username: user.username,
        total: userNotifications.length,
        unread: userNotifications.filter(n => !n.read).length
      };
    });

    return {
      success: true,
      data: stats
    };
  }

  /**
   * Get notification preferences for a user
   * @param {string} userId - User ID
   * @returns {Object} Preferences
   */
  async getNotificationPreferences(userId) {
    // In a real app, this would be stored in user preferences
    const defaultPreferences = {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      types: {
        assignment: true,
        reminder: true,
        event_update: true,
        matching_suggestion: true,
        assignment_cancelled: true
      },
      reminderTiming: {
        '1w': true,
        '24h': true,
        '2h': true
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    };

    return {
      success: true,
      data: defaultPreferences
    };
  }
}

module.exports = new NotificationService();