
const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportingController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/volunteers', reportingController.getVolunteerReport);
router.get('/events', reportingController.getEventReport);

module.exports = router;
