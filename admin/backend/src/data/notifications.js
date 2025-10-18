/**
 * Hardcoded Notification Data for Assignment 3
 * In a real application, this would be stored in a database
 */

const notifications = [
  {
    id: 'notif_001',
    userId: 'user_002',
    type: 'assignment',
    title: 'Event Assignment Confirmed',
    message: 'You have been assigned to "Community Food Drive" on December 15, 2024.',
    data: {
      eventId: 'event_001',
      eventTitle: 'Community Food Drive',
      assignmentId: 'assign_001',
      assignmentStatus: 'confirmed'
    },
    priority: 'high',
    read: false,
    createdAt: new Date('2024-11-20T10:30:00Z'),
    readAt: null
  },
  {
    id: 'notif_002',
    userId: 'user_003',
    type: 'reminder',
    title: 'Event Reminder',
    message: 'Reminder: "Emergency Shelter Support" starts in 24 hours. Please confirm your attendance.',
    data: {
      eventId: 'event_004',
      eventTitle: 'Emergency Shelter Support',
      reminderType: '24h',
      eventStartDate: '2024-12-01T18:00:00Z'
    },
    priority: 'normal',
    read: false,
    createdAt: new Date('2024-11-30T18:00:00Z'),
    readAt: null
  },
  {
    id: 'notif_003',
    userId: 'user_002',
    type: 'event_update',
    title: 'Event Update',
    message: 'The location for "Park Cleanup Initiative" has been changed. Please check the updated details.',
    data: {
      eventId: 'event_002',
      eventTitle: 'Park Cleanup Initiative',
      updateType: 'location_change',
      changes: {
        location: {
          old: '789 Memorial Park, Houston, TX 77007',
          new: '456 Updated Park Location, Houston, TX 77008'
        }
      }
    },
    priority: 'high',
    read: true,
    createdAt: new Date('2024-11-25T14:15:00Z'),
    readAt: new Date('2024-11-25T16:20:00Z')
  },
  {
    id: 'notif_004',
    userId: 'user_004',
    type: 'matching_suggestion',
    title: 'New Event Match',
    message: 'We found a great volunteer opportunity that matches your skills: "Senior Center Technology Workshop".',
    data: {
      eventId: 'event_003',
      eventTitle: 'Senior Center Technology Workshop',
      matchScore: 85,
      matchQuality: 'Very Good'
    },
    priority: 'normal',
    read: false,
    createdAt: new Date('2024-11-28T09:00:00Z'),
    readAt: null
  },
  {
    id: 'notif_005',
    userId: 'user_003',
    type: 'assignment_cancelled',
    title: 'Assignment Cancelled',
    message: 'Your assignment to "Youth After-School Program" has been cancelled due to event changes.',
    data: {
      eventId: 'event_005',
      eventTitle: 'Youth After-School Program',
      assignmentId: 'assign_005',
      cancellationReason: 'Event postponed indefinitely'
    },
    priority: 'high',
    read: false,
    createdAt: new Date('2024-11-29T11:45:00Z'),
    readAt: null
  }
];

/**
 * Notification Helper Functions
 */
class NotificationHelpers {
  /**
   * Get all notifications
   */
  getAllNotifications() {
    return [...notifications];
  }

  /**
   * Get notifications for a specific user
   */
  getByUserId(userId) {
    return notifications.filter(n => n.userId === userId);
  }

  /**
   * Get notification by ID
   */
  findById(id) {
    return notifications.find(n => n.id === id);
  }

  /**
   * Get unread notifications for a user
   */
  getUnreadByUserId(userId) {
    return notifications.filter(n => n.userId === userId && !n.read);
  }

  /**
   * Get notifications by type for a user
   */
  getByUserIdAndType(userId, type) {
    return notifications.filter(n => n.userId === userId && n.type === type);
  }

  /**
   * Get notifications by priority for a user
   */
  getByUserIdAndPriority(userId, priority) {
    return notifications.filter(n => n.userId === userId && n.priority === priority);
  }

  /**
   * Mark notification as read
   */
  markAsRead(id) {
    const notification = this.findById(id);
    if (notification) {
      notification.read = true;
      notification.readAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Mark multiple notifications as read
   */
  markMultipleAsRead(ids) {
    const results = [];
    for (const id of ids) {
      results.push({
        id,
        success: this.markAsRead(id)
      });
    }
    return results;
  }

  /**
   * Mark all notifications as read for a user
   */
  markAllAsReadByUserId(userId) {
    const userNotifications = this.getByUserId(userId);
    let count = 0;

    userNotifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = new Date();
        count++;
      }
    });

    return count;
  }

  /**
   * Create new notification
   */
  create(notificationData) {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      priority: notificationData.priority || 'normal',
      read: false,
      createdAt: new Date(),
      readAt: null
    };

    notifications.push(newNotification);
    return newNotification;
  }

  /**
   * Delete notification
   */
  delete(id) {
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const deleted = notifications.splice(index, 1)[0];
      return deleted;
    }
    return null;
  }

  /**
   * Delete multiple notifications
   */
  deleteMultiple(ids) {
    const results = [];
    for (const id of ids) {
      const deleted = this.delete(id);
      results.push({
        id,
        success: deleted !== null,
        deleted
      });
    }
    return results;
  }

  /**
   * Get notification statistics for a user
   */
  getStats(userId) {
    const userNotifications = this.getByUserId(userId);
    const unread = userNotifications.filter(n => !n.read);

    const byType = {
      assignment: userNotifications.filter(n => n.type === 'assignment').length,
      reminder: userNotifications.filter(n => n.type === 'reminder').length,
      event_update: userNotifications.filter(n => n.type === 'event_update').length,
      matching_suggestion: userNotifications.filter(n => n.type === 'matching_suggestion').length,
      assignment_cancelled: userNotifications.filter(n => n.type === 'assignment_cancelled').length
    };

    const byPriority = {
      high: userNotifications.filter(n => n.priority === 'high').length,
      normal: userNotifications.filter(n => n.priority === 'normal').length,
      low: userNotifications.filter(n => n.priority === 'low').length
    };

    return {
      total: userNotifications.length,
      unread: unread.length,
      read: userNotifications.length - unread.length,
      byType,
      byPriority,
      latest: userNotifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };
  }

  /**
   * Create assignment notification
   */
  createAssignmentNotification(userId, eventData, assignmentData) {
    const statusMessages = {
      pending: `You have been assigned to "${eventData.title}" and your participation is pending confirmation.`,
      confirmed: `Your assignment to "${eventData.title}" has been confirmed.`,
      cancelled: `Your assignment to "${eventData.title}" has been cancelled.`
    };

    return this.create({
      userId,
      type: assignmentData.status === 'cancelled' ? 'assignment_cancelled' : 'assignment',
      title: assignmentData.status === 'cancelled' ? 'Assignment Cancelled' : 'Event Assignment',
      message: statusMessages[assignmentData.status] || statusMessages.pending,
      data: {
        eventId: eventData.id,
        eventTitle: eventData.title,
        assignmentId: assignmentData.id,
        assignmentStatus: assignmentData.status,
        eventStartDate: eventData.startDate,
        eventLocation: eventData.location
      },
      priority: assignmentData.status === 'cancelled' ? 'high' : 'normal'
    });
  }

  /**
   * Create reminder notification
   */
  createReminderNotification(userId, eventData, reminderType = '24h') {
    const reminderMessages = {
      '24h': `Reminder: "${eventData.title}" starts in 24 hours. Please confirm your attendance.`,
      '2h': `Final reminder: "${eventData.title}" starts in 2 hours. See you there!`,
      '1w': `Upcoming event: "${eventData.title}" is scheduled for next week.`
    };

    return this.create({
      userId,
      type: 'reminder',
      title: 'Event Reminder',
      message: reminderMessages[reminderType] || reminderMessages['24h'],
      data: {
        eventId: eventData.id,
        eventTitle: eventData.title,
        reminderType,
        eventStartDate: eventData.startDate,
        eventLocation: eventData.location
      },
      priority: reminderType === '2h' ? 'high' : 'normal'
    });
  }

  /**
   * Create event update notification
   */
  createEventUpdateNotification(userId, eventData, updateData) {
    const updateMessages = {
      location_change: `The location for "${eventData.title}" has been changed. Please check the updated details.`,
      time_change: `The schedule for "${eventData.title}" has been updated. Please review the new timing.`,
      cancellation: `"${eventData.title}" has been cancelled. We apologize for any inconvenience.`,
      general_update: `"${eventData.title}" has been updated. Please review the latest information.`
    };

    return this.create({
      userId,
      type: 'event_update',
      title: updateData.type === 'cancellation' ? 'Event Cancelled' : 'Event Update',
      message: updateMessages[updateData.type] || updateMessages.general_update,
      data: {
        eventId: eventData.id,
        eventTitle: eventData.title,
        updateType: updateData.type,
        changes: updateData.changes || {},
        reason: updateData.reason
      },
      priority: updateData.type === 'cancellation' ? 'high' : 'normal'
    });
  }

  /**
   * Create matching suggestion notification
   */
  createMatchingSuggestionNotification(userId, eventData, matchData) {
    return this.create({
      userId,
      type: 'matching_suggestion',
      title: 'New Event Match',
      message: `We found a great volunteer opportunity that matches your skills: "${eventData.title}".`,
      data: {
        eventId: eventData.id,
        eventTitle: eventData.title,
        matchScore: matchData.matchScore,
        matchQuality: matchData.matchQuality,
        recommendations: matchData.recommendations
      },
      priority: matchData.matchScore >= 80 ? 'high' : 'normal'
    });
  }
}

const notificationHelpers = new NotificationHelpers();

module.exports = {
  notifications,
  notificationHelpers
};