/**
 * @file db.advanced.test.ts
 * @description Advanced database testing for error scenarios and edge cases
 * @module tests
 */

// Mock logger first
jest.mock('../utils/logger', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }

  return {
    __esModule: true,
    default: jest.fn(() => mockLogger)
  }
})

// Mock config
jest.mock('../utils/config', () => ({
  ATLAS_URI: 'mongodb://localhost:27017',
  DBNAME: 'test-db',
  NODE_ENV: 'test',
  USE_EMOJI: false
}))

describe('Database Utils - Advanced Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('DatabaseService Class Methods', () => {
    it('should test health check intervals and monitoring', async () => {
      const mockClient = {
        connect: jest.fn().mockResolvedValue(undefined),
        db: jest.fn().mockReturnValue({
          admin: () => ({
            ping: jest.fn().mockResolvedValue({ ok: 1 })
          })
        }),
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined)
      }

      jest.doMock('mongodb', () => ({
        MongoClient: jest.fn().mockImplementation(() => mockClient)
      }))

      const { initializeDatabase, shutdownDatabase } = await import('../utils/db')

      await initializeDatabase()

      // Test health check functionality
      await new Promise(resolve => setTimeout(resolve, 100))

      await shutdownDatabase()
    })

    it('should handle database ping failures', async () => {
      const mockClient = {
        connect: jest.fn().mockResolvedValue(undefined),
        db: jest.fn().mockReturnValue({
          admin: () => ({
            ping: jest.fn().mockRejectedValue(new Error('Ping failed'))
          })
        }),
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined)
      }

      jest.doMock('mongodb', () => ({
        MongoClient: jest.fn().mockImplementation(() => mockClient)
      }))

      const { initializeDatabase, getDatabaseStatus } = await import('../utils/db')

      await initializeDatabase()

      const status = await getDatabaseStatus()

      expect(status).toHaveProperty('isConnected')
    })

    it('should test connection event handlers', async () => {
      const eventHandlers: { [key: string]: (error?: Error) => void } = {}
      const mockClient = {
        connect: jest.fn().mockResolvedValue(undefined),
        db: jest.fn().mockReturnValue({
          admin: () => ({
            ping: jest.fn().mockResolvedValue({ ok: 1 })
          })
        }),
        on: jest.fn().mockImplementation((event, handler) => {
          eventHandlers[event] = handler
        }),
        close: jest.fn().mockResolvedValue(undefined)
      }

      jest.doMock('mongodb', () => ({
        MongoClient: jest.fn().mockImplementation(() => mockClient)
      }))

      const { initializeDatabase } = await import('../utils/db')

      await initializeDatabase()

      // Test error event handler
      if (eventHandlers['error']) {
        eventHandlers['error'](new Error('Connection error'))
      }

      // Test close event handler
      if (eventHandlers['close']) {
        eventHandlers['close']()
      }

      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mockClient.on).toHaveBeenCalledWith('close', expect.any(Function))
    })

    it('should test configuration validation edge cases', async () => {
      // Test with empty string ATLAS_URI
      jest.doMock('../utils/config', () => ({
        ATLAS_URI: '',
        DBNAME: 'test-db',
        NODE_ENV: 'test'
      }))

      const { initializeDatabase } = await import('../utils/db')

      await expect(initializeDatabase()).rejects.toThrow()
    })

    it('should test database name validation', async () => {
      // Test with empty string DBNAME
      jest.doMock('../utils/config', () => ({
        ATLAS_URI: 'mongodb://localhost:27017',
        DBNAME: '',
        NODE_ENV: 'test'
      }))

      const { initializeDatabase } = await import('../utils/db')

      await expect(initializeDatabase()).rejects.toThrow()
    })

    it('should test already initialized database', async () => {
      const mockClient = {
        connect: jest.fn().mockResolvedValue(undefined),
        db: jest.fn().mockReturnValue({
          admin: () => ({
            ping: jest.fn().mockResolvedValue({ ok: 1 })
          })
        }),
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined)
      }

      jest.doMock('mongodb', () => ({
        MongoClient: jest.fn().mockImplementation(() => mockClient)
      }))

      const { initializeDatabase } = await import('../utils/db')

      // Initialize once
      await initializeDatabase()

      // Try to initialize again - should handle gracefully
      await initializeDatabase()

      expect(mockClient.connect).toHaveBeenCalledTimes(1)
    })

    it('should test different environment configurations', async () => {
      // Test production environment settings
      jest.doMock('../utils/config', () => ({
        ATLAS_URI: 'mongodb://localhost:27017',
        DBNAME: 'test-db',
        NODE_ENV: 'production',
        USE_EMOJI: true
      }))

      const { getDatabaseStatus } = await import('../utils/db')
      const status = await getDatabaseStatus()

      expect(status.poolConfig).toHaveProperty('maxPoolSize')
    })

    it('should test shutdown with no active connection', async () => {
      const { shutdownDatabase } = await import('../utils/db')

      // Should handle shutdown gracefully even without active connection
      await expect(shutdownDatabase()).resolves.not.toThrow()
    })

    it('should test database reconnection logic', async () => {
      let connectCallCount = 0
      const mockClient = {
        connect: jest.fn().mockImplementation(() => {
          connectCallCount++
          if (connectCallCount === 1) {
            return Promise.reject(new Error('First connection failed'))
          }

          return Promise.resolve()
        }),
        db: jest.fn().mockReturnValue({
          admin: () => ({
            ping: jest.fn().mockResolvedValue({ ok: 1 })
          })
        }),
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined)
      }

      jest.doMock('mongodb', () => ({
        MongoClient: jest.fn().mockImplementation(() => mockClient)
      }))

      const { initializeDatabase } = await import('../utils/db')

      // First attempt should fail, but error should be handled
      await expect(initializeDatabase()).rejects.toThrow()
    })
  })

  describe('Legacy Function Error Handling', () => {
    it('should handle connectToCluster connection errors', async () => {
      const mockClient = {
        connect: jest.fn().mockRejectedValue(new Error('Connection failed'))
      }

      jest.doMock('mongodb', () => ({
        MongoClient: jest.fn().mockImplementation(() => mockClient)
      }))

      const { connectToCluster } = await import('../utils/db')

      await expect(connectToCluster()).rejects.toThrow('Connection failed')
    })

    it('should handle closeConnection errors gracefully', async () => {
      const mockClient = {
        close: jest.fn().mockRejectedValue(new Error('Close failed'))
      }
      const { closeConnection } = await import('../utils/db')

      // Should handle close errors gracefully
      await expect(closeConnection(mockClient as any)).resolves.not.toThrow()
    })
  })
})
