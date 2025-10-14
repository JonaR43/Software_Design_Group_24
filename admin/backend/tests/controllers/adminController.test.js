/**
 * Unit Tests for Admin Controller
 */

const request = require('supertest');
const express = require('express');
const adminController = require('../../src/controllers/adminController');
const { userHelpers } = require('../../src/data/users');
const { events } = require('../../src/data/events');
const { volunteerHistory } = require('../../src/data/history');

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
      const response = await request(app).get('/admin/users');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });
  });

  describe('GET /admin/users/:userId', () => {
    it('should get user by ID successfully', async () => {
      const users = userHelpers.getAllUsers();
      const userId = users[0].id;

      const response = await request(app).get(`/admin/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(userId);
    });

    it('should handle user not found', async () => {
      const response = await request(app).get('/admin/users/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /admin/users', () => {
    it('should create user successfully', async () => {
      const newUser = {
        username: 'testuser_' + Date.now(),
        email: `testuser_${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'volunteer'
      };

      const response = await request(app)
        .post('/admin/users')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.username).toBe(newUser.username);
      expect(response.body.data.email).toBe(newUser.email);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/admin/users')
        .send({ username: 'incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle duplicate email', async () => {
      const users = userHelpers.getAllUsers();
      const existingEmail = users[0].email;

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
      const users = userHelpers.getAllUsers();
      const existingUsername = users[0].username;

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
      const users = userHelpers.getAllUsers();
      const userId = users[0].id;

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ verified: true });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(userId);
    });

    it('should handle user not found', async () => {
      const response = await request(app)
        .put('/admin/users/nonexistent_id')
        .send({ verified: true });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should handle duplicate email on update', async () => {
      const users = userHelpers.getAllUsers();
      if (users.length < 2) {
        // Create a second user for testing
        userHelpers.createUser({
          username: 'seconduser',
          email: 'second@example.com',
          password: 'hashed',
          role: 'volunteer',
          verified: true
        });
      }
      const updatedUsers = userHelpers.getAllUsers();
      const userId = updatedUsers[0].id;
      const existingEmail = updatedUsers[1].email;

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ email: existingEmail });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
    });

    it('should handle duplicate username on update', async () => {
      const users = userHelpers.getAllUsers();
      if (users.length < 2) {
        userHelpers.createUser({
          username: 'uniqueuser2',
          email: 'unique2@example.com',
          password: 'hashed',
          role: 'volunteer',
          verified: true
        });
      }
      const updatedUsers = userHelpers.getAllUsers();
      const userId = updatedUsers[0].id;
      const existingUsername = updatedUsers[1].username;

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ username: existingUsername });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Username');
    });

    it('should update user with new password', async () => {
      const users = userHelpers.getAllUsers();
      const userId = users[0].id;

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ password: 'NewPassword123!' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('DELETE /admin/users/:userId', () => {
    it('should delete user successfully', async () => {
      // Create a user to delete
      const newUser = userHelpers.createUser({
        username: 'deleteme_' + Date.now(),
        email: `deleteme_${Date.now()}@example.com`,
        password: 'hashed',
        role: 'volunteer',
        verified: true
      });

      const response = await request(app).delete(`/admin/users/${newUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should handle user not found on delete', async () => {
      const response = await request(app).delete('/admin/users/nonexistent_id');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should prevent deleting own account', async () => {
      // First get the actual admin user id from the mock auth
      const users = userHelpers.getAllUsers();
      const adminUser = users.find(u => u.role === 'admin');

      // If admin_001 doesn't exist, create it or use the existing admin
      let adminId = 'admin_001';
      if (!userHelpers.findById(adminId)) {
        if (adminUser) {
          adminId = adminUser.id;
        } else {
          const newAdmin = userHelpers.createUser({
            username: 'adminuser',
            email: 'admin@example.com',
            password: 'hashed',
            role: 'admin',
            verified: true
          });
          adminId = newAdmin.id;
        }
      }

      // Create a custom app instance with this specific admin ID
      const testApp = express();
      testApp.use(express.json());
      const customAdminAuth = (req, res, next) => {
        req.user = { id: adminId, email: 'admin@example.com', role: 'admin' };
        next();
      };
      testApp.delete('/admin/users/:userId', customAdminAuth, adminController.deleteUser);

      const response = await request(testApp).delete(`/admin/users/${adminId}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('cannot delete your own account');
    });

    it('should handle delete failure', async () => {
      // Create a mock scenario where deleteUser returns false
      jest.spyOn(userHelpers, 'deleteUser').mockReturnValue(false);

      // Create a user
      const testUser = userHelpers.createUser({
        username: 'testfaileddelete',
        email: 'testfaileddelete@example.com',
        password: 'hashed',
        role: 'volunteer',
        verified: true
      });

      jest.spyOn(userHelpers, 'findById').mockReturnValue(testUser);

      const response = await request(app).delete(`/admin/users/${testUser.id}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to delete user');
    });
  });

  describe('GET /admin/metrics', () => {
    it('should get analytics metrics successfully', async () => {
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
      const response = await request(app).get('/admin/metrics');

      expect(Array.isArray(response.body.data.userRegistrationTrend)).toBe(true);
      expect(Array.isArray(response.body.data.eventStatusDistribution)).toBe(true);
      expect(Array.isArray(response.body.data.topVolunteers)).toBe(true);
      expect(Array.isArray(response.body.data.monthlyHoursTrend)).toBe(true);
    });
  });

  describe('GET /admin/users/:userId/metrics', () => {
    it('should get volunteer metrics successfully', async () => {
      // Find a volunteer user
      const users = userHelpers.getAllUsers();
      const volunteer = users.find(u => u.role === 'volunteer');

      if (!volunteer) {
        // Create a volunteer if none exists
        const newVolunteer = userHelpers.createUser({
          username: 'testvolunteer',
          email: 'testvolunteer@example.com',
          password: 'hashed',
          role: 'volunteer',
          verified: true
        });

        const response = await request(app).get(`/admin/users/${newVolunteer.id}/metrics`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toBeDefined();
        expect(response.body.data.volunteer).toBeDefined();
        expect(response.body.data.overview).toBeDefined();
      } else {
        const response = await request(app).get(`/admin/users/${volunteer.id}/metrics`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toBeDefined();
      }
    });

    it('should return volunteer overview stats', async () => {
      const users = userHelpers.getAllUsers();
      let volunteer = users.find(u => u.role === 'volunteer');

      if (!volunteer) {
        volunteer = userHelpers.createUser({
          username: 'testvolunteer2',
          email: 'testvolunteer2@example.com',
          password: 'hashed',
          role: 'volunteer',
          verified: true
        });
      }

      const response = await request(app).get(`/admin/users/${volunteer.id}/metrics`);

      expect(response.body.data.overview).toHaveProperty('totalEvents');
      expect(response.body.data.overview).toHaveProperty('completedEvents');
      expect(response.body.data.overview).toHaveProperty('upcomingEvents');
      expect(response.body.data.overview).toHaveProperty('totalHours');
      expect(response.body.data.overview).toHaveProperty('attendanceRate');
    });

    it('should return monthly activity data', async () => {
      const users = userHelpers.getAllUsers();
      let volunteer = users.find(u => u.role === 'volunteer');

      if (!volunteer) {
        volunteer = userHelpers.createUser({
          username: 'testvolunteer3',
          email: 'testvolunteer3@example.com',
          password: 'hashed',
          role: 'volunteer',
          verified: true
        });
      }

      const response = await request(app).get(`/admin/users/${volunteer.id}/metrics`);

      expect(Array.isArray(response.body.data.monthlyActivity)).toBe(true);
      expect(response.body.data.monthlyActivity.length).toBe(6); // Last 6 months
    });

    it('should return rating distribution', async () => {
      const users = userHelpers.getAllUsers();
      let volunteer = users.find(u => u.role === 'volunteer');

      if (!volunteer) {
        volunteer = userHelpers.createUser({
          username: 'testvolunteer4',
          email: 'testvolunteer4@example.com',
          password: 'hashed',
          role: 'volunteer',
          verified: true
        });
      }

      const response = await request(app).get(`/admin/users/${volunteer.id}/metrics`);

      expect(Array.isArray(response.body.data.ratingDistribution)).toBe(true);
      expect(response.body.data.ratingDistribution.length).toBe(5); // 5 stars
    });

    it('should handle user not found', async () => {
      // Mock userHelpers.findById to return null for nonexistent users
      const originalFindById = userHelpers.findById;
      userHelpers.findById = jest.fn((id) => {
        if (id.startsWith('nonexistent_')) return null;
        return originalFindById(id);
      });

      const nonExistentId = 'nonexistent_' + Date.now();
      const response = await request(app).get(`/admin/users/${nonExistentId}/metrics`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');

      // Restore original function
      userHelpers.findById = originalFindById;
    });

    it('should handle non-volunteer user', async () => {
      // Mock findById to return an admin user
      const mockAdmin = {
        id: 'admin_test_' + Date.now(),
        username: 'testadmin',
        email: 'testadmin@example.com',
        role: 'admin',
        verified: true
      };

      const originalFindById = userHelpers.findById;
      userHelpers.findById = jest.fn((id) => {
        if (id === mockAdmin.id) return mockAdmin;
        return originalFindById(id);
      });

      const response = await request(app).get(`/admin/users/${mockAdmin.id}/metrics`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User is not a volunteer');

      // Restore original function
      userHelpers.findById = originalFindById;
    });

    it('should return category breakdown', async () => {
      const users = userHelpers.getAllUsers();
      let volunteer = users.find(u => u.role === 'volunteer');

      if (!volunteer) {
        volunteer = userHelpers.createUser({
          username: 'testvolunteer5',
          email: 'testvolunteer5@example.com',
          password: 'hashed',
          role: 'volunteer',
          verified: true
        });
      }

      const response = await request(app).get(`/admin/users/${volunteer.id}/metrics`);

      expect(Array.isArray(response.body.data.categoryBreakdown)).toBe(true);
    });

    it('should return recent events', async () => {
      const users = userHelpers.getAllUsers();
      let volunteer = users.find(u => u.role === 'volunteer');

      if (!volunteer) {
        volunteer = userHelpers.createUser({
          username: 'testvolunteer6',
          email: 'testvolunteer6@example.com',
          password: 'hashed',
          role: 'volunteer',
          verified: true
        });
      }

      const response = await request(app).get(`/admin/users/${volunteer.id}/metrics`);

      expect(Array.isArray(response.body.data.recentEvents)).toBe(true);
      expect(response.body.data.recentEvents.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Error handling', () => {
    it('should handle getAllUsers errors', async () => {
      const originalGetAllUsers = userHelpers.getAllUsers;
      userHelpers.getAllUsers = jest.fn(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/admin/users');

      expect(response.status).toBe(500);

      userHelpers.getAllUsers = originalGetAllUsers;
    });

    it('should handle getUserById errors', async () => {
      const originalFindById = userHelpers.findById;
      userHelpers.findById = jest.fn(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/admin/users/user_001');

      expect(response.status).toBe(500);

      userHelpers.findById = originalFindById;
    });

    it('should handle createUser errors', async () => {
      const originalCreateUser = userHelpers.createUser;
      userHelpers.createUser = jest.fn(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/admin/users')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'volunteer'
        });

      expect(response.status).toBe(500);

      userHelpers.createUser = originalCreateUser;
    });

    it('should handle updateUser errors', async () => {
      const users = userHelpers.getAllUsers();
      const userId = users[0].id;

      const originalUpdateUser = userHelpers.updateUser;
      userHelpers.updateUser = jest.fn(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .put(`/admin/users/${userId}`)
        .send({ verified: true });

      expect(response.status).toBe(500);

      userHelpers.updateUser = originalUpdateUser;
    });

    it('should handle deleteUser errors', async () => {
      const users = userHelpers.getAllUsers();
      const userId = users[0].id;

      const originalDeleteUser = userHelpers.deleteUser;
      userHelpers.deleteUser = jest.fn(() => {
        throw new Error('Database error');
      });

      const response = await request(app).delete(`/admin/users/${userId}`);

      expect(response.status).toBe(500);

      userHelpers.deleteUser = originalDeleteUser;
    });

    it('should handle getMetrics errors', async () => {
      const originalGetAllUsers = userHelpers.getAllUsers;
      userHelpers.getAllUsers = jest.fn(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/admin/metrics');

      expect(response.status).toBe(500);

      userHelpers.getAllUsers = originalGetAllUsers;
    });

    it('should handle getVolunteerMetrics errors', async () => {
      const users = userHelpers.getAllUsers();
      const volunteer = users.find(u => u.role === 'volunteer');
      const userId = volunteer ? volunteer.id : 'user_001';

      const originalFindById = userHelpers.findById;
      userHelpers.findById = jest.fn(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get(`/admin/users/${userId}/metrics`);

      expect(response.status).toBe(500);

      userHelpers.findById = originalFindById;
    });
  });

  describe('Edge cases for getVolunteerMetrics', () => {
    it('should handle volunteer with no events', async () => {
      // Create a volunteer with no history
      const newVolunteer = userHelpers.createUser({
        username: 'nohistory_' + Date.now(),
        email: `nohistory_${Date.now()}@example.com`,
        password: 'hashed',
        role: 'volunteer',
        verified: true
      });

      const response = await request(app).get(`/admin/users/${newVolunteer.id}/metrics`);

      expect(response.status).toBe(200);
      expect(response.body.data.overview.totalEvents).toBe(0);
      expect(response.body.data.overview.attendanceRate).toBe(0);
      expect(response.body.data.overview.averageRating).toBeNull();
    });

    it('should calculate metrics for volunteer with events but no event found', async () => {
      const users = userHelpers.getAllUsers();
      let volunteer = users.find(u => u.role === 'volunteer');

      if (!volunteer) {
        volunteer = userHelpers.createUser({
          username: 'testvolunteer7',
          email: 'testvolunteer7@example.com',
          password: 'hashed',
          role: 'volunteer',
          verified: true
        });
      }

      // Mock volunteerHistory to have a participation with non-existent event
      const originalHistory = [...volunteerHistory];
      volunteerHistory.push({
        id: 'hist_test_' + Date.now(),
        volunteerId: volunteer.id,
        eventId: 'nonexistent_event',
        status: 'completed',
        hoursWorked: 5,
        participationDate: new Date(),
        performanceRating: 4
      });

      const response = await request(app).get(`/admin/users/${volunteer.id}/metrics`);

      expect(response.status).toBe(200);
      expect(response.body.data.categoryBreakdown).toBeDefined();

      // Cleanup
      volunteerHistory.length = originalHistory.length;
      originalHistory.forEach((item, i) => volunteerHistory[i] = item);
    });
  });
});
