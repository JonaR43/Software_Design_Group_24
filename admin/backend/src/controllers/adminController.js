const bcrypt = require('bcryptjs');
const { userHelpers } = require('../data/users');
const { events } = require('../data/events');
const { volunteerHistory } = require('../data/history');

/**
 * Admin Controller
 * Handles HTTP requests for admin user management operations
 */
class AdminController {
  /**
   * Get all users
   * GET /api/admin/users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = userHelpers.getAllUsers();

      res.status(200).json({
        status: 'success',
        data: {
          users
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/admin/users/:userId
   */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      const user = userHelpers.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      const profile = userHelpers.getProfile(userId);

      res.status(200).json({
        status: 'success',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          verified: user.verified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: profile ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zipCode: profile.zipCode
          } : null
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user
   * POST /api/admin/users
   */
  async createUser(req, res, next) {
    try {
      const { username, email, password, role = 'volunteer' } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Username, email, and password are required',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user already exists
      const existingUserByEmail = userHelpers.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          status: 'error',
          message: 'User with this email already exists',
          timestamp: new Date().toISOString()
        });
      }

      const existingUserByUsername = userHelpers.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({
          status: 'error',
          message: 'Username already taken',
          timestamp: new Date().toISOString()
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const newUser = userHelpers.createUser({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        verified: true
      });

      // Create initial profile
      userHelpers.createProfile(newUser.id, {
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        bio: '',
        skills: [],
        availability: [],
        preferences: {
          causes: [],
          maxDistance: 50,
          weekdaysOnly: false,
          preferredTimeSlots: []
        }
      });

      res.status(201).json({
        status: 'success',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          verified: newUser.verified,
          createdAt: newUser.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   * PUT /api/admin/users/:userId
   */
  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { username, email, role, verified, password } = req.body;

      const user = userHelpers.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if new email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = userHelpers.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            status: 'error',
            message: 'Email already in use by another user',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Check if new username is already taken by another user
      if (username && username !== user.username) {
        const existingUser = userHelpers.findByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            status: 'error',
            message: 'Username already taken',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (username !== undefined) updateData.username = username.toLowerCase();
      if (email !== undefined) updateData.email = email.toLowerCase();
      if (role !== undefined) updateData.role = role;
      if (verified !== undefined) updateData.verified = verified;

      // Hash new password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      // Update user
      const updatedUser = userHelpers.updateUser(userId, updateData);

      res.status(200).json({
        status: 'success',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          verified: updatedUser.verified,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/admin/users/:userId
   */
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = userHelpers.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      // Prevent deleting yourself
      if (req.user && req.user.id === userId) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot delete your own account',
          timestamp: new Date().toISOString()
        });
      }

      const deleted = userHelpers.deleteUser(userId);

      if (deleted) {
        res.status(200).json({
          status: 'success',
          message: 'User deleted successfully',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Failed to delete user',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get analytics metrics
   * GET /api/admin/metrics
   */
  async getMetrics(req, res, next) {
    try {
      const users = userHelpers.getAllUsers();

      // User metrics
      const totalUsers = users.length;
      const adminUsers = users.filter(u => u.role === 'admin').length;
      const volunteerUsers = users.filter(u => u.role === 'volunteer').length;
      const verifiedUsers = users.filter(u => u.verified).length;

      // User registration trend (last 6 months)
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const userRegistrationTrend = [];

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const count = users.filter(u => {
          const createdAt = new Date(u.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;

        userRegistrationTrend.push({
          month: monthName,
          users: count,
          volunteers: users.filter(u => {
            const createdAt = new Date(u.createdAt);
            return u.role === 'volunteer' && createdAt >= monthStart && createdAt <= monthEnd;
          }).length,
          admins: users.filter(u => {
            const createdAt = new Date(u.createdAt);
            return u.role === 'admin' && createdAt >= monthStart && createdAt <= monthEnd;
          }).length
        });
      }

      // Event metrics
      const totalEvents = events.length;
      const publishedEvents = events.filter(e => e.status === 'published').length;
      const completedEvents = events.filter(e => e.status === 'completed').length;
      const cancelledEvents = events.filter(e => e.status === 'cancelled').length;
      const draftEvents = events.filter(e => e.status === 'draft').length;

      // Event status distribution
      const eventStatusDistribution = [
        { status: 'Published', count: publishedEvents, percentage: (publishedEvents / totalEvents * 100).toFixed(1) },
        { status: 'Completed', count: completedEvents, percentage: (completedEvents / totalEvents * 100).toFixed(1) },
        { status: 'Draft', count: draftEvents, percentage: (draftEvents / totalEvents * 100).toFixed(1) },
        { status: 'Cancelled', count: cancelledEvents, percentage: (cancelledEvents / totalEvents * 100).toFixed(1) }
      ];

      // Volunteer capacity utilization
      const totalCapacity = events.reduce((sum, e) => sum + e.maxVolunteers, 0);
      const filledSpots = events.reduce((sum, e) => sum + e.currentVolunteers, 0);
      const capacityUtilization = totalCapacity > 0 ? (filledSpots / totalCapacity * 100).toFixed(1) : 0;

      // Event capacity by category
      const eventsByCategory = events.reduce((acc, event) => {
        const cat = event.category || 'other';
        if (!acc[cat]) {
          acc[cat] = { category: cat, events: 0, volunteers: 0, capacity: 0 };
        }
        acc[cat].events += 1;
        acc[cat].volunteers += event.currentVolunteers;
        acc[cat].capacity += event.maxVolunteers;
        return acc;
      }, {});

      const categoryMetrics = Object.values(eventsByCategory).map(cat => ({
        ...cat,
        utilization: cat.capacity > 0 ? ((cat.volunteers / cat.capacity) * 100).toFixed(1) : 0
      }));

      // Volunteer history metrics
      const completedParticipations = volunteerHistory.filter(h => h.status === 'completed').length;
      const noShows = volunteerHistory.filter(h => h.status === 'no_show').length;
      const cancelledParticipations = volunteerHistory.filter(h => h.status === 'cancelled').length;
      const totalHoursVolunteered = volunteerHistory
        .filter(h => h.status === 'completed')
        .reduce((sum, h) => sum + (h.hoursWorked || 0), 0);
      const averageHoursPerEvent = completedParticipations > 0
        ? (totalHoursVolunteered / completedParticipations).toFixed(1)
        : 0;

      // Attendance rate
      const totalParticipations = volunteerHistory.length;
      const attendanceRate = totalParticipations > 0
        ? ((completedParticipations / totalParticipations) * 100).toFixed(1)
        : 0;

      // Top volunteers by hours
      const volunteerHours = volunteerHistory
        .filter(h => h.status === 'completed')
        .reduce((acc, h) => {
          if (!acc[h.volunteerId]) {
            const user = users.find(u => u.id === h.volunteerId);
            acc[h.volunteerId] = {
              id: h.volunteerId,
              name: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.username || 'Unknown',
              hours: 0,
              events: 0,
              avgRating: 0,
              totalRating: 0,
              ratingCount: 0
            };
          }
          acc[h.volunteerId].hours += h.hoursWorked || 0;
          acc[h.volunteerId].events += 1;
          if (h.performanceRating) {
            acc[h.volunteerId].totalRating += h.performanceRating;
            acc[h.volunteerId].ratingCount += 1;
          }
          return acc;
        }, {});

      const topVolunteers = Object.values(volunteerHours)
        .map(v => ({
          ...v,
          avgRating: v.ratingCount > 0 ? (v.totalRating / v.ratingCount).toFixed(1) : 'N/A'
        }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 10);

      // Performance ratings distribution
      const ratings = volunteerHistory
        .filter(h => h.performanceRating)
        .map(h => h.performanceRating);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2)
        : 0;

      const ratingDistribution = [
        { rating: '5 Stars', count: ratings.filter(r => r === 5).length },
        { rating: '4 Stars', count: ratings.filter(r => r === 4).length },
        { rating: '3 Stars', count: ratings.filter(r => r === 3).length },
        { rating: '2 Stars', count: ratings.filter(r => r === 2).length },
        { rating: '1 Star', count: ratings.filter(r => r === 1).length }
      ];

      // Monthly hours trend (last 6 months)
      const monthlyHoursTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const hours = volunteerHistory
          .filter(h => {
            const date = new Date(h.participationDate);
            return h.status === 'completed' && date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, h) => sum + (h.hoursWorked || 0), 0);

        const participants = volunteerHistory
          .filter(h => {
            const date = new Date(h.participationDate);
            return date >= monthStart && date <= monthEnd;
          }).length;

        monthlyHoursTrend.push({
          month: monthName,
          hours: parseFloat(hours.toFixed(1)),
          participants
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          overview: {
            totalUsers,
            adminUsers,
            volunteerUsers,
            verifiedUsers,
            totalEvents,
            publishedEvents,
            completedEvents,
            totalHoursVolunteered: parseFloat(totalHoursVolunteered.toFixed(1)),
            averageHoursPerEvent: parseFloat(averageHoursPerEvent),
            attendanceRate: parseFloat(attendanceRate),
            capacityUtilization: parseFloat(capacityUtilization)
          },
          userRegistrationTrend,
          eventStatusDistribution,
          categoryMetrics,
          topVolunteers,
          ratingDistribution,
          avgRating: parseFloat(avgRating),
          monthlyHoursTrend,
          participationMetrics: {
            completed: completedParticipations,
            noShows,
            cancelled: cancelledParticipations,
            total: totalParticipations
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
