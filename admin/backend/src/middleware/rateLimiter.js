const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */

/**
 * General API Rate Limiter
 * Limit: 1000 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window (increased for demo/production usage)
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  // Skip successful requests from counting (optional)
  skipSuccessfulRequests: false,
  // Skip failed requests from counting (optional)
  skipFailedRequests: false
});

/**
 * Authentication Endpoints Rate Limiter
 * Stricter limit for login/register to prevent brute force attacks
 * Limit: 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests (so only failed login attempts count)
  skipSuccessfulRequests: true
});

/**
 * Password Reset Rate Limiter
 * Prevent abuse of password reset functionality
 * Limit: 3 requests per hour per IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    status: 'error',
    message: 'Too many password reset attempts, please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Email Verification Rate Limiter
 * Prevent spam of verification emails
 * Limit: 5 requests per hour per IP
 */
const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: {
    status: 'error',
    message: 'Too many verification email requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Create Event Rate Limiter
 * Prevent spam event creation
 * Limit: 50 events per hour per user
 */
const createEventLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 events per hour (increased for demo purposes)
  message: {
    status: 'error',
    message: 'Too many events created, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  createEventLimiter
};
