const userRepository = require('../database/repositories/userRepository');
const skillRepository = require('../database/repositories/skillRepository');

/**
 * Profile Service
 * Handles user profile management operations
 * Updated to use Prisma database
 */
class ProfileService {
  /**
   * Get user profile by user ID
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const profile = await userRepository.getProfile(userId);
    if (!profile) {
      return {
        success: true,
        data: {
          profile: null
        }
      };
    }

    // Calculate profile completion
    const profileCompletion = this.calculateProfileCompletion(profile);

    // Get skill details
    const skillsWithDetails = profile.skills.map(userSkill => {
      const skill = userSkill.skill; // Prisma includes the skill via relation
      return {
        skillId: userSkill.skillId,
        proficiency: userSkill.proficiency,
        yearsOfExp: userSkill.yearsOfExp,
        certified: userSkill.certified,
        skillName: skill ? skill.name : 'Unknown Skill',
        skillCategory: skill ? skill.category : 'unknown'
      };
    });

    return {
      success: true,
      data: {
        profile: {
          ...profile,
          skills: skillsWithDetails,
          profileCompletion,
          completionPercentage: profileCompletion,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            verified: user.verified
          }
        }
      }
    };
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile update data
   * @returns {Object} Updated profile data
   */
  async updateProfile(userId, profileData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const existingProfile = await userRepository.getProfile(userId);
    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    // Validate required fields
    this.validateRequiredFields(profileData);

    // Validate phone number format if provided
    if (profileData.phone) {
      this.validatePhoneNumber(profileData.phone);
    }

    // Validate ZIP code format if provided
    if (profileData.zipCode) {
      this.validateZipCode(profileData.zipCode);
    }

    // Validate skills if provided
    if (profileData.skills) {
      await this.validateSkills(profileData.skills);
    }

    // Validate availability if provided
    if (profileData.availability) {
      this.validateAvailability(profileData.availability);
    }

    // Extract skills and availability for separate handling
    const { skills, availability, ...profileUpdates } = profileData;

    // Update profile basic fields
    const updatedProfile = await userRepository.updateProfile(userId, profileUpdates);

    if (!updatedProfile) {
      throw new Error('Failed to update profile');
    }

    // Update skills if provided
    if (skills !== undefined) {
      // Remove all existing skills and add new ones
      await userRepository.removeSkills(existingProfile.id,
        existingProfile.skills.map(s => s.skillId));

      if (skills.length > 0) {
        await userRepository.addSkills(existingProfile.id, skills);
      }
    }

    // Update availability if provided
    if (availability !== undefined) {
      await userRepository.updateAvailability(existingProfile.id, availability);
    }

    // Get updated profile with details
    const result = await this.getProfile(userId);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: result.data
    };
  }

  /**
   * Get available skills
   * @returns {Object} List of available skills grouped by category
   */
  async getAvailableSkills() {
    const skills = await skillRepository.findAll();
    const skillsByCategory = await skillRepository.getSkillsGroupedByCategory();
    const categories = await skillRepository.getCategories();

    // Transform categories into objects
    const categoriesData = categories.map(cat => ({ id: cat, name: cat }));

    return {
      success: true,
      data: {
        skills,
        categories: categoriesData,
        skillsByCategory: Object.entries(skillsByCategory).map(([category, categorySkills]) => ({
          id: category,
          name: category,
          skills: categorySkills
        })),
        totalSkills: skills.length,
        totalCategories: categories.length
      }
    };
  }

  /**
   * Search skills by query
   * @param {string} query - Search query
   * @param {string} category - Optional category filter
   * @returns {Object} Matching skills
   */
  async searchSkills(query, category = null) {
    let matchingSkills;

    if (category && !query) {
      // Filter by category only
      matchingSkills = await skillRepository.findByCategory(category);
    } else if (query && query.length >= 2) {
      // Search by query
      matchingSkills = await skillRepository.searchByName(query, category);
    } else {
      // Return empty array for invalid queries
      matchingSkills = [];
    }

    return {
      success: true,
      data: {
        skills: matchingSkills,
        totalResults: matchingSkills.length,
        query: query || '',
        category: category
      }
    };
  }

  /**
   * Get user's skill proficiency levels
   * @returns {Object} Available proficiency levels
   */
  async getProficiencyLevels() {
    return {
      success: true,
      data: {
        levels: [
          { id: 'beginner', name: 'Beginner', description: 'Basic knowledge' },
          { id: 'intermediate', name: 'Intermediate', description: 'Working knowledge' },
          { id: 'advanced', name: 'Advanced', description: 'Strong expertise' },
          { id: 'expert', name: 'Expert', description: 'Master level' }
        ]
      }
    };
  }

  /**
   * Add skills to user profile
   * @param {string} userId - User ID
   * @param {Array} skills - Skills to add
   * @returns {Object} Updated profile
   */
  async addSkills(userId, skills) {
    const profile = await userRepository.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Validate skills
    await this.validateSkills(skills);

    // Remove duplicates and add new skills
    const existingSkillIds = profile.skills.map(s => s.skillId);
    const newSkills = skills.filter(s => !existingSkillIds.includes(s.skillId));

    if (newSkills.length > 0) {
      await userRepository.addSkills(profile.id, newSkills);
    }

    return await this.getProfile(userId);
  }

  /**
   * Remove skills from user profile
   * @param {string} userId - User ID
   * @param {Array} skillIds - Skill IDs to remove
   * @returns {Object} Updated profile
   */
  async removeSkills(userId, skillIds) {
    const profile = await userRepository.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await userRepository.removeSkills(profile.id, skillIds);

    return await this.getProfile(userId);
  }

  /**
   * Update user availability
   * @param {string} userId - User ID
   * @param {Array} availability - Availability slots
   * @returns {Object} Updated profile
   */
  async updateAvailability(userId, availability) {
    this.validateAvailability(availability);

    const profile = await userRepository.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await userRepository.updateAvailability(profile.id, availability);

    return await this.getProfile(userId);
  }

  /**
   * Get user availability for a specific date range
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Availability data
   */
  async getAvailability(userId, startDate, endDate) {
    const profile = await userRepository.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // For Assignment 3, we'll return the recurring availability
    // In a real app, this would calculate specific date availability
    return {
      success: true,
      data: {
        userId,
        availability: profile.availability,
        dateRange: {
          startDate,
          endDate
        },
        totalSlots: profile.availability.length
      }
    };
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences
   * @returns {Object} Updated profile
   */
  async updatePreferences(userId, preferences) {
    const profile = await userRepository.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Merge preferences with existing profile fields
    const updateData = {
      preferredDays: preferences.preferredDays || profile.preferredDays,
      preferredTimeSlots: preferences.preferredTimeSlots || profile.preferredTimeSlots,
      preferredCauses: preferences.causes || preferences.preferredCauses || profile.preferredCauses,
      maxTravelDistance: preferences.maxDistance || profile.maxTravelDistance,
      emailNotifications: preferences.emailNotifications !== undefined
        ? preferences.emailNotifications
        : profile.emailNotifications,
      eventReminders: preferences.eventReminders !== undefined
        ? preferences.eventReminders
        : profile.eventReminders,
      weekendsOnly: preferences.weekendsOnly !== undefined
        ? preferences.weekendsOnly
        : (preferences.weekdaysOnly === false ? true : profile.weekendsOnly)
    };

    await userRepository.updateProfile(userId, updateData);

    return await this.getProfile(userId);
  }

  /**
   * Calculate profile completion percentage
   * @param {Object} profile - User profile
   * @returns {number} Completion percentage
   */
  calculateProfileCompletion(profile) {
    const requiredFields = [
      'firstName', 'lastName', 'phone', 'address',
      'city', 'state', 'zipCode'
    ];

    const optionalFields = ['bio'];
    const arrayFields = ['skills', 'availability'];

    let completedRequired = 0;
    let completedOptional = 0;
    let completedArrays = 0;

    // Check required fields
    requiredFields.forEach(field => {
      if (profile[field] && profile[field].trim() !== '') {
        completedRequired++;
      }
    });

    // Check optional fields
    optionalFields.forEach(field => {
      if (profile[field] && profile[field].trim() !== '') {
        completedOptional++;
      }
    });

    // Check array fields
    arrayFields.forEach(field => {
      if (profile[field] && profile[field].length > 0) {
        completedArrays++;
      }
    });

    // Calculate weighted completion
    const requiredWeight = 70; // 70% for required fields
    const optionalWeight = 15; // 15% for optional fields
    const arrayWeight = 15;    // 15% for skills and availability

    const requiredPercentage = (completedRequired / requiredFields.length) * requiredWeight;
    const optionalPercentage = (completedOptional / optionalFields.length) * optionalWeight;
    const arrayPercentage = (completedArrays / arrayFields.length) * arrayWeight;

    return Math.round(requiredPercentage + optionalPercentage + arrayPercentage);
  }

  /**
   * Validate required fields
   * @param {Object} profileData - Profile data to validate
   */
  validateRequiredFields(profileData) {
    const requiredFields = ['firstName', 'lastName'];
    const missingFields = requiredFields.filter(field => !profileData[field] || profileData[field].trim() === '');

    if (missingFields.length > 0) {
      throw new Error('Missing required fields');
    }
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   */
  validatePhoneNumber(phone) {
    // Accept formats like +1-555-0123, (555) 123-4567, 555-123-4567, etc.
    const phoneRegex = /^[\+]?[\s\-\(\)]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number format');
    }
  }

  /**
   * Validate ZIP code format
   * @param {string} zipCode - ZIP code to validate
   */
  validateZipCode(zipCode) {
    // Accept 5-digit or 5+4 digit ZIP codes
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode)) {
      throw new Error('Invalid ZIP code format');
    }
  }

  /**
   * Validate skills data
   * @param {Array} skills - Skills to validate
   */
  async validateSkills(skills) {
    if (!Array.isArray(skills)) {
      throw new Error('Skills must be an array');
    }

    for (const skill of skills) {
      if (!skill.skillId || !skill.proficiency) {
        throw new Error('Each skill must have skillId and proficiency');
      }

      // Check if skill exists
      const skillExists = await skillRepository.findById(skill.skillId);
      if (!skillExists) {
        throw new Error('Invalid skill ID');
      }

      // Check if proficiency is valid
      const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
      if (!validProficiencies.includes(skill.proficiency.toLowerCase())) {
        throw new Error(`Invalid proficiency level: ${skill.proficiency}`);
      }
    }
  }

  /**
   * Validate availability data
   * @param {Array} availability - Availability to validate
   */
  validateAvailability(availability) {
    if (!Array.isArray(availability)) {
      throw new Error('Availability must be an array');
    }

    for (const slot of availability) {
      // Accept both number (1-7) and string day names
      const dayOfWeek = slot.dayOfWeek;
      const isValidNumber = typeof dayOfWeek === 'number' && dayOfWeek >= 1 && dayOfWeek <= 7;
      const isValidString = typeof dayOfWeek === 'string' &&
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(dayOfWeek);

      if (!isValidNumber && !isValidString) {
        throw new Error('Invalid day of week');
      }

      if (!slot.startTime || !slot.endTime) {
        throw new Error('startTime and endTime are required');
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        throw new Error('Time must be in HH:MM format');
      }

      // Check if end time is after start time
      const startMinutes = this.timeToMinutes(slot.startTime);
      const endMinutes = this.timeToMinutes(slot.endTime);

      if (endMinutes <= startMinutes) {
        throw new Error('End time must be after start time');
      }
    }

    // Check for overlapping slots on the same day
    const daySlots = {};
    for (const slot of availability) {
      const dayKey = slot.dayOfWeek.toString();
      if (!daySlots[dayKey]) {
        daySlots[dayKey] = [];
      }
      daySlots[dayKey].push(slot);
    }

    for (const day in daySlots) {
      const slots = daySlots[day];
      if (slots.length > 1) {
        for (let i = 0; i < slots.length; i++) {
          for (let j = i + 1; j < slots.length; j++) {
            if (this.slotsOverlap(slots[i], slots[j])) {
              throw new Error(`Overlapping availability slots found for day ${day}`);
            }
          }
        }
      }
    }
  }

  /**
   * Convert time string to minutes
   * @param {string} time - Time in HH:MM format
   * @returns {number} Minutes since midnight
   */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if two availability slots overlap
   * @param {Object} slot1 - First slot
   * @param {Object} slot2 - Second slot
   * @returns {boolean} True if slots overlap
   */
  slotsOverlap(slot1, slot2) {
    const start1 = this.timeToMinutes(slot1.startTime);
    const end1 = this.timeToMinutes(slot1.endTime);
    const start2 = this.timeToMinutes(slot2.startTime);
    const end2 = this.timeToMinutes(slot2.endTime);

    return start1 < end2 && start2 < end1;
  }

  /**
   * Get all profiles (admin only)
   * @param {Object} options - Pagination options
   * @returns {Object} List of profiles with pagination
   */
  async getAllProfiles(options = {}) {
    const { page = 1, limit = 10 } = options;

    const result = await userRepository.getAllProfiles(page, limit);

    return {
      success: true,
      data: result
    };
  }

  /**
   * Delete user profile
   * @param {string} userId - User ID
   * @returns {Object} Success message
   */
  async deleteProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const profile = await userRepository.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    await userRepository.deleteProfile(userId);

    return {
      success: true,
      message: 'Profile deleted successfully'
    };
  }

  /**
   * Get profile statistics for admin
   * @returns {Object} Profile statistics
   */
  async getProfileStats() {
    const result = await userRepository.getAllProfiles(1, 10000); // Get all profiles
    const profiles = result.profiles;

    const totalProfiles = profiles.length;
    const completedProfiles = profiles.filter(p => this.calculateProfileCompletion(p) === 100).length;
    const profilesWithSkills = profiles.filter(p => p.skills && p.skills.length > 0).length;
    const profilesWithAvailability = profiles.filter(p => p.availability && p.availability.length > 0).length;

    const averageCompletion = profiles.reduce((sum, p) =>
      sum + this.calculateProfileCompletion(p), 0) / (totalProfiles || 1);

    return {
      success: true,
      data: {
        totalProfiles,
        completedProfiles,
        profilesWithSkills,
        profilesWithAvailability,
        averageCompletion: Math.round(averageCompletion),
        completionRate: totalProfiles > 0
          ? Math.round((completedProfiles / totalProfiles) * 100)
          : 0
      }
    };
  }
}

module.exports = new ProfileService();
