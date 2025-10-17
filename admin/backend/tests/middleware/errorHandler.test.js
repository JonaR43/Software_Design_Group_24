/**
 * Unit Tests for Error Handler Middleware
 */

const errorHandler = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let consoleErrorSpy;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should handle Joi validation errors', () => {
    const err = {
      isJoi: true,
      details: [
        {
          path: ['email'],
          message: '"email" is required'
        },
        {
          path: ['password'],
          message: '"password" must be at least 6 characters'
        }
      ]
    };

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Validation Error',
        errors: [
          { field: 'email', message: 'email is required' },
          { field: 'password', message: 'password must be at least 6 characters' }
        ]
      })
    );
  });

  it('should handle JsonWebTokenError', () => {
    const err = new Error('jwt malformed');
    err.name = 'JsonWebTokenError';

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Invalid token'
      })
    );
  });

  it('should handle TokenExpiredError', () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Token expired'
      })
    );
  });

  it('should handle custom application errors with statusCode', () => {
    const err = new Error('Resource not found');
    err.statusCode = 404;

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Resource not found'
      })
    );
  });

  it('should handle duplicate key errors (code 11000)', () => {
    const err = new Error('Duplicate key');
    err.code = 11000;

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Duplicate field value entered'
      })
    );
  });

  it('should handle CastError', () => {
    const err = new Error('Cast to ObjectId failed');
    err.name = 'CastError';

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Resource not found'
      })
    );
  });

  it('should handle generic errors with 500 status', () => {
    const err = new Error('Something went wrong');

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Internal Server Error'
      })
    );
  });

  it('should log errors to console', () => {
    const err = new Error('Test error');

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', err);
  });

  it('should include stack trace in development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const err = new Error('Test error');
    err.stack = 'Error: Test error\n    at Test';

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: err.stack,
        originalError: expect.any(Object)
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('should not include stack trace in production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const err = new Error('Test error');

    errorHandler(err, mockReq, mockRes, mockNext);

    const jsonCall = mockRes.json.mock.calls[0][0];
    expect(jsonCall.stack).toBeUndefined();
    expect(jsonCall.originalError).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });

  it('should include timestamp in response', () => {
    const err = new Error('Test error');

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String)
      })
    );
  });
});