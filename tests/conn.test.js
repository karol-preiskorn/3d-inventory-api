/**
 * @file: /tests/conn.test.js
 * @module: /tests
 * @description:
 * @version 2024-01-14 C2RLO - Initial
**/

import '../utils/loadEnvironment'
const { MongoClient } = require('mongodb')

describe('ConnectToDatabase Mongo Atlas', () => {
  let connection
  let db

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = await connection.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await connection.close()
  })

  it('should insert a doc into collection', async () => {
    const users = db.collection('users')

    const mockUser = { _id: 'some-user-id', name: 'John' }
    await users.insertOne(mockUser)

    const insertedUser = await users.findOne({ _id: 'some-user-id' })
    expect(insertedUser).toEqual(mockUser)

    const deleteUser = await users.deleteOne({ _id: 'some-user-id' })
    expect(deleteUser).toEqual({
      'acknowledged': true,
      'deletedCount': 1,
    })
  })

  it(`connect to ${process.env.DBNAME}`, async () => {
    const devices = db.collection('devices')
    const device = await devices.findOne({})
    expect(device).toBeDefined()
  })
})
