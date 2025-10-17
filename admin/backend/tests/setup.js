/**
 * Test Setup Configuration
 * Global setup for Jest tests
 */

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Mock user for testing
  mockUser: {
    id: 'test_user_001',
    username: 'testuser',
    email: 'test@example.com',
    role: 'volunteer',
    verified: true
  },

  // Mock admin user for testing
  mockAdmin: {
    id: 'test_admin_001',
    username: 'testadmin',
    email: 'admin@example.com',
    role: 'admin',
    verified: true
  },

  // Mock JWT token
  mockToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0X3VzZXJfMDAxIiwiaWF0IjoxNjAwMDAwMDAwfQ.test',

  // Generate test event data
  generateTestEvent: (overrides = {}) => ({
    id: 'test_event_001',
    title: 'Test Event',
    description: 'This is a test event for unit testing',
    location: '123 Test Street, Test City, TC 12345',
    latitude: 29.7604,
    longitude: -95.3698,
    startDate: new Date(Date.now() + 86400000), // Tomorrow
    endDate: new Date(Date.now() + 90000000), // Tomorrow + 1 hour
    maxVolunteers: 10,
    currentVolunteers: 0,
    urgencyLevel: 'normal',
    status: 'published',
    category: 'community',
    createdBy: 'test_admin_001',
    requiredSkills: [],
    ...overrides
  }),

  // Generate test history record
  generateTestHistory: (overrides = {}) => ({
    id: 'test_history_001',
    volunteerId: 'test_user_001',
    eventId: 'test_event_001',
    status: 'completed',
    hoursWorked: 4,
    performanceRating: 5,
    feedback: 'Great work!',
    attendance: 'present',
    skills_utilized: ['skill_001'],
    participationDate: new Date(Date.now() - 86400000), // Yesterday
    completionDate: new Date(Date.now() - 82800000), // Yesterday + 1 hour
    recordedBy: 'test_admin_001',
    recordedAt: new Date(),
    ...overrides
  }),

  // Generate test profile data
  generateTestProfile: (overrides = {}) => ({
    id: 'test_profile_001',
    userId: 'test_user_001',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1-555-0123',
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    latitude: 29.7604,
    longitude: -95.3698,
    bio: 'Test user bio',
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
      weekdaysOnly: false,
      preferredTimeSlots: ['morning']
    },
    ...overrides
  })
};

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';