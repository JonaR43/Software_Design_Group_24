/**
 * Unit Tests for Profile Service
 * Updated to mock Prisma repositories
 */

const profileService = require('../../src/services/profileService');
const userRepository = require('../../src/database/repositories/userRepository');
const skillRepository = require('../../src/database/repositories/skillRepository');

// Mock dependencies
jest.mock('../../src/database/repositories/userRepository');
jest.mock('../../src/database/repositories/skillRepository');

describe('ProfileService', () => {
  const mockUser = {
    id: 'user_002',
    username: 'johnsmith',
    email: 'john.smith@email.com',
    role: 'volunteer'
  };

  const mockProfile = global.testUtils.generateTestProfile({
    userId: 'user_002'
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository.findById.mockResolvedValue(mockUser);
    // Return a fresh copy each time to avoid mutation issues
    userRepository.getProfile.mockResolvedValue({ ...mockProfile });
    userRepository.updateProfile.mockResolvedValue({ ...mockProfile });
    userRepository.getAllProfiles.mockResolvedValue([]);
    userRepository.deleteProfile.mockResolvedValue(true);
  });

  describe('getCurrentUserProfile', () => {
    it('should get current user profile successfully', async () => {
      const result = await profileService.getProfile('user_002');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('profile');
      expect(result.data.profile.userId).toBe('user_002');
    });

    it('should reject request for non-existent user', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(profileService.getProfile('non-existent'))
        .rejects.toThrow('User not found');
    });

    it('should handle user without profile', async () => {
      userRepository.getProfile.mockResolvedValue(null);

      const result = await profileService.getProfile('user_002');

      expect(result.success).toBe(true);
      expect(result.data.profile).toBeNull();
    });
  });

  describe('updateProfile', () => {
    const validProfileData = {
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-0123',
      address: '123 Main St',
      city: 'Houston',
      state: 'Texas',
      zipCode: '77001',
      bio: 'Experienced volunteer',
      skills: [
        { skillId: 'skill_001', proficiency: 'intermediate' }
      ],
      availability: [
        {
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true
        }
      ],
      preferences: {
        causes: ['community'],
        maxDistance: 25,
        weekdaysOnly: false
      }
    };

    it('should update profile successfully', async () => {
      const updatedProfile = {
        ...mockProfile,
        ...validProfileData,
        skills: validProfileData.skills.map(s => ({
          skillId: s.skillId,
          proficiency: s.proficiency,
          skill: { id: s.skillId, name: 'Test Skill' }
        }))
      };

      userRepository.updateProfile.mockResolvedValue(updatedProfile);
      userRepository.getProfile.mockResolvedValueOnce({ ...mockProfile }).mockResolvedValueOnce(updatedProfile);
      userRepository.removeSkills.mockResolvedValue();
      userRepository.addSkills.mockResolvedValue();
      userRepository.updateAvailability.mockResolvedValue();
      skillRepository.findById.mockResolvedValue({ id: 'skill_001', name: 'Test Skill' });

      const result = await profileService.updateProfile('user_002', validProfileData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Profile updated successfully');
      expect(result.data.profile.firstName).toBe(validProfileData.firstName);
    });

    it('should reject update for non-existent user', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(profileService.updateProfile('non-existent', validProfileData))
        .rejects.toThrow('User not found');
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        firstName: 'John'
        // Missing required fields
      };

      await expect(profileService.updateProfile('user_002', incompleteData))
        .rejects.toThrow('Missing required fields');
    });

    it('should validate phone number format', async () => {
      const invalidPhoneData = { ...validProfileData, phone: 'invalid-phone' };

      await expect(profileService.updateProfile('user_002', invalidPhoneData))
        .rejects.toThrow('Invalid phone number format');
    });

    it('should validate zip code format', async () => {
      const invalidZipData = { ...validProfileData, zipCode: 'invalid-zip' };

      await expect(profileService.updateProfile('user_002', invalidZipData))
        .rejects.toThrow('Invalid ZIP code format');
    });

    it('should handle update failure', async () => {
      userRepository.getProfile.mockResolvedValue({ ...mockProfile });
      userRepository.updateProfile.mockResolvedValue(null);

      await expect(profileService.updateProfile('user_002', validProfileData))
        .rejects.toThrow('Failed to update profile');
    });

    it('should validate skills array', async () => {
      const invalidSkillsData = {
        ...validProfileData,
        skills: [{ skillId: 'invalid_skill', proficiency: 'expert' }]
      };

      userRepository.getProfile.mockResolvedValue({ ...mockProfile });
      skillRepository.findById.mockResolvedValue(null);

      await expect(profileService.updateProfile('user_002', invalidSkillsData))
        .rejects.toThrow('Invalid skill ID');
    });

    it('should validate availability time slots', async () => {
      const invalidAvailabilityData = {
        ...validProfileData,
        availability: [
          {
            dayOfWeek: 8, // Invalid day of week
            startTime: '09:00',
            endTime: '17:00'
          }
        ]
      };

      userRepository.getProfile.mockResolvedValue({ ...mockProfile });
      skillRepository.findById.mockResolvedValue({ id: 'skill_001', name: 'Test Skill' });

      await expect(profileService.updateProfile('user_002', invalidAvailabilityData))
        .rejects.toThrow('Invalid day of week');
    });

    it('should validate time range (start before end)', async () => {
      const invalidTimeData = {
        ...validProfileData,
        availability: [
          {
            dayOfWeek: 1,
            startTime: '17:00',
            endTime: '09:00' // End before start
          }
        ]
      };

      userRepository.getProfile.mockResolvedValue({ ...mockProfile });
      skillRepository.findById.mockResolvedValue({ id: 'skill_001', name: 'Test Skill' });

      await expect(profileService.updateProfile('user_002', invalidTimeData))
        .rejects.toThrow('End time must be after start time');
    });

    it('should calculate profile completion percentage', async () => {
      const updatedProfile = {
        ...mockProfile,
        ...validProfileData,
        skills: validProfileData.skills.map(s => ({
          skillId: s.skillId,
          proficiency: s.proficiency,
          skill: { id: s.skillId, name: 'Test Skill' }
        }))
      };

      userRepository.updateProfile.mockResolvedValue(updatedProfile);
      userRepository.getProfile.mockResolvedValueOnce({ ...mockProfile }).mockResolvedValueOnce(updatedProfile);
      userRepository.removeSkills.mockResolvedValue();
      userRepository.addSkills.mockResolvedValue();
      userRepository.updateAvailability.mockResolvedValue();
      skillRepository.findById.mockResolvedValue({ id: 'skill_001', name: 'Test Skill' });

      const result = await profileService.updateProfile('user_002', validProfileData);

      expect(result.data.profile).toHaveProperty('completionPercentage');
      expect(result.data.profile.completionPercentage).toBeGreaterThan(0);
      expect(result.data.profile.completionPercentage).toBeLessThanOrEqual(100);
    });
  });

  describe('getAllProfiles', () => {
    it('should get all profiles successfully (admin only)', async () => {
      userRepository.getAllProfiles.mockResolvedValue({
        profiles: [mockProfile],
        pagination: { page: 1, limit: 10, total: 1 }
      });

      const result = await profileService.getAllProfiles();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('profiles');
      expect(Array.isArray(result.data.profiles)).toBe(true);
    });

    it('should apply pagination correctly', async () => {
      const profiles = [mockProfile, mockProfile]; // Return only limit amount
      userRepository.getAllProfiles.mockResolvedValue({
        profiles,
        pagination: { page: 1, limit: 2, total: 3 }
      });

      const options = { page: 1, limit: 2 };
      const result = await profileService.getAllProfiles(options);

      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.limit).toBe(2);
      expect(result.data.profiles.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getAvailableSkills', () => {
    it('should get all available skills', async () => {
      skillRepository.findAll.mockResolvedValue([
        { id: 'skill_001', name: 'First Aid', category: 'medical' },
        { id: 'skill_002', name: 'CPR', category: 'medical' }
      ]);
      skillRepository.getSkillsGroupedByCategory.mockResolvedValue({
        medical: [
          { id: 'skill_001', name: 'First Aid', category: 'medical' },
          { id: 'skill_002', name: 'CPR', category: 'medical' }
        ]
      });
      skillRepository.getCategories.mockResolvedValue(['medical']);

      const result = await profileService.getAvailableSkills();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('skills');
      expect(Array.isArray(result.data.skills)).toBe(true);
    });

    it('should group skills by category', async () => {
      skillRepository.findAll.mockResolvedValue([
        { id: 'skill_001', name: 'First Aid', category: 'medical' },
        { id: 'skill_002', name: 'CPR', category: 'medical' }
      ]);
      skillRepository.getSkillsGroupedByCategory.mockResolvedValue({
        medical: [
          { id: 'skill_001', name: 'First Aid', category: 'medical' },
          { id: 'skill_002', name: 'CPR', category: 'medical' }
        ]
      });
      skillRepository.getCategories.mockResolvedValue(['medical']);

      const result = await profileService.getAvailableSkills();

      expect(result.data).toHaveProperty('skillsByCategory');
      expect(typeof result.data.skillsByCategory).toBe('object');
    });
  });

  describe('searchSkills', () => {
    it('should search skills by name', async () => {
      skillRepository.searchByName.mockResolvedValue([
        { id: 'skill_001', name: 'Communication', category: 'soft-skills' }
      ]);

      const result = await profileService.searchSkills('communication');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('skills');
      expect(Array.isArray(result.data.skills)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      skillRepository.searchByName.mockResolvedValue([]);

      const result = await profileService.searchSkills('nonexistent-skill');

      expect(result.success).toBe(true);
      expect(result.data.skills).toHaveLength(0);
    });

    it('should filter by category if provided', async () => {
      skillRepository.findByCategory.mockResolvedValue([
        { id: 'skill_001', name: 'Programming', category: 'technical' }
      ]);

      const result = await profileService.searchSkills('', 'technical');

      expect(result.success).toBe(true);
      expect(result.data.skills.every(skill => skill.category === 'technical')).toBe(true);
    });

    it('should search by query and filter by category', async () => {
      skillRepository.searchByName.mockResolvedValue([
        { id: 'skill_001', name: 'Communication', category: 'soft-skills' }
      ]);

      const result = await profileService.searchSkills('communication', 'soft-skills');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('skills');
    });

    it('should return empty array for short query', async () => {
      const result = await profileService.searchSkills('a');

      expect(result.success).toBe(true);
      expect(result.data.skills).toEqual([]);
    });
  });

  describe('getProficiencyLevels', () => {
    it('should get proficiency levels', async () => {
      const result = await profileService.getProficiencyLevels();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('levels');
      expect(Array.isArray(result.data.levels)).toBe(true);
    });
  });

  describe('addSkills', () => {
    it('should add skills to profile', async () => {
      const newSkills = [{ skillId: 'skill_002', proficiency: 'beginner' }];
      const currentProfile = global.testUtils.generateTestProfile({ userId: 'user_002' });

      // Mock getProfile and addSkills
      userRepository.getProfile.mockResolvedValue(currentProfile);
      userRepository.addSkills.mockResolvedValue();
      skillRepository.findById.mockResolvedValue({ id: 'skill_002', name: 'Test Skill' });

      // Spy on getProfile to return updated profile on second call
      const getProfileSpy = jest.spyOn(profileService, 'getProfile');
      const updatedSkills = [...currentProfile.skills, ...newSkills.map(s => ({
        skillId: s.skillId,
        proficiency: s.proficiency,
        skill: { id: s.skillId, name: 'Test Skill' }
      }))];
      const updatedProfile = { ...currentProfile, skills: updatedSkills };
      getProfileSpy.mockResolvedValue({
        success: true,
        data: { profile: updatedProfile }
      });

      const result = await profileService.addSkills('user_002', newSkills);

      expect(result.success).toBe(true);
      expect(result.data.profile.skills.length).toBeGreaterThan(currentProfile.skills.length);

      getProfileSpy.mockRestore();
    });

    it('should reject if profile not found', async () => {
      userRepository.getProfile.mockResolvedValue(null);

      await expect(profileService.addSkills('user_002', []))
        .rejects.toThrow('Profile not found');
    });
  });

  describe('removeSkills', () => {
    it('should remove skills from profile', async () => {
      const skillsToRemove = ['skill_001'];
      const currentProfile = global.testUtils.generateTestProfile({ userId: 'user_002' });

      const updateProfileSpy = jest.spyOn(profileService, 'updateProfile');
      const updatedProfile = { ...currentProfile, skills: [] };
      updateProfileSpy.mockResolvedValue({
        success: true,
        message: 'Profile updated successfully',
        data: { profile: updatedProfile }
      });

      userRepository.getProfile.mockResolvedValue(currentProfile);

      const result = await profileService.removeSkills('user_002', skillsToRemove);

      expect(result.success).toBe(true);

      updateProfileSpy.mockRestore();
    });

    it('should reject if profile not found', async () => {
      userRepository.getProfile.mockResolvedValue(null);

      await expect(profileService.removeSkills('user_002', []))
        .rejects.toThrow('Profile not found');
    });
  });

  describe('updateAvailability', () => {
    it('should update availability', async () => {
      const availability = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isRecurring: true }
      ];
      const currentProfile = global.testUtils.generateTestProfile({ userId: 'user_002' });

      const updateProfileSpy = jest.spyOn(profileService, 'updateProfile');
      const updatedProfile = { ...currentProfile, availability };
      updateProfileSpy.mockResolvedValue({
        success: true,
        message: 'Profile updated successfully',
        data: { profile: updatedProfile }
      });

      const result = await profileService.updateAvailability('user_002', availability);

      expect(result.success).toBe(true);
      expect(result.data.profile.availability).toEqual(availability);

      updateProfileSpy.mockRestore();
    });
  });

  describe('getAvailability', () => {
    it('should get user availability', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await profileService.getAvailability('user_002', startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('availability');
      expect(result.data).toHaveProperty('dateRange');
    });

    it('should reject if profile not found', async () => {
      userRepository.getProfile.mockResolvedValue(null);

      await expect(profileService.getAvailability('user_002', new Date(), new Date()))
        .rejects.toThrow('Profile not found');
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const preferences = { maxDistance: 30, weekdaysOnly: true };
      const currentProfile = global.testUtils.generateTestProfile({ userId: 'user_002' });

      const updateProfileSpy = jest.spyOn(profileService, 'updateProfile');
      const updatedProfile = { ...currentProfile, preferences: { ...currentProfile.preferences, ...preferences } };
      updateProfileSpy.mockResolvedValue({
        success: true,
        message: 'Profile updated successfully',
        data: { profile: updatedProfile }
      });

      userRepository.getProfile.mockResolvedValue(currentProfile);

      const result = await profileService.updatePreferences('user_002', preferences);

      expect(result.success).toBe(true);

      updateProfileSpy.mockRestore();
    });

    it('should reject if profile not found', async () => {
      userRepository.getProfile.mockResolvedValue(null);

      await expect(profileService.updatePreferences('user_002', {}))
        .rejects.toThrow('Profile not found');
    });
  });

  describe('deleteProfile', () => {
    it('should delete profile successfully', async () => {
      userRepository.deleteProfile.mockResolvedValue(true);

      const result = await profileService.deleteProfile('user_002');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Profile deleted successfully');
    });

    it('should reject deletion for non-existent user', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(profileService.deleteProfile('non-existent'))
        .rejects.toThrow('User not found');
    });

    it('should handle delete failure', async () => {
      userRepository.getProfile.mockResolvedValue(mockProfile);
      userRepository.deleteProfile.mockRejectedValue(new Error('Failed to delete profile'));

      await expect(profileService.deleteProfile('user_002'))
        .rejects.toThrow('Failed to delete profile');
    });
  });

  describe('getProfileStats', () => {
    it('should get profile statistics successfully', async () => {
      userRepository.getAllProfiles.mockResolvedValue({
        profiles: [mockProfile, mockProfile],
        pagination: { page: 1, limit: 10000, total: 2 }
      });

      const result = await profileService.getProfileStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalProfiles');
      expect(result.data).toHaveProperty('completedProfiles');
      expect(result.data).toHaveProperty('profilesWithSkills');
      expect(result.data).toHaveProperty('profilesWithAvailability');
      expect(result.data).toHaveProperty('averageCompletion');
    });
  });

  describe('validateSkills', () => {
    it('should validate valid skills successfully', async () => {
      const skills = [
        { skillId: 'skill_001', proficiency: 'intermediate' }
      ];

      skillRepository.findById.mockResolvedValue({ id: 'skill_001', name: 'First Aid' });

      await expect(profileService.validateSkills(skills)).resolves.not.toThrow();
    });

    it('should reject non-array skills', async () => {
      await expect(profileService.validateSkills('not-an-array'))
        .rejects.toThrow('Skills must be an array');
    });

    it('should reject skills without skillId', async () => {
      const skills = [{ proficiency: 'intermediate' }];

      await expect(profileService.validateSkills(skills))
        .rejects.toThrow('Each skill must have skillId and proficiency');
    });

    it('should reject skills without proficiency', async () => {
      const skills = [{ skillId: 'skill_001' }];

      await expect(profileService.validateSkills(skills))
        .rejects.toThrow('Each skill must have skillId and proficiency');
    });

    it('should reject invalid skill ID', async () => {
      const skills = [{ skillId: 'invalid', proficiency: 'intermediate' }];

      skillRepository.findById.mockResolvedValue(null);

      await expect(profileService.validateSkills(skills))
        .rejects.toThrow('Invalid skill ID');
    });

    it('should reject invalid proficiency level', async () => {
      const skills = [{ skillId: 'skill_001', proficiency: 'invalid' }];

      skillRepository.findById.mockResolvedValue({ id: 'skill_001', name: 'First Aid' });

      await expect(profileService.validateSkills(skills))
        .rejects.toThrow('Invalid proficiency level');
    });
  });

  describe('validateAvailability', () => {
    it('should validate valid availability successfully', () => {
      const availability = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }
      ];

      expect(() => profileService.validateAvailability(availability)).not.toThrow();
    });

    it('should reject non-array availability', () => {
      expect(() => profileService.validateAvailability('not-an-array'))
        .toThrow('Availability must be an array');
    });

    it('should reject availability without dayOfWeek', () => {
      const availability = [{ startTime: '09:00', endTime: '17:00' }];

      expect(() => profileService.validateAvailability(availability))
        .toThrow('Invalid day of week');
    });

    it('should reject availability without startTime', () => {
      const availability = [{ dayOfWeek: 1, endTime: '17:00' }];

      expect(() => profileService.validateAvailability(availability))
        .toThrow('startTime and endTime are required');
    });

    it('should reject availability without endTime', () => {
      const availability = [{ dayOfWeek: 1, startTime: '09:00' }];

      expect(() => profileService.validateAvailability(availability))
        .toThrow('startTime and endTime are required');
    });

    it('should reject invalid dayOfWeek', () => {
      const availability = [{ dayOfWeek: 8, startTime: '09:00', endTime: '17:00' }];

      expect(() => profileService.validateAvailability(availability))
        .toThrow('Invalid day of week');
    });

    it('should reject invalid time format', () => {
      const availability = [{ dayOfWeek: 1, startTime: 'invalid', endTime: '17:00' }];

      expect(() => profileService.validateAvailability(availability))
        .toThrow('Time must be in HH:MM format');
    });

    it('should reject end time before start time', () => {
      const availability = [{ dayOfWeek: 1, startTime: '17:00', endTime: '09:00' }];

      expect(() => profileService.validateAvailability(availability))
        .toThrow('End time must be after start time');
    });

    it('should reject overlapping slots', () => {
      const availability = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 1, startTime: '12:00', endTime: '18:00' }
      ];

      expect(() => profileService.validateAvailability(availability))
        .toThrow('Overlapping availability slots');
    });
  });
});