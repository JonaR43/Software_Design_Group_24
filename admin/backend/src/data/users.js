const bcrypt = require('bcryptjs');

/**
 * Hardcoded User Data for Assignment 3
 * In a real application, this would be stored in a database
 */

// Pre-hashed passwords for demo users
const hashedPasswords = {
  admin: bcrypt.hashSync('Admin123!', 10),
  volunteer1: bcrypt.hashSync('Volunteer123!', 10),
  volunteer2: bcrypt.hashSync('Volunteer123!', 10),
  volunteer3: bcrypt.hashSync('Volunteer123!', 10),
  volunteer_test: bcrypt.hashSync('Volunteer123!', 10)
};

const users = [
  {
    id: 'user_001',
    username: 'admin',
    email: 'admin@jacsshiftpilot.com',
    password: hashedPasswords.admin,
    role: 'admin',
    verified: true,
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z')
  },
  {
    id: 'user_002',
    username: 'johnsmith',
    email: 'john.smith@email.com',
    password: hashedPasswords.volunteer1,
    role: 'volunteer',
    verified: true,
    createdAt: new Date('2024-02-01T10:30:00Z'),
    updatedAt: new Date('2024-02-15T14:20:00Z')
  },
  {
    id: 'user_003',
    username: 'sarahjones',
    email: 'sarah.jones@email.com',
    password: hashedPasswords.volunteer2,
    role: 'volunteer',
    verified: true,
    createdAt: new Date('2024-02-10T09:15:00Z'),
    updatedAt: new Date('2024-02-20T16:45:00Z')
  },
  {
    id: 'user_004',
    username: 'mikebrown',
    email: 'mike.brown@email.com',
    password: hashedPasswords.volunteer3,
    role: 'volunteer',
    verified: true,
    createdAt: new Date('2024-02-20T11:00:00Z'),
    updatedAt: new Date('2024-03-01T13:30:00Z')
  },
  {
    id: 'user_005',
    username: 'volunteer',
    email: 'volunteer@jacsshiftpilot.com',
    password: hashedPasswords.volunteer_test,
    role: 'volunteer',
    verified: true,
    createdAt: new Date('2024-03-01T09:00:00Z'),
    updatedAt: new Date('2024-03-01T09:00:00Z')
  }
];

