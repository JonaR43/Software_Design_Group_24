/**
 * Unit Tests for History Controller
 */

const request = require('supertest');
const express = require('express');
const historyController = require('../../src/controllers/historyController');

jest.mock('../../src/services/historyService');
const historyService = require('../../src/services/historyService');

const app = express();
app.use(express.json());

const mockVolunteerAuth = (req, res, next) => {
  req.user = { id: 'user_001', role: 'volunteer' };
  next();
};

const mockAdminAuth = (req, res, next) => {
  req.user = { id: 'admin_001', role: 'admin' };
  next();
};

// Order matters - specific routes before parameterized routes
app.get('/history/my/history', mockVolunteerAuth, historyController.getMyHistory);
app.get('/history/my/stats', mockVolunteerAuth, historyController.getMyStats);
app.get('/history/my/performance', mockVolunteerAuth, historyController.getMyPerformance);
app.get('/history/all/stats', mockAdminAuth, historyController.getAllVolunteerStats);
app.get('/history/dashboard/stats', mockAdminAuth, historyController.getDashboardStats);
app.get('/history/metadata', mockVolunteerAuth, historyController.getMetadata);
app.get('/history/event/:eventId', mockAdminAuth, historyController.getEventHistory);
app.post('/history/record', mockAdminAuth, historyController.recordParticipation);
app.put('/history/:recordId', mockAdminAuth, historyController.updateHistoryRecord);
app.get('/history/:volunteerId/stats', mockVolunteerAuth, historyController.getVolunteerStats);
app.get('/history/:volunteerId/performance', mockAdminAuth, historyController.getPerformanceMetrics);
app.get('/history/:volunteerId', mockVolunteerAuth, historyController.getVolunteerHistory);

describe('HistoryController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /history/:volunteerId', () => {
    it('should get volunteer history successfully', async () => {
      const mockResponse = {
        data: { history: [], pagination: {} }
      };
      historyService.getVolunteerHistory.mockResolvedValue(mockResponse);

      const response = await request(app).get('/history/user_001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny volunteer viewing other history', async () => {
      const response = await request(app).get('/history/user_002');

      expect(response.status).toBe(403);
    });
  });

  describe('GET /history/my/history', () => {
    it('should get current user history', async () => {
      const mockResponse = { data: { history: [], pagination: {} } };
      historyService.getMyHistory.mockResolvedValue(mockResponse);

      const response = await request(app).get('/history/my/history');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /history/record', () => {
    it('should record participation', async () => {
      const mockResponse = { data: { id: 'hist_new' } };
      historyService.recordParticipation.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/history/record')
        .send({ volunteerId: 'user_001', eventId: 'event_001' });

      expect(response.status).toBe(201);
    });
  });

  describe('PUT /history/:recordId', () => {
    it('should update history record', async () => {
      const mockResponse = { data: { id: 'hist_001' } };
      historyService.updateHistoryRecord.mockResolvedValue(mockResponse);

      const response = await request(app)
        .put('/history/hist_001')
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /history/:volunteerId/stats', () => {
    it('should get volunteer stats', async () => {
      const mockResponse = { data: { totalEvents: 10 } };
      historyService.getVolunteerStats.mockResolvedValue(mockResponse);

      const response = await request(app).get('/history/user_001/stats');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /history/my/stats', () => {
    it('should get current user stats', async () => {
      const mockResponse = { data: { totalEvents: 5 } };
      historyService.getVolunteerStats.mockResolvedValue(mockResponse);

      const response = await request(app).get('/history/my/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(historyService.getVolunteerStats).toHaveBeenCalledWith('user_001');
    });
  });

  describe('GET /history/:volunteerId/performance', () => {
    it('should get performance metrics', async () => {
      const mockResponse = { data: { completionRate: 95 } };
      historyService.getPerformanceMetrics.mockResolvedValue(mockResponse);

      const response = await request(app).get('/history/user_001/performance');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /history/my/performance', () => {
    it('should get current user performance', async () => {
      const mockResponse = { data: { completionRate: 90 } };
      historyService.getPerformanceMetrics.mockResolvedValue(mockResponse);

      const response = await request(app).get('/history/my/performance');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(historyService.getPerformanceMetrics).toHaveBeenCalledWith('user_001', undefined);
    });
  });

  describe('GET /history/all/stats', () => {
    it('should get all volunteer stats', async () => {
      const mockResponse = { data: { volunteers: [] } };
      historyService.getAllVolunteerStats.mockResolvedValue(mockResponse);

      const response = await request(app).get('/history/all/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(historyService.getAllVolunteerStats).toHaveBeenCalledWith({ sortBy: undefined });
    });
  });

  describe('GET /history/event/:eventId', () => {
    it('should get event history', async () => {
      const mockResponse = { data: { eventId: 'event_001' } };
      historyService.getEventHistory.mockResolvedValue(mockResponse);

      const response = await request(app).get('/history/event/event_001');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /history/dashboard/stats', () => {
    it('should get dashboard stats', async () => {
      const mockResponse = { data: { totalVolunteers: 50 } };
      historyService.getDashboardStats.mockResolvedValue(mockResponse);

      const response = await request(app).get('/history/dashboard/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(historyService.getDashboardStats).toHaveBeenCalled();
    });
  });

  describe('GET /history/metadata', () => {
    it('should get metadata', async () => {
      const response = await request(app).get('/history/metadata');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('participationStatuses');
      expect(response.body.data).toHaveProperty('attendanceTypes');
    });
  });
});
