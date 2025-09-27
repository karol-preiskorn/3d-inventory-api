/**
 * Application metrics and monitoring system
 * Provides Prometheus-compatible metrics for monitoring
 */

import { NextFunction, Request, Response } from 'express'
import getLogger from '../utils/logger'
import { getCorrelationId, getRequestStartTime } from './correlation'

const logger = getLogger('metrics')

// Metrics storage
interface Metrics {
  requestCount: Map<string, number> // method:path -> count
  requestDuration: Map<string, number[]> // method:path -> durations array
  errorCount: Map<string, number> // status_code -> count
  activeRequests: number
  totalRequests: number
  responseTimeP95: number
  responseTimeP99: number
  errorRate: number
  lastCalculated: Date
}

class MetricsCollector {
  private metrics: Metrics = {
    requestCount: new Map(),
    requestDuration: new Map(),
    errorCount: new Map(),
    activeRequests: 0,
    totalRequests: 0,
    responseTimeP95: 0,
    responseTimeP99: 0,
    errorRate: 0,
    lastCalculated: new Date()
  }

  private readonly MAX_DURATION_SAMPLES = 1000 // Keep last 1000 samples for percentile calculation

  /**
   * Record a request start
   */
  recordRequestStart(method: string, path: string): void {
    this.metrics.activeRequests++
    this.metrics.totalRequests++

    const key = `${method}:${path}`

    this.metrics.requestCount.set(key, (this.metrics.requestCount.get(key) || 0) + 1)
  }

  /**
   * Record a request completion
   */
  recordRequestComplete(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    correlationId: string
  ): void {
    this.metrics.activeRequests = Math.max(0, this.metrics.activeRequests - 1)

    const key = `${method}:${path}`
    const durations = this.metrics.requestDuration.get(key) || []

    durations.push(duration)

    // Keep only the most recent samples
    if (durations.length > this.MAX_DURATION_SAMPLES) {
      durations.shift()
    }

    this.metrics.requestDuration.set(key, durations)

    // Track error rates
    if (statusCode >= 400) {
      const errorKey = statusCode.toString()

      this.metrics.errorCount.set(errorKey, (this.metrics.errorCount.get(errorKey) || 0) + 1)

      logger.warn(`[${correlationId}] Error response: ${method} ${path} - ${statusCode}`)
    }

    // Log slow requests
    if (duration > 1000) {
      logger.warn(`[${correlationId}] Slow request: ${method} ${path} - ${duration.toFixed(2)}ms`)
    }

    this.calculatePercentiles()
  }

  /**
   * Calculate response time percentiles
   */
  private calculatePercentiles(): void {
    const allDurations: number[] = []

    this.metrics.requestDuration.forEach(durations => {
      allDurations.push(...durations)
    })

    if (allDurations.length === 0) return

    allDurations.sort((a, b) => a - b)

    const p95Index = Math.floor(allDurations.length * 0.95)
    const p99Index = Math.floor(allDurations.length * 0.99)

    this.metrics.responseTimeP95 = allDurations[p95Index] || 0
    this.metrics.responseTimeP99 = allDurations[p99Index] || 0

    // Calculate error rate
    const totalErrors = Array.from(this.metrics.errorCount.values()).reduce((sum, count) => sum + count, 0)

    this.metrics.errorRate = this.metrics.totalRequests > 0 ? (totalErrors / this.metrics.totalRequests) * 100 : 0

    this.metrics.lastCalculated = new Date()
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): Metrics & {
    topEndpoints: Array<{ endpoint: string; requests: number; avgDuration: number }>
    statusCodeDistribution: Array<{ code: string; count: number; percentage: number }>
    } {
    // Calculate top endpoints by request count
    const endpointStats = Array.from(this.metrics.requestCount.entries())
      .map(([endpoint, requests]) => {
        const durations = this.metrics.requestDuration.get(endpoint) || []
        const avgDuration = durations.length > 0
          ? durations.reduce((sum, d) => sum + d, 0) / durations.length
          : 0

        return { endpoint, requests, avgDuration }
      })
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10)
    // Calculate status code distribution
    const totalErrors = Array.from(this.metrics.errorCount.values()).reduce((sum, count) => sum + count, 0)
    const statusCodeDistribution = Array.from(this.metrics.errorCount.entries())
      .map(([code, count]) => ({
        code,
        count,
        percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)

    return {
      ...this.metrics,
      topEndpoints: endpointStats,
      statusCodeDistribution
    }
  }

  /**
   * Get Prometheus-formatted metrics
   */
  getPrometheusMetrics(): string {
    const metrics = this.getMetrics()
    let output = ''

    // Request count metrics
    output += '# HELP http_requests_total Total number of HTTP requests\n'
    output += '# TYPE http_requests_total counter\n'
    metrics.requestCount.forEach((count, key) => {
      const [method, path] = key.split(':')

      output += `http_requests_total{method="${method}",path="${path}"} ${count}\n`
    })

    // Request duration metrics
    output += '# HELP http_request_duration_ms HTTP request duration in milliseconds\n'
    output += '# TYPE http_request_duration_ms histogram\n'
    output += `http_request_duration_ms_p95 ${metrics.responseTimeP95}\n`
    output += `http_request_duration_ms_p99 ${metrics.responseTimeP99}\n`

    // Error metrics
    output += '# HELP http_errors_total Total number of HTTP errors\n'
    output += '# TYPE http_errors_total counter\n'
    metrics.errorCount.forEach((count, statusCode) => {
      output += `http_errors_total{status_code="${statusCode}"} ${count}\n`
    })

    // Active requests
    output += '# HELP http_requests_active Number of currently active requests\n'
    output += '# TYPE http_requests_active gauge\n'
    output += `http_requests_active ${metrics.activeRequests}\n`

    // Error rate
    output += '# HELP http_error_rate Error rate percentage\n'
    output += '# TYPE http_error_rate gauge\n'
    output += `http_error_rate ${metrics.errorRate}\n`

    return output
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.metrics = {
      requestCount: new Map(),
      requestDuration: new Map(),
      errorCount: new Map(),
      activeRequests: 0,
      totalRequests: 0,
      responseTimeP95: 0,
      responseTimeP99: 0,
      errorRate: 0,
      lastCalculated: new Date()
    }
  }
}

// Global metrics collector instance
const metricsCollector = new MetricsCollector()

/**
 * Metrics collection middleware
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const path = req.route?.path || req.path
  const method = req.method
  const correlationId = getCorrelationId(req)

  // Record request start
  metricsCollector.recordRequestStart(method, path)

  // Override res.end to capture completion metrics
  const originalEnd = res.end

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.end = function (...args: any[]) {
    const startTime = getRequestStartTime(req)
    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1000000 // Convert to milliseconds

    // Record request completion
    metricsCollector.recordRequestComplete(method, path, res.statusCode, duration, correlationId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalEnd as any).apply(this, args)
  }

  next()
}

/**
 * Metrics endpoint handler
 */
export const getMetrics = (req: Request, res: Response): void => {
  try {
    const metrics = metricsCollector.getMetrics()

    res.json({
      success: true,
      data: metrics,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: getCorrelationId(req)
      }
    })
  } catch (error) {
    logger.error(`Error getting metrics: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics',
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: getCorrelationId(req)
      }
    })
  }
}

/**
 * Prometheus metrics endpoint handler
 */
export const getPrometheusMetrics = (req: Request, res: Response): void => {
  try {
    const prometheusMetrics = metricsCollector.getPrometheusMetrics()

    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
    res.send(prometheusMetrics)
  } catch (error) {
    logger.error(`Error getting Prometheus metrics: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).send('Error generating metrics')
  }
}

export { metricsCollector }