// User profiles with detailed information
const profiles = [
  {
    id: 'profile_001',
    userId: 'user_001',
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+1-555-0100',
    address: '123 Admin Street',
    city: 'Houston',
    state: 'Texas',
    zipCode: '77001',
    latitude: 29.7604,
    longitude: -95.3698,
    bio: 'System administrator for JACS ShiftPilot volunteer management platform.',
    profilePicture: null,
    emergencyContact: 'Emergency Services: 911',
    skills: [],
    availability: [],
    preferences: {
      causes: ['administrative'],
      maxDistance: 0,
      weekdaysOnly: true,
      preferredTimeSlots: ['morning', 'afternoon']
    },
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z')
  },
  {
    id: 'profile_002',
    userId: 'user_002',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1-555-0101',
    address: '456 Volunteer Lane',
    city: 'Houston',
    state: 'Texas',
    zipCode: '77002',
    latitude: 29.7505,
    longitude: -95.3704,
    bio: 'Passionate about community service and helping others. Available most weekends.',
    profilePicture: null,
    emergencyContact: 'Jane Smith: +1-555-0102',
    skills: [
      { skillId: 'skill_001', proficiency: 'advanced' },
      { skillId: 'skill_003', proficiency: 'intermediate' },
      { skillId: 'skill_007', proficiency: 'expert' }
    ],
    availability: [
      { dayOfWeek: 6, startTime: '08:00', endTime: '17:00', isRecurring: true },
      { dayOfWeek: 0, startTime: '09:00', endTime: '15:00', isRecurring: true }
    ],
    preferences: {
      causes: ['community', 'environmental', 'food'],
      maxDistance: 25,
      weekdaysOnly: false,
      preferredTimeSlots: ['morning', 'afternoon']
    },
    createdAt: new Date('2024-02-01T10:30:00Z'),
    updatedAt: new Date('2024-02-15T14:20:00Z')
  },
  {
    id: 'profile_003',
    userId: 'user_003',
    firstName: 'Sarah',
    lastName: 'Jones',
    phone: '+1-555-0201',
    address: '789 Helper Avenue',
    city: 'Houston',
    state: 'Texas',
    zipCode: '77003',
    latitude: 29.7403,
    longitude: -95.3370,
    bio: 'Healthcare professional with experience in emergency response and patient care.',
    profilePicture: null,
    emergencyContact: 'Tom Jones: +1-555-0202',
    skills: [
      { skillId: 'skill_004', proficiency: 'expert' },
      { skillId: 'skill_005', proficiency: 'advanced' },
      { skillId: 'skill_002', proficiency: 'intermediate' }
    ],
    availability: [
      { dayOfWeek: 1, startTime: '18:00', endTime: '22:00', isRecurring: true },
      { dayOfWeek: 3, startTime: '18:00', endTime: '22:00', isRecurring: true },
      { dayOfWeek: 5, startTime: '18:00', endTime: '22:00', isRecurring: true }
    ],
    preferences: {
      causes: ['healthcare', 'disaster', 'community'],
      maxDistance: 30,
      weekdaysOnly: true,
      preferredTimeSlots: ['evening']
    },
    createdAt: new Date('2024-02-10T09:15:00Z'),
    updatedAt: new Date('2024-02-20T16:45:00Z')
  },
  {
    id: 'profile_004',
    userId: 'user_004',
    firstName: 'Mike',
    lastName: 'Brown',
    phone: '+1-555-0301',
    address: '321 Service Road',
    city: 'Houston',
    state: 'Texas',
    zipCode: '77004',
    latitude: 29.7205,
    longitude: -95.3890,
    bio: 'Experienced in construction and manual labor. Happy to help with physical tasks.',
    profilePicture: null,
    emergencyContact: 'Lisa Brown: +1-555-0302',
    skills: [
      { skillId: 'skill_006', proficiency: 'expert' },
      { skillId: 'skill_008', proficiency: 'advanced' },
      { skillId: 'skill_001', proficiency: 'intermediate' }
    ],
    availability: [
      { dayOfWeek: 6, startTime: '07:00', endTime: '19:00', isRecurring: true },
      { dayOfWeek: 0, startTime: '08:00', endTime: '16:00', isRecurring: true }
    ],
    preferences: {
      causes: ['environmental', 'disaster', 'community'],
      maxDistance: 50,
      weekdaysOnly: false,
      preferredTimeSlots: ['morning', 'afternoon']
    },
    createdAt: new Date('2024-02-20T11:00:00Z'),
    updatedAt: new Date('2024-03-01T13:30:00Z')
  },
  {
    id: 'profile_005',
    userId: 'user_005',
    firstName: 'Test',
    lastName: 'Volunteer',
    phone: '+1-555-0401',
    address: '555 Test Street',
    city: 'Houston',
    state: 'Texas',
    zipCode: '77005',
    latitude: 29.7304,
    longitude: -95.3698,
    bio: 'Test volunteer account for development and demonstration purposes.',
    profilePicture: null,
    emergencyContact: 'Emergency Contact: +1-555-0402',
    skills: [
      { skillId: 'skill_001', proficiency: 'intermediate' },
      { skillId: 'skill_002', proficiency: 'advanced' },
      { skillId: 'skill_009', proficiency: 'expert' }
    ],
    availability: [
      { dayOfWeek: 1, startTime: '17:00', endTime: '21:00', isRecurring: true },
      { dayOfWeek: 3, startTime: '17:00', endTime: '21:00', isRecurring: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isRecurring: true }
    ],
    preferences: {
      causes: ['community', 'food', 'environmental'],
      maxDistance: 20,
      weekdaysOnly: false,
      preferredTimeSlots: ['evening', 'weekend']
    },
    createdAt: new Date('2024-03-01T09:00:00Z'),
    updatedAt: new Date('2024-03-01T09:00:00Z')
  }
];

/**
 * Helper functions for user management
 */
const userHelpers = {
  // Find user by email
  findByEmail: (email) => {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  },

  // Find user by ID
  findById: (id) => {
    return users.find(user => user.id === id);
  },

  // Find user by username
  findByUsername: (username) => {
    return users.find(user => user.username.toLowerCase() === username.toLowerCase());
  },

  // Get user profile
  getProfile: (userId) => {
    return profiles.find(profile => profile.userId === userId);
  },

  // Update user profile
  updateProfile: (userId, updateData) => {
    const profileIndex = profiles.findIndex(profile => profile.userId === userId);
    if (profileIndex !== -1) {
      profiles[profileIndex] = {
        ...profiles[profileIndex],
        ...updateData,
        updatedAt: new Date()
      };
      return profiles[profileIndex];
    }
    return null;
  },

  // Create new user
  createUser: (userData) => {
    const newUser = {
      id: `user_${String(users.length + 1).padStart(3, '0')}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    return newUser;
  },

  // Alias for createUser (for OAuth compatibility)
  create: (userData) => {
    return userHelpers.createUser(userData);
  },

  // Create new profile
  createProfile: (userId, profileData) => {
    const newProfile = {
      id: `profile_${String(profiles.length + 1).padStart(3, '0')}`,
      userId,
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    profiles.push(newProfile);
    return newProfile;
  },

  // Get all volunteers (excluding admins)
  getVolunteers: () => {
    return users.filter(user => user.role === 'volunteer');
  },

  // Get volunteer profiles with user data
  getVolunteerProfiles: () => {
    return profiles
      .filter(profile => {
        const user = users.find(u => u.id === profile.userId);
        return user && user.role === 'volunteer';
      })
      .map(profile => {
        const user = users.find(u => u.id === profile.userId);
        return {
          ...profile,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            verified: user.verified
          }
        };
      });
  }
};

module.exports = {
  users,
  profiles,
  userHelpers,
  hashedPasswords // Export for testing purposes
};