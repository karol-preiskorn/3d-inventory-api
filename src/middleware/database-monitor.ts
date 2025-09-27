/**
 * Database performance monitoring and query tracking
 * Monitors MongoDB operations and connection pool performance
 */

import { Request } from 'express'
import { Collection, Db, MongoClient } from 'mongodb'
import { getCorrelationId } from '../middleware/correlation'
import getLogger from '../utils/logger'

const logger = getLogger('db-monitor')

// Database performance metrics
interface DatabaseMetrics {
  queryCount: number
  slowQueryCount: number
  avgQueryTime: number
  connectionPoolSize: number
  activeConnections: number
  errors: number
  lastSlowQuery?: SlowQueryInfo
  queryStats: Map<string, QueryStats>
}

interface SlowQueryInfo {
  query: string
  collection: string
  duration: number
  timestamp: Date
  correlationId?: string
}

interface QueryStats {
  count: number
  totalTime: number
  avgTime: number
  maxTime: number
  minTime: number
}

class DatabaseMonitor {
  private metrics: DatabaseMetrics = {
    queryCount: 0,
    slowQueryCount: 0,
    avgQueryTime: 0,
    connectionPoolSize: 0,
    activeConnections: 0,
    errors: 0,
    queryStats: new Map()
  }

  private readonly SLOW_QUERY_THRESHOLD = 1000 // 1 second
  private readonly MAX_QUERY_STATS = 100 // Keep stats for top 100 operations

