/**
 * Notification Repository
 * Handles all database operations for notifications
 */

const prisma = require('../prisma');

class NotificationRepository {
  /**
   * Get user notifications with pagination and filters
   */
  async getUserNotifications(userId, filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = { userId };

    if (filters.type) {
      where.type = filters.type.toUpperCase().replace('-', '_');
    }

    if (filters.priority) {
      where.priority = filters.priority.toUpperCase();
    }

    if (filters.read !== undefined) {
      where.read = filters.read;
    }

    if (filters.startDate) {
      where.createdAt = {
        gte: new Date(filters.startDate)
      };
    }

    if (filters.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.endDate)
      };
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.notification.count({ where })
    ]);

    return { notifications, total };
  }

  /**
   * Find notification by ID
   */
  async findById(notificationId) {
    return await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Create notification
   */
  async create(notificationData) {
    return await prisma.notification.create({
      data: {
        userId: notificationData.userId,
        type: notificationData.type.toUpperCase().replace('-', '_'),
        priority: notificationData.priority ? notificationData.priority.toUpperCase() : 'MEDIUM',
        title: notificationData.title,
        message: notificationData.message,
        eventId: notificationData.eventId || null,
        relatedId: notificationData.relatedId || null,
        actionUrl: notificationData.actionUrl || null,
        actionLabel: notificationData.actionLabel || null,
        metadata: notificationData.metadata || null,
        expiresAt: notificationData.expiresAt ? new Date(notificationData.expiresAt) : null
      }
    });
  }

  /**
   * Create multiple notifications
   */
  async createMany(notificationsData) {
    return await prisma.notification.createMany({
      data: notificationsData.map(n => ({
        userId: n.userId,
        type: n.type.toUpperCase().replace('-', '_'),
        priority: n.priority ? n.priority.toUpperCase() : 'MEDIUM',
        title: n.title,
        message: n.message,
        eventId: n.eventId || null,
        relatedId: n.relatedId || null,
        actionUrl: n.actionUrl || null,
        actionLabel: n.actionLabel || null,
        metadata: n.metadata || null,
        expiresAt: n.expiresAt ? new Date(n.expiresAt) : null
      }))
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date()
      }
    });
  }

  /**
   * Mark multiple notifications as read
   */
  async markManyAsRead(notificationIds) {
    return await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        }
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });
  }

  /**
   * Delete notification
   */
  async delete(notificationId) {
    return await prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  /**
   * Delete multiple notifications
   */
  async deleteMany(notificationIds) {
    return await prisma.notification.deleteMany({
      where: {
        id: {
          in: notificationIds
        }
      }
    });
  }

  /**
   * Delete all user notifications
   */
  async deleteAllForUser(userId) {
    return await prisma.notification.deleteMany({
      where: { userId }
    });
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId) {
    return await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
  }

  /**
   * Get notification statistics
   */
  async getStats(userId) {
    const [total, unread, byType, byPriority] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: true
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        where: { userId },
        _count: true
      })
    ]);

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {})
    };
  }

  /**
   * Delete expired notifications
   */
  async deleteExpired() {
    return await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }

  /**
   * Get admin statistics
   */
  async getAdminStats() {
    const [totalNotifications, unreadNotifications, notificationsByType] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { read: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: true
      })
    ]);

    return {
      totalNotifications,
      unreadNotifications,
      readNotifications: totalNotifications - unreadNotifications,
      notificationsByType: notificationsByType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {})
    };
  }
}

module.exports = new NotificationRepository();
