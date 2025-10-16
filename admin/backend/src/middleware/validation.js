const Joi = require('joi');

/**
 * Validation Middleware Factory
 * Creates middleware to validate request data using Joi schemas
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        value: detail.context.value
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Common Validation Schemas
 */
const schemas = {
  // Authentication schemas
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    role: Joi.string()
      .valid('volunteer', 'admin')
      .default('volunteer')
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .required()
  }),

  // Profile schemas
  updateProfile: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.pattern.base': 'First name must contain only letters and spaces'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Last name must contain only letters and spaces'
      }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .min(10)
      .max(20)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    address: Joi.string()
      .min(5)
      .max(200)
      .required(),
    city: Joi.string()
      .min(2)
      .max(100)
      .required(),
    state: Joi.string()
      .min(2)
      .max(100)
      .required(),
    zipCode: Joi.string()
      .pattern(/^\d{5}(-\d{4})?$/)
      .required()
      .messages({
        'string.pattern.base': 'ZIP code must be in format 12345 or 12345-6789'
      }),
    bio: Joi.string()
      .max(500)
      .allow(''),
    emergencyContact: Joi.string()
      .max(200)
      .allow(''),
    skills: Joi.array()
      .items(Joi.object({
        skillId: Joi.string().required(),
        proficiency: Joi.string()
          .valid('beginner', 'intermediate', 'advanced', 'expert')
          .required()
      }))
      .min(0)
      .max(10)
      .default([]),
    availability: Joi.array()
      .items(Joi.object({
        dayOfWeek: Joi.number()
          .integer()
          .min(0)
          .max(6)
          .required(),
        startTime: Joi.string()
          .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required()
          .messages({
            'string.pattern.base': 'Time must be in HH:MM format'
          }),
        endTime: Joi.string()
          .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required()
          .messages({
            'string.pattern.base': 'Time must be in HH:MM format'
          }),
        isRecurring: Joi.boolean().default(true)
      }))
      .min(0)
      .default([]),
    preferences: Joi.object({
      causes: Joi.array()
        .items(Joi.string())
        .max(5),
      maxDistance: Joi.number()
        .min(1)
        .max(500)
        .default(50),
      weekdaysOnly: Joi.boolean().default(false),
      preferredTimeSlots: Joi.array()
        .items(Joi.string().valid('morning', 'afternoon', 'evening'))
    }).default({})
  }),

  // Event schemas
  createEvent: Joi.object({
    title: Joi.string()
      .min(5)
      .max(100)
      .required(),
    description: Joi.string()
      .min(10)
      .max(1000)
      .required(),
    address: Joi.string()
      .min(5)
      .max(200)
      .required()
      .messages({
        'any.required': 'Street address is required'
      }),
    city: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'any.required': 'City is required'
      }),
    state: Joi.string()
      .length(2)
      .uppercase()
      .required()
      .messages({
        'any.required': 'State is required',
        'string.length': 'State must be 2 characters (e.g., TX)'
      }),
    zipCode: Joi.string()
      .pattern(/^\d{5}(-\d{4})?$/)
      .required()
      .messages({
        'any.required': 'ZIP code is required',
        'string.pattern.base': 'ZIP code must be in format 12345 or 12345-6789'
      }),
    startDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Event start date must be in the future'
      }),
    endDate: Joi.date()
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'date.min': 'Event end date must be after start date'
      }),
    maxVolunteers: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .required(),
    urgencyLevel: Joi.string()
      .valid('low', 'medium', 'high', 'critical')
      .default('medium'),
    requiredSkills: Joi.array()
      .items(Joi.object({
        skillId: Joi.string().required(),
        minLevel: Joi.string()
          .valid('beginner', 'intermediate', 'advanced', 'expert')
          .required(),
        required: Joi.boolean().default(false)
      }))
      .max(10),
    category: Joi.string()
      .valid('community', 'environmental', 'educational', 'healthcare', 'food', 'disaster', 'fundraising', 'administrative')
      .required()
  }),

  updateEvent: Joi.object({
    title: Joi.string()
      .min(5)
      .max(100),
    description: Joi.string()
      .min(10)
      .max(1000),
    address: Joi.string()
      .min(5)
      .max(200),
    city: Joi.string()
      .min(2)
      .max(100),
    state: Joi.string()
      .length(2)
      .uppercase(),
    zipCode: Joi.string()
      .pattern(/^\d{5}(-\d{4})?$/),
    startDate: Joi.date()
      .min('now'),
    endDate: Joi.date()
      .min(Joi.ref('startDate')),
    maxVolunteers: Joi.number()
      .integer()
      .min(1)
      .max(1000),
    urgencyLevel: Joi.string()
      .valid('low', 'medium', 'high', 'critical'),
    requiredSkills: Joi.array()
      .items(Joi.object({
        skillId: Joi.string().required(),
        minLevel: Joi.string()
          .valid('beginner', 'intermediate', 'advanced', 'expert')
          .required(),
        required: Joi.boolean().default(false)
      }))
      .max(10),
    status: Joi.string()
      .valid('draft', 'published', 'in-progress', 'completed', 'cancelled')
  }),

  // Matching schemas
  assignVolunteer: Joi.object({
    eventId: Joi.string().required(),
    volunteerId: Joi.string().required(),
    notes: Joi.string().max(500).allow('')
  }),

  // Notification schemas
  createNotification: Joi.object({
    recipientId: Joi.string().required(),
    type: Joi.string()
      .valid('assignment', 'reminder', 'update', 'announcement')
      .required(),
    title: Joi.string()
      .min(5)
      .max(100)
      .required(),
    message: Joi.string()
      .min(10)
      .max(500)
      .required(),
    eventId: Joi.string().when('type', {
      is: Joi.valid('assignment', 'reminder', 'update'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    scheduledFor: Joi.date().min('now').optional()
  }),

  // History schemas
  recordParticipation: Joi.object({
    volunteerId: Joi.string().required(),
    eventId: Joi.string().required(),
    assignmentId: Joi.string().optional(),
    status: Joi.string()
      .valid('assigned', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'left_early', 'rescheduled')
      .required(),
    hoursWorked: Joi.number()
      .min(0)
      .max(24)
      .required()
      .messages({
        'number.min': 'Hours worked cannot be negative',
        'number.max': 'Hours worked cannot exceed 24 hours'
      }),
    performanceRating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional()
      .messages({
        'number.min': 'Performance rating must be between 1 and 5',
        'number.max': 'Performance rating must be between 1 and 5'
      }),
    feedback: Joi.string()
      .max(1000)
      .allow('')
      .optional(),
    attendance: Joi.string()
      .valid('pending', 'present', 'absent', 'late', 'left_early')
      .required(),
    skillsUtilized: Joi.array()
      .items(Joi.string())
      .max(10)
      .optional(),
    participationDate: Joi.date()
      .optional(),
    completionDate: Joi.date()
      .optional(),
    adminNotes: Joi.string()
      .max(500)
      .allow('')
      .optional()
  }),

  updateHistoryRecord: Joi.object({
    status: Joi.string()
      .valid('assigned', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'left_early', 'rescheduled')
      .optional(),
    hoursWorked: Joi.number()
      .min(0)
      .max(24)
      .optional(),
    performanceRating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .allow(null)
      .optional(),
    feedback: Joi.string()
      .max(1000)
      .allow('')
      .optional(),
    attendance: Joi.string()
      .valid('pending', 'present', 'absent', 'late', 'left_early')
      .optional(),
    skillsUtilized: Joi.array()
      .items(Joi.string())
      .max(10)
      .optional(),
    completionDate: Joi.date()
      .allow(null)
      .optional(),
    adminNotes: Joi.string()
      .max(500)
      .allow('')
      .optional()
  }),

  // Common parameter schemas
  mongoId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format'
    }),

  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),
    sortBy: Joi.string()
      .valid('createdAt', 'updatedAt', 'name', 'date', 'title')
      .default('createdAt'),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
  })
};

// Specific validation middleware exports
const validateRegister = validate(schemas.register);
const validateLogin = validate(schemas.login);
const validateUpdateProfile = validate(schemas.updateProfile);
const validateCreateEvent = validate(schemas.createEvent);
const validateUpdateEvent = validate(schemas.updateEvent);
const validateAssignVolunteer = validate(schemas.assignVolunteer);
const validateCreateNotification = validate(schemas.createNotification);
const validateHistoryRecord = validate(schemas.recordParticipation);
const validateHistoryUpdate = validate(schemas.updateHistoryRecord);
const validatePagination = validate(schemas.pagination, 'query');

module.exports = {
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
};