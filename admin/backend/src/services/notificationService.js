const notificationRepository = require('../database/repositories/notificationRepository');
const userRepository = require('../database/repositories/userRepository');
const eventRepository = require('../database/repositories/eventRepository');

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

    // Get user notifications from repository
    const { notifications, total } = await notificationRepository.getUserNotifications(
      userId,
      filters,
      { page, limit, sortBy, sortOrder }
    );

    // Normalize enum values to lowercase with hyphens
    const normalizedNotifications = notifications.map(n => ({
      ...n,
      type: n.type.toLowerCase().replace('_', '-'),
      priority: n.priority.toLowerCase()
    }));

    const pages = Math.ceil(total / limit);

    // Get user stats
    const stats = await notificationRepository.getStats(userId);

    return {
      success: true,
      data: {
        notifications: normalizedNotifications,
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
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check if user owns this notification
    if (notification.userId !== userId) {
      throw new Error('Access denied. You can only view your own notifications.');
    }

    // Normalize enum values
    const normalizedNotification = {
      ...notification,
      type: notification.type.toLowerCase().replace('_', '-'),
      priority: notification.priority.toLowerCase()
    };

    return {
      success: true,
      data: normalizedNotification
    };
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} Update result
   */
  async markAsRead(notificationId, userId) {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check if user owns this notification
    if (notification.userId !== userId) {
      throw new Error('Access denied. You can only modify your own notifications.');
    }

    const updatedNotification = await notificationRepository.markAsRead(notificationId);

    if (!updatedNotification) {
      throw new Error('Failed to mark notification as read');
    }

    // Normalize enum values
    const normalizedNotification = {
      ...updatedNotification,
      type: updatedNotification.type.toLowerCase().replace('_', '-'),
      priority: updatedNotification.priority.toLowerCase()
    };

    return {
      success: true,
      message: 'Notification marked as read',
      data: normalizedNotification
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
        const notification = await notificationRepository.findById(id);

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

        const updatedNotification = await notificationRepository.markAsRead(id);
        results.push({ id, success: !!updatedNotification });

        if (updatedNotification) {
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
    const result = await notificationRepository.markAllAsRead(userId);
    const count = result.count || 0;

    const stats = await notificationRepository.getStats(userId);

    return {
      success: true,
      message: `Marked ${count} notifications as read`,
      data: {
        markedCount: count,
        stats
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
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Check if user owns this notification
    if (notification.userId !== userId) {
      throw new Error('Access denied. You can only delete your own notifications.');
    }

    const deleted = await notificationRepository.delete(notificationId);

    if (!deleted) {
      throw new Error('Failed to delete notification');
    }

    // Normalize enum values
    const normalizedDeleted = {
      ...deleted,
      type: deleted.type.toLowerCase().replace('_', '-'),
      priority: deleted.priority.toLowerCase()
    };

    return {
      success: true,
      message: 'Notification deleted successfully',
      data: normalizedDeleted
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
        const notification = await notificationRepository.findById(id);

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

        const deleted = await notificationRepository.delete(id);
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
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate required fields
    if (!type || !title || !message) {
      throw new Error('Type, title, and message are required');
    }

    const notification = await notificationRepository.create({
      userId,
      type,
      title,
      message,
      data: data || {},
      priority: priority || 'normal'
    });

    // Normalize enum values
    const normalizedNotification = {
      ...notification,
      type: notification.type.toLowerCase().replace('_', '-'),
      priority: notification.priority.toLowerCase()
    };

    return {
      success: true,
      message: 'Notification created successfully',
      data: normalizedNotification
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
    const notification = await notificationRepository.create({
      userId,
      type: 'assignment',
      priority: 'high',
      title: `New Assignment: ${eventData.title}`,
      message: `You have been assigned to ${eventData.title}`,
      eventId: eventData.id,
      relatedId: assignmentData.id,
      actionUrl: `/events/${eventData.id}`,
      actionLabel: 'View Event',
      metadata: {
        eventId: eventData.id,
        assignmentId: assignmentData.id,
        eventTitle: eventData.title
      }
    });

    // Normalize enum values
    const normalizedNotification = {
      ...notification,
      type: notification.type.toLowerCase().replace('_', '-'),
      priority: notification.priority.toLowerCase()
    };

    return {
      success: true,
      message: 'Assignment notification sent',
      data: normalizedNotification
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
    const reminderMessages = {
      '1w': 'in 1 week',
      '24h': 'in 24 hours',
      '2h': 'in 2 hours'
    };

    const notification = await notificationRepository.create({
      userId,
      type: 'reminder',
      priority: reminderType === '2h' ? 'high' : 'normal',
      title: `Upcoming Event: ${eventData.title}`,
      message: `${eventData.title} starts ${reminderMessages[reminderType] || 'soon'}`,
      eventId: eventData.id,
      actionUrl: `/events/${eventData.id}`,
      actionLabel: 'View Details',
      metadata: {
        eventId: eventData.id,
        reminderType,
        eventStartDate: eventData.startDate
      }
    });

    // Normalize enum values
    const normalizedNotification = {
      ...notification,
      type: notification.type.toLowerCase().replace('_', '-'),
      priority: notification.priority.toLowerCase()
    };

    return {
      success: true,
      message: 'Reminder notification sent',
      data: normalizedNotification
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
    const notification = await notificationRepository.create({
      userId,
      type: 'event-update',
      priority: 'normal',
      title: `Event Updated: ${eventData.title}`,
      message: `${eventData.title} has been updated. ${updateData.changeDescription || 'Please review the changes.'}`,
      eventId: eventData.id,
      actionUrl: `/events/${eventData.id}`,
      actionLabel: 'View Changes',
      metadata: {
        eventId: eventData.id,
        updates: updateData.changes || {},
        updateDescription: updateData.changeDescription
      }
    });

    // Normalize enum values
    const normalizedNotification = {
      ...notification,
      type: notification.type.toLowerCase().replace('_', '-'),
      priority: notification.priority.toLowerCase()
    };

    return {
      success: true,
      message: 'Event update notification sent',
      data: normalizedNotification
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
    const notification = await notificationRepository.create({
      userId,
      type: 'matching-suggestion',
      priority: 'normal',
      title: `Event Suggestion: ${eventData.title}`,
      message: `Based on your skills and interests, you might be interested in ${eventData.title}`,
      eventId: eventData.id,
      actionUrl: `/events/${eventData.id}`,
      actionLabel: 'View Event',
      metadata: {
        eventId: eventData.id,
        matchScore: matchData.score || 0,
        matchedSkills: matchData.matchedSkills || [],
        matchReason: matchData.reason
      }
    });

    // Normalize enum values
    const normalizedNotification = {
      ...notification,
      type: notification.type.toLowerCase().replace('_', '-'),
      priority: notification.priority.toLowerCase()
    };

    return {
      success: true,
      message: 'Matching suggestion notification sent',
      data: normalizedNotification
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
        const user = await userRepository.findById(userId);
        if (!user) {
          results.push({ userId, success: false, error: 'User not found' });
          errorCount++;
          continue;
        }

        const notification = await notificationRepository.create({
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
    const adminStats = await notificationRepository.getAdminStats();

    // Normalize enum values in notificationsByType
    const normalizedByType = {};
    Object.keys(adminStats.notificationsByType).forEach(type => {
      const normalizedType = type.toLowerCase().replace('_', '-');
      normalizedByType[normalizedType] = adminStats.notificationsByType[type];
    });

    return {
      success: true,
      data: {
        totalNotifications: adminStats.totalNotifications,
        unreadNotifications: adminStats.unreadNotifications,
        readNotifications: adminStats.readNotifications,
        notificationsByType: normalizedByType
      }
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