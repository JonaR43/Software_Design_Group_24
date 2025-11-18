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
app.post('/profile/create-skill', mockAuth, profileController.createCustomSkill);
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

    it('should handle user not found error', async () => {
      profileService.updateProfile.mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .put('/profile')
        .send({ firstName: 'John' });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('should handle availability validation errors', async () => {
      profileService.updateProfile.mockRejectedValue(new Error('Time must be in HH:MM format'));

      const response = await request(app)
        .put('/profile')
        .send({ availability: [{ dayOfWeek: 1, startTime: 'invalid' }] });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle overlapping time slots error', async () => {
      profileService.updateProfile.mockRejectedValue(new Error('Overlapping time slots'));

      const response = await request(app)
        .put('/profile')
        .send({ availability: [] });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle generic errors', async () => {
      profileService.updateProfile.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/profile')
        .send({ firstName: 'John' });

      expect(response.status).toBe(500);
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

    it('should handle short search query', async () => {
      profileService.searchSkills.mockRejectedValue(new Error('Search query must be at least 2 characters'));

      const response = await request(app)
        .get('/profile/skills/search')
        .query({ q: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Search query must be at least 2 characters');
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

    it('should handle skill validation errors', async () => {
      profileService.addSkills.mockRejectedValue(new Error('Skill not found'));

      const response = await request(app)
        .post('/profile/skills')
        .send({ skills: [{ skillId: 'invalid' }] });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle proficiency errors', async () => {
      profileService.addSkills.mockRejectedValue(new Error('Invalid proficiency level'));

      const response = await request(app)
        .post('/profile/skills')
        .send({ skills: [{ skillId: 'skill_001', proficiency: 'invalid' }] });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
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

    it('should handle dayOfWeek validation errors', async () => {
      profileService.updateAvailability.mockRejectedValue(new Error('dayOfWeek must be between 0 and 6'));

      const response = await request(app)
        .put('/profile/availability')
        .send({ availability: [{ dayOfWeek: 7 }] });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should handle end time validation errors', async () => {
      profileService.updateAvailability.mockRejectedValue(new Error('End time must be after start time'));

      const response = await request(app)
        .put('/profile/availability')
        .send({ availability: [{ dayOfWeek: 1, startTime: '17:00', endTime: '09:00' }] });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
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

    it('should handle invalid start date format', async () => {
      const response = await request(app)
        .get('/profile/availability')
        .query({ start: 'invalid-date' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid start date format');
    });

    it('should handle invalid end date format', async () => {
      const response = await request(app)
        .get('/profile/availability')
        .query({ end: 'invalid-date' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid end date format');
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

    it('should handle skill validation errors', async () => {
      profileService.validateSkills = jest.fn().mockRejectedValue(new Error('Invalid skill ID'));

      const response = await request(app)
        .post('/profile/validate')
        .send({
          skills: [{ skillId: 'invalid', proficiency: 'intermediate' }]
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid skill ID');
    });

    it('should handle availability validation errors', async () => {
      profileService.validateAvailability = jest.fn().mockImplementation(() => {
        throw new Error('Invalid availability format');
      });

      const response = await request(app)
        .post('/profile/validate')
        .send({
          availability: [{ dayOfWeek: 8 }]
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid availability format');
    });
  });

  describe('Error handling for next(error)', () => {
    it('should call next for unexpected errors in getProfile', async () => {
      profileService.getProfile.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/profile');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getAvailableSkills', async () => {
      profileService.getAvailableSkills.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/profile/skills');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in searchSkills', async () => {
      profileService.searchSkills.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/profile/skills/search')
        .query({ q: 'test' });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getProficiencyLevels', async () => {
      profileService.getProficiencyLevels.mockRejectedValue(new Error('Service error'));

      const response = await request(app).get('/profile/proficiency-levels');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in addSkills', async () => {
      profileService.addSkills.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/profile/skills')
        .send({ skills: [{ skillId: 'skill_001' }] });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in removeSkills', async () => {
      profileService.removeSkills.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/profile/skills')
        .send({ skillIds: ['skill_001'] });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in updateAvailability', async () => {
      profileService.updateAvailability.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/profile/availability')
        .send({ availability: [] });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getAvailability', async () => {
      profileService.getAvailability.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/profile/availability');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in updatePreferences', async () => {
      profileService.updatePreferences.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/profile/preferences')
        .send({ maxDistance: 25 });

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getProfileByUserId', async () => {
      profileService.getProfile.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/profile/user/user_002');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in getProfileStats', async () => {
      profileService.getProfileStats.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/profile/stats');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in uploadAvatar', async () => {
      profileService.updateProfile.mockRejectedValue(new Error('Upload error'));

      const response = await request(app).post('/profile/avatar');

      expect(response.status).toBe(500);
    });

    it('should call next for unexpected errors in deleteAvatar', async () => {
      profileService.updateProfile.mockRejectedValue(new Error('Delete error'));

      const response = await request(app).delete('/profile/avatar');

      expect(response.status).toBe(500);
    });
  });
  describe('POST /profile/create-skill', () => {
    it('should return 400 when skill name is missing', async () => {
      const response = await request(app)
        .post('/profile/create-skill')
        .send({ category: 'custom' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Skill name is required');
    });

    it('should return 400 when skill name is empty', async () => {
      const response = await request(app)
        .post('/profile/create-skill')
        .send({ name: '   ', category: 'custom' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Skill name is required');
    });

    it('should return 409 when skill already exists', async () => {
      profileService.createCustomSkill.mockRejectedValue(
        new Error('Skill already exists')
      );

      const response = await request(app)
        .post('/profile/create-skill')
        .send({ name: 'Existing Skill', category: 'custom' });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });

    it('should create custom skill successfully', async () => {
      profileService.createCustomSkill.mockResolvedValue({
        success: true,
        data: { id: 'skill_new', name: 'New Skill' }
      });

      const response = await request(app)
        .post('/profile/create-skill')
        .send({ name: 'New Skill', category: 'custom' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
    });
  });

});
