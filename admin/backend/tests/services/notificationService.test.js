/**
 * Unit Tests for Notification Service
 */

const notificationService = require('../../src/services/notificationService');
const { notificationHelpers } = require('../../src/data/notifications');
const { userHelpers } = require('../../src/data/users');
const { eventHelpers } = require('../../src/data/events');

// Mock dependencies
jest.mock('../../src/data/notifications');
jest.mock('../../src/data/users');
jest.mock('../../src/data/events');

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
    type: 'assignment',
    title: 'Event Assignment Confirmed',
    message: 'You have been assigned to Community Cleanup',
    data: {
      eventId: 'event_001',
      eventTitle: 'Community Cleanup'
    },
    priority: 'normal',
    read: false,
    createdAt: new Date(),
    readAt: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should get notifications with default pagination', async () => {
      const mockNotifications = [mockNotification];
      const mockStats = { total: 1, unread: 1 };

      notificationHelpers.getByUserId.mockReturnValue(mockNotifications);
      notificationHelpers.getStats.mockReturnValue(mockStats);

      const result = await notificationService.getNotifications('user_001');

      expect(result.success).toBe(true);
      expect(result.data.notifications).toEqual(mockNotifications);
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(20);
      expect(result.data.stats).toEqual(mockStats);
    });

    it('should apply type filter correctly', async () => {
      const mockNotifications = [mockNotification];
      notificationHelpers.getByUserId.mockReturnValue(mockNotifications);
      notificationHelpers.getStats.mockReturnValue({ total: 1, unread: 1 });

      const result = await notificationService.getNotifications('user_001', { type: 'assignment' });

      expect(result.success).toBe(true);
      expect(result.data.filters.type).toBe('assignment');
    });

    it('should apply priority filter correctly', async () => {
      const mockNotifications = [mockNotification];
      notificationHelpers.getByUserId.mockReturnValue(mockNotifications);
      notificationHelpers.getStats.mockReturnValue({ total: 1, unread: 1 });

      const result = await notificationService.getNotifications('user_001', { priority: 'high' });

      expect(result.success).toBe(true);
      expect(result.data.filters.priority).toBe('high');
    });

    it('should apply read filter correctly', async () => {
      const unreadNotification = { ...mockNotification, read: false };
      notificationHelpers.getByUserId.mockReturnValue([unreadNotification]);
      notificationHelpers.getStats.mockReturnValue({ total: 1, unread: 1 });

      const result = await notificationService.getNotifications('user_001', { read: 'false' });

      expect(result.success).toBe(true);
      expect(result.data.filters.read).toBe('false');
    });

    it('should apply date range filter', async () => {
      const mockNotifications = [mockNotification];
      notificationHelpers.getByUserId.mockReturnValue(mockNotifications);
      notificationHelpers.getStats.mockReturnValue({ total: 1, unread: 1 });

      const startDate = new Date(Date.now() - 86400000).toISOString();
      const endDate = new Date().toISOString();

      const result = await notificationService.getNotifications('user_001', { startDate, endDate });

      expect(result.success).toBe(true);
    });

    it('should sort in descending order', async () => {
      const mockNotifications = [mockNotification];
      notificationHelpers.getByUserId.mockReturnValue(mockNotifications);
      notificationHelpers.getStats.mockReturnValue({ total: 1, unread: 1 });

      const result = await notificationService.getNotifications('user_001', {}, { sortOrder: 'desc' });

      expect(result.success).toBe(true);
    });

    it('should sort in ascending order', async () => {
      const mockNotifications = [mockNotification];
      notificationHelpers.getByUserId.mockReturnValue(mockNotifications);
      notificationHelpers.getStats.mockReturnValue({ total: 1, unread: 1 });

      const result = await notificationService.getNotifications('user_001', {}, { sortOrder: 'asc' });

      expect(result.success).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      const mockNotifications = Array(25).fill(mockNotification);
      notificationHelpers.getByUserId.mockReturnValue(mockNotifications);
      notificationHelpers.getStats.mockReturnValue({ total: 25, unread: 5 });

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
      notificationHelpers.findById.mockReturnValue(mockNotification);

      const result = await notificationService.getNotificationById('notif_001', 'user_001');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNotification);
    });

    it('should handle notification not found', async () => {
      notificationHelpers.findById.mockReturnValue(null);

      await expect(notificationService.getNotificationById('nonexistent', 'user_001'))
        .rejects.toThrow('Notification not found');
    });

    it('should handle access denied for other user notification', async () => {
      notificationHelpers.findById.mockReturnValue({ ...mockNotification, userId: 'user_002' });

      await expect(notificationService.getNotificationById('notif_001', 'user_001'))
        .rejects.toThrow('Access denied. You can only view your own notifications.');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const updatedNotification = { ...mockNotification, read: true, readAt: new Date() };
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.markAsRead.mockReturnValue(true);
      notificationHelpers.findById.mockReturnValueOnce(mockNotification).mockReturnValueOnce(updatedNotification);

      const result = await notificationService.markAsRead('notif_001', 'user_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification marked as read');
      expect(notificationHelpers.markAsRead).toHaveBeenCalledWith('notif_001');
    });

    it('should handle notification not found', async () => {
      notificationHelpers.findById.mockReturnValue(null);

      await expect(notificationService.markAsRead('nonexistent', 'user_001'))
        .rejects.toThrow('Notification not found');
    });

    it('should handle access denied', async () => {
      notificationHelpers.findById.mockReturnValue({ ...mockNotification, userId: 'user_002' });

      await expect(notificationService.markAsRead('notif_001', 'user_001'))
        .rejects.toThrow('Access denied. You can only modify your own notifications.');
    });

    it('should handle failed mark as read', async () => {
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.markAsRead.mockReturnValue(false);

      await expect(notificationService.markAsRead('notif_001', 'user_001'))
        .rejects.toThrow('Failed to mark notification as read');
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read successfully', async () => {
      const notificationIds = ['notif_001', 'notif_002'];
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.markAsRead.mockReturnValue(true);

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.total).toBe(2);
      expect(result.data.summary.successful).toBe(2);
      expect(result.data.summary.failed).toBe(0);
    });

    it('should handle mixed success and failure', async () => {
      const notificationIds = ['notif_001', 'nonexistent'];
      notificationHelpers.findById.mockReturnValueOnce(mockNotification).mockReturnValueOnce(null);
      notificationHelpers.markAsRead.mockReturnValue(true);

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.successful).toBe(1);
      expect(result.data.summary.failed).toBe(1);
    });

    it('should deny access to notifications owned by other users', async () => {
      const notificationIds = ['notif_001'];
      notificationHelpers.findById.mockReturnValue({ ...mockNotification, userId: 'user_002' });

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
      expect(result.data.results[0].error).toBe('Access denied');
    });

    it('should handle markAsRead failures', async () => {
      const notificationIds = ['notif_001'];
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.markAsRead.mockReturnValue(false);

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
    });

    it('should handle exceptions during marking', async () => {
      const notificationIds = ['notif_001'];
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.markAsRead.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await notificationService.markMultipleAsRead(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const mockStats = { total: 5, unread: 0 };
      notificationHelpers.markAllAsReadByUserId.mockReturnValue(3);
      notificationHelpers.getStats.mockReturnValue(mockStats);

      const result = await notificationService.markAllAsRead('user_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Marked 3 notifications as read');
      expect(result.data.markedCount).toBe(3);
      expect(result.data.stats).toEqual(mockStats);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.delete.mockReturnValue(mockNotification);

      const result = await notificationService.deleteNotification('notif_001', 'user_001');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification deleted successfully');
      expect(result.data).toEqual(mockNotification);
    });

    it('should handle notification not found', async () => {
      notificationHelpers.findById.mockReturnValue(null);

      await expect(notificationService.deleteNotification('nonexistent', 'user_001'))
        .rejects.toThrow('Notification not found');
    });

    it('should handle access denied', async () => {
      notificationHelpers.findById.mockReturnValue({ ...mockNotification, userId: 'user_002' });

      await expect(notificationService.deleteNotification('notif_001', 'user_001'))
        .rejects.toThrow('Access denied. You can only delete your own notifications.');
    });

    it('should handle failed deletion', async () => {
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.delete.mockReturnValue(null);

      await expect(notificationService.deleteNotification('notif_001', 'user_001'))
        .rejects.toThrow('Failed to delete notification');
    });
  });

  describe('deleteMultiple', () => {
    it('should delete multiple notifications successfully', async () => {
      const notificationIds = ['notif_001', 'notif_002'];
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.delete.mockReturnValue(mockNotification);

      const result = await notificationService.deleteMultiple(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.total).toBe(2);
      expect(result.data.summary.successful).toBe(2);
      expect(result.data.summary.failed).toBe(0);
    });

    it('should handle notification not found', async () => {
      const notificationIds = ['nonexistent'];
      notificationHelpers.findById.mockReturnValue(null);

      const result = await notificationService.deleteMultiple(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
      expect(result.data.results[0].error).toBe('Notification not found');
    });

    it('should deny deleting notifications owned by other users', async () => {
      const notificationIds = ['notif_001'];
      notificationHelpers.findById.mockReturnValue({ ...mockNotification, userId: 'user_002' });

      const result = await notificationService.deleteMultiple(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
      expect(result.data.results[0].error).toBe('Access denied');
    });

    it('should handle delete failures', async () => {
      const notificationIds = ['notif_001'];
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.delete.mockReturnValue(null);

      const result = await notificationService.deleteMultiple(notificationIds, 'user_001');

      expect(result.success).toBe(true);
      expect(result.data.summary.failed).toBe(1);
    });

    it('should handle exceptions during deletion', async () => {
      const notificationIds = ['notif_001'];
      notificationHelpers.findById.mockReturnValue(mockNotification);
      notificationHelpers.delete.mockImplementation(() => {
        throw new Error('Database error');
      });

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
      userHelpers.findById.mockReturnValue(mockUser);
      notificationHelpers.create.mockReturnValue(mockNotification);

      const result = await notificationService.createNotification(validNotificationData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification created successfully');
      expect(result.data).toEqual(mockNotification);
    });

    it('should handle user not found', async () => {
      userHelpers.findById.mockReturnValue(null);

      await expect(notificationService.createNotification(validNotificationData))
        .rejects.toThrow('User not found');
    });

    it('should validate required fields', async () => {
      userHelpers.findById.mockReturnValue(mockUser);

      await expect(notificationService.createNotification({ userId: 'user_001' }))
        .rejects.toThrow('Type, title, and message are required');
    });
  });

  describe('sendAssignmentNotification', () => {
    it('should send assignment notification successfully', async () => {
      const assignmentData = { assignmentId: 'assign_001', status: 'confirmed' };
      notificationHelpers.createAssignmentNotification.mockReturnValue(mockNotification);

      const result = await notificationService.sendAssignmentNotification('user_001', mockEvent, assignmentData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Assignment notification sent');
      expect(result.data).toEqual(mockNotification);
    });
  });

  describe('sendReminderNotification', () => {
    it('should send reminder notification successfully', async () => {
      notificationHelpers.createReminderNotification.mockReturnValue(mockNotification);

      const result = await notificationService.sendReminderNotification('user_001', mockEvent, '24h');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Reminder notification sent');
      expect(result.data).toEqual(mockNotification);
    });
  });

  describe('sendEventUpdateNotification', () => {
    it('should send event update notification successfully', async () => {
      const updateData = { type: 'location_change', changes: { location: 'New Location' } };
      notificationHelpers.createEventUpdateNotification.mockReturnValue(mockNotification);

      const result = await notificationService.sendEventUpdateNotification('user_001', mockEvent, updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event update notification sent');
      expect(result.data).toEqual(mockNotification);
    });
  });

  describe('sendMatchingSuggestionNotification', () => {
    it('should send matching suggestion notification successfully', async () => {
      const matchData = { matchScore: 85, matchQuality: 'excellent', recommendations: ['Great match'] };
      notificationHelpers.createMatchingSuggestionNotification.mockReturnValue(mockNotification);

      const result = await notificationService.sendMatchingSuggestionNotification('user_001', mockEvent, matchData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Matching suggestion notification sent');
      expect(result.data).toEqual(mockNotification);
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

      userHelpers.findById.mockReturnValue(mockUser);
      notificationHelpers.create.mockReturnValue(mockNotification);

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

      userHelpers.findById.mockReturnValueOnce(mockUser).mockReturnValueOnce(null);
      notificationHelpers.create.mockReturnValue(mockNotification);

      const result = await notificationService.sendBulkNotifications(userIds, notificationData);

      expect(result.success).toBe(true);
      expect(result.data.summary.successful).toBe(1);
      expect(result.data.summary.failed).toBe(1);
    });
  });

  describe('getAdminStats', () => {
    it('should get admin statistics successfully', async () => {
      const mockAllNotifications = [
        { ...mockNotification, type: 'assignment', priority: 'high', read: false },
        { ...mockNotification, id: 'notif_002', type: 'reminder', priority: 'normal', read: true }
      ];
      const mockUsers = [mockUser];

      notificationHelpers.getAllNotifications.mockReturnValue(mockAllNotifications);
      userHelpers.getVolunteers.mockReturnValue(mockUsers);

      const result = await notificationService.getAdminStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalNotifications');
      expect(result.data).toHaveProperty('unreadNotifications');
      expect(result.data).toHaveProperty('notificationsByType');
      expect(result.data).toHaveProperty('notificationsByPriority');
      expect(result.data).toHaveProperty('notificationsByUser');
      expect(result.data).toHaveProperty('recentActivity');
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