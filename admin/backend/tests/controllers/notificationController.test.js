/**
 * Unit Tests for Notification Controller
 */

const request = require('supertest');
const express = require('express');
const notificationController = require('../../src/controllers/notificationController');

// Mock the notification service
jest.mock('../../src/services/notificationService');
const notificationService = require('../../src/services/notificationService');

const app = express();
app.use(express.json());

// Setup routes with mock middleware for authentication
const mockAuth = (req, res, next) => {
  req.user = { id: 'user_001', role: 'volunteer' };
  next();
};

const mockAdminAuth = (req, res, next) => {
  req.user = { id: 'admin_001', role: 'admin' };
  next();
};

app.get('/notifications', mockAuth, notificationController.getNotifications);
app.get('/notifications/preferences/me', mockAuth, notificationController.getPreferences);
app.put('/notifications/bulk/read', mockAuth, notificationController.markMultipleAsRead);
app.put('/notifications/all/read', mockAuth, notificationController.markAllAsRead);
app.delete('/notifications/bulk', mockAuth, notificationController.deleteMultiple);
app.get('/notifications/:id', mockAuth, notificationController.getNotificationById);
app.put('/notifications/:id/read', mockAuth, notificationController.markAsRead);
app.delete('/notifications/:id', mockAuth, notificationController.deleteNotification);
app.post('/notifications/create', mockAdminAuth, notificationController.createNotification);
app.post('/notifications/assignment', mockAdminAuth, notificationController.sendAssignmentNotification);
app.post('/notifications/reminder', mockAdminAuth, notificationController.sendReminderNotification);
app.post('/notifications/event-update', mockAdminAuth, notificationController.sendEventUpdateNotification);
app.post('/notifications/matching-suggestion', mockAdminAuth, notificationController.sendMatchingSuggestionNotification);
app.post('/notifications/bulk-send', mockAdminAuth, notificationController.sendBulkNotifications);
app.get('/notifications/admin/stats', mockAdminAuth, notificationController.getAdminStats);

describe('NotificationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /notifications', () => {
    it('should get notifications with default pagination', async () => {
      const mockResponse = {
        data: {
          notifications: [
            {
              id: 'notif_001',
              title: 'Test Notification',
              message: 'Test message',
              read: false
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1
          },
          stats: { total: 5, unread: 1 }
        }
      };

      notificationService.getNotifications.mockResolvedValue(mockResponse);

      const response = await request(app).get('/notifications');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.notifications).toHaveLength(1);
      expect(notificationService.getNotifications).toHaveBeenCalledWith(
        'user_001',
        expect.any(Object),
        expect.objectContaining({ page: 1, limit: 20 })
      );
    });

    it('should handle service errors', async () => {
      notificationService.getNotifications.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/notifications');

      expect(response.status).toBe(500);
    });

    it('should apply filters and pagination from query params', async () => {
      const mockResponse = { data: { notifications: [], pagination: {}, stats: {} } };
      notificationService.getNotifications.mockResolvedValue(mockResponse);

      await request(app)
        .get('/notifications')
        .query({
          type: 'assignment',
          priority: 'high',
          read: 'false',
          page: 2,
          limit: 10,
          sortBy: 'priority',
          sortOrder: 'asc'
        });

      expect(notificationService.getNotifications).toHaveBeenCalledWith(
        'user_001',
        expect.objectContaining({
          type: 'assignment',
          priority: 'high',
          read: 'false'
        }),
        expect.objectContaining({
          page: 2,
          limit: 10,
          sortBy: 'priority',
          sortOrder: 'asc'
        })
      );
    });
  });

  describe('GET /notifications/:id', () => {
    it('should get notification by ID successfully', async () => {
      const mockResponse = {
        data: {
          id: 'notif_001',
          title: 'Test Notification',
          message: 'Test message'
        }
      };

      notificationService.getNotificationById.mockResolvedValue(mockResponse);

      const response = await request(app).get('/notifications/notif_001');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe('notif_001');
    });

    it('should handle notification not found', async () => {
      notificationService.getNotificationById.mockRejectedValue(new Error('Notification not found'));

      const response = await request(app).get('/notifications/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Notification not found');
    });

    it('should handle access denied', async () => {
      notificationService.getNotificationById.mockRejectedValue(
        new Error('Access denied. You can only view your own notifications.')
      );

      const response = await request(app).get('/notifications/notif_001');

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('PUT /notifications/:id/read', () => {
    it('should mark notification as read successfully', async () => {
      const mockResponse = {
        message: 'Notification marked as read',
        data: { id: 'notif_001', read: true }
      };

      notificationService.markAsRead.mockResolvedValue(mockResponse);

      const response = await request(app).put('/notifications/notif_001/read');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Notification marked as read');
    });

    it('should handle notification not found', async () => {
      notificationService.markAsRead.mockRejectedValue(new Error('Notification not found'));

      const response = await request(app).put('/notifications/nonexistent/read');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Notification not found');
    });

    it('should handle access denied', async () => {
      notificationService.markAsRead.mockRejectedValue(
        new Error('Access denied. You can only modify your own notifications.')
      );

      const response = await request(app).put('/notifications/notif_001/read');

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('PUT /notifications/bulk/read', () => {
    it('should mark multiple notifications as read successfully', async () => {
      const mockResponse = {
        message: 'Marked 2 notifications as read',
        data: {
          results: [
            { id: 'notif_001', success: true },
            { id: 'notif_002', success: true }
          ],
          summary: { total: 2, successful: 2, failed: 0 }
        }
      };

      notificationService.markMultipleAsRead.mockResolvedValue(mockResponse);

      const response = await request(app)
        .put('/notifications/bulk/read')
        .send({ notificationIds: ['notif_001', 'notif_002'] });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.summary.successful).toBe(2);
    });

    it('should validate notificationIds array is provided', async () => {
      const response = await request(app)
        .put('/notifications/bulk/read')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('notificationIds array is required');
    });

    it('should validate notificationIds is an array', async () => {
      const response = await request(app)
        .put('/notifications/bulk/read')
        .send({ notificationIds: 'not-an-array' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('notificationIds array is required');
    });
  });

  describe('PUT /notifications/all/read', () => {
    it('should mark all notifications as read successfully', async () => {
      const mockResponse = {
        message: 'Marked 5 notifications as read',
        data: {
          markedCount: 5,
          stats: { total: 5, unread: 0 }
        }
      };

      notificationService.markAllAsRead.mockResolvedValue(mockResponse);

      const response = await request(app).put('/notifications/all/read');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.markedCount).toBe(5);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete notification successfully', async () => {
      const mockResponse = {
        message: 'Notification deleted successfully',
        data: { id: 'notif_001', title: 'Deleted Notification' }
      };

      notificationService.deleteNotification.mockResolvedValue(mockResponse);

      const response = await request(app).delete('/notifications/notif_001');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Notification deleted successfully');
    });

    it('should handle notification not found', async () => {
      notificationService.deleteNotification.mockRejectedValue(new Error('Notification not found'));

      const response = await request(app).delete('/notifications/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Notification not found');
    });

    it('should handle access denied', async () => {
      notificationService.deleteNotification.mockRejectedValue(
        new Error('Access denied. You can only delete your own notifications.')
      );

      const response = await request(app).delete('/notifications/notif_001');

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('DELETE /notifications/bulk', () => {
    it('should delete multiple notifications successfully', async () => {
      const mockResponse = {
        message: 'Deleted 2 notifications',
        data: {
          results: [
            { id: 'notif_001', success: true },
            { id: 'notif_002', success: true }
          ],
          summary: { total: 2, successful: 2, failed: 0 }
        }
      };

      notificationService.deleteMultiple.mockResolvedValue(mockResponse);

      const response = await request(app)
        .delete('/notifications/bulk')
        .send({ notificationIds: ['notif_001', 'notif_002'] });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.summary.successful).toBe(2);
    });

    it('should validate notificationIds array is provided', async () => {
      const response = await request(app)
        .delete('/notifications/bulk')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('notificationIds array is required');
    });
  });

  describe('GET /notifications/preferences/me', () => {
    it('should get notification preferences successfully', async () => {
      const mockResponse = {
        data: {
          userId: 'user_001',
          emailNotifications: true,
          pushNotifications: true,
          types: { assignment: true, reminder: true }
        }
      };

      notificationService.getNotificationPreferences.mockResolvedValue(mockResponse);

      const response = await request(app).get('/notifications/preferences/me');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.userId).toBe('user_001');
    });
  });

  describe('POST /notifications/create', () => {
    it('should create notification successfully (admin only)', async () => {
      const mockResponse = {
        message: 'Notification created successfully',
        data: {
          id: 'notif_new',
          title: 'New Notification',
          message: 'Test message'
        }
      };

      notificationService.createNotification.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/notifications/create')
        .send({
          userId: 'user_001',
          type: 'assignment',
          title: 'New Notification',
          message: 'Test message',
          priority: 'normal'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Notification created successfully');
    });

    it('should validate required fields', async () => {
      notificationService.createNotification.mockRejectedValue(
        new Error('Type, title, and message are required')
      );

      const response = await request(app)
        .post('/notifications/create')
        .send({ userId: 'user_001' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Type, title, and message are required');
    });
  });

  describe('POST /notifications/assignment', () => {
    it('should send assignment notification successfully', async () => {
      const mockResponse = {
        message: 'Assignment notification sent',
        data: { id: 'notif_new' }
      };

      notificationService.sendAssignmentNotification.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/notifications/assignment')
        .send({
          userId: 'user_001',
          eventData: { id: 'event_001', title: 'Community Cleanup' },
          assignmentData: { assignmentId: 'assign_001', status: 'confirmed' }
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Assignment notification sent');
    });
  });

  describe('POST /notifications/reminder', () => {
    it('should send reminder notification successfully', async () => {
      const mockResponse = {
        message: 'Reminder notification sent',
        data: { id: 'notif_new' }
      };

      notificationService.sendReminderNotification.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/notifications/reminder')
        .send({
          userId: 'user_001',
          eventData: { id: 'event_001', title: 'Community Cleanup' },
          reminderType: '24h'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Reminder notification sent');
    });
  });

  describe('POST /notifications/event-update', () => {
    it('should send event update notification successfully', async () => {
      const mockResponse = {
        message: 'Event update notification sent',
        data: { id: 'notif_new' }
      };

      notificationService.sendEventUpdateNotification.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/notifications/event-update')
        .send({
          userId: 'user_001',
          eventData: { id: 'event_001', title: 'Community Cleanup' },
          updateData: { type: 'location_change', changes: { location: 'New Location' } }
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Event update notification sent');
    });
  });

  describe('POST /notifications/matching-suggestion', () => {
    it('should send matching suggestion notification successfully', async () => {
      const mockResponse = {
        message: 'Matching suggestion notification sent',
        data: { id: 'notif_new' }
      };

      notificationService.sendMatchingSuggestionNotification.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/notifications/matching-suggestion')
        .send({
          userId: 'user_001',
          eventData: { id: 'event_001', title: 'Community Cleanup' },
          matchData: { matchScore: 85, matchQuality: 'excellent' }
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Matching suggestion notification sent');
    });
  });

  describe('POST /notifications/bulk-send', () => {
    it('should send bulk notifications successfully', async () => {
      const mockResponse = {
        message: 'Sent notifications to 2 users',
        data: {
          results: [
            { userId: 'user_001', success: true },
            { userId: 'user_002', success: true }
          ],
          summary: { total: 2, successful: 2, failed: 0 }
        }
      };

      notificationService.sendBulkNotifications.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/notifications/bulk-send')
        .send({
          userIds: ['user_001', 'user_002'],
          notificationData: {
            type: 'reminder',
            title: 'Bulk Notification',
            message: 'This is a bulk notification'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.summary.successful).toBe(2);
    });
  });

  describe('GET /notifications/admin/stats', () => {
    it('should get admin statistics successfully', async () => {
      const mockResponse = {
        data: {
          totalNotifications: 100,
          unreadNotifications: 25,
          notificationsByType: { assignment: 40, reminder: 30, event_update: 20 },
          notificationsByPriority: { high: 20, normal: 60, low: 20 }
        }
      };

      notificationService.getAdminStats.mockResolvedValue(mockResponse);

      const response = await request(app).get('/notifications/admin/stats');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.totalNotifications).toBe(100);
    });
  });

  describe('Error handling for next(error)', () => {
    it('should call next for unexpected errors in markAsRead', async () => {
      notificationService.markAsRead.mockRejectedValue(new Error('Database error'));

      const response = await request(app).put('/notifications/notif_001/read');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in markMultipleAsRead', async () => {
      notificationService.markMultipleAsRead.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/notifications/bulk/read')
        .send({ notificationIds: ['notif_001'] });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in markAllAsRead', async () => {
      notificationService.markAllAsRead.mockRejectedValue(new Error('Database error'));

      const response = await request(app).put('/notifications/all/read');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in deleteMultiple', async () => {
      notificationService.deleteMultiple.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/notifications/bulk')
        .send({ notificationIds: ['notif_001'] });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getPreferences', async () => {
      notificationService.getNotificationPreferences.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/notifications/preferences/me');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in createNotification', async () => {
      notificationService.createNotification.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/notifications/create')
        .send({
          userId: 'user_001',
          type: 'assignment',
          title: 'Test',
          message: 'Test message'
        });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in sendAssignmentNotification', async () => {
      notificationService.sendAssignmentNotification.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/notifications/assignment')
        .send({
          userId: 'user_001',
          eventData: { id: 'event_001', title: 'Test' },
          assignmentData: { assignmentId: 'assign_001' }
        });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in sendReminderNotification', async () => {
      notificationService.sendReminderNotification.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/notifications/reminder')
        .send({
          userId: 'user_001',
          eventData: { id: 'event_001', title: 'Test' },
          reminderType: '24h'
        });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in sendEventUpdateNotification', async () => {
      notificationService.sendEventUpdateNotification.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/notifications/event-update')
        .send({
          userId: 'user_001',
          eventData: { id: 'event_001', title: 'Test' },
          updateData: { type: 'change' }
        });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in sendMatchingSuggestionNotification', async () => {
      notificationService.sendMatchingSuggestionNotification.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/notifications/matching-suggestion')
        .send({
          userId: 'user_001',
          eventData: { id: 'event_001', title: 'Test' },
          matchData: { matchScore: 85 }
        });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in sendBulkNotifications', async () => {
      notificationService.sendBulkNotifications.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/notifications/bulk-send')
        .send({
          userIds: ['user_001'],
          notificationData: { type: 'reminder', title: 'Test', message: 'Test' }
        });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getAdminStats', async () => {
      notificationService.getAdminStats.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/notifications/admin/stats');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in deleteNotification', async () => {
      notificationService.deleteNotification.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/notifications/notif_001');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getNotificationById', async () => {
      notificationService.getNotificationById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/notifications/notif_001');

      expect(response.status).toBe(500);
    });
  });
});