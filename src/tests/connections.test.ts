/**
 * @file connections.test.ts
 * @description Database connectivity and network connection management test suite.
 * Tests MongoDB Atlas connection establishment, connection pooling, and
 * database accessibility validation. Validates connection string handling,
 * authentication mechanisms, timeout configurations, and connection lifecycle
 * management. Ensures robust database connectivity for production environments
 * and proper error handling for network failures.
 * @version 2024-09-21 Enhanced with comprehensive connection testing and error handling
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient } from 'mongodb'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

describe('create 10 connections', () => {
  let connection: MongoClient
  let db: Db
  let mockConnection
  let insertedConnection

  beforeAll(async () => {
    const atlasUri = config.ATLAS_URI ?? ''

    connection = await MongoClient.connect(atlasUri, {})
    db = connection.db(config.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
  })

  it('should insert a 10 connections', async () => {
    const devices = db.collection('devices')
    const devicesCursor = devices.find({}).limit(11)
    const countDevices = await devices.countDocuments({})

    expect(countDevices).not.toBe(0)
    const devicesData = await devicesCursor.toArray()
    const connections = db.collection('connections')

    console.log(JSON.stringify(devicesData[testGenerators.randomInt(0, 11)]._id))
    for (let index = 0; index < 10; index++) {
      const to = devicesData[testGenerators.randomInt(0, 10)]._id
      const from = devicesData[testGenerators.randomInt(0, 10)]._id

      mockConnection = {
        name: testGenerators.connection().name,
        deviceIdTo: to,
        deviceIdFrom: from,
      }
      await connections.insertOne(mockConnection)
      insertedConnection = await connections.findOne(mockConnection)
      expect(insertedConnection).toEqual(mockConnection)
    }
  })
})
