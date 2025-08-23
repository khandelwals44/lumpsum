// Global test setup - using mocks, no real database operations needed
beforeAll(async () => {
  // Tests use mocked Prisma client, no real database cleanup needed
});

// Global test teardown
afterAll(async () => {
  // Tests use mocked Prisma client, no real database disconnect needed
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: () => {},
  error: () => {},
};

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
