/**
 * @resume Connect to Mongo Atlas DB with connection pooling optimization.
 * @module db/conn
 * @description This module exports an optimized MongoDB connection service with pooling.
 */

import type { NextFunction, Request, Response } from 'express'
import { MongoClient, type Db, type MongoClientOptions } from 'mongodb'
import config from './config'
import log from './logger'

const logger = log('db')
// Configurable emoji usage for logs and errors
const useEmoji = config.USE_EMOJI ?? true

/**
 * MongoDB connection pool configuration
 */
interface ConnectionPoolConfig {
  maxPoolSize: number
  minPoolSize: number
  maxIdleTimeMS: number
  serverSelectionTimeoutMS: number
  connectTimeoutMS: number
  socketTimeoutMS: number
  heartbeatFrequencyMS: number
  maxConnecting: number
}

/**
 * Connection pool configuration based on environment
 */
const poolConfig: ConnectionPoolConfig = {
  maxPoolSize: config.NODE_ENV === 'production' ? 20 : 10,
  minPoolSize: config.NODE_ENV === 'production' ? 5 : 1,
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000, // Check server health every 10 seconds
  maxConnecting: 2 // Limit concurrent connection attempts
}
/**
 * MongoDB connection options optimized for connection pooling.
 * @type {MongoClientOptions}
 */
const mongoOptions: MongoClientOptions = {
  // SSL/TLS configuration
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: false,

  // Connection pool settings
  maxPoolSize: poolConfig.maxPoolSize,
  minPoolSize: poolConfig.minPoolSize,
  maxIdleTimeMS: poolConfig.maxIdleTimeMS,
  maxConnecting: poolConfig.maxConnecting,

  // Connection timing
  serverSelectionTimeoutMS: poolConfig.serverSelectionTimeoutMS,
  connectTimeoutMS: poolConfig.connectTimeoutMS,
  socketTimeoutMS: poolConfig.socketTimeoutMS,
  heartbeatFrequencyMS: poolConfig.heartbeatFrequencyMS,

  // Reliability settings
  retryWrites: true,
  retryReads: true,
  w: 'majority',

  // Monitoring
  monitorCommands: config.NODE_ENV !== 'production'
}

/**
 * Database Connection Service
 * Manages MongoDB connection pooling and provides database instances
 */
class DatabaseService {
  private static instance: DatabaseService
  private client: MongoClient | null = null
  private db: Db | null = null
  private isConnecting = false
  private connectionPromise: Promise<void> | null = null
  private healthCheckInterval: NodeJS.Timeout | null = null
  private lastHealthCheck = 0
  private readonly HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }

    return DatabaseService.instance
  }

  /**
   * Initialize the database connection
   */
  public async initialize(): Promise<void> {
    // Check if client exists and is still connected
    if (this.client && this.db) {
      try {
        // Test the connection with a quick ping
        await this.db.admin().ping()

        return // Already initialized and connected
      } catch {
        // Connection is broken, continue with reconnection
        logger.warn(`${useEmoji ? '⚠️ ' : ''}Existing connection failed ping test, reconnecting...`)
      }
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise
    }

    this.isConnecting = true
    this.connectionPromise = this._connect()

    try {
      await this.connectionPromise
    } finally {
      this.isConnecting = false
      this.connectionPromise = null
    }
  }

  /**
   * Private method to establish connection
   */
  private async _connect(): Promise<void> {
    const mongoUri = config.ATLAS_URI

    if (!mongoUri || typeof mongoUri !== 'string') {
      const msg = `${useEmoji ? '❌ ' : ''}ATLAS_URI environment variable is not set or invalid.`

      logger.error(msg)
      throw new Error(msg)
    }

    if (!config.DBNAME || typeof config.DBNAME !== 'string') {
      throw new Error('Invalid or undefined DBNAME in configuration.')
    }

    try {
      // Close existing connection if any
      if (this.client) {
        await this._disconnect()
      }

      logger.info(`${useEmoji ? '🔄 ' : ''}Connecting to MongoDB Atlas...`)
      this.client = new MongoClient(mongoUri, mongoOptions)

      await this.client.connect()
      this.db = this.client.db(config.DBNAME)

      // Test the connection
      await this.db.admin().ping()

      logger.info(`${useEmoji ? '✅ ' : ''}Connected to MongoDB Atlas Database: ${config.DBNAME}`)
      logger.info(`${useEmoji ? '📊 ' : ''}Connection pool configured - Max: ${poolConfig.maxPoolSize}, Min: ${poolConfig.minPoolSize}`)

      // Setup connection monitoring
      this._setupConnectionMonitoring()
      this._startHealthChecks()

    } catch (error) {
      const errMsg = `${useEmoji ? '❌ ' : ''}MongoDB connection failed: ${error instanceof Error ? error.message : String(error)}`

      logger.error(errMsg)

      // Clean up on failure
      if (this.client) {
        await this.client.close().catch(() => {}) // Ignore close errors
        this.client = null
      }
      this.db = null

      throw new Error(errMsg)
    }
  }

  /**
   * Setup connection event monitoring
   */
  private _setupConnectionMonitoring(): void {
    if (!this.client) return

    this.client.on('connectionPoolCreated', () => {
      logger.info(`${useEmoji ? '🏊 ' : ''}MongoDB connection pool created`)
    })

    this.client.on('connectionPoolClosed', () => {
      logger.warn(`${useEmoji ? '❌ ' : ''}MongoDB connection pool closed`)
    })

    this.client.on('connectionCreated', () => {
      logger.debug(`${useEmoji ? '🔗 ' : ''}New MongoDB connection created`)
    })

    this.client.on('connectionClosed', () => {
      logger.debug(`${useEmoji ? '🔌 ' : ''}MongoDB connection closed`)
    })

    this.client.on('serverOpening', () => {
      logger.info(`${useEmoji ? '🚀 ' : ''}MongoDB server connection opening`)
    })

    this.client.on('serverClosed', () => {
      logger.warn(`${useEmoji ? '⚠️ ' : ''}MongoDB server connection closed`)
    })

    this.client.on('error', (error) => {
      logger.error(`${useEmoji ? '❌ ' : ''}MongoDB connection error: ${error.message}`)
    })
  }

  /**
   * Start periodic health checks
   */
  private _startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      await this._healthCheck()
    }, this.HEALTH_CHECK_INTERVAL)
  }

  /**
   * Perform health check
   */
  private async _healthCheck(): Promise<void> {
    try {
      if (!this.db || !this.client) {
        logger.warn(`${useEmoji ? '⚠️ ' : ''}Database not available for health check`)

        return
      }

      const start = Date.now()

      await this.db.admin().ping()
      const duration = Date.now() - start

      this.lastHealthCheck = Date.now()

      if (duration > 1000) {
        logger.warn(`${useEmoji ? '⚠️ ' : ''}Database health check slow: ${duration}ms`)
      } else {
        logger.debug(`${useEmoji ? '💓 ' : ''}Database health check OK: ${duration}ms`)
      }
    } catch (error) {
      logger.error(`${useEmoji ? '❌ ' : ''}Database health check failed: ${error instanceof Error ? error.message : String(error)}`)
      // Attempt reconnection on health check failure
      this._reconnect().catch((reconnectError) => {
        logger.error(`${useEmoji ? '❌ ' : ''}Database reconnection failed: ${reconnectError instanceof Error ? reconnectError.message : String(reconnectError)}`)
      })
    }
  }

  /**
   * Attempt to reconnect to the database
   */
  private async _reconnect(): Promise<void> {
    logger.info(`${useEmoji ? '🔄 ' : ''}Attempting to reconnect to database...`)

    try {
      await this._disconnect()
      await this.initialize()
      logger.info(`${useEmoji ? '✅ ' : ''}Database reconnection successful`)
    } catch (error) {
      logger.error(`${useEmoji ? '❌ ' : ''}Database reconnection failed: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Get the database instance
   */
  public async getDatabase(): Promise<Db> {
    // Check if we have a valid connection
    if (!this.db || !this.client) {
      logger.info(`${useEmoji ? '🔄 ' : ''}Database not available, attempting to connect...`)
      await this.initialize()
    } else {
      // Test the connection
      try {
        await this.db.admin().ping()
      } catch (error) {
        logger.warn(`${useEmoji ? '⚠️ ' : ''}Database connection test failed, reconnecting: ${error instanceof Error ? error.message : String(error)}`)
        await this.initialize()
      }
    }

    if (!this.db) {
      throw new Error('Database connection not available')
    }

    return this.db
  }

  /**
   * Get connection pool status
   */
  public getConnectionStatus(): {
    isConnected: boolean
    lastHealthCheck: number
    poolConfig: ConnectionPoolConfig
    } {
    return {
      isConnected: !!(this.client && this.db),
      lastHealthCheck: this.lastHealthCheck,
      poolConfig
    }
  }

  /**
   * Disconnect from the database
   */
  private async _disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    if (this.client) {
      try {
        await this.client.close()
        logger.info(`${useEmoji ? '✅ ' : ''}MongoDB connection closed successfully`)
      } catch (error) {
        logger.error(`${useEmoji ? '❌ ' : ''}Failed to close MongoDB connection: ${error}`)
        throw error
      } finally {
        this.client = null
        this.db = null
      }
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info(`${useEmoji ? '🔄 ' : ''}Shutting down database service...`)
    await this._disconnect()
    logger.info(`${useEmoji ? '✅ ' : ''}Database service shutdown complete`)
  }
}

// Create singleton instance
const dbService = DatabaseService.getInstance()

/**
 * Initialize database connection (replaces connectToCluster + connectToDb pattern)
 */
export async function initializeDatabase(): Promise<void> {
  await dbService.initialize()
}

/**
 * Get database instance with connection pooling
 */
export async function getDatabase(): Promise<Db> {
  return dbService.getDatabase()
}

/**
 * Get connection status for monitoring
 */
export function getDatabaseStatus(): {
  isConnected: boolean
  lastHealthCheck: number
  poolConfig: ConnectionPoolConfig
  } {
  return dbService.getConnectionStatus()
}

/**
 * Shutdown database service gracefully
 */
export async function shutdownDatabase(): Promise<void> {
  await dbService.shutdown()
}

// Legacy functions - marked as deprecated but maintained for compatibility
/**
 * @deprecated Use getDatabase() instead for better connection pooling
 * Connects to the MongoDB Atlas cluster.
 * @returns {Promise<MongoClient>} The connected MongoDB client.
 * @throws {Error} If the connection fails or ATLAS_URI is not set.
 */
export async function connectToCluster(): Promise<MongoClient> {
  const mongoUri = config.ATLAS_URI

  if (!mongoUri || typeof mongoUri !== 'string') {
    const msg = `${useEmoji ? '❌ ' : ''}ATLAS_URI environment variable is not set or invalid.`

    logger.error(msg)
    throw new Error(msg)
  }

  try {
    const client = new MongoClient(mongoUri, mongoOptions)

    await client.connect()
    logger.info(`${useEmoji ? '✅ ' : ''}Connected to MongoDB Atlas Cluster`)

    return client
  } catch (error) {
    const errMsg = `${useEmoji ? '❌ ' : ''}MongoDB connection to ${config.DBNAME} failed: ${error instanceof Error ? error.message : String(error)}`

    logger.error(errMsg)
    throw new Error(errMsg)
  }
}

/**
 * Connects to the specified MongoDB database.
 * @param {MongoClient} client - The connected MongoDB client.
 * @returns {Db} The MongoDB database instance.
 */
export function connectToDb(client: MongoClient): Db {
  if (!config.DBNAME || typeof config.DBNAME !== 'string') {
    throw new Error('Invalid or undefined DBNAME in configuration.')
  }
  try {
    const db = client.db(config.DBNAME)

    logger.info(`✅ Successfully connected to Atlas DB ${config.DBNAME}`)

    return db
  } catch (error) {
    logger.error(`❌ Connection to Atlas DB failed (${config.DBNAME}): ${error instanceof Error ? error.message : error}`)
    throw new Error(`❌ Connection to Atlas DB failed (${config.DBNAME}): ${error}`)
  }
}

/**
 * Closes the MongoDB connection.
 * @param {MongoClient} connection - The MongoDB connection.
 * @returns {void}
 */
export async function closeConnection(client: MongoClient): Promise<void> {
  try {
    await client.close()
    logger.info('✅ MongoDB connection closed successfully.')
  } catch (error) {
    logger.error(`❌ Failed to close MongoDB connection: ${error}`)
    // Optionally, rethrow or handle the error as needed
    throw error
  }
}

let lastPingTime = 0

export let cachedDb: Db | null = null

export let cachedMongoClient: MongoClient | null = null

const PING_INTERVAL_MS = 60000 // 60 seconds

export async function getDb(): Promise<Db | null> {
  const now = Date.now()

  if (cachedDb && now - lastPingTime < PING_INTERVAL_MS) {
    return cachedDb
  }
  try {
    if (config.ATLAS_URI) {
      if (!cachedMongoClient) {
        cachedMongoClient = await connectToCluster()
        cachedDb = connectToDb(cachedMongoClient)
      }
      if (cachedDb) {
        await cachedDb.admin().ping()
        lastPingTime = Date.now()

        return cachedDb
      } else {
        logger.error('No cachedDb instance available for ping.')

        return null
      }
    } else {
      logger.warn('⚠️ No MongoDB URI provided, running without database')

      return null
    }
  } catch (error) {
    logger.error(`Failed to connect to the database: ${error instanceof Error ? error.message : String(error)}`)
    cachedDb = null
    cachedMongoClient = null

    return null
  }
}

// db middleware for attaching db instance to request
export const dbConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Attach the db instance to req.app.locals for access in routes
    req.app.locals.db = await getDb()

    return next()
  } catch (error) {
    return next(error)
  }
}
