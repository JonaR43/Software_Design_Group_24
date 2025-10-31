/**
 * Unit Tests for Admin Controller
 * Updated to use Prisma repository mocks
 */

const request = require('supertest');
const express = require('express');
const adminController = require('../../src/controllers/adminController');
const userRepository = require('../../src/database/repositories/userRepository');
const eventRepository = require('../../src/database/repositories/eventRepository');
const historyRepository = require('../../src/database/repositories/historyRepository');

// Mock the repositories
jest.mock('../../src/database/repositories/userRepository');
jest.mock('../../src/database/repositories/eventRepository');
jest.mock('../../src/database/repositories/historyRepository');

const app = express();
app.use(express.json());

const mockAdminAuth = (req, res, next) => {
  req.user = { id: 'admin_001', email: 'admin@example.com', role: 'admin' };
  next();
};

// Setup routes
app.get('/admin/users', mockAdminAuth, adminController.getAllUsers);
app.get('/admin/users/:userId', mockAdminAuth, adminController.getUserById);
app.post('/admin/users', mockAdminAuth, adminController.createUser);
app.put('/admin/users/:userId', mockAdminAuth, adminController.updateUser);
app.delete('/admin/users/:userId', mockAdminAuth, adminController.deleteUser);
app.get('/admin/metrics', mockAdminAuth, adminController.getMetrics);
app.get('/admin/users/:userId/metrics', mockAdminAuth, adminController.getVolunteerMetrics);

describe('AdminController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /admin/users', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'testuser', email: 'test@example.com', role: 'VOLUNTEER' },
        { id: 'user-2', username: 'admin', email: 'admin@example.com', role: 'ADMIN' }
      ];

      userRepository.findAll.mockResolvedValue(mockUsers);

      const response = await request(app).get('/admin/users');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });
  });

  describe('GET /admin/users/:userId', () => {
    it('should get user by ID successfully', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const mockProfile = {
        firstName: 'Test',
        lastName: 'User',
        phone: '123-456-7890',
        address: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001'
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.getProfile.mockResolvedValue(mockProfile);

      const response = await request(app).get(`/admin/users/${mockUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(mockUser.id);
    });

    it('should handle user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const response = await request(app).get('/admin/users/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /admin/users', () => {
    it('should create user successfully', async () => {
      const timestamp = Date.now();
      const newUser = {
        username: 'testuser_' + timestamp,
        email: `testuser_${timestamp}@example.com`,
        password: 'Password123!',
        role: 'volunteer'
      };

      const mockCreatedUser = {
        id: 'user-new',
        username: newUser.username.toLowerCase(),
        email: newUser.email.toLowerCase(),
        role: newUser.role,
        verified: true,
        createdAt: new Date()
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockCreatedUser);
      userRepository.createProfile.mockResolvedValue({});

      const response = await request(app)
        .post('/admin/users')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.username).toBe(newUser.username.toLowerCase());
      expect(response.body.data.email).toBe(newUser.email.toLowerCase());
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/admin/users')
        .send({ username: 'incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle duplicate email', async () => {
      const existingEmail = 'existing@example.com';
      const mockExistingUser = {
        id: 'user-existing',
        username: 'existinguser',
        email: existingEmail,
        role: 'volunteer'
      };

      userRepository.findByEmail.mockResolvedValue(mockExistingUser);

      const response = await request(app)
        .post('/admin/users')
        .send({
          username: 'newuser',
          email: existingEmail,
          password: 'Password123!',
          role: 'volunteer'
        });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('email');
    });

    it('should handle duplicate username', async () => {
      const existingUsername = 'existinguser';
      const mockExistingUser = {
        id: 'user-existing',
        username: existingUsername,
        email: 'existing@example.com',
        role: 'volunteer'
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(mockExistingUser);

      const response = await request(app)
        .post('/admin/users')
        .send({
          username: existingUsername,
          email: 'newemail@example.com',
          password: 'Password123!',
          role: 'volunteer'
        });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Username');
    });
  });

  describe('PUT /admin/users/:userId', () => {
    it('should update user successfully', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'VOLUNTEER',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUpdatedUser = {
        ...mockUser,
        verified: true,
        updatedAt: new Date()
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ verified: true });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(userId);
    });

    it('should handle user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .put('/admin/users/nonexistent_id')
        .send({ verified: true });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should handle duplicate email on update', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'VOLUNTEER'
      };

      const existingEmail = 'second@example.com';
      const mockExistingUser = {
        id: 'user-2',
        username: 'seconduser',
        email: existingEmail,
        role: 'VOLUNTEER'
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(mockExistingUser);

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ email: existingEmail });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
    });

    it('should handle duplicate username on update', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'VOLUNTEER'
      };

      const existingUsername = 'uniqueuser2';
      const mockExistingUser = {
        id: 'user-2',
        username: existingUsername,
        email: 'unique2@example.com',
        role: 'VOLUNTEER'
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(mockExistingUser);

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ username: existingUsername });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Username');
    });

    it('should update user with new password', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUpdatedUser = {
        ...mockUser,
        updatedAt: new Date()
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ password: 'NewPassword123!' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('DELETE /admin/users/:userId', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-delete';
      const mockUser = {
        id: userId,
        username: 'deleteme',
        email: 'deleteme@example.com',
        role: 'VOLUNTEER',
        verified: true
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(true);

      const response = await request(app).delete(`/admin/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should handle user not found on delete', async () => {
      userRepository.findById.mockResolvedValue(null);

      const response = await request(app).delete('/admin/users/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should prevent deleting own account', async () => {
      const adminId = 'admin_001';
      const mockAdmin = {
        id: adminId,
        username: 'adminuser',
        email: 'admin@example.com',
        role: 'ADMIN',
        verified: true
      };

      // Create a custom app instance with this specific admin ID
      const testApp = express();
      testApp.use(express.json());
      const customAdminAuth = (req, res, next) => {
        req.user = { id: adminId, email: 'admin@example.com', role: 'admin' };
        next();
      };
      testApp.delete('/admin/users/:userId', customAdminAuth, adminController.deleteUser);

      userRepository.findById.mockResolvedValue(mockAdmin);

      const response = await request(testApp).delete(`/admin/users/${adminId}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('cannot delete your own account');
    });

    it('should handle delete failure', async () => {
      const userId = 'user-fail-delete';
      const mockUser = {
        id: userId,
        username: 'testfaileddelete',
        email: 'testfaileddelete@example.com',
        role: 'VOLUNTEER',
        verified: true
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete(`/admin/users/${userId}`);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /admin/metrics', () => {
    it('should get analytics metrics successfully', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'volunteer1', email: 'vol1@test.com', role: 'VOLUNTEER', verified: true, createdAt: new Date() },
        { id: 'user-2', username: 'admin1', email: 'admin1@test.com', role: 'ADMIN', verified: true, createdAt: new Date() }
      ];

      const mockEvents = [
        { id: 'event-1', title: 'Event 1', status: 'PUBLISHED', category: 'education', maxVolunteers: 10, currentVolunteers: 5, createdAt: new Date() },
        { id: 'event-2', title: 'Event 2', status: 'COMPLETED', category: 'healthcare', maxVolunteers: 15, currentVolunteers: 12, createdAt: new Date() }
      ];

      const mockHistory = [
        { id: 'hist-1', volunteerId: 'user-1', eventId: 'event-1', status: 'completed', hoursWorked: 5, participationDate: new Date(), performanceRating: 5 },
        { id: 'hist-2', volunteerId: 'user-1', eventId: 'event-2', status: 'completed', hoursWorked: 3, participationDate: new Date(), performanceRating: 4 }
      ];

      userRepository.findAll.mockResolvedValue(mockUsers);
      eventRepository.findAll.mockResolvedValue({ events: mockEvents });
      historyRepository.findAll.mockResolvedValue(mockHistory);
      userRepository.getProfile.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });

      const response = await request(app).get('/admin/metrics');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.overview).toBeDefined();
      expect(response.body.data.userRegistrationTrend).toBeDefined();
      expect(response.body.data.eventStatusDistribution).toBeDefined();
      expect(response.body.data.categoryMetrics).toBeDefined();
      expect(response.body.data.topVolunteers).toBeDefined();
      expect(response.body.data.ratingDistribution).toBeDefined();
      expect(response.body.data.monthlyHoursTrend).toBeDefined();
    });

    it('should return overview stats with correct structure', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'volunteer1', email: 'vol1@test.com', role: 'VOLUNTEER', verified: true, createdAt: new Date() }
      ];

      const mockEvents = [
        { id: 'event-1', title: 'Event 1', status: 'PUBLISHED', category: 'education', maxVolunteers: 10, currentVolunteers: 5, createdAt: new Date() }
      ];

      const mockHistory = [
        { id: 'hist-1', volunteerId: 'user-1', eventId: 'event-1', status: 'completed', hoursWorked: 5, participationDate: new Date(), performanceRating: 5 }
      ];

      userRepository.findAll.mockResolvedValue(mockUsers);
      eventRepository.findAll.mockResolvedValue({ events: mockEvents });
      historyRepository.findAll.mockResolvedValue(mockHistory);
      userRepository.getProfile.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });

      const response = await request(app).get('/admin/metrics');

      expect(response.body.data.overview).toHaveProperty('totalUsers');
      expect(response.body.data.overview).toHaveProperty('adminUsers');
      expect(response.body.data.overview).toHaveProperty('volunteerUsers');
      expect(response.body.data.overview).toHaveProperty('verifiedUsers');
      expect(response.body.data.overview).toHaveProperty('totalEvents');
      expect(response.body.data.overview).toHaveProperty('totalHoursVolunteered');
      expect(response.body.data.overview).toHaveProperty('attendanceRate');
    });

    it('should return arrays for trend data', async () => {
      const mockUsers = [];
      const mockEvents = [];
      const mockHistory = [];

      userRepository.findAll.mockResolvedValue(mockUsers);
      eventRepository.findAll.mockResolvedValue({ events: mockEvents });
      historyRepository.findAll.mockResolvedValue(mockHistory);

      const response = await request(app).get('/admin/metrics');

      expect(Array.isArray(response.body.data.userRegistrationTrend)).toBe(true);
      expect(Array.isArray(response.body.data.eventStatusDistribution)).toBe(true);
      expect(Array.isArray(response.body.data.topVolunteers)).toBe(true);
      expect(Array.isArray(response.body.data.monthlyHoursTrend)).toBe(true);
    });
  });

  describe('GET /admin/users/:userId/metrics', () => {
    it('should get volunteer metrics successfully', async () => {
      const volunteerId = 'volunteer-1';
      const mockVolunteer = {
        id: volunteerId,
        username: 'testvolunteer',
        email: 'testvolunteer@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date()
      };

      const mockHistory = [
        { id: 'hist-1', volunteerId, eventId: 'event-1', status: 'completed', hoursWorked: 5, participationDate: new Date(), performanceRating: 5 },
        { id: 'hist-2', volunteerId, eventId: 'event-2', status: 'completed', hoursWorked: 3, participationDate: new Date(), performanceRating: 4 }
      ];

      const mockEvent = {
        id: 'event-1',
        title: 'Test Event',
        category: 'education'
      };

      userRepository.findById.mockResolvedValue(mockVolunteer);
      historyRepository.getByVolunteerId.mockResolvedValue(mockHistory);
      eventRepository.findById.mockResolvedValue(mockEvent);

      const response = await request(app).get(`/admin/users/${volunteerId}/metrics`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.volunteer).toBeDefined();
      expect(response.body.data.overview).toBeDefined();
    });

    it('should return volunteer overview stats', async () => {
      const volunteerId = 'volunteer-2';
      const mockVolunteer = {
        id: volunteerId,
        username: 'testvolunteer2',
        email: 'testvolunteer2@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date()
      };

      const mockHistory = [
        { id: 'hist-1', volunteerId, eventId: 'event-1', status: 'completed', hoursWorked: 5, participationDate: new Date(), performanceRating: 5 }
      ];

      userRepository.findById.mockResolvedValue(mockVolunteer);
      historyRepository.getByVolunteerId.mockResolvedValue(mockHistory);
      eventRepository.findById.mockResolvedValue({ id: 'event-1', title: 'Event', category: 'education' });

      const response = await request(app).get(`/admin/users/${volunteerId}/metrics`);

      expect(response.body.data.overview).toHaveProperty('totalEvents');
      expect(response.body.data.overview).toHaveProperty('completedEvents');
      expect(response.body.data.overview).toHaveProperty('upcomingEvents');
      expect(response.body.data.overview).toHaveProperty('totalHours');
      expect(response.body.data.overview).toHaveProperty('attendanceRate');
    });

    it('should return monthly activity data', async () => {
      const volunteerId = 'volunteer-3';
      const mockVolunteer = {
        id: volunteerId,
        username: 'testvolunteer3',
        email: 'testvolunteer3@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date()
      };

      const mockHistory = [
        { id: 'hist-1', volunteerId, eventId: 'event-1', status: 'completed', hoursWorked: 5, participationDate: new Date(), performanceRating: 5 }
      ];

      userRepository.findById.mockResolvedValue(mockVolunteer);
      historyRepository.getByVolunteerId.mockResolvedValue(mockHistory);
      eventRepository.findById.mockResolvedValue({ id: 'event-1', title: 'Event', category: 'education' });

      const response = await request(app).get(`/admin/users/${volunteerId}/metrics`);

      expect(Array.isArray(response.body.data.monthlyActivity)).toBe(true);
      expect(response.body.data.monthlyActivity.length).toBe(6); // Last 6 months
    });

    it('should return rating distribution', async () => {
      const volunteerId = 'volunteer-4';
      const mockVolunteer = {
        id: volunteerId,
        username: 'testvolunteer4',
        email: 'testvolunteer4@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date()
      };

      const mockHistory = [
        { id: 'hist-1', volunteerId, eventId: 'event-1', status: 'completed', hoursWorked: 5, participationDate: new Date(), performanceRating: 5 }
      ];

      userRepository.findById.mockResolvedValue(mockVolunteer);
      historyRepository.getByVolunteerId.mockResolvedValue(mockHistory);
      eventRepository.findById.mockResolvedValue({ id: 'event-1', title: 'Event', category: 'education' });

      const response = await request(app).get(`/admin/users/${volunteerId}/metrics`);

      expect(Array.isArray(response.body.data.ratingDistribution)).toBe(true);
      expect(response.body.data.ratingDistribution.length).toBe(5); // 5 stars
    });

    it('should handle user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const response = await request(app).get('/admin/users/nonexistent_id/metrics');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });

    it('should handle non-volunteer user', async () => {
      const mockAdmin = {
        id: 'admin-test',
        username: 'testadmin',
        email: 'testadmin@example.com',
        role: 'ADMIN',
        verified: true
      };

      userRepository.findById.mockResolvedValue(mockAdmin);

      const response = await request(app).get(`/admin/users/${mockAdmin.id}/metrics`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User is not a volunteer');
    });

    it('should return category breakdown', async () => {
      const volunteerId = 'volunteer-5';
      const mockVolunteer = {
        id: volunteerId,
        username: 'testvolunteer5',
        email: 'testvolunteer5@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date()
      };

      const mockHistory = [
        { id: 'hist-1', volunteerId, eventId: 'event-1', status: 'completed', hoursWorked: 5, participationDate: new Date(), performanceRating: 5 }
      ];

      userRepository.findById.mockResolvedValue(mockVolunteer);
      historyRepository.getByVolunteerId.mockResolvedValue(mockHistory);
      eventRepository.findById.mockResolvedValue({ id: 'event-1', title: 'Event', category: 'education' });

      const response = await request(app).get(`/admin/users/${volunteerId}/metrics`);

      expect(Array.isArray(response.body.data.categoryBreakdown)).toBe(true);
    });

    it('should return recent events', async () => {
      const volunteerId = 'volunteer-6';
      const mockVolunteer = {
        id: volunteerId,
        username: 'testvolunteer6',
        email: 'testvolunteer6@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date()
      };

      const mockHistory = [
        { id: 'hist-1', volunteerId, eventId: 'event-1', status: 'completed', hoursWorked: 5, participationDate: new Date(), performanceRating: 5 }
      ];

      userRepository.findById.mockResolvedValue(mockVolunteer);
      historyRepository.getByVolunteerId.mockResolvedValue(mockHistory);
      eventRepository.findById.mockResolvedValue({ id: 'event-1', title: 'Event', category: 'education' });

      const response = await request(app).get(`/admin/users/${volunteerId}/metrics`);

      expect(Array.isArray(response.body.data.recentEvents)).toBe(true);
      expect(response.body.data.recentEvents.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Error handling', () => {
    it('should handle getAllUsers errors', async () => {
      userRepository.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/admin/users');

      expect(response.status).toBe(500);
    });

    it('should handle getUserById errors', async () => {
      userRepository.findById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/admin/users/user_001');

      expect(response.status).toBe(500);
    });

    it('should handle createUser errors', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/admin/users')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'volunteer'
        });

      expect(response.status).toBe(500);
    });

    it('should handle updateUser errors', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'VOLUNTEER'
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ verified: true });

      expect(response.status).toBe(500);
    });

    it('should handle deleteUser errors', async () => {
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'VOLUNTEER'
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete(`/admin/users/${userId}`);

      expect(response.status).toBe(500);
    });

    it('should handle getMetrics errors', async () => {
      userRepository.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/admin/metrics');

      expect(response.status).toBe(500);
    });

    it('should handle getVolunteerMetrics errors', async () => {
      userRepository.findById.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/admin/users/volunteer-1/metrics');

      expect(response.status).toBe(500);
    });
  });

  describe('Edge cases for getVolunteerMetrics', () => {
    it('should handle volunteer with no events', async () => {
      const volunteerId = 'volunteer-no-history';
      const mockVolunteer = {
        id: volunteerId,
        username: 'nohistory',
        email: 'nohistory@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date()
      };

      userRepository.findById.mockResolvedValue(mockVolunteer);
      historyRepository.getByVolunteerId.mockResolvedValue([]);

      const response = await request(app).get(`/admin/users/${volunteerId}/metrics`);

      expect(response.status).toBe(200);
      expect(response.body.data.overview.totalEvents).toBe(0);
      expect(response.body.data.overview.attendanceRate).toBe(0);
      expect(response.body.data.overview.averageRating).toBeNull();
    });

    it('should calculate metrics for volunteer with events but no event found', async () => {
      const volunteerId = 'volunteer-7';
      const mockVolunteer = {
        id: volunteerId,
        username: 'testvolunteer7',
        email: 'testvolunteer7@example.com',
        role: 'VOLUNTEER',
        verified: true,
        createdAt: new Date()
      };

      const mockHistory = [
        {
          id: 'hist-test',
          volunteerId,
          eventId: 'nonexistent_event',
          status: 'completed',
          hoursWorked: 5,
          participationDate: new Date(),
          performanceRating: 4
        }
      ];

      userRepository.findById.mockResolvedValue(mockVolunteer);
      historyRepository.getByVolunteerId.mockResolvedValue(mockHistory);
      eventRepository.findById.mockResolvedValue(null);

      const response = await request(app).get(`/admin/users/${volunteerId}/metrics`);

      expect(response.status).toBe(200);
      expect(response.body.data.categoryBreakdown).toBeDefined();
    });
  });
});
