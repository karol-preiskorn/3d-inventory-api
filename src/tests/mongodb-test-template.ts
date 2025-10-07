/**
 * Template for fixing MongoDB test files
 * Based on the successful pattern from db.utils.test.ts
 */

import { MongoClient } from 'mongodb'

// ✅ CORRECT: Use jest.mock at the top level, not jest.doMock
jest.mock('mongodb', () => ({
  MongoClient: jest.fn()
}))

// ✅ CORRECT: Mock logger consistently
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }))
}))

// ✅ CORRECT: Mock config consistently
jest.mock('../utils/config', () => ({
  ATLAS_URI: 'mongodb://localhost:27017',
  DBNAME: 'test-db',
  NODE_ENV: 'test',
  USE_EMOJI: false
}))

describe('Your Test Suite', () => {
  const MockedMongoClient = MongoClient as jest.MockedClass<typeof MongoClient>
  let mockClient: Partial<MongoClient>
  let mockDb: Partial<{ collection: jest.Mock; admin: jest.Mock }>
  let mockAdmin: Partial<{ ping: jest.Mock }>

  beforeEach(() => {
    jest.clearAllMocks()

    // ✅ CORRECT: Setup proper mock hierarchy
    mockAdmin = {
      ping: jest.fn().mockResolvedValue({ ok: 1 })
    }

    mockDb = {
      collection: jest.fn(),
      admin: jest.fn().mockReturnValue(mockAdmin)
    }

    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue(mockDb),
      on: jest.fn()
    }

    // ✅ CORRECT: Configure the mock implementation with type assertion
    MockedMongoClient.mockImplementation(() => mockClient as MongoClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Your Test Cases', () => {
    it('should work with proper mocking', async () => {
      // Your test code here
      // NOTE: Replace '../your-module' with actual module path
      // Example: import { yourFunction } from '../your-module'
      // const result = await yourFunction()

      // Assertions
      expect(MockedMongoClient).toHaveBeenCalled()
      expect((mockClient as { connect: jest.Mock }).connect).toHaveBeenCalled()
      // expect(result).toBeDefined()
    })

    it('should handle errors properly', async () => {
      // ✅ CORRECT: Mock errors for specific tests
      ;(mockClient as { connect: jest.Mock }).connect.mockRejectedValue(new Error('Connection failed'))

      // NOTE: Replace '../your-module' with actual module path
      // Example: import { yourFunction } from '../your-module'
      // await expect(yourFunction()).rejects.toThrow('Connection failed')
    })
  })
})

/**
 * ❌ AVOID: These patterns cause issues
 *
 * 1. jest.doMock() inside test cases - causes module isolation issues
 * 2. Dynamic imports with await import() - can cause hanging
 * 3. jest.resetModules() in every test - causes performance issues
 * 4. Complex mock hierarchies that don't match the actual API
 * 5. Missing proper mock cleanup in afterEach
 *
 * ✅ USE INSTEAD:
 *
 * 1. jest.mock() at top level for consistent mocking
 * 2. Regular require() for imports after mocking
 * 3. Proper mock setup in beforeEach/afterEach
 * 4. Simple, focused mock implementations
 * 5. Clear mock state management
 */
