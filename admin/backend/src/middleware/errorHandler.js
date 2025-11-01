/**
 * Global Error Handler Middleware
 * Handles all errors in the application and sends appropriate responses
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = 'Validation Error';
    const validationErrors = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, '')
    }));

    return res.status(statusCode).json({
      status: 'error',
      message,
      errors: validationErrors,
      timestamp: new Date().toISOString()
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Custom application errors
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Duplicate key errors (for future database implementation)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Cast errors (for future database implementation)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err
    }),
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;