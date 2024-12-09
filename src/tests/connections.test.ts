/**
 * @file        connections.test.js
 * @description Create connection to DB and test the connection
 * @version 2024-10-29 C2RLO - Init
 */

import '../utils/loadEnvironment'

import { Db, MongoClient } from 'mongodb'

import { faker } from '@faker-js/faker'

describe('create 10 connections', () => {
  let connection: MongoClient
  let db: Db
  let mockConnection
  let insertedConnection

  beforeAll(async () => {
    const atlasUri = process.env.ATLAS_URI ?? ''
    connection = await MongoClient.connect(atlasUri, {})
    db = connection.db(process.env.DBNAME)
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
    console.log(JSON.stringify(devicesData[faker.number.int({ min: 0, max: 11 })]._id))
    for (let index = 0; index < 10; index++) {
      const to = devicesData[faker.number.int({ min: 0, max: 10 })]._id
      const from = devicesData[faker.number.int({ min: 0, max: 10 })]._id
      mockConnection = {
        name: faker.color.human() + ' ' + faker.commerce.product(),
        deviceIdTo: to,
        deviceIdFrom: from
      }
      await connections.insertOne(mockConnection)
      insertedConnection = await connections.findOne(mockConnection)
      expect(insertedConnection).toEqual(mockConnection)
    }
  })
})
