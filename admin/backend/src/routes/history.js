const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const auth = require('../middleware/auth');
const { validateHistoryRecord, validateHistoryUpdate } = require('../middleware/validation');

// Public metadata endpoint
router.get('/metadata', historyController.getMetadata);

// Volunteer self-service endpoints (require authentication)
router.get('/my-history', auth.authenticate, historyController.getMyHistory);
router.get('/my-stats', auth.authenticate, historyController.getMyStats);
router.get('/my-performance', auth.authenticate, historyController.getMyPerformance);

// Admin endpoints for managing all volunteer history
router.get('/admin/all-stats', auth.authenticate, historyController.getAllVolunteerStats);
router.get('/admin/dashboard', auth.authenticate, historyController.getDashboardStats);
router.post('/record', auth.authenticate, validateHistoryRecord, historyController.recordParticipation);

// Specific volunteer endpoints (admin or self-access)
router.get('/volunteer/:volunteerId', auth.authenticate, historyController.getVolunteerHistory);
router.get('/stats/:volunteerId', auth.authenticate, historyController.getVolunteerStats);
router.get('/performance/:volunteerId', auth.authenticate, historyController.getPerformanceMetrics);

// Event history endpoints (admin only)
router.get('/event/:eventId', auth.authenticate, historyController.getEventHistory);

// Update history record (admin only)
router.put('/:historyId', auth.authenticate, validateHistoryUpdate, historyController.updateHistoryRecord);

module.exports = router;