/**
 * User Repository
 * Handles all database operations for users and profiles
 */

const prisma = require('../prisma');

class UserRepository {
  /**
   * Find user by ID
   */
  async findById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            skills: {
              include: {
                skill: true
              }
            },
            availability: true
          }
        }
      }
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          include: {
            skills: {
              include: {
                skill: true
              }
            },
            availability: true
          }
        }
      }
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username },
      include: {
        profile: true
      }
    });
  }

  /**
   * Get all users with optional filters
   */
  async findAll(filters = {}) {
    const where = {};

    if (filters.role) {
      where.role = filters.role.toUpperCase();
    }

    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }

    return await prisma.user.findMany({
      where,
      include: {
        profile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Create new user
   */
  async create(userData) {
    return await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role ? userData.role.toUpperCase() : 'VOLUNTEER',
        verified: userData.verified || false,
        oauthProvider: userData.oauthProvider || null,
        oauthId: userData.oauthId || null
      },
      include: {
        profile: true
      }
    });
  }

  /**
   * Update user
   */
  async update(userId, updateData) {
    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        profile: true
      }
    });
  }

  /**
   * Delete user
   */
  async delete(userId) {
    return await prisma.user.delete({
      where: { id: userId }
    });
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    return await prisma.profile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: {
            skill: true
          }
        },
        availability: true,
        user: true
      }
    });
  }

  /**
   * Create user profile
   */
  async createProfile(userId, profileData) {
    return await prisma.profile.create({
      data: {
        userId,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || null,
        address: profileData.address || null,
        city: profileData.city || null,
        state: profileData.state || null,
        zipCode: profileData.zipCode || null,
        bio: profileData.bio || null,
        avatar: profileData.avatar || null,
        maxTravelDistance: profileData.maxTravelDistance || 25,
        preferredDays: profileData.preferredDays || [],
        preferredTimeSlots: profileData.preferredTimeSlots || [],
        preferredCauses: profileData.preferredCauses || [],
        emailNotifications: profileData.emailNotifications !== false,
        eventReminders: profileData.eventReminders !== false,
        weekendsOnly: profileData.weekendsOnly || false,
        profileCompleteness: profileData.profileCompleteness || 0
      },
      include: {
        skills: {
          include: {
            skill: true
          }
        },
        availability: true
      }
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    return await prisma.profile.update({
      where: { userId },
      data: profileData,
      include: {
        skills: {
          include: {
            skill: true
          }
        },
        availability: true
      }
    });
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId) {
    return await prisma.profile.delete({
      where: { userId }
    });
  }

  /**
   * Add skills to profile
   */
  async addSkills(profileId, skills) {
    const skillsData = skills.map(skill => ({
      profileId,
      skillId: skill.skillId,
      proficiency: skill.proficiency.toUpperCase(),
      yearsOfExp: skill.yearsOfExp || 0,
      certified: skill.certified || false
    }));

    return await prisma.volunteerSkill.createMany({
      data: skillsData,
      skipDuplicates: true
    });
  }

  /**
   * Remove skills from profile
   */
  async removeSkills(profileId, skillIds) {
    return await prisma.volunteerSkill.deleteMany({
      where: {
        profileId,
        skillId: {
          in: skillIds
        }
      }
    });
  }

  /**
   * Update availability
   */
  async updateAvailability(profileId, availabilityData) {
    // Delete existing availability
    await prisma.availability.deleteMany({
      where: { profileId }
    });

    // Create new availability slots
    if (availabilityData && availabilityData.length > 0) {
      return await prisma.availability.createMany({
        data: availabilityData.map(slot => ({
          profileId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      });
    }

    return { count: 0 };
  }

  /**
   * Get all profiles with pagination
   */
  async getAllProfiles(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              verified: true
            }
          },
          skills: {
            include: {
              skill: true
            }
          },
          availability: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      }),
      prisma.profile.count()
    ]);

    return {
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get all volunteers
   */
  async getVolunteers() {
    return await prisma.user.findMany({
      where: { role: 'VOLUNTEER' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true
      }
    });
  }

  /**
   * Get all volunteers with their profiles
   */
  async getVolunteersWithProfiles() {
    return await prisma.user.findMany({
      where: { role: 'VOLUNTEER' },
      include: {
        profile: {
          include: {
            skills: {
              include: {
                skill: true
              }
            },
            availability: true
          }
        }
      }
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const [totalUsers, volunteers, admins, verifiedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'VOLUNTEER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { verified: true } })
    ]);

    return {
      totalUsers,
      volunteers,
      admins,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers
    };
  }
}

module.exports = new UserRepository();
