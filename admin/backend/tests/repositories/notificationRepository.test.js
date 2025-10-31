const NotificationRepository = require('../../src/database/repositories/notificationRepository');
const prisma = require('../../src/database/prisma');

jest.mock('../../src/database/prisma', () => ({
  notification: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn()
  }
}));

describe('NotificationRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUser', () => {
    it('should find notifications for a user', async () => {
      const mockNotifications = [
        { id: '1', userId: 'user-1', message: 'Notification 1', read: false },
        { id: '2', userId: 'user-1', message: 'Notification 2', read: true }
      ];

      prisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationRepository.findByUser('user-1');

      expect(result).toEqual(mockNotifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return empty array for user with no notifications', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      const result = await NotificationRepository.findByUser('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('findUnreadByUser', () => {
    it('should find unread notifications for a user', async () => {
      const mockNotifications = [
        { id: '1', userId: 'user-1', message: 'Unread 1', read: false },
        { id: '2', userId: 'user-1', message: 'Unread 2', read: false }
      ];

      prisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationRepository.findUnreadByUser('user-1');

      expect(result).toEqual(mockNotifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          read: false
        },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return empty array when no unread notifications', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      const result = await NotificationRepository.findUnreadByUser('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const notificationData = {
        userId: 'user-1',
        type: 'EVENT_ASSIGNMENT',
        message: 'You have been assigned to an event',
        eventId: 'event-1'
      };

      const mockNotification = { id: 'notif-1', ...notificationData, read: false };
      prisma.notification.create.mockResolvedValue(mockNotification);

      const result = await NotificationRepository.create(notificationData);

      expect(result).toEqual(mockNotification);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: notificationData.userId,
          type: notificationData.type,
          message: notificationData.message,
          eventId: notificationData.eventId
        })
      });
    });

    it('should create notification without eventId', async () => {
      const notificationData = {
        userId: 'user-1',
        type: 'ANNOUNCEMENT',
        message: 'General announcement'
      };

      const mockNotification = { id: 'notif-1', ...notificationData };
      prisma.notification.create.mockResolvedValue(mockNotification);

      const result = await NotificationRepository.create(notificationData);

      expect(result).toEqual(mockNotification);
    });
  });

  describe('update', () => {
    it('should update a notification', async () => {
      const updateData = { read: true };
      const mockUpdated = { id: 'notif-1', read: true };

      prisma.notification.update.mockResolvedValue(mockUpdated);

      const result = await NotificationRepository.update('notif-1', updateData);

      expect(result).toEqual(mockUpdated);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: updateData
      });
    });

    it('should handle update of non-existent notification', async () => {
      prisma.notification.update.mockRejectedValue(new Error('Record not found'));

      await expect(NotificationRepository.update('nonexistent', {})).rejects.toThrow();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = { id: 'notif-1', read: true };
      prisma.notification.update.mockResolvedValue(mockNotification);

      const result = await NotificationRepository.markAsRead('notif-1');

      expect(result).toEqual(mockNotification);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: expect.objectContaining({ read: true })
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await NotificationRepository.markAllAsRead('user-1');

      expect(result.count).toBe(5);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          read: false
        },
        data: expect.objectContaining({ read: true })
      });
    });

    it('should return count 0 when no unread notifications', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const result = await NotificationRepository.markAllAsRead('user-1');

      expect(result.count).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      const mockDeleted = { id: 'notif-1', message: 'Deleted notification' };
      prisma.notification.delete.mockResolvedValue(mockDeleted);

      const result = await NotificationRepository.delete('notif-1');

      expect(result).toEqual(mockDeleted);
      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notif-1' }
      });
    });

    it('should handle deletion of non-existent notification', async () => {
      prisma.notification.delete.mockRejectedValue(new Error('Record not found'));

      await expect(NotificationRepository.delete('nonexistent')).rejects.toThrow();
    });
  });

  describe('deleteAllByUser', () => {
    it('should delete all notifications for a user', async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 10 });

      const result = await NotificationRepository.deleteAllByUser('user-1');

      expect(result.count).toBe(10);
      expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' }
      });
    });

    it('should return count 0 when user has no notifications', async () => {
      prisma.notification.deleteMany.mockResolvedValue({ count: 0 });

      const result = await NotificationRepository.deleteAllByUser('user-1');

      expect(result.count).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find notification by ID', async () => {
      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        message: 'Test notification'
      };

      prisma.notification.findUnique.mockResolvedValue(mockNotification);

      const result = await NotificationRepository.findById('notif-1');

      expect(result).toEqual(mockNotification);
      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        include: expect.any(Object)
      });
    });

    it('should return null for non-existent notification', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      const result = await NotificationRepository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('should count all notifications', async () => {
      prisma.notification.count.mockResolvedValue(100);

      const result = await NotificationRepository.count();

      expect(result).toBe(100);
      expect(prisma.notification.count).toHaveBeenCalled();
    });

    it('should count notifications with filters', async () => {
      const filters = { userId: 'user-1', read: false };
      prisma.notification.count.mockResolvedValue(5);

      const result = await NotificationRepository.count(filters);

      expect(result).toBe(5);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: filters
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count for user', async () => {
      prisma.notification.count.mockResolvedValue(7);

      const result = await NotificationRepository.getUnreadCount('user-1');

      expect(result).toBe(7);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          read: false
        }
      });
    });

    it('should return 0 when no unread notifications', async () => {
      prisma.notification.count.mockResolvedValue(0);

      const result = await NotificationRepository.getUnreadCount('user-1');

      expect(result).toBe(0);
    });
  });

  describe('findByEvent', () => {
    it('should find notifications by event', async () => {
      const mockNotifications = [
        { id: '1', eventId: 'event-1', message: 'Event notification 1' },
        { id: '2', eventId: 'event-1', message: 'Event notification 2' }
      ];

      prisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationRepository.findByEvent('event-1');

      expect(result).toEqual(mockNotifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-1' },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should return empty array for event with no notifications', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      const result = await NotificationRepository.findByEvent('event-1');

      expect(result).toEqual([]);
    });
  });

  describe('findByType', () => {
    it('should find notifications by type', async () => {
      const mockNotifications = [
        { id: '1', type: 'EVENT_ASSIGNMENT' },
        { id: '2', type: 'EVENT_ASSIGNMENT' }
      ];

      prisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationRepository.findByType('EVENT_ASSIGNMENT');

      expect(result).toEqual(mockNotifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { type: 'EVENT_ASSIGNMENT' },
        orderBy: { createdAt: 'desc' }
      });
    });
  });
});
