/**
 * Unit Tests for Profile Controller
 */

const request = require('supertest');
const express = require('express');
const profileController = require('../../src/controllers/profileController');

// Mock the profile service
jest.mock('../../src/services/profileService');
const profileService = require('../../src/services/profileService');

const app = express();
app.use(express.json());

// Setup routes with mock middleware for authentication
const mockAuth = (req, res, next) => {
  req.user = { id: 'user_001', role: 'volunteer' };
  next();
};

const mockAdminAuth = (req, res, next) => {
  req.user = { id: 'admin_001', role: 'admin' };
  next();
};

app.get('/profile', mockAuth, profileController.getProfile);
app.put('/profile', mockAuth, profileController.updateProfile);
app.get('/profile/skills', mockAuth, profileController.getAvailableSkills);
app.get('/profile/skills/search', mockAuth, profileController.searchSkills);
app.get('/profile/proficiency-levels', mockAuth, profileController.getProficiencyLevels);
app.post('/profile/skills', mockAuth, profileController.addSkills);
app.delete('/profile/skills', mockAuth, profileController.removeSkills);
app.put('/profile/availability', mockAuth, profileController.updateAvailability);
app.get('/profile/availability', mockAuth, profileController.getAvailability);
app.put('/profile/preferences', mockAuth, profileController.updatePreferences);
app.get('/profile/user/:userId', mockAdminAuth, profileController.getProfileByUserId);
app.get('/profile/stats', mockAuth, profileController.getProfileStats);
app.post('/profile/avatar', mockAuth, profileController.uploadAvatar);
app.delete('/profile/avatar', mockAuth, profileController.deleteAvatar);
app.post('/profile/validate', mockAuth, profileController.validateProfile);

describe('ProfileController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /profile', () => {
    it('should get current user profile successfully', async () => {
      const mockProfile = {
        data: {
          userId: 'user_001',
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      profileService.getProfile.mockResolvedValue(mockProfile);

      const response = await request(app).get('/profile');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(profileService.getProfile).toHaveBeenCalledWith('user_001');
    });

    it('should handle profile not found', async () => {
      profileService.getProfile.mockRejectedValue(new Error('Profile not found'));

      const response = await request(app).get('/profile');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Profile not found');
    });
  });

  describe('PUT /profile', () => {
    it('should update profile successfully', async () => {
      const mockResponse = {
        data: { userId: 'user_001', firstName: 'John' }
      };

      profileService.updateProfile.mockResolvedValue(mockResponse);

      const response = await request(app)
        .put('/profile')
        .send({ firstName: 'John' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
    });

    it('should handle validation errors', async () => {
      profileService.updateProfile.mockRejectedValue(new Error('Skill proficiency level is invalid'));

      const response = await request(app)
        .put('/profile')
        .send({ skills: [{ skillId: 'skill_001', proficiency: 'invalid' }] });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /profile/skills', () => {
    it('should get available skills successfully', async () => {
      const mockResponse = {
        data: { skills: [{ id: 'skill_001', name: 'First Aid' }] }
      };

      profileService.getAvailableSkills.mockResolvedValue(mockResponse);

      const response = await request(app).get('/profile/skills');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /profile/skills/search', () => {
    it('should search skills successfully', async () => {
      const mockResponse = {
        data: { results: [{ id: 'skill_001', name: 'First Aid' }] }
      };

      profileService.searchSkills.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/profile/skills/search')
        .query({ q: 'first' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(profileService.searchSkills).toHaveBeenCalledWith('first');
    });

    it('should require search query', async () => {
      const response = await request(app).get('/profile/skills/search');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Search query (q) is required');
    });
  });

  describe('GET /profile/proficiency-levels', () => {
    it('should get proficiency levels successfully', async () => {
      const mockResponse = {
        data: { levels: ['beginner', 'intermediate'] }
      };

      profileService.getProficiencyLevels.mockResolvedValue(mockResponse);

      const response = await request(app).get('/profile/proficiency-levels');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /profile/skills', () => {
    it('should add skills successfully', async () => {
      const mockResponse = {
        data: { skills: [{ skillId: 'skill_001' }] }
      };

      profileService.addSkills.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/profile/skills')
        .send({ skills: [{ skillId: 'skill_001' }] });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Skills added successfully');
    });

    it('should require skills array', async () => {
      const response = await request(app)
        .post('/profile/skills')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /profile/skills', () => {
    it('should remove skills successfully', async () => {
      const mockResponse = {
        data: { removedSkills: ['skill_001'] }
      };

      profileService.removeSkills.mockResolvedValue(mockResponse);

      const response = await request(app)
        .delete('/profile/skills')
        .send({ skillIds: ['skill_001'] });

      expect(response.status).toBe(200);
    });

    it('should require skillIds array', async () => {
      const response = await request(app)
        .delete('/profile/skills')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /profile/availability', () => {
    it('should update availability successfully', async () => {
      const mockResponse = {
        data: { availability: [] }
      };

      profileService.updateAvailability.mockResolvedValue(mockResponse);

      const response = await request(app)
        .put('/profile/availability')
        .send({ availability: [] });

      expect(response.status).toBe(200);
    });

    it('should require availability array', async () => {
      const response = await request(app)
        .put('/profile/availability')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /profile/availability', () => {
    it('should get availability successfully', async () => {
      const mockResponse = {
        data: { availability: [] }
      };

      profileService.getAvailability.mockResolvedValue(mockResponse);

      const response = await request(app).get('/profile/availability');

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /profile/preferences', () => {
    it('should update preferences successfully', async () => {
      const mockResponse = {
        data: { preferences: {} }
      };

      profileService.updatePreferences.mockResolvedValue(mockResponse);

      const response = await request(app)
        .put('/profile/preferences')
        .send({ maxDistance: 25 });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /profile/user/:userId', () => {
    it('should get profile by user ID', async () => {
      const mockResponse = {
        data: { userId: 'user_002', firstName: 'Jane', lastName: 'Doe' }
      };

      profileService.getProfile.mockResolvedValue(mockResponse);

      const response = await request(app).get('/profile/user/user_002');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(profileService.getProfile).toHaveBeenCalledWith('user_002');
    });
  });

  describe('GET /profile/stats', () => {
    it('should get profile statistics', async () => {
      const mockResponse = {
        data: { profileCompletion: 85 }
      };

      profileService.getProfileStats.mockResolvedValue(mockResponse);

      const response = await request(app).get('/profile/stats');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /profile/avatar', () => {
    it('should upload avatar successfully', async () => {
      const mockResponse = {
        data: { userId: 'user_001', profilePicture: 'https://example.com/avatars/user_001.jpg' }
      };

      profileService.updateProfile.mockResolvedValue(mockResponse);

      const response = await request(app).post('/profile/avatar');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Profile picture uploaded successfully');
    });
  });

  describe('DELETE /profile/avatar', () => {
    it('should delete avatar successfully', async () => {
      const mockResponse = {
        data: { userId: 'user_001', profilePicture: null }
      };

      profileService.updateProfile.mockResolvedValue(mockResponse);

      const response = await request(app).delete('/profile/avatar');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Profile picture deleted successfully');
    });
  });

  describe('POST /profile/validate', () => {
    it('should validate profile successfully', async () => {
      profileService.validateSkills = jest.fn().mockResolvedValue(true);
      profileService.validateAvailability = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/profile/validate')
        .send({
          skills: [{ skillId: 'skill_001', proficiency: 'intermediate' }],
          availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });
});
