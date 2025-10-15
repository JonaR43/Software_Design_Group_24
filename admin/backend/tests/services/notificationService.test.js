/**
 * Unit Tests for Notification Service
 */

const notificationService = require('../../src/services/notificationService');
const notificationRepository = require('../../src/database/repositories/notificationRepository');
const userRepository = require('../../src/database/repositories/userRepository');
const eventRepository = require('../../src/database/repositories/eventRepository');

// Mock dependencies
jest.mock('../../src/database/repositories/notificationRepository');
jest.mock('../../src/database/repositories/userRepository');
jest.mock('../../src/database/repositories/eventRepository');

describe('NotificationService', () => {
  const mockUser = {
    id: 'user_001',
    username: 'volunteer1',
    email: 'volunteer1@example.com',
    role: 'volunteer'
  };

  const mockEvent = {
    id: 'event_001',
    title: 'Community Cleanup',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 90000000).toISOString(),
    location: 'Central Park'
  };

  const mockNotification = {
    id: 'notif_001',
    userId: 'user_001',
    type: 'ASSIGNMENT',  // Prisma enum uppercase
    title: 'Event Assignment Confirmed',
    message: 'You have been assigned to Community Cleanup',
    eventId: 'event_001',
    relatedId: null,
    actionUrl: '/events/event_001',
    actionLabel: 'View Event',
    metadata: {
      eventId: 'event_001',
      eventTitle: 'Community Cleanup'
    },
    priority: 'NORMAL',  // Prisma enum uppercase
    read: false,
    createdAt: new Date(),
    readAt: null,
    expiresAt: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should get notifications with default pagination', async () => {
      const mockNotifications = [mockNotification];
      const mockStats = { total: 1, unread: 1, read: 0 };

      notificationRepository.getUserNotifications.mockResolvedValue({ notifications: mockNotifications, total: 1 });
      notificationRepository.getStats.mockResolvedValue(mockStats);

      const result = await notificationService.getNotifications('user_001');

      expect(result.success).toBe(true);
      expect(result.data.notifications[0].type).toBe('assignment');  // Normalized to lowercase
      expect(result.data.notifications[0].priority).toBe('normal');  // Normalized to lowercase
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(20);
      expect(result.data.stats).toEqual(mockStats);
    });

    it('should apply type filter correctly', async () => {
      const mockNotifications = [mockNotification];
      notificationRepository.getUserNotifications.mockResolvedValue({ notifications: mockNotifications, total: 1 });
      notificationRepository.getStats.mockResolvedValue({ total: 1, unread: 1, read: 0 });

      const result = await notificationService.getNotifications('user_001', { type: 'assignment' });

      expect(result.success).toBe(true);
      expect(result.data.filters.type).toBe('assignment');
    });

    it('should apply priority filter correctly', async () => {
      const mockNotifications = [mockNotification];
      notificationRepository.getUserNotifications.mockResolvedValue({ notifications: mockNotifications, total: 1 });
      notificationRepository.getStats.mockResolvedValue({ total: 1, unread: 1, read: 0 });

      const result = await notificationService.getNotifications('user_001', { priority: 'high' });

      expect(result.success).toBe(true);
      expect(result.data.filters.priority).toBe('high');
    });

    it('should apply read filter correctly', async () => {
      const unreadNotification = { ...mockNotification, read: false };
      notificationRepository.getUserNotifications.mockResolvedValue({ notifications: [unreadNotification], total: 1 });
      notificationRepository.getStats.mockResolvedValue({ total: 1, unread: 1, read: 0 });

      const result = await notificationService.getNotifications('user_001', { read: 'false' });

      expect(result.success).toBe(true);
      expect(result.data.filters.read).toBe('false');
    });

    it('should apply date range filter', async () => {
      const mockNotifications = [mockNotification];
      notificationRepository.getUserNotifications.mockResolvedValue({ notifications: mockNotifications, total: 1 });
      notificationRepository.getStats.mockResolvedValue({ total: 1, unread: 1, read: 0 });

      const startDate = new Date(Date.now() - 86400000).toISOString();
      const endDate = new Date().toISOString();

      const result = await notificationService.getNotifications('user_001', { startDate, endDate });

      expect(result.success).toBe(true);
    });

    it('should sort in descending order', async () => {
      const mockNotifications = [mockNotification];
      notificationRepository.getUserNotifications.mockResolvedValue({ notifications: mockNotifications, total: 1 });
      notificationRepository.getStats.mockResolvedValue({ total: 1, unread: 1, read: 0 });

      const result = await notificationService.getNotifications('user_001', {}, { sortOrder: 'desc' });

      expect(result.success).toBe(true);
    });

    it('should sort in ascending order', async () => {
      const mockNotifications = [mockNotification];
      notificationRepository.getUserNotifications.mockResolvedValue({ notifications: mockNotifications, total: 1 });
      notificationRepository.getStats.mockResolvedValue({ total: 1, unread: 1, read: 0 });

      const result = await notificationService.getNotifications('user_001', {}, { sortOrder: 'asc' });

      expect(result.success).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      const mockNotifications = Array(10).fill(mockNotification);
      notificationRepository.getUserNotifications.mockResolvedValue({ notifications: mockNotifications, total: 25 });
      notificationRepository.getStats.mockResolvedValue({ total: 25, unread: 5, read: 20 });

      const result = await notificationService.getNotifications('user_001', {}, { page: 2, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.pagination.page).toBe(2);
      expect(result.data.pagination.limit).toBe(10);
      expect(result.data.pagination.total).toBe(25);
      expect(result.data.pagination.pages).toBe(3);
    });
  });

  describe('getNotificationById', () => {
    it('should get notification by ID successfully', async () => {
      notificationRepository.findById.mockResolvedValue(mockNotification);

      const result = await notificationService.getNotificationById('notif_001', 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.type).toBe('assignment');  // Normalized
      expect(result.data.priority).toBe('normal');  // Normalized
    });

    it('should handle notification not found', async () => {
      notificationRepository.findById.mockResolvedValue(null);

      await expect(notificationService.getNotificationById('nonexistent', 'user_001'))
        .rejects.toThrow('Notification not found');
    });

    it('should handle access denied for other user notification', async () => {
      notificationRepository.findById.mockResolvedValue({ ...mockNotification, userId: 'user_002' });

      await expect(notificationService.getNotificationById('notif_001', 'user_001'))
        .rejects.toThrow('Access denied. You can only view your own notifications.');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const updatedNotification = { ...mockNotification, read: true, readAt: new Date() };
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.markAsRead.mockResolvedValue(updatedNotification);

      const result = await notificationService.markAsRead('notif_001', 'user_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification marked as read');
      expect(notificationRepository.markAsRead).toHaveBeenCalledWith('notif_001');
    });

    it('should handle notification not found', async () => {
      notificationRepository.findById.mockResolvedValue(null);

      await expect(notificationService.markAsRead('nonexistent', 'user_001'))
        .rejects.toThrow('Notification not found');
    });

    it('should handle access denied', async () => {
      notificationRepository.findById.mockResolvedValue({ ...mockNotification, userId: 'user_002' });

      await expect(notificationService.markAsRead('notif_001', 'user_001'))
        .rejects.toThrow('Access denied. You can only modify your own notifications.');
    });

    it('should handle failed mark as read', async () => {
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.markAsRead.mockResolvedValue(null);

      await expect(notificationService.markAsRead('notif_001', 'user_001'))
        .rejects.toThrow('Failed to mark notification as read');
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read successfully', async () => {
      const notificationIds = ['notif_001', 'notif_002'];
      const updatedNotification = { ...mockNotification, read: true };
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.markAsRead.mockResolvedValue(updatedNotification);

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.total).toBe(2);
      expect(result.data.summary.successful).toBe(2);
      expect(result.data.summary.failed).toBe(0);
    });

    it('should handle mixed success and failure', async () => {
      const notificationIds = ['notif_001', 'nonexistent'];
      const updatedNotification = { ...mockNotification, read: true };
      notificationRepository.findById.mockResolvedValueOnce(mockNotification).mockResolvedValueOnce(null);
      notificationRepository.markAsRead.mockResolvedValue(updatedNotification);

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.successful).toBe(1);
      expect(result.data.summary.failed).toBe(1);
    });

    it('should deny access to notifications owned by other users', async () => {
      const notificationIds = ['notif_001'];
      notificationRepository.findById.mockResolvedValue({ ...mockNotification, userId: 'user_002' });

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
      expect(result.data.results[0].error).toBe('Access denied');
    });

    it('should handle markAsRead failures', async () => {
      const notificationIds = ['notif_001'];
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.markAsRead.mockResolvedValue(null);

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
    });

    it('should handle exceptions during marking', async () => {
      const notificationIds = ['notif_001'];
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.markAsRead.mockRejectedValue(new Error('Database error'));

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const mockStats = { total: 5, unread: 0, read: 5 };
      notificationRepository.markAllAsRead.mockResolvedValue({ count: 3 });  // Prisma updateMany returns { count }
      notificationRepository.getStats.mockResolvedValue(mockStats);

      const result = await notificationService.markAllAsRead('user_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Marked 3 notifications as read');
      expect(result.data.markedCount).toBe(3);
      expect(result.data.stats).toEqual(mockStats);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.delete.mockResolvedValue(mockNotification);

      const result = await notificationService.deleteNotification('notif_001', 'user_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification deleted successfully');
      expect(result.data.type).toBe('assignment');  // Normalized
    });

    it('should handle notification not found', async () => {
      notificationRepository.findById.mockResolvedValue(null);

      await expect(notificationService.deleteNotification('nonexistent', 'user_001'))
        .rejects.toThrow('Notification not found');
    });

    it('should handle access denied', async () => {
      notificationRepository.findById.mockResolvedValue({ ...mockNotification, userId: 'user_002' });

      await expect(notificationService.deleteNotification('notif_001', 'user_001'))
        .rejects.toThrow('Access denied. You can only delete your own notifications.');
    });

    it('should handle failed deletion', async () => {
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.delete.mockResolvedValue(null);

      await expect(notificationService.deleteNotification('notif_001', 'user_001'))
        .rejects.toThrow('Failed to delete notification');
    });
  });

  describe('deleteMultiple', () => {
    it('should delete multiple notifications successfully', async () => {
      const notificationIds = ['notif_001', 'notif_002'];
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.delete.mockResolvedValue(mockNotification);

      const result = await notificationService.deleteMultiple(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.total).toBe(2);
      expect(result.data.summary.successful).toBe(2);
      expect(result.data.summary.failed).toBe(0);
    });

    it('should handle notification not found', async () => {
      const notificationIds = ['nonexistent'];
      notificationRepository.findById.mockResolvedValue(null);

      const result = await notificationService.deleteMultiple(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
      expect(result.data.results[0].error).toBe('Notification not found');
    });

    it('should deny deleting notifications owned by other users', async () => {
      const notificationIds = ['notif_001'];
      notificationRepository.findById.mockResolvedValue({ ...mockNotification, userId: 'user_002' });

      const result = await notificationService.deleteMultiple(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
      expect(result.data.results[0].error).toBe('Access denied');
    });

    it('should handle delete failures', async () => {
      const notificationIds = ['notif_001'];
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.delete.mockResolvedValue(null);

      const result = await notificationService.deleteMultiple(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
    });

    it('should handle exceptions during deletion', async () => {
      const notificationIds = ['notif_001'];
      notificationRepository.findById.mockResolvedValue(mockNotification);
      notificationRepository.delete.mockRejectedValue(new Error('Database error'));

      const result = await notificationService.deleteMultiple(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
    });
  });

  describe('createNotification', () => {
    const validNotificationData = {
      userId: 'user_001',
      type: 'assignment',
      title: 'Test Notification',
      message: 'Test message',
      priority: 'normal'
    };

    it('should create notification successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      notificationRepository.create.mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification(validNotificationData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification created successfully');
      expect(result.data.type).toBe('assignment');  // Normalized
    });

    it('should handle user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(notificationService.createNotification(validNotificationData))
        .rejects.toThrow('User not found');
    });

    it('should validate required fields', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      await expect(notificationService.createNotification({ userId: 'user_001' }))
        .rejects.toThrow('Type, title, and message are required');
    });
  });

  describe('sendAssignmentNotification', () => {
    it('should send assignment notification successfully', async () => {
      const assignmentData = { id: 'assign_001', status: 'confirmed' };
      notificationRepository.create.mockResolvedValue(mockNotification);

      const result = await notificationService.sendAssignmentNotification('user_001', mockEvent, assignmentData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Assignment notification sent');
      expect(result.data.type).toBe('assignment');  // Normalized
    });
  });

  describe('sendReminderNotification', () => {
    it('should send reminder notification successfully', async () => {
      notificationRepository.create.mockResolvedValue(mockNotification);

      const result = await notificationService.sendReminderNotification('user_001', mockEvent, '24h');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Reminder notification sent');
      expect(result.data.type).toBe('assignment');  // Normalized
    });
  });

  describe('sendEventUpdateNotification', () => {
    it('should send event update notification successfully', async () => {
      const updateData = { type: 'location_change', changes: { location: 'New Location' } };
      notificationRepository.create.mockResolvedValue(mockNotification);

      const result = await notificationService.sendEventUpdateNotification('user_001', mockEvent, updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event update notification sent');
      expect(result.data.type).toBe('assignment');  // Normalized
    });
  });

  describe('sendMatchingSuggestionNotification', () => {
    it('should send matching suggestion notification successfully', async () => {
      const matchData = { score: 85, matchedSkills: ['First Aid'], reason: 'Great match' };
      notificationRepository.create.mockResolvedValue(mockNotification);

      const result = await notificationService.sendMatchingSuggestionNotification('user_001', mockEvent, matchData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Matching suggestion notification sent');
      expect(result.data.type).toBe('assignment');  // Normalized
    });
  });

  describe('sendBulkNotifications', () => {
    it('should send bulk notifications successfully', async () => {
      const userIds = ['user_001', 'user_002'];
      const notificationData = {
        type: 'reminder',
        title: 'Bulk Notification',
        message: 'This is a bulk notification',
        priority: 'normal'
      };

      userRepository.findById.mockResolvedValue(mockUser);
      notificationRepository.create.mockResolvedValue(mockNotification);

      const result = await notificationService.sendBulkNotifications(userIds, notificationData);

      expect(result.success).toBe(true);
      expect(result.data.summary.total).toBe(2);
      expect(result.data.summary.successful).toBe(2);
      expect(result.data.summary.failed).toBe(0);
    });

    it('should handle mixed success and failure in bulk send', async () => {
      const userIds = ['user_001', 'nonexistent'];
      const notificationData = {
        type: 'reminder',
        title: 'Bulk Notification',
        message: 'This is a bulk notification'
      };

      userRepository.findById.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);
      notificationRepository.create.mockResolvedValue(mockNotification);

      const result = await notificationService.sendBulkNotifications(userIds, notificationData);

      expect(result.success).toBe(true);
      expect(result.data.summary.successful).toBe(1);
      expect(result.data.summary.failed).toBe(1);
    });
  });

  describe('getAdminStats', () => {
    it('should get admin statistics successfully', async () => {
      const mockAdminStats = {
        totalNotifications: 10,
        unreadNotifications: 3,
        readNotifications: 7,
        notificationsByType: {
          ASSIGNMENT: 5,
          REMINDER: 3,
          EVENT_UPDATE: 2
        }
      };

      notificationRepository.getAdminStats.mockResolvedValue(mockAdminStats);

      const result = await notificationService.getAdminStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalNotifications');
      expect(result.data).toHaveProperty('unreadNotifications');
      expect(result.data).toHaveProperty('notificationsByType');
      expect(result.data.notificationsByType).toHaveProperty('assignment');  // Normalized
      expect(result.data.notificationsByType).toHaveProperty('reminder');  // Normalized
    });
  });

  describe('getNotificationPreferences', () => {
    it('should get notification preferences successfully', async () => {
      const result = await notificationService.getNotificationPreferences('user_001');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('userId');
      expect(result.data).toHaveProperty('emailNotifications');
      expect(result.data).toHaveProperty('pushNotifications');
      expect(result.data).toHaveProperty('types');
      expect(result.data).toHaveProperty('reminderTiming');
      expect(result.data).toHaveProperty('quietHours');
    });
  });
});