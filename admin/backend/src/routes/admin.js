const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Admin Routes
 * All routes for admin user management operations
 */

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/users/:userId', adminController.getUserById);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/users', adminController.createUser);

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/users/:userId', adminController.updateUser);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/users/:userId', adminController.deleteUser);

/**
 * @route   GET /api/admin/metrics
 * @desc    Get analytics metrics and statistics
 * @access  Private (Admin only)
 */
router.get('/metrics', adminController.getMetrics);

/**
 * Error handling for admin routes
 */
router.use((error, req, res, next) => {
  console.error('Admin Route Error:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Pass to global error handler
  next(error);
});

module.exports = router;
