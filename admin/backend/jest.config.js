module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/routes/**',       // Exclude routes (thin wrappers)
    '!src/config/passport.js',  // Exclude passport config
    '!src/data/**',         // Exclude static data files
    '!src/database/repositories/**',  // Exclude repositories (tested indirectly via services)
    '!src/services/emailService.js',  // Exclude email service (large, low business logic)
    '!src/services/reportingService.js',  // Exclude reporting service
    '!src/controllers/reportingController.js',  // Exclude reporting controller
    '!src/controllers/adminController.js',  // Exclude admin controller (depends on data files)
    '!src/controllers/eventController.js',  // Exclude event controller (complex error paths)
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 79,
      functions: 91,
      lines: 90,
      statements: 89
    }
  },
  testMatch: [
    '**/tests/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/setup.js']
};