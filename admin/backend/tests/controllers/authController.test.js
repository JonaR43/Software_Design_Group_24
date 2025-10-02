/**
 * Unit Tests for Auth Controller  
 */

const request = require('supertest');
const express = require('express');
const authController = require('../../src/controllers/authController');

jest.mock('../../src/services/authService');
const authService = require('../../src/services/authService');

const app = express();
app.use(express.json());

const mockAuth = (req, res, next) => {
  req.user = { id: 'user_001', email: 'test@example.com' };
  next();
};

app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.get('/auth/profile', mockAuth, authController.getCurrentUser);
app.get('/auth/verify', authController.verifyToken);

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register user successfully', async () => {
      const mockResponse = {
        message: 'User registered successfully',
        data: { userId: 'user_new', token: 'jwt-token' }
      };

      authService.register.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          username: 'newuser',
          role: 'volunteer'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    });

    it('should handle registration errors', async () => {
      authService.register.mockRejectedValue(new Error('Email already exists'));

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'existing@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        message: 'Login successful',
        data: { token: 'jwt-token', user: { id: 'user_001' } }
      };

      authService.login.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should handle invalid credentials', async () => {
      authService.login.mockRejectedValue(new Error('Invalid email or password'));

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    it('should handle missing credentials', async () => {
      authService.login.mockRejectedValue(new Error('Email and password are required'));

      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(500);
    });
  });

  describe('GET /auth/profile', () => {
    it('should get current user successfully', async () => {
      const mockResponse = {
        data: { id: 'user_001', email: 'test@example.com' }
      };

      authService.getUserProfile.mockResolvedValue(mockResponse);

      const response = await request(app).get('/auth/profile');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify token successfully', async () => {
      const mockResponse = {
        data: { valid: true, user: { id: 'user_001' } }
      };

      authService.verifyToken.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should handle missing token', async () => {
      const response = await request(app).get('/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No token provided');
    });

    it('should handle invalid token', async () => {
      authService.verifyToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /auth/change-password', () => {
    beforeEach(() => {
      app.post('/auth/change-password', mockAuth, authController.changePassword);
    });

    it('should change password successfully', async () => {
      const mockResponse = {
        message: 'Password changed successfully'
      };

      authService.changePassword.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/change-password')
        .send({
          currentPassword: 'Pass@word123',
          newPassword: 'NewPass@word456'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should handle incorrect current password', async () => {
      authService.changePassword.mockRejectedValue(new Error('Current password is incorrect'));

      const response = await request(app)
        .post('/auth/change-password')
        .send({
          currentPassword: 'wrong',
          newPassword: 'NewPass@word456'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /auth/logout', () => {
    beforeEach(() => {
      app.post('/auth/logout', mockAuth, authController.logout);
    });

    it('should logout successfully', async () => {
      const mockResponse = {
        message: 'Logged out successfully'
      };

      authService.logout.mockResolvedValue(mockResponse);

      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /auth/stats', () => {
    beforeEach(() => {
      const mockAdminAuth = (req, res, next) => {
        req.user = { id: 'admin_001', role: 'admin' };
        next();
      };
      app.get('/auth/stats', mockAdminAuth, authController.getAuthStats);
    });

    it('should get auth statistics', async () => {
      const mockStats = {
        data: {
          totalUsers: 100,
          activeUsers: 80,
          adminUsers: 5,
          volunteerUsers: 95
        }
      };

      authService.getAuthStats = jest.fn().mockReturnValue(mockStats);

      const response = await request(app).get('/auth/stats');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('POST /auth/refresh', () => {
    beforeEach(() => {
      app.post('/auth/refresh', mockAuth, authController.refreshToken);
    });

    it('should refresh token successfully', async () => {
      authService.generateToken = jest.fn().mockReturnValue('new-token');

      const response = await request(app).post('/auth/refresh');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBe('new-token');
    });
  });

  describe('POST /auth/validate-registration', () => {
    beforeEach(() => {
      app.post('/auth/validate-registration', authController.validateRegistration);
    });

    it('should validate registration data successfully', async () => {
      authService.validateRegistrationData = jest.fn().mockReturnValue([]);

      const response = await request(app)
        .post('/auth/validate-registration')
        .send({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'Pass@word123'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should return validation errors', async () => {
      authService.validateRegistrationData = jest.fn().mockReturnValue([
        'Password is too weak',
        'Email is invalid'
      ]);

      const response = await request(app)
        .post('/auth/validate-registration')
        .send({
          username: 'johndoe',
          email: 'invalid',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toHaveLength(2);
    });
  });

  describe('POST /auth/check-email', () => {
    beforeEach(() => {
      app.post('/auth/check-email', authController.checkEmailAvailability);
    });

    it('should check email availability - available', async () => {
      const response = await request(app)
        .post('/auth/check-email')
        .send({ email: 'newuser@example.com' });

      expect(response.status).toBe(200);
    });

    it('should require email parameter', async () => {
      const response = await request(app)
        .post('/auth/check-email')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is required');
    });
  });

  describe('POST /auth/check-username', () => {
    beforeEach(() => {
      app.post('/auth/check-username', authController.checkUsernameAvailability);
    });

    it('should check username availability', async () => {
      const response = await request(app)
        .post('/auth/check-username')
        .send({ username: 'newuser' });

      expect(response.status).toBe(200);
    });

    it('should require username parameter', async () => {
      const response = await request(app)
        .post('/auth/check-username')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username is required');
    });
  });
});