  /**
   * Monitor a database operation
   */
  async monitorOperation<T>(
    operation: () => Promise<T>,
    operationType: string,
    collectionName?: string,
    correlationId?: string
  ): Promise<T> {
    const startTime = process.hrtime.bigint()

    try {
      const result = await operation()
      const endTime = process.hrtime.bigint()
      const duration = Number(endTime - startTime) / 1000000 // Convert to milliseconds

      this.recordQuery(operationType, duration, collectionName, correlationId)

      return result
    } catch (error) {
      this.metrics.errors++
      logger.error(`[${correlationId}] Database operation failed: ${operationType} - ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Record query statistics
   */
  private recordQuery(
    operationType: string,
    duration: number,
    collectionName?: string,
    correlationId?: string
  ): void {
    this.metrics.queryCount++

    // Update average query time
    this.metrics.avgQueryTime =
      (this.metrics.avgQueryTime * (this.metrics.queryCount - 1) + duration) / this.metrics.queryCount

    // Check for slow queries
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      this.metrics.slowQueryCount++
      this.metrics.lastSlowQuery = {
        query: operationType,
        collection: collectionName || 'unknown',
        duration,
        timestamp: new Date(),
        correlationId
      }

      logger.warn(`[${correlationId}] Slow database query detected: ${operationType} on ${collectionName} - ${duration.toFixed(2)}ms`)
    }

    // Update query statistics
    const queryKey = collectionName ? `${collectionName}.${operationType}` : operationType
    const existing = this.metrics.queryStats.get(queryKey)

    if (existing) {
      existing.count++
      existing.totalTime += duration
      existing.avgTime = existing.totalTime / existing.count
      existing.maxTime = Math.max(existing.maxTime, duration)
      existing.minTime = Math.min(existing.minTime, duration)
    } else {
      this.metrics.queryStats.set(queryKey, {
        count: 1,
        totalTime: duration,
        avgTime: duration,
        maxTime: duration,
        minTime: duration
      })
    }

    // Limit the number of tracked query stats
    if (this.metrics.queryStats.size > this.MAX_QUERY_STATS) {
      // Remove the least frequently used query
      let minCount = Infinity
      let minKey = ''

      this.metrics.queryStats.forEach((stats, key) => {
        if (stats.count < minCount) {
          minCount = stats.count
          minKey = key
        }
      })

      if (minKey) {
        this.metrics.queryStats.delete(minKey)
      }
    }
  }

  /**
   * Monitor connection pool
   */
  monitorConnectionPool(client: MongoClient): void {
    try {
      // Get connection pool events
      client.on('connectionPoolCreated', () => {
        logger.info('Database connection pool created')
      })

      client.on('connectionCreated', () => {
        this.metrics.activeConnections++
        logger.debug('Database connection created')
      })

      client.on('connectionClosed', () => {
        this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1)
        logger.debug('Database connection closed')
      })

      client.on('connectionPoolCleared', () => {
        this.metrics.activeConnections = 0
        logger.warn('Database connection pool cleared')
      })

      // Monitor server events
      client.on('serverHeartbeatSucceeded', (event) => {
        logger.debug(`Database heartbeat succeeded: ${event.connectionId}`)
      })

      client.on('serverHeartbeatFailed', (event) => {
        logger.error(`Database heartbeat failed: ${event.connectionId} - ${event.failure}`)
      })

    } catch (error) {
      logger.error(`Error setting up connection pool monitoring: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get database metrics
   */
  getMetrics(): DatabaseMetrics & {
    topSlowQueries: Array<{ operation: string; avgTime: number; count: number; maxTime: number }>
    connectionHealth: {
      status: 'healthy' | 'warning' | 'critical'
      message: string
    }
    } {
    // Get top slow queries
    const topSlowQueries = Array.from(this.metrics.queryStats.entries())
      .map(([operation, stats]) => ({
        operation,
        avgTime: stats.avgTime,
        count: stats.count,
        maxTime: stats.maxTime
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10)
    // Assess connection health
    let connectionHealth: { status: 'healthy' | 'warning' | 'critical'; message: string }
    const errorRate = this.metrics.queryCount > 0 ? (this.metrics.errors / this.metrics.queryCount) * 100 : 0
    const slowQueryRate = this.metrics.queryCount > 0 ? (this.metrics.slowQueryCount / this.metrics.queryCount) * 100 : 0

    if (errorRate > 10 || slowQueryRate > 20) {
      connectionHealth = {
        status: 'critical',
        message: `High error rate (${errorRate.toFixed(1)}%) or slow query rate (${slowQueryRate.toFixed(1)}%)`
      }
    } else if (errorRate > 5 || slowQueryRate > 10) {
      connectionHealth = {
        status: 'warning',
        message: `Moderate error rate (${errorRate.toFixed(1)}%) or slow query rate (${slowQueryRate.toFixed(1)}%)`
      }
    } else {
      connectionHealth = {
        status: 'healthy',
        message: 'Database performance is within normal parameters'
      }
    }

    return {
      ...this.metrics,
      topSlowQueries,
      connectionHealth
    }
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      queryCount: 0,
      slowQueryCount: 0,
      avgQueryTime: 0,
      connectionPoolSize: 0,
      activeConnections: 0,
      errors: 0,
      queryStats: new Map()
    }
  }
}

// Global database monitor instance
export const databaseMonitor = new DatabaseMonitor()

/**
 * Enhanced database wrapper with monitoring
 */
export class MonitoredDatabase {
  constructor(
    private db: Db,
    private correlationId?: string
  ) {}

  /**
   * Get collection with monitoring
   */
  collection(name: string): MonitoredCollection {
    return new MonitoredCollection(this.db.collection(name), name, this.correlationId)
  }
}

/**
 * Collection wrapper with operation monitoring
 */
export class MonitoredCollection {
  constructor(
    private collection: Collection,
    private collectionName: string,
    private correlationId?: string
  ) {}

  /**
   * Find documents with monitoring
   */
  async find(filter: any, options?: any): Promise<any[]> {
    return databaseMonitor.monitorOperation(
      async () => this.collection.find(filter, options).toArray(),
      'find',
      this.collectionName,
      this.correlationId
    )
  }

  /**
   * Find one document with monitoring
   */
  async findOne(filter: any, options?: any): Promise<any> {
    return databaseMonitor.monitorOperation(
      async () => this.collection.findOne(filter, options),
      'findOne',
      this.collectionName,
      this.correlationId
    )
  }

  /**
   * Insert one document with monitoring
   */
  async insertOne(doc: any, options?: any): Promise<any> {
    return databaseMonitor.monitorOperation(
      async () => this.collection.insertOne(doc, options),
      'insertOne',
      this.collectionName,
      this.correlationId
    )
  }

  /**
   * Update one document with monitoring
   */
  async updateOne(filter: any, update: any, options?: any): Promise<any> {
    return databaseMonitor.monitorOperation(
      async () => this.collection.updateOne(filter, update, options),
      'updateOne',
      this.collectionName,
      this.correlationId
    )
  }

  /**
   * Delete one document with monitoring
   */
  async deleteOne(filter: any, options?: any): Promise<any> {
    return databaseMonitor.monitorOperation(
      async () => this.collection.deleteOne(filter, options),
      'deleteOne',
      this.collectionName,
      this.correlationId
    )
  }

  /**
   * Count documents with monitoring
   */
  async countDocuments(filter: any, options?: any): Promise<number> {
    return databaseMonitor.monitorOperation(
      async () => this.collection.countDocuments(filter, options),
      'countDocuments',
      this.collectionName,
      this.correlationId
    )
  }

  /**
   * Create index with monitoring
   */
  async createIndex(indexSpec: any, options?: any): Promise<any> {
    return databaseMonitor.monitorOperation(
      async () => this.collection.createIndex(indexSpec, options),
      'createIndex',
      this.collectionName,
      this.correlationId
    )
  }

  /**
   * Get collection information with monitoring
   */
  async collectionInfo(): Promise<any> {
    return databaseMonitor.monitorOperation(
      async () => this.collection.options(),
      'collectionInfo',
      this.collectionName,
      this.correlationId
    )
  }
}

/**
 * Create monitored database instance from request context
 */
export function createMonitoredDatabase(db: Db, req?: Request): MonitoredDatabase {
  const correlationId = req ? getCorrelationId(req) : undefined

  return new MonitoredDatabase(db, correlationId)
}

export { DatabaseMonitor }
