/**
 * Unit Tests for Auth Middleware
 */

const jwt = require('jsonwebtoken');
const { authenticate, authorize, optionalAuth } = require('../../src/middleware/auth');
const { users } = require('../../src/data/users');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/data/users', () => ({
  users: [
    {
      id: 'user_001',
      username: 'volunteer1',
      email: 'volunteer1@example.com',
      role: 'volunteer'
    },
    {
      id: 'admin_001',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    }
  ]
}));

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token successfully', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'user_001' });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe('user_001');
      expect(mockReq.user.email).toBe('volunteer1@example.com');
      expect(mockReq.user.role).toBe('volunteer');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should handle missing authorization header', async () => {
      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No token provided or invalid format'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle invalid authorization format', async () => {
      mockReq.headers.authorization = 'InvalidFormat token';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No token provided or invalid format'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle expired token', async () => {
      mockReq.headers.authorization = 'Bearer expired-token';
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Token expired'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'nonexistent' });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Authentication error'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should allow user with correct role', () => {
      mockReq.user = { id: 'admin_001', role: 'admin' };
      const middleware = authorize('admin');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow user with one of multiple allowed roles', () => {
      mockReq.user = { id: 'user_001', role: 'volunteer' };
      const middleware = authorize('admin', 'volunteer');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny user without required role', () => {
      mockReq.user = { id: 'user_001', role: 'volunteer' };
      const middleware = authorize('admin');

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny request without user (not authenticated)', () => {
      const middleware = authorize('admin');

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should set user when valid token provided', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'user_001' });

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe('user_001');
      expect(mockReq.user.email).toBe('volunteer1@example.com');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should continue without user when no token provided', async () => {
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should continue without user when invalid token provided', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should not set user when user not found for token', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'nonexistent' });

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should continue without user when authorization header has invalid format', async () => {
      mockReq.headers.authorization = 'InvalidFormat token';

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});