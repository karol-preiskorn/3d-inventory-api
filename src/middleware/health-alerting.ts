/**
 * Health check and alerting system for monitoring critical failures
 * Provides comprehensive system health monitoring and alert capabilities
 */

import { readFileSync } from 'fs'
import { loadavg } from 'os'
import { join } from 'path'
import { Request, Response } from 'express'
import getLogger from '../utils/logger'
import { getCorrelationId } from './correlation'
import { databaseMonitor } from './database-monitor'
import { metricsCollector } from './metrics'

const logger = getLogger('health-alerting')

// Health check severity levels
export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  DOWN = 'down'
}

// Alert types
export enum AlertType {
  DATABASE_ERROR = 'database_error',
  HIGH_RESPONSE_TIME = 'high_response_time',
  HIGH_ERROR_RATE = 'high_error_rate',
  MEMORY_USAGE = 'memory_usage',
  CONNECTION_ISSUE = 'connection_issue',
  SYSTEM_FAILURE = 'system_failure'
}

interface HealthCheckResult {
  service: string
  status: HealthStatus
  message: string
  details?: Record<string, number | string | boolean>
  responseTime?: number
}

interface SystemHealth {
  status: HealthStatus
  timestamp: string
  version: string
  uptime: number
  checks: HealthCheckResult[]
  summary: {
    total: number
    healthy: number
    warning: number
    critical: number
    down: number
  }
}

interface AlertRule {
  type: AlertType
  threshold: number
  duration: number // seconds
  enabled: boolean
}

interface Alert {
  id: string
  type: AlertType
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details: Record<string, number | string | boolean | object>
  timestamp: Date
  correlationId?: string
  resolved: boolean
  resolvedAt?: Date
}

class HealthMonitor {
  private alerts: Map<string, Alert> = new Map()
  private alertRules: AlertRule[] = [
    { type: AlertType.DATABASE_ERROR, threshold: 5, duration: 60, enabled: true }, // 5% error rate over 1 minute
    { type: AlertType.HIGH_RESPONSE_TIME, threshold: 2000, duration: 120, enabled: true }, // 2s avg response time over 2 minutes
    { type: AlertType.HIGH_ERROR_RATE, threshold: 10, duration: 300, enabled: true }, // 10% error rate over 5 minutes
    { type: AlertType.MEMORY_USAGE, threshold: 85, duration: 300, enabled: true }, // 85% memory usage over 5 minutes
    { type: AlertType.CONNECTION_ISSUE, threshold: 1, duration: 30, enabled: true } // Connection issues for 30 seconds
  ]

  private startTime = Date.now()

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(req?: Request): Promise<SystemHealth> {
    const correlationId = req ? getCorrelationId(req) : 'health-check'
    const startTime = process.hrtime.bigint()

    logger.info(`[${correlationId}] Starting health check`)

    const checks: HealthCheckResult[] = []

    // Database health check
    try {
      const dbHealth = await this.checkDatabaseHealth(correlationId)

      checks.push(dbHealth)
    } catch (error) {
      checks.push({
        service: 'database',
        status: HealthStatus.CRITICAL,
        message: `Database health check failed: ${error instanceof Error ? error.message : String(error)}`
      })
    }

    // Application metrics health check
    try {
      const metricsHealth = this.checkMetricsHealth(correlationId)

      checks.push(metricsHealth)
    } catch (error) {
      checks.push({
        service: 'metrics',
        status: HealthStatus.WARNING,
        message: `Metrics health check failed: ${error instanceof Error ? error.message : String(error)}`
      })
    }

    // System resources health check
    try {
      const systemHealth = this.checkSystemResources(correlationId)

      checks.push(systemHealth)
    } catch (error) {
      checks.push({
        service: 'system',
        status: HealthStatus.WARNING,
        message: `System health check failed: ${error instanceof Error ? error.message : String(error)}`
      })
    }

    // Memory health check
    try {
      const memoryHealth = this.checkMemoryUsage(correlationId)

      checks.push(memoryHealth)
    } catch (error) {
      checks.push({
        service: 'memory',
        status: HealthStatus.WARNING,
        message: `Memory health check failed: ${error instanceof Error ? error.message : String(error)}`
      })
    }

    // Determine overall status
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === HealthStatus.HEALTHY).length,
      warning: checks.filter(c => c.status === HealthStatus.WARNING).length,
      critical: checks.filter(c => c.status === HealthStatus.CRITICAL).length,
      down: checks.filter(c => c.status === HealthStatus.DOWN).length
    }
    let overallStatus: HealthStatus

    if (summary.down > 0) {
      overallStatus = HealthStatus.DOWN
    } else if (summary.critical > 0) {
      overallStatus = HealthStatus.CRITICAL
    } else if (summary.warning > 0) {
      overallStatus = HealthStatus.WARNING
    } else {
      overallStatus = HealthStatus.HEALTHY
    }

    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1000000
    // Get version from package.json
    let version = '1.0.0'

    try {
      const packagePath = join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))

      version = packageJson.version
    } catch (error) {
      logger.warn(`Failed to read version from package.json: ${error instanceof Error ? error.message : String(error)}`)
    }

    const healthResult: SystemHealth = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks,
      summary
    }

    logger.info(`[${correlationId}] Health check completed in ${duration.toFixed(2)}ms - Status: ${overallStatus}`)

    // Check for alert conditions
    this.checkAlertConditions(healthResult, correlationId)

    return healthResult
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(correlationId: string): Promise<HealthCheckResult> {
    const startTime = process.hrtime.bigint()

    try {
      const dbMetrics = databaseMonitor.getMetrics()
      const endTime = process.hrtime.bigint()
      const responseTime = Number(endTime - startTime) / 1000000
      let status: HealthStatus
      let message: string

      if (dbMetrics.connectionHealth.status === 'critical') {
        status = HealthStatus.CRITICAL
        message = dbMetrics.connectionHealth.message
      } else if (dbMetrics.connectionHealth.status === 'warning') {
        status = HealthStatus.WARNING
        message = dbMetrics.connectionHealth.message
      } else {
        status = HealthStatus.HEALTHY
        message = 'Database is operating normally'
      }

      return {
        service: 'database',
        status,
        message,
        responseTime,
        details: {
          queryCount: dbMetrics.queryCount,
          slowQueryCount: dbMetrics.slowQueryCount,
          avgQueryTime: dbMetrics.avgQueryTime,
          errors: dbMetrics.errors,
          activeConnections: dbMetrics.activeConnections
        }
      }
    } catch (error) {
      logger.error(`[${correlationId}] Database health check error: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Check application metrics health
   */
  private checkMetricsHealth(correlationId: string): HealthCheckResult {
    const startTime = process.hrtime.bigint()

    try {
      const metrics = metricsCollector.getMetrics()
      const endTime = process.hrtime.bigint()
      const responseTime = Number(endTime - startTime) / 1000000
      let status: HealthStatus
      let message: string

      // Check error rate
      if (metrics.errorRate > 15) {
        status = HealthStatus.CRITICAL
        message = `High error rate: ${metrics.errorRate.toFixed(2)}%`
      } else if (metrics.errorRate > 8) {
        status = HealthStatus.WARNING
        message = `Elevated error rate: ${metrics.errorRate.toFixed(2)}%`
      } else if (metrics.responseTimeP95 > 3000) {
        status = HealthStatus.WARNING
        message = `High response times: P95 ${metrics.responseTimeP95.toFixed(0)}ms`
      } else {
        status = HealthStatus.HEALTHY
        message = 'Application metrics are normal'
      }

      return {
        service: 'metrics',
        status,
        message,
        responseTime,
        details: {
          totalRequests: metrics.totalRequests,
          activeRequests: metrics.activeRequests,
          errorRate: metrics.errorRate,
          responseTimeP95: metrics.responseTimeP95,
          responseTimeP99: metrics.responseTimeP99
        }
      }
    } catch (error) {
      logger.error(`[${correlationId}] Metrics health check error: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Check system resources
   */
  private checkSystemResources(correlationId: string): HealthCheckResult {
    const startTime = process.hrtime.bigint()

    try {
      const uptime = process.uptime()
      // Load average is only available on Unix-like systems
      const loadAvgArray = process.platform === 'win32' ? [0, 0, 0] : loadavg()
      const endTime = process.hrtime.bigint()
      const responseTime = Number(endTime - startTime) / 1000000
      let status: HealthStatus
      let message: string

      // Basic system health checks
      if (uptime < 60) {
        status = HealthStatus.WARNING
        message = 'System recently restarted'
      } else if (loadAvgArray[0] > 4) {
        status = HealthStatus.WARNING
        message = `High system load: ${loadAvgArray[0].toFixed(2)}`
      } else {
        status = HealthStatus.HEALTHY
        message = 'System resources are normal'
      }

      return {
        service: 'system',
        status,
        message,
        responseTime,
        details: {
          uptime,
          loadAvg: loadAvgArray.join(', '),
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid
        }
      }
    } catch (error) {
      logger.error(`[${correlationId}] System health check error: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(correlationId: string): HealthCheckResult {
    const startTime = process.hrtime.bigint()

    try {
      const memUsage = process.memoryUsage()
      const endTime = process.hrtime.bigint()
      const responseTime = Number(endTime - startTime) / 1000000
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024
      const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100
      let status: HealthStatus
      let message: string

      if (memoryUsagePercent > 90) {
        status = HealthStatus.CRITICAL
        message = `Critical memory usage: ${memoryUsagePercent.toFixed(1)}%`
      } else if (memoryUsagePercent > 80) {
        status = HealthStatus.WARNING
        message = `High memory usage: ${memoryUsagePercent.toFixed(1)}%`
      } else {
        status = HealthStatus.HEALTHY
        message = `Memory usage is normal: ${memoryUsagePercent.toFixed(1)}%`
      }

      return {
        service: 'memory',
        status,
        message,
        responseTime,
        details: {
          heapUsed: Math.round(heapUsedMB),
          heapTotal: Math.round(heapTotalMB),
          rss: Math.round(memUsage.rss / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
          usagePercent: Math.round(memoryUsagePercent * 100) / 100
        }
      }
    } catch (error) {
      logger.error(`[${correlationId}] Memory health check error: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Check for alert conditions and trigger alerts
   */
  private checkAlertConditions(health: SystemHealth, correlationId: string): void {
    // Check for critical services down
    const criticalServices = health.checks.filter(c => c.status === HealthStatus.CRITICAL || c.status === HealthStatus.DOWN)

    for (const service of criticalServices) {
      this.triggerAlert({
        type: AlertType.SYSTEM_FAILURE,
        severity: 'critical',
        message: `Service ${service.service} is ${service.status}: ${service.message}`,
        details: { service: service.service, status: service.status, ...service.details },
        correlationId
      })
    }

    // Check database alerts
    const dbCheck = health.checks.find(c => c.service === 'database')

    if (dbCheck?.details?.errors && typeof dbCheck.details.errors === 'number' && dbCheck.details.errors > 0) {
      const queryCount = typeof dbCheck.details.queryCount === 'number' ? dbCheck.details.queryCount : 1
      const errorRate = (dbCheck.details.errors / queryCount) * 100

      if (errorRate > 10) {
        this.triggerAlert({
          type: AlertType.DATABASE_ERROR,
          severity: 'high',
          message: `High database error rate: ${errorRate.toFixed(2)}%`,
          details: { errorRate, errors: dbCheck.details.errors, queries: dbCheck.details.queryCount },
          correlationId
        })
      }
    }

    // Check response time alerts
    const metricsCheck = health.checks.find(c => c.service === 'metrics')

    if (metricsCheck?.details?.responseTimeP95 && typeof metricsCheck.details.responseTimeP95 === 'number' && metricsCheck.details.responseTimeP95 > 2000) {
      this.triggerAlert({
        type: AlertType.HIGH_RESPONSE_TIME,
        severity: 'medium',
        message: `High response times detected: P95 ${metricsCheck.details.responseTimeP95}ms`,
        details: {
          p95: metricsCheck.details.responseTimeP95,
          p99: metricsCheck.details.responseTimeP99 || 0
        },
        correlationId
      })
    }

    // Check memory alerts
    const memoryCheck = health.checks.find(c => c.service === 'memory')

    if (memoryCheck?.details?.usagePercent && typeof memoryCheck.details.usagePercent === 'number' && memoryCheck.details.usagePercent > 85) {
      this.triggerAlert({
        type: AlertType.MEMORY_USAGE,
        severity: memoryCheck.details.usagePercent > 95 ? 'critical' : 'high',
        message: `High memory usage: ${memoryCheck.details.usagePercent}%`,
        details: memoryCheck.details || {},
        correlationId
      })
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(alertData: {
    type: AlertType
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    details: Record<string, any>
    correlationId?: string
  }): void {
    const alertId = `${alertData.type}_${Date.now()}`
    const alert: Alert = {
      id: alertId,
      type: alertData.type,
      severity: alertData.severity,
      message: alertData.message,
      details: alertData.details,
      timestamp: new Date(),
      correlationId: alertData.correlationId,
      resolved: false
    }

    this.alerts.set(alertId, alert)

    // Log the alert
    const logLevel = alertData.severity === 'critical' ? 'error' : alertData.severity === 'high' ? 'warn' : 'info'

    logger[logLevel](`[${alertData.correlationId}] ALERT [${alertData.severity.toUpperCase()}] ${alertData.type}: ${alertData.message}`)

    // In production, you would send notifications here (email, Slack, PagerDuty, etc.)
    if (process.env.NODE_ENV === 'production') {
      this.sendNotification(alert)
    }
  }

  /**
   * Send notification for alert (placeholder implementation)
   */
  private sendNotification(alert: Alert): void {
    // Placeholder for notification implementation
    logger.info(`Notification would be sent for alert: ${alert.id} - ${alert.message}`)

    // Example integrations you could add:
    // - Email notifications
    // - Slack webhooks
    // - PagerDuty integration
    // - SMS notifications
    // - Discord/Teams webhooks
  }

  /**
   * Get active alerts
   */
  getAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(a => !a.resolved)
  }

  /**
   * Get all alerts (including resolved)
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values())
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, correlationId?: string): boolean {
    const alert = this.alerts.get(alertId)

    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      logger.info(`[${correlationId}] Alert resolved: ${alertId} - ${alert.message}`)

      return true
    }

    return false
  }
}

// Global health monitor instance
export const healthMonitor = new HealthMonitor()

/**
 * Health check endpoint handler
 */
export const getHealthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const health = await healthMonitor.performHealthCheck(req)
    // Set appropriate HTTP status based on health
    let statusCode = 200

    if (health.status === HealthStatus.DOWN) {
      statusCode = 503 // Service Unavailable
    } else if (health.status === HealthStatus.CRITICAL) {
      statusCode = 500 // Internal Server Error
    } else if (health.status === HealthStatus.WARNING) {
      statusCode = 200 // OK but with warnings
    }

    res.status(statusCode).json({
      success: health.status === HealthStatus.HEALTHY || health.status === HealthStatus.WARNING,
      data: health,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: getCorrelationId(req)
      }
    })
  } catch (error) {
    logger.error(`Health check failed: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      data: {
        status: HealthStatus.CRITICAL,
        message: 'Health check system failure',
        timestamp: new Date().toISOString()
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: getCorrelationId(req)
      }
    })
  }
}

/**
 * Alerts endpoint handler
 */
export const getAlerts = (req: Request, res: Response): void => {
  try {
    const alerts = healthMonitor.getAlerts()

    res.json({
      success: true,
      data: alerts,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: getCorrelationId(req),
        count: alerts.length
      }
    })
  } catch (error) {
    logger.error(`Failed to get alerts: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      success: false,
      error: 'Failed to get alerts',
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: getCorrelationId(req)
      }
    })
  }
}

export { HealthMonitor }
