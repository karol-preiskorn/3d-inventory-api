/**
 * @file: /tests/conn.test copy.js
 * @description: This file contains the global setup for Jest testing.
 * @version 2024-01-20 C2RLO - Initial
 */

import { connectToCluster, connectToDb } from '../db/conn.js'
import '../utils/loadEnvironment.js'

describe('ConnectToDatabase Mongo Atlas', () => {
  it('should insert a doc into collection', async () => {
    const client = await connectToCluster()
    const db = await connectToDb(client)

    const users = db.collection('users')

    const mockUser = { _id: 'some-user-id', name: 'John' }
    await users.insertOne(mockUser)

    const insertedUser = await users.findOne({ _id: 'some-user-id' })
    expect(insertedUser).toEqual(mockUser)

    const deleteUser = await users.deleteOne({ _id: 'some-user-id' })
    expect(deleteUser).toEqual({
      acknowledged: true,
      deletedCount: 1,
    })
  })

  it(`connect to ${process.env.DBNAME}`, async () => {
    const client = await connectToCluster()
    const db = await connectToDb(client)

    const devices = db.collection('devices')
    const device = await devices.findOne({})
    expect(device).toBeDefined()
  })
})
