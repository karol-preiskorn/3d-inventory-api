/**
 * Jest setup file for test environment
 * Sets up environment variables and test configuration
 */

// Mock node-fetch to avoid ES module issues
jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn()
}))

// Set test environment variables before any modules are loaded
process.env.NODE_ENV = 'test'

// Use the existing ATLAS_URI if available, otherwise use a test default
if (!process.env.ATLAS_URI) {
  process.env.ATLAS_URI = 'mongodb://localhost:27017/test'
}

process.env.DBNAME = process.env.DBNAME || '3d-inventory-test'
process.env.PORT = process.env.PORT || '8080'
process.env.HOST = process.env.HOST || '0.0.0.0'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
process.env.API_YAML_FILE = process.env.API_YAML_FILE || './api.yaml'

// Disable console output in tests (optional)
if (process.env.JEST_SILENT === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}

// Global test setup
beforeAll(() => {
  // Set a longer timeout for database tests
  jest.setTimeout(30000)
})

// Global test teardown
afterAll(async () => {
  try {
    // Import and shutdown database service to clear health check intervals
    const { shutdownDatabase } = await import('../utils/db')

    await shutdownDatabase()
  } catch (error) {
    console.warn('Warning: Failed to shutdown database service:', error)
  }

  // Small delay to ensure all async operations complete
  await new Promise(resolve => setTimeout(resolve, 100))
})
