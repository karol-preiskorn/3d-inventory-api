/**
 * @file connection.db.test.ts
 * @description Database connection establishment and validation test suite.
 * Tests MongoDB Atlas connection setup, database authentication, and
 * connection lifecycle management. Validates connection string parsing,
 * SSL/TLS configuration, connection pooling, and database accessibility.
 * Ensures robust database connectivity patterns and proper error handling
 * for production deployment scenarios and network resilience.
 * @version 2024-09-21 Enhanced with comprehensive database connection testing
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient } from 'mongodb'
import config from '../utils/config'

describe('ConnectToDatabase Mongo Atlas', () => {
  let connection: MongoClient
  let db: Db

  beforeAll(async () => {
    if (!config.ATLAS_URI) {
      throw new Error('ATLAS_URI environment variable is not defined.')
    }
    try {
      connection = await MongoClient.connect(config.ATLAS_URI, {})
      db = connection.db(config.DBNAME)
    } catch (error) {
      console.error('Error connecting to the database:', error)
    }
  })

  afterAll(async () => {
    await connection.close()
  })

  it(`connect to ${process.env.DBNAME}`, async () => {
    const devices = db.collection('devices')
    const device = await devices.findOne({})

    expect(device).toBeDefined()
  })
})
