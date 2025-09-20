/**
 * @file: /tests/conn.test.js
 * @module: /tests
 * @description: This file contains the global setup for Jest testing.
 * @version 2024-01-14 C2RLO - Initial
 */

import '../utils/loadEnvironment'

import { beforeAll, afterAll, describe, it, expect } from '@jest/globals'
import { Db, MongoClient } from 'mongodb'

describe('ConnectToDatabase Mongo Atlas', () => {
  let connection: MongoClient
  let db: Db

  beforeAll(async () => {
    if (!process.env.ATLAS_URI) {
      throw new Error('ATLAS_URI environment variable is not defined.')
    }
    try {
      connection = await MongoClient.connect(process.env.ATLAS_URI, {})
      db = connection.db(process.env.DBNAME)
    }
    catch (error) {
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
