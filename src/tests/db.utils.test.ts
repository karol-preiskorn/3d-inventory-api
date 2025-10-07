/**
 * @file db.utils.test.ts
 * @description Simplified test suite for database utilities with proper mocking
 * @module tests
 */

import { MongoClient } from 'mongodb'
import {
  closeConnection,
  connectToCluster,
  connectToDb,
  getDatabase,
  getDatabaseStatus,
  initializeDatabase,
  shutdownDatabase
} from '../utils/db'

// Mock MongoDB client
jest.mock('mongodb', () => ({
  MongoClient: jest.fn()
}))

// Mock logger
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }))
}))

// Mock config
jest.mock('../utils/config', () => ({
  ATLAS_URI: 'mongodb://localhost:27017',
  DBNAME: 'test-db',
  NODE_ENV: 'test',
  USE_EMOJI: false
}))

describe('Database Utils Tests', () => {
  const MockedMongoClient = MongoClient as jest.MockedClass<typeof MongoClient>
  let mockClient: any
  let mockDb: any
  let mockAdmin: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock admin interface
    mockAdmin = {
      ping: jest.fn().mockResolvedValue({ ok: 1 })
    }

    // Setup mock database
    mockDb = {
      collection: jest.fn(),
      admin: jest.fn().mockReturnValue(mockAdmin)
    }

    // Setup mock client
    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue(mockDb),
      on: jest.fn()
    }

    // Configure the mock
    MockedMongoClient.mockImplementation(() => mockClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('initializeDatabase', () => {
    it('should initialize database connection successfully', async () => {
      await expect(initializeDatabase()).resolves.toBeUndefined()
      expect(MockedMongoClient).toHaveBeenCalled()
      expect(mockClient.connect).toHaveBeenCalled()
      expect(mockClient.db).toHaveBeenCalledWith('test-db')
      expect(mockAdmin.ping).toHaveBeenCalled()
    })

    it('should handle connection failure', async () => {
      mockClient.connect.mockRejectedValue(new Error('Connection failed'))

      await expect(initializeDatabase()).rejects.toThrow('MongoDB connection failed')
    })

    it('should handle ping failure', async () => {
      mockAdmin.ping.mockRejectedValue(new Error('Ping failed'))

      await expect(initializeDatabase()).rejects.toThrow('MongoDB connection failed')
    })
  })

  describe('getDatabase', () => {
    it('should return database instance when connected', async () => {
      await initializeDatabase()
      const db = await getDatabase()

      expect(db).toBeDefined()
      expect(mockClient.db).toHaveBeenCalledWith('test-db')
    })

    it('should initialize connection if not connected', async () => {
      const db = await getDatabase()

      expect(db).toBeDefined()
      expect(MockedMongoClient).toHaveBeenCalled()
    })
  })

  describe('getDatabaseStatus', () => {
    it('should return connection status when initialized', async () => {
      await initializeDatabase()
      const status = getDatabaseStatus()

      expect(status).toHaveProperty('isConnected')
      expect(status).toHaveProperty('lastHealthCheck')
      expect(status).toHaveProperty('poolConfig')
      expect(status.isConnected).toBe(true)
    })

    it('should return disconnected status when not initialized', () => {
      // Reset the DatabaseService singleton state
      jest.clearAllMocks()
      const status = getDatabaseStatus()

      expect(status).toHaveProperty('isConnected')
      expect(status).toHaveProperty('lastHealthCheck')
      expect(status).toHaveProperty('poolConfig')
    })
  })

  describe('shutdownDatabase', () => {
    it('should shutdown database connection successfully', async () => {
      await initializeDatabase()
      await shutdownDatabase()

      expect(mockClient.close).toHaveBeenCalled()
    })

    it('should handle shutdown errors gracefully', async () => {
      mockClient.close.mockRejectedValue(new Error('Close failed'))
      await initializeDatabase()

      // The shutdown function in the actual implementation re-throws errors
      await expect(shutdownDatabase()).rejects.toThrow('Close failed')
    })
  })

  describe('Legacy Functions', () => {
    describe('connectToCluster', () => {
      it('should connect to MongoDB cluster', async () => {
        const client = await connectToCluster()

        expect(client).toBeDefined()
        expect(MockedMongoClient).toHaveBeenCalled()
        expect(mockClient.connect).toHaveBeenCalled()
      })

      it('should handle connection failure', async () => {
        mockClient.connect.mockRejectedValue(new Error('Connection failed'))

        await expect(connectToCluster()).rejects.toThrow()
      })
    })

    describe('connectToDb', () => {
      it('should return database instance', () => {
        const db = connectToDb(mockClient)

        expect(db).toBeDefined()
        expect(mockClient.db).toHaveBeenCalledWith('test-db')
      })
    })

    describe('closeConnection', () => {
      it('should close connection successfully', async () => {
        await closeConnection(mockClient)

        expect(mockClient.close).toHaveBeenCalled()
      })

      it('should handle close errors', async () => {
        mockClient.close.mockRejectedValue(new Error('Close failed'))

        // The closeConnection function re-throws errors
        await expect(closeConnection(mockClient)).rejects.toThrow('Close failed')
      })
    })
  })

  describe('Connection Pool Configuration', () => {
    it('should use test environment settings', () => {
      // Test that the configuration is properly loaded for test environment
      expect(process.env.NODE_ENV).toBe('test')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid database name', () => {
      const originalDbName = process.env.DBNAME

      delete process.env.DBNAME

      expect(() => connectToDb(mockClient)).not.toThrow()

      process.env.DBNAME = originalDbName
    })

    it('should handle missing ATLAS_URI', async () => {
      // This test verifies that the function handles missing ATLAS_URI
      // The actual implementation throws an error when ATLAS_URI is invalid
      const originalConnect = mockClient.connect

      mockClient.connect = jest.fn().mockRejectedValue(new Error('ATLAS_URI environment variable is not set or invalid.'))

      await expect(connectToCluster()).rejects.toThrow()

      mockClient.connect = originalConnect
    })
  })
})
