// Jest setup file for backend tests
// Global test configuration

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "0"; // Use random available port for tests

// Global test configuration
if (typeof global !== "undefined") {
  global.console = {
    ...console,
    // Uncomment to ignore specific console outputs during tests
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
  };
}
