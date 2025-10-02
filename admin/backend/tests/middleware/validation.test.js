/**
 * Unit Tests for Validation Middleware
 */

const {
  validate,
  schemas,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreateEvent,
  validateUpdateEvent,
  validateAssignVolunteer,
  validateCreateNotification,
  validateHistoryRecord,
  validateHistoryUpdate,
  validatePagination
} = require('../../src/middleware/validation');

describe('Validation Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('validate factory function', () => {
    it('should validate body by default', () => {
      const testSchema = require('joi').object({
        name: require('joi').string().required()
      });
      const middleware = validate(testSchema);

      mockReq.body = { name: 'John' };
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should validate custom property', () => {
      const testSchema = require('joi').object({
        page: require('joi').number().required()
      });
      const middleware = validate(testSchema, 'query');

      mockReq.query = { page: 1 };
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return validation errors', () => {
      const testSchema = require('joi').object({
        name: require('joi').string().required()
      });
      const middleware = validate(testSchema);

      mockReq.body = {};
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Validation failed',
          errors: expect.any(Array)
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should strip unknown fields', () => {
      const testSchema = require('joi').object({
        name: require('joi').string().required()
      });
      const middleware = validate(testSchema);

      mockReq.body = { name: 'John', extra: 'field' };
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateRegister', () => {
    it('should validate valid registration data', () => {
      mockReq.body = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Pass@word123',
        role: 'volunteer'
      };

      validateRegister(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject short username', () => {
      mockReq.body = {
        username: 'ab',
        email: 'john@example.com',
        password: 'Pass@word123'
      };

      validateRegister(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'username',
              message: expect.stringContaining('3 characters')
            })
          ])
        })
      );
    });

    it('should reject non-alphanumeric username', () => {
      mockReq.body = {
        username: 'john-doe!',
        email: 'john@example.com',
        password: 'Pass@word123'
      };

      validateRegister(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'username',
              message: expect.stringContaining('alphanumeric')
            })
          ])
        })
      );
    });

    it('should reject invalid email', () => {
      mockReq.body = {
        username: 'johndoe',
        email: 'invalid-email',
        password: 'Pass@word123'
      };

      validateRegister(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: expect.stringContaining('valid email')
            })
          ])
        })
      );
    });

    it('should reject weak password', () => {
      mockReq.body = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'weakpass'
      };

      validateRegister(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'password'
            })
          ])
        })
      );
    });

    it('should reject invalid role', () => {
      mockReq.body = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Pass@word123',
        role: 'invalid'
      };

      validateRegister(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should use default role if not provided', () => {
      mockReq.body = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Pass@word123'
      };

      validateRegister(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateLogin', () => {
    it('should validate valid login data', () => {
      mockReq.body = {
        email: 'john@example.com',
        password: 'password123'
      };

      validateLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should require email', () => {
      mockReq.body = {
        password: 'password123'
      };

      validateLogin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should require password', () => {
      mockReq.body = {
        email: 'john@example.com'
      };

      validateLogin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUpdateProfile', () => {
    const validProfile = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '12345',
      bio: 'I love volunteering',
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
      ]
    };

    it('should validate complete profile data', () => {
      mockReq.body = validProfile;

      validateUpdateProfile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid first name with numbers', () => {
      mockReq.body = {
        ...validProfile,
        firstName: 'John123'
      };

      validateUpdateProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject invalid zip code format', () => {
      mockReq.body = {
        ...validProfile,
        zipCode: '123'
      };

      validateUpdateProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should accept extended zip code', () => {
      mockReq.body = {
        ...validProfile,
        zipCode: '12345-6789'
      };

      validateUpdateProfile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid time format', () => {
      mockReq.body = {
        ...validProfile,
        availability: [
          {
            dayOfWeek: 1,
            startTime: '25:00',
            endTime: '17:00'
          }
        ]
      };

      validateUpdateProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should require at least one skill', () => {
      mockReq.body = {
        ...validProfile,
        skills: []
      };

      validateUpdateProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should limit skills to 10', () => {
      mockReq.body = {
        ...validProfile,
        skills: Array(11).fill({ skillId: 'skill_001', proficiency: 'beginner' })
      };

      validateUpdateProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateCreateEvent', () => {
    const validEvent = {
      title: 'Community Cleanup',
      description: 'Help clean up the local park on Saturday morning',
      location: '123 Park Ave, City, State',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 90000000).toISOString(),
      maxVolunteers: 20,
      category: 'environmental',
      urgencyLevel: 'normal'
    };

    it('should validate complete event data', () => {
      mockReq.body = validEvent;

      validateCreateEvent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject short title', () => {
      mockReq.body = {
        ...validEvent,
        title: 'Test'
      };

      validateCreateEvent(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject short description', () => {
      mockReq.body = {
        ...validEvent,
        description: 'Short'
      };

      validateCreateEvent(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject past start date', () => {
      mockReq.body = {
        ...validEvent,
        startDate: new Date(Date.now() - 86400000).toISOString()
      };

      validateCreateEvent(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject end date before start date', () => {
      mockReq.body = {
        ...validEvent,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 43200000).toISOString()
      };

      validateCreateEvent(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject invalid category', () => {
      mockReq.body = {
        ...validEvent,
        category: 'invalid'
      };

      validateCreateEvent(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should validate required skills array', () => {
      mockReq.body = {
        ...validEvent,
        requiredSkills: [
          {
            skillId: 'skill_001',
            minLevel: 'intermediate',
            required: true
          }
        ]
      };

      validateCreateEvent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateUpdateEvent', () => {
    it('should validate partial event updates', () => {
      mockReq.body = {
        title: 'Updated Event Title'
      };

      validateUpdateEvent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate status update', () => {
      mockReq.body = {
        status: 'published'
      };

      validateUpdateEvent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid status', () => {
      mockReq.body = {
        status: 'invalid'
      };

      validateUpdateEvent(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateAssignVolunteer', () => {
    it('should validate assignment data', () => {
      mockReq.body = {
        eventId: 'event_001',
        volunteerId: 'volunteer_001',
        notes: 'Great match'
      };

      validateAssignVolunteer(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should require eventId', () => {
      mockReq.body = {
        volunteerId: 'volunteer_001'
      };

      validateAssignVolunteer(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should require volunteerId', () => {
      mockReq.body = {
        eventId: 'event_001'
      };

      validateAssignVolunteer(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should allow empty notes', () => {
      mockReq.body = {
        eventId: 'event_001',
        volunteerId: 'volunteer_001',
        notes: ''
      };

      validateAssignVolunteer(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateCreateNotification', () => {
    it('should validate notification data', () => {
      mockReq.body = {
        recipientId: 'user_001',
        type: 'assignment',
        title: 'You have been assigned',
        message: 'You have been assigned to a new event',
        eventId: 'event_001'
      };

      validateCreateNotification(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should require eventId for assignment type', () => {
      mockReq.body = {
        recipientId: 'user_001',
        type: 'assignment',
        title: 'You have been assigned',
        message: 'You have been assigned to a new event'
      };

      validateCreateNotification(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should not require eventId for announcement type', () => {
      mockReq.body = {
        recipientId: 'user_001',
        type: 'announcement',
        title: 'Important announcement',
        message: 'This is an important announcement'
      };

      validateCreateNotification(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid notification type', () => {
      mockReq.body = {
        recipientId: 'user_001',
        type: 'invalid',
        title: 'Test notification',
        message: 'Test message'
      };

      validateCreateNotification(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateHistoryRecord', () => {
    const validRecord = {
      volunteerId: 'volunteer_001',
      eventId: 'event_001',
      status: 'completed',
      hoursWorked: 4,
      performanceRating: 5,
      feedback: 'Great work!',
      attendance: 'present',
      skillsUtilized: ['skill_001', 'skill_002']
    };

    it('should validate history record', () => {
      mockReq.body = validRecord;

      validateHistoryRecord(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject negative hours', () => {
      mockReq.body = {
        ...validRecord,
        hoursWorked: -1
      };

      validateHistoryRecord(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject hours over 24', () => {
      mockReq.body = {
        ...validRecord,
        hoursWorked: 25
      };

      validateHistoryRecord(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject invalid performance rating', () => {
      mockReq.body = {
        ...validRecord,
        performanceRating: 6
      };

      validateHistoryRecord(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject invalid status', () => {
      mockReq.body = {
        ...validRecord,
        status: 'invalid'
      };

      validateHistoryRecord(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject invalid attendance', () => {
      mockReq.body = {
        ...validRecord,
        attendance: 'invalid'
      };

      validateHistoryRecord(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateHistoryUpdate', () => {
    it('should validate partial history updates', () => {
      mockReq.body = {
        status: 'completed',
        hoursWorked: 5
      };

      validateHistoryUpdate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow null performance rating', () => {
      mockReq.body = {
        performanceRating: null
      };

      validateHistoryUpdate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow null completion date', () => {
      mockReq.body = {
        completionDate: null
      };

      validateHistoryUpdate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validatePagination', () => {
    it('should validate pagination query params', () => {
      mockReq.query = {
        page: '1',
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      validatePagination(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should use default values', () => {
      mockReq.query = {};

      validatePagination(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid page number', () => {
      mockReq.query = {
        page: '0'
      };

      validatePagination(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject limit over 100', () => {
      mockReq.query = {
        limit: '101'
      };

      validatePagination(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject invalid sortOrder', () => {
      mockReq.query = {
        sortOrder: 'invalid'
      };

      validatePagination(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('error formatting', () => {
    it('should format multiple errors', () => {
      mockReq.body = {};

      validateLogin(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ field: expect.any(String) }),
            expect.objectContaining({ message: expect.any(String) })
          ])
        })
      );
    });

    it('should include timestamp', () => {
      mockReq.body = {};

      validateLogin(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });
  });
});
