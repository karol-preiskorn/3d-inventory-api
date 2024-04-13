/**
 * @file: /tests/conn.test.js
 * @module: /tests
 * @description: This file contains the global setup for Jest testing.
 * @version 2024-01-14 C2RLO - Initial
 */

import { Db, MongoClient } from 'mongodb'
import '../utils/loadEnvironment'


describe('ConnectToDatabase Mongo Atlas', () => {
  let connection: MongoClient
  let db: Db

  beforeAll(async () => {
    if (!process.env.ATLAS_URI) {
      throw new Error('ATLAS_URI environment variable is not defined.')
    }
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = connection.db(process.env.DBNAME)
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
