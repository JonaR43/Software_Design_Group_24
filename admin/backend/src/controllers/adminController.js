const bcrypt = require('bcryptjs');
const userRepository = require('../database/repositories/userRepository');
const eventRepository = require('../database/repositories/eventRepository');
const historyRepository = require('../database/repositories/historyRepository');

/**
 * Admin Controller
 * Handles HTTP requests for admin user management operations
 * Updated to use Prisma database
 */
class AdminController {
  /**
   * Get all users
   * GET /api/admin/users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await userRepository.findAll();

      // Normalize roles to lowercase
      const normalizedUsers = users.map(user => ({
        ...user,
        role: user.role.toLowerCase()
      }));

      res.status(200).json({
        status: 'success',
        data: {
          users: normalizedUsers
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

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      const profile = await userRepository.getProfile(userId);

      res.status(200).json({
        status: 'success',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.toLowerCase(),
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
      const existingUserByEmail = await userRepository.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          status: 'error',
          message: 'User with this email already exists',
          timestamp: new Date().toISOString()
        });
      }

      const existingUserByUsername = await userRepository.findByUsername(username);
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
      const newUser = await userRepository.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        verified: true
      });

      // Create initial profile
      await userRepository.createProfile(newUser.id, {
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        bio: '',
        maxTravelDistance: 50,
        preferredDays: [],
        preferredTimeSlots: [],
        preferredCauses: [],
        emailNotifications: true,
        eventReminders: true,
        weekendsOnly: false,
        profileCompleteness: 0
      });

      res.status(201).json({
        status: 'success',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role.toLowerCase(),
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

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if new email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await userRepository.findByEmail(email);
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
        const existingUser = await userRepository.findByUsername(username);
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
      const updatedUser = await userRepository.update(userId, updateData);

      res.status(200).json({
        status: 'success',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role.toLowerCase(),
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

      const user = await userRepository.findById(userId);
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

      await userRepository.delete(userId);

      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get volunteer-specific metrics
   * GET /api/admin/users/:userId/metrics
   */
  async getVolunteerMetrics(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      if (user.role.toLowerCase() !== 'volunteer') {
        return res.status(400).json({
          status: 'error',
          message: 'User is not a volunteer',
          timestamp: new Date().toISOString()
        });
      }

      // Get volunteer's history
      const volunteerParticipation = await historyRepository.getByVolunteerId(userId);

      // Basic stats
      const totalEvents = volunteerParticipation.length;
      const completedEvents = volunteerParticipation.filter(h => h.status === 'COMPLETED').length;
      const noShows = volunteerParticipation.filter(h => h.status === 'NO_SHOW').length;
      const cancelled = volunteerParticipation.filter(h => h.status === 'CANCELLED').length;
      const upcomingEvents = volunteerParticipation.filter(h => h.status === 'CONFIRMED').length;

      // Hours and attendance
      const totalHours = volunteerParticipation
        .filter(h => h.status === 'COMPLETED')
        .reduce((sum, h) => sum + (h.hoursWorked || 0), 0);

      const attendanceRate = totalEvents > 0
        ? ((completedEvents / totalEvents) * 100).toFixed(1)
        : 0;

      const averageHoursPerEvent = completedEvents > 0
        ? (totalHours / completedEvents).toFixed(1)
        : 0;

      // Performance ratings
      const ratings = volunteerParticipation
        .filter(h => h.performanceRating)
        .map(h => h.performanceRating);

      const averageRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2)
        : null;

      const ratingDistribution = [
        { rating: '5 Stars', count: ratings.filter(r => r === 5).length },
        { rating: '4 Stars', count: ratings.filter(r => r === 4).length },
        { rating: '3 Stars', count: ratings.filter(r => r === 3).length },
        { rating: '2 Stars', count: ratings.filter(r => r === 2).length },
        { rating: '1 Star', count: ratings.filter(r => r === 1).length }
      ];

      // Monthly activity (last 6 months)
      const now = new Date();
      const monthlyActivity = [];

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const monthEvents = volunteerParticipation.filter(h => {
          const date = new Date(h.participationDate);
          return date >= monthStart && date <= monthEnd;
        });

        const monthHours = monthEvents
          .filter(h => h.status === 'COMPLETED')
          .reduce((sum, h) => sum + (h.hoursWorked || 0), 0);

        monthlyActivity.push({
          month: monthName,
          events: monthEvents.length,
          completed: monthEvents.filter(h => h.status === 'COMPLETED').length,
          hours: parseFloat(monthHours.toFixed(1))
        });
      }

      // Event categories breakdown
      const eventsByCategory = {};
      for (const h of volunteerParticipation) {
        const event = await eventRepository.findById(h.eventId);
        if (event) {
          const category = event.category || 'other';
          if (!eventsByCategory[category]) {
            eventsByCategory[category] = { category, events: 0, hours: 0 };
          }
          eventsByCategory[category].events += 1;
          if (h.status === 'COMPLETED') {
            eventsByCategory[category].hours += h.hoursWorked || 0;
          }
        }
      }

      const categoryBreakdown = Object.values(eventsByCategory).map(cat => ({
        ...cat,
        hours: parseFloat(cat.hours.toFixed(1))
      }));

      // Recent events
      const sortedParticipation = volunteerParticipation
        .sort((a, b) => new Date(b.participationDate).getTime() - new Date(a.participationDate).getTime())
        .slice(0, 10);

      const recentEvents = [];
      for (const h of sortedParticipation) {
        const event = await eventRepository.findById(h.eventId);
        recentEvents.push({
          eventId: h.eventId,
          eventName: event?.title || 'Unknown Event',
          eventCategory: event?.category || 'other',
          date: h.participationDate,
          status: h.status,
          hours: h.hoursWorked || 0,
          rating: h.performanceRating || null,
          feedback: h.feedback || null
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          volunteer: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.username,
            joinedDate: user.createdAt
          },
          overview: {
            totalEvents,
            completedEvents,
            upcomingEvents,
            noShows,
            cancelled,
            totalHours: parseFloat(totalHours.toFixed(1)),
            averageHoursPerEvent: parseFloat(averageHoursPerEvent),
            attendanceRate: parseFloat(attendanceRate),
            averageRating: averageRating ? parseFloat(averageRating) : null
          },
          ratingDistribution,
          monthlyActivity,
          categoryBreakdown,
          recentEvents
        },
        timestamp: new Date().toISOString()
      });
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
      const users = await userRepository.findAll();

      // User metrics
      const totalUsers = users.length;
      const adminUsers = users.filter(u => u.role.toLowerCase() === 'admin').length;
      const volunteerUsers = users.filter(u => u.role.toLowerCase() === 'volunteer').length;
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
            return u.role.toLowerCase() === 'volunteer' && createdAt >= monthStart && createdAt <= monthEnd;
          }).length,
          admins: users.filter(u => {
            const createdAt = new Date(u.createdAt);
            return u.role.toLowerCase() === 'admin' && createdAt >= monthStart && createdAt <= monthEnd;
          }).length
        });
      }

      // Event metrics
      const { events } = await eventRepository.findAll();
      const totalEvents = events.length;
      const publishedEvents = events.filter(e => e.status.toLowerCase() === 'published').length;
      const completedEvents = events.filter(e => e.status.toLowerCase() === 'completed').length;
      const cancelledEvents = events.filter(e => e.status.toLowerCase() === 'cancelled').length;
      const draftEvents = events.filter(e => e.status.toLowerCase() === 'draft').length;

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
      const volunteerHistory = await historyRepository.findAll();
      const completedParticipations = volunteerHistory.filter(h => h.status === 'COMPLETED').length;
      const noShows = volunteerHistory.filter(h => h.status === 'NO_SHOW').length;
      const cancelledParticipations = volunteerHistory.filter(h => h.status === 'CANCELLED').length;
      const totalHoursVolunteered = volunteerHistory
        .filter(h => h.status === 'COMPLETED')
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
      const volunteerHours = {};
      for (const h of volunteerHistory.filter(h => h.status === 'COMPLETED')) {
        if (!volunteerHours[h.volunteerId]) {
          const user = users.find(u => u.id === h.volunteerId);
          const profile = user ? await userRepository.getProfile(user.id) : null;
          volunteerHours[h.volunteerId] = {
            id: h.volunteerId,
            name: profile ? `${profile.firstName} ${profile.lastName}` : user?.username || 'Unknown',
            hours: 0,
            events: 0,
            avgRating: 0,
            totalRating: 0,
            ratingCount: 0
          };
        }
        volunteerHours[h.volunteerId].hours += h.hoursWorked || 0;
        volunteerHours[h.volunteerId].events += 1;
        if (h.performanceRating) {
          volunteerHours[h.volunteerId].totalRating += h.performanceRating;
          volunteerHours[h.volunteerId].ratingCount += 1;
        }
      }

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
            return h.status === 'COMPLETED' && date >= monthStart && date <= monthEnd;
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
