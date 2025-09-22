/**
 * @file health.test.ts
 * @description Comprehensive health check API test suite.
 * Tests health endpoint functionality including database connectivity,
 * uptime reporting, environment status, and error handling scenarios.
 * Validates proper HTTP status codes, response structure, and health
 * monitoring capabilities for production deployment readiness.
 * @version 2024-09-21 Complete health endpoint test coverage
 */

import { Db } from 'mongodb'
import { healthController, HealthStatus } from '../controllers/health'

// Mock Express request and response objects
const mockRequest = {} as any
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as any

describe('Health Controller', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockResponse.status.mockClear()
    mockResponse.json.mockClear()
  })

  it('should return healthy status with connected database', async () => {
    const mockDb = {
      admin: () => ({
        ping: jest.fn().mockResolvedValue({})
      })
    } as unknown as Db

    await healthController(mockRequest, mockResponse, mockDb)

    expect(mockResponse.status).toHaveBeenCalledWith(200)
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'healthy',
        database: 'connected',
        error: null
      })
    )
  })

  it('should return degraded status when database is null', async () => {
    await healthController(mockRequest, mockResponse, null as any)

    expect(mockResponse.status).toHaveBeenCalledWith(503)
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'degraded',
        database: 'not_initialized',
        error: 'Database connection is not initialized.'
      })
    )
  })

  it('should return degraded status when database ping fails', async () => {
    const mockDb = {
      admin: () => ({
        ping: jest.fn().mockRejectedValue(new Error('Connection failed'))
      })
    } as unknown as Db

    await healthController(mockRequest, mockResponse, mockDb)

    expect(mockResponse.status).toHaveBeenCalledWith(503)
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'degraded',
        database: 'disconnected',
        error: 'Connection failed'
      })
    )
  })

  it('should include all required health status properties', async () => {
    const mockDb = {
      admin: () => ({
        ping: jest.fn().mockResolvedValue({})
      })
    } as unknown as Db

    await healthController(mockRequest, mockResponse, mockDb)

    const healthCall = mockResponse.json.mock.calls[0][0] as HealthStatus

    expect(healthCall).toHaveProperty('status')
    expect(healthCall).toHaveProperty('timestamp')
    expect(healthCall).toHaveProperty('port')
    expect(healthCall).toHaveProperty('environment')
    expect(healthCall).toHaveProperty('uptime')
    expect(healthCall).toHaveProperty('uptimeString')
    expect(healthCall).toHaveProperty('database')
    expect(healthCall).toHaveProperty('error')
  })

  it('should have valid timestamp format', async () => {
    const mockDb = {
      admin: () => ({
        ping: jest.fn().mockResolvedValue({})
      })
    } as unknown as Db

    await healthController(mockRequest, mockResponse, mockDb)

    const healthCall = mockResponse.json.mock.calls[0][0] as HealthStatus

    // Validate timestamp is a valid ISO string
    expect(new Date(healthCall.timestamp).toISOString()).toBe(healthCall.timestamp)
  })

  it('should have valid uptime information', async () => {
    const mockDb = {
      admin: () => ({
        ping: jest.fn().mockResolvedValue({})
      })
    } as unknown as Db

    await healthController(mockRequest, mockResponse, mockDb)

    const healthCall = mockResponse.json.mock.calls[0][0] as HealthStatus

    expect(typeof healthCall.uptime).toBe('number')
    expect(healthCall.uptime).toBeGreaterThanOrEqual(0)
    expect(healthCall.uptimeString).toMatch(/\d+h \d+m \d+s/)
  })

  it('should have correct port configuration', async () => {
    const mockDb = {
      admin: () => ({
        ping: jest.fn().mockResolvedValue({})
      })
    } as unknown as Db

    await healthController(mockRequest, mockResponse, mockDb)

    const healthCall = mockResponse.json.mock.calls[0][0] as HealthStatus

    expect(typeof healthCall.port).toBe('number')
    expect(healthCall.port).toBeGreaterThan(0)
  })
})
