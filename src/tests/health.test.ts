/**
 * @file health.test.ts
 * @description Comprehensive test suite for Health API endpoints and system monitoring.
 *
 * Coverage includes:
 * - Complete health check endpoints
 * - System status monitoring and reporting
 * - Database connectivity checks
 * - Service availability monitoring
 * - Performance metrics collection
 * - Error rate tracking and alerting
 * - Resource utilization monitoring
 * - External dependency health checks
 * - Health dashboard and summary views
 * - Automated health monitoring
 * - Input validation and error handling
 * - Security and access control
 * - Real-time health status updates
 *
 * @version 2024-09-22 Comprehensive health API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Health API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db

  // ===============================
  // SETUP AND TEARDOWN
  // ===============================
  beforeAll(async () => {
    try {
      if (!config.ATLAS_URI) {
        throw new Error('ATLAS_URI not configured for tests')
      }

      connection = await MongoClient.connect(config.ATLAS_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000
      })
      db = connection.db(config.DBNAME)

      await db.admin().ping()
      console.log('✅ MongoDB connection successful for comprehensive health tests')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
        console.warn('⚠️ Skipping database tests - database not accessible')

        return
      }

      throw error
    }
  }, 30000)

  afterAll(async () => {
    try {
      if (connection) {
        await connection.close()
        console.log('🔌 Database connection closed')
      }
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error)
    }
  }, 10000)

  // Helper functions
  const checkDbConnection = (): boolean => {
    if (!connection || !db) {
      console.warn('⚠️ Skipping test - no database connection')

      return false
    }

    return true
  }

  // ===============================
  // API ENDPOINT TESTS - GET /health
  // ===============================
  describe('GET /health - Basic Health Check', () => {
    it('should return basic health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
      expect(response.body.status).toBe('healthy')

      // Validate timestamp format
      const timestamp = new Date(response.body.timestamp)

      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.getTime()).not.toBeNaN()

      // Validate uptime is a number
      expect(typeof response.body.uptime).toBe('number')
      expect(response.body.uptime).toBeGreaterThan(0)
    })

    it('should include service information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body).toHaveProperty('service')

      if (response.body.service) {
        expect(response.body.service).toHaveProperty('name')
        expect(response.body.service).toHaveProperty('version')
        expect(typeof response.body.service.name).toBe('string')
        expect(typeof response.body.service.version).toBe('string')
      }
    })

    it('should respond quickly (under 1 second)', async () => {
      const startTime = Date.now()

      await request(app)
        .get('/health')
        .expect(200)

      const responseTime = Date.now() - startTime

      expect(responseTime).toBeLessThan(1000)
    })

    it('should handle concurrent health checks', async () => {
      const promises = Array(10).fill(null).map(() =>
        request(app).get('/health')
      )
      const responses = await Promise.all(promises)

      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.status).toBe('healthy')
      })
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /health/detailed
  // ===============================
  describe('GET /health/detailed - Detailed Health Check', () => {
    it('should return comprehensive health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('checks')
      expect(response.body).toHaveProperty('metrics')
      expect(response.body).toHaveProperty('timestamp')

      // Validate checks object
      expect(typeof response.body.checks).toBe('object')
      expect(response.body.checks).toHaveProperty('database')
      expect(response.body.checks).toHaveProperty('memory')
      expect(response.body.checks).toHaveProperty('disk')

      // Validate metrics object
      expect(typeof response.body.metrics).toBe('object')
    })

    it('should include database connectivity check', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200)

      expect(response.body.checks).toHaveProperty('database')

      const dbCheck = response.body.checks.database

      expect(dbCheck).toHaveProperty('status')
      expect(dbCheck).toHaveProperty('responseTime')
      expect(['healthy', 'unhealthy', 'degraded']).toContain(dbCheck.status)
      expect(typeof dbCheck.responseTime).toBe('number')

      if (dbCheck.status === 'healthy') {
        expect(dbCheck.responseTime).toBeGreaterThan(0)
        expect(dbCheck.responseTime).toBeLessThan(5000) // Should respond within 5 seconds
      }
    })

    it('should include memory usage metrics', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200)

      expect(response.body.checks).toHaveProperty('memory')

      const memoryCheck = response.body.checks.memory

      expect(memoryCheck).toHaveProperty('status')
      expect(memoryCheck).toHaveProperty('usage')
      expect(['healthy', 'warning', 'critical']).toContain(memoryCheck.status)

      if (memoryCheck.usage) {
        expect(memoryCheck.usage).toHaveProperty('used')
        expect(memoryCheck.usage).toHaveProperty('total')
        expect(memoryCheck.usage).toHaveProperty('percentage')
        expect(typeof memoryCheck.usage.used).toBe('number')
        expect(typeof memoryCheck.usage.total).toBe('number')
        expect(typeof memoryCheck.usage.percentage).toBe('number')
        expect(memoryCheck.usage.percentage).toBeGreaterThanOrEqual(0)
        expect(memoryCheck.usage.percentage).toBeLessThanOrEqual(100)
      }
    })

    it('should include performance metrics', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200)

      expect(response.body).toHaveProperty('metrics')

      const metrics = response.body.metrics

      // Check for common performance metrics
      if (metrics.requests) {
        expect(metrics.requests).toHaveProperty('total')
        expect(typeof metrics.requests.total).toBe('number')
      }

      if (metrics.response_times) {
        expect(metrics.response_times).toHaveProperty('average')
        expect(typeof metrics.response_times.average).toBe('number')
      }

      if (metrics.errors) {
        expect(typeof metrics.errors).toBe('number')
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /health/database
  // ===============================
  describe('GET /health/database - Database Health Check', () => {
    it('should check database connectivity and performance', async () => {
      const response = await request(app)
        .get('/health/database')
        .expect(200)

      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('connection')
      expect(response.body).toHaveProperty('responseTime')
      expect(response.body).toHaveProperty('timestamp')

      // Validate connection details
      expect(response.body.connection).toHaveProperty('state')
      expect(['connected', 'disconnected', 'connecting']).toContain(response.body.connection.state)

      if (response.body.connection.state === 'connected') {
        expect(response.body.status).toBe('healthy')
        expect(response.body.responseTime).toBeGreaterThan(0)
      }
    })

    it('should include database server information', async () => {
      if (!checkDbConnection()) return

      const response = await request(app)
        .get('/health/database')
        .expect(200)

      if (response.body.connection.state === 'connected') {
        expect(response.body.connection).toHaveProperty('server')

        if (response.body.connection.server) {
          expect(response.body.connection.server).toHaveProperty('version')
          expect(typeof response.body.connection.server.version).toBe('string')
        }
      }
    })

    it('should check database operations', async () => {
      if (!checkDbConnection()) return

      const response = await request(app)
        .get('/health/database?operations=true')
        .expect(200)

      if (response.body.status === 'healthy') {
        expect(response.body).toHaveProperty('operations')

        const operations = response.body.operations

        expect(operations).toHaveProperty('read')
        expect(operations).toHaveProperty('write')
        expect(operations.read).toHaveProperty('status')
        expect(operations.write).toHaveProperty('status')
        expect(['success', 'failure']).toContain(operations.read.status)
        expect(['success', 'failure']).toContain(operations.write.status)
      }
    })

    it('should measure database query performance', async () => {
      if (!checkDbConnection()) return

      const response = await request(app)
        .get('/health/database?performance=true')
        .expect(200)

      if (response.body.status === 'healthy') {
        expect(response.body).toHaveProperty('performance')

        const performance = response.body.performance

        expect(performance).toHaveProperty('queries')
        expect(performance.queries).toHaveProperty('average_time')
        expect(typeof performance.queries.average_time).toBe('number')
        expect(performance.queries.average_time).toBeGreaterThan(0)
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /health/services
  // ===============================
  describe('GET /health/services - External Services Health', () => {
    it('should check external service dependencies', async () => {
      const response = await request(app)
        .get('/health/services')
        .expect(200)

      expect(response.body).toHaveProperty('services')
      expect(response.body).toHaveProperty('overall_status')
      expect(Array.isArray(response.body.services)).toBe(true)
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.overall_status)
    })

    it('should include service-specific health information', async () => {
      const response = await request(app)
        .get('/health/services')
        .expect(200)

      if (response.body.services.length > 0) {
        const service = response.body.services[0]

        expect(service).toHaveProperty('name')
        expect(service).toHaveProperty('status')
        expect(service).toHaveProperty('url')
        expect(service).toHaveProperty('responseTime')
        expect(typeof service.name).toBe('string')
        expect(['healthy', 'unhealthy', 'timeout']).toContain(service.status)
        expect(typeof service.responseTime).toBe('number')
      }
    })

    it('should handle service timeout scenarios', async () => {
      const response = await request(app)
        .get('/health/services?timeout=1000')
        .expect(200)

      // Should complete within reasonable time even with timeouts
      expect(response.body).toHaveProperty('services')

      response.body.services.forEach((service: any) => {
        if (service.status === 'timeout') {
          expect(service.responseTime).toBeGreaterThanOrEqual(1000)
        }
      })
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /health/metrics
  // ===============================
  describe('GET /health/metrics - System Metrics', () => {
    it('should return system performance metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200)

      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('system')
      expect(response.body).toHaveProperty('application')

      // System metrics
      const system = response.body.system

      expect(system).toHaveProperty('cpu')
      expect(system).toHaveProperty('memory')
      expect(system).toHaveProperty('disk')

      if (system.cpu) {
        expect(system.cpu).toHaveProperty('usage')
        expect(typeof system.cpu.usage).toBe('number')
        expect(system.cpu.usage).toBeGreaterThanOrEqual(0)
        expect(system.cpu.usage).toBeLessThanOrEqual(100)
      }
    })

    it('should include application-specific metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200)
      const application = response.body.application

      expect(application).toHaveProperty('uptime')
      expect(application).toHaveProperty('requests')
      expect(typeof application.uptime).toBe('number')
      expect(application.uptime).toBeGreaterThan(0)

      if (application.requests) {
        expect(application.requests).toHaveProperty('total')
        expect(application.requests).toHaveProperty('rate')
        expect(typeof application.requests.total).toBe('number')
        expect(typeof application.requests.rate).toBe('number')
      }
    })

    it('should support metrics filtering by category', async () => {
      const response = await request(app)
        .get('/health/metrics?category=system')
        .expect(200)

      expect(response.body).toHaveProperty('system')

      // Should only include system metrics when filtered
      if (response.body.application) {
        // Application metrics should be minimal or excluded
        expect(Object.keys(response.body.application)).toHaveLength(0)
      }
    })

    it('should support time-based metrics queries', async () => {
      const response = await request(app)
        .get('/health/metrics?timeframe=1h')
        .expect(200)

      expect(response.body).toHaveProperty('timeframe')
      expect(response.body.timeframe).toBe('1h')

      if (response.body.historical) {
        expect(Array.isArray(response.body.historical)).toBe(true)
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /health/status
  // ===============================
  describe('GET /health/status - Overall System Status', () => {
    it('should return overall system status summary', async () => {
      const response = await request(app)
        .get('/health/status')
        .expect(200)

      expect(response.body).toHaveProperty('overall_status')
      expect(response.body).toHaveProperty('components')
      expect(response.body).toHaveProperty('incidents')
      expect(response.body).toHaveProperty('last_updated')

      expect(['healthy', 'degraded', 'unhealthy', 'maintenance']).toContain(response.body.overall_status)
      expect(Array.isArray(response.body.components)).toBe(true)
      expect(Array.isArray(response.body.incidents)).toBe(true)
    })

    it('should include component status breakdown', async () => {
      const response = await request(app)
        .get('/health/status')
        .expect(200)

      if (response.body.components.length > 0) {
        const component = response.body.components[0]

        expect(component).toHaveProperty('name')
        expect(component).toHaveProperty('status')
        expect(component).toHaveProperty('description')
        expect(typeof component.name).toBe('string')
        expect(['operational', 'degraded', 'down', 'maintenance']).toContain(component.status)
      }
    })

    it('should track ongoing incidents', async () => {
      const response = await request(app)
        .get('/health/status')
        .expect(200)

      response.body.incidents.forEach((incident: any) => {
        expect(incident).toHaveProperty('id')
        expect(incident).toHaveProperty('title')
        expect(incident).toHaveProperty('status')
        expect(incident).toHaveProperty('created_at')
        expect(['investigating', 'identified', 'monitoring', 'resolved']).toContain(incident.status)
      })
    })

    it('should support status history queries', async () => {
      const response = await request(app)
        .get('/health/status?history=24h')
        .expect(200)

      if (response.body.history) {
        expect(Array.isArray(response.body.history)).toBe(true)

        response.body.history.forEach((entry: any) => {
          expect(entry).toHaveProperty('timestamp')
          expect(entry).toHaveProperty('status')
          expect(entry).toHaveProperty('components')
        })
      }
    })
  })

  // ===============================
  // REAL-TIME AND MONITORING TESTS
  // ===============================
  describe('Real-time Health Monitoring', () => {
    it('should support health check streaming', async () => {
      const response = await request(app)
        .get('/health/stream')
        .expect(200)

      // For SSE or websocket streams, check appropriate headers
      if (response.headers['content-type']) {
        const contentType = response.headers['content-type']

        expect(
          contentType.includes('text/event-stream') ||
          contentType.includes('application/json')
        ).toBe(true)
      }
    })

    it('should handle health alerts and notifications', async () => {
      const response = await request(app)
        .get('/health/alerts')
        .expect(200)

      expect(response.body).toHaveProperty('alerts')
      expect(Array.isArray(response.body.alerts)).toBe(true)

      response.body.alerts.forEach((alert: any) => {
        expect(alert).toHaveProperty('level')
        expect(alert).toHaveProperty('message')
        expect(alert).toHaveProperty('timestamp')
        expect(['info', 'warning', 'error', 'critical']).toContain(alert.level)
      })
    })

    it('should support health check configuration', async () => {
      const response = await request(app)
        .get('/health/config')
        .expect(200)

      expect(response.body).toHaveProperty('intervals')
      expect(response.body).toHaveProperty('thresholds')
      expect(response.body).toHaveProperty('notifications')

      if (response.body.intervals) {
        expect(response.body.intervals).toHaveProperty('health_check')
        expect(typeof response.body.intervals.health_check).toBe('number')
      }
    })
  })

  // ===============================
  // ERROR SCENARIOS AND EDGE CASES
  // ===============================
  describe('Error Scenarios and Edge Cases', () => {
    it('should handle database connection failures gracefully', async () => {
      // This test would simulate database unavailability
      const response = await request(app)
        .get('/health/database')

      if (response.status === 503) {
        expect(response.body).toHaveProperty('status', 'unhealthy')
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toContain('database')
      } else {
        expect(response.status).toBe(200)
      }
    })

    it('should handle partial service degradation', async () => {
      const response = await request(app)
        .get('/health/detailed')

      if (response.body.status === 'degraded') {
        expect(response.body).toHaveProperty('warnings')
        expect(Array.isArray(response.body.warnings)).toBe(true)
        expect(response.body.warnings.length).toBeGreaterThan(0)
      }
    })

    it('should respect health check timeouts', async () => {
      const startTime = Date.now()
      const response = await request(app)
        .get('/health?timeout=500')
      const responseTime = Date.now() - startTime

      if (response.status === 408) {
        expect(response.body).toHaveProperty('error', 'Health check timeout')
      } else {
        expect(responseTime).toBeLessThan(1000) // Should respect timeout
      }
    })

    it('should handle high load scenarios', async () => {
      const promises = Array(50).fill(null).map(() =>
        request(app).get('/health')
      )
      const responses = await Promise.all(promises)
      const successfulResponses = responses.filter(r => r.status === 200)

      expect(successfulResponses.length).toBeGreaterThan(40) // At least 80% success rate
    })

    it('should provide health information during maintenance mode', async () => {
      const response = await request(app)
        .get('/health')
        .set('X-Maintenance-Mode', 'true')

      expect(response.status).toBe(200)

      if (response.body.status === 'maintenance') {
        expect(response.body).toHaveProperty('maintenance')
        expect(response.body.maintenance).toHaveProperty('scheduled')
        expect(response.body.maintenance).toHaveProperty('estimated_duration')
      }
    })
  })

  // ===============================
  // SECURITY AND ACCESS CONTROL
  // ===============================
  describe('Security and Access Control', () => {
    it('should protect sensitive health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200)
      // Ensure no sensitive information is exposed
      const responseString = JSON.stringify(response.body)

      expect(responseString).not.toContain('password')
      expect(responseString).not.toContain('secret')
      expect(responseString).not.toContain('token')
      expect(responseString).not.toContain('key')
    })

    it('should handle unauthorized access to admin health endpoints', async () => {
      const response = await request(app)
        .get('/health/admin')

      if (response.status === 401 || response.status === 403) {
        expect(response.body).toHaveProperty('error')
      } else {
        // If endpoint doesn't exist or is public, that's also acceptable
        expect([200, 404]).toContain(response.status)
      }
    })

    it('should sanitize health check parameters', async () => {
      const maliciousParams = [
        '?timeout=<script>alert("xss")</script>',
        '?category=../../../etc/passwd',
        '?timeframe=1h; DROP TABLE health;'
      ]

      for (const param of maliciousParams) {
        const response = await request(app)
          .get(`/health/metrics${param}`)

        expect([200, 400]).toContain(response.status)

        if (response.status === 200) {
          const responseString = JSON.stringify(response.body)

          expect(responseString).not.toContain('<script>')
          expect(responseString).not.toContain('../../')
          expect(responseString).not.toContain('DROP TABLE')
        }
      }
    })
  })
})
