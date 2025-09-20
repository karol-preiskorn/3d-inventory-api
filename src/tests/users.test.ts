/**
 * @file:        index.js
 * @description: Connect to MongoDB 3d-inventory claster
 * @version: 2023-11-26  C2RLO  Add mongo test
 * @version: 2023-11-20  C2RLO  Add logger
 * @version: 2023-10-29  C2RLO  Init
 */

import { Collection, Db, Document, MongoClient, ObjectId } from 'mongodb'
import { User } from '../routers/users'
import '../utils/config'
import { connectToCluster, connectToDb } from '../utils/db'
import { testGenerators } from './testGenerators'

describe('Test Mongo Atlas DB users', () => {
  let db: Db
  let users: Collection<Document>
  let client: MongoClient
  let mockUser

  beforeAll(async () => {
    client = await connectToCluster()
    db = connectToDb(client)
    users = db.collection('users')
  })

  afterAll(async () => {
    await client.close()
  })

  it('should insert a one User doc into collection', async () => {
    const userData = testGenerators.userSimple()
    const mockUser: User = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      permissions: testGenerators.randomArrayElements(['admin', 'users', 'models', 'connections', 'attributes'], { min: 1, max: 5 }),
      token: userData.token,
      _id: new ObjectId()
    }

    await users.insertOne(mockUser)
    const insertedUser = await users.findOne(mockUser)

    expect(insertedUser).toEqual(mockUser)

    const deletedUser = await users.deleteOne(mockUser)

    expect(deletedUser).toEqual(mockUser)
  })

  it('should delete all users', async () => {
    const users = db.collection('users')
    const mock = {}

    await users.deleteMany(mock)
    const deleted = (await users.findOne(mock)) as User | null

    expect(deleted).toBeNull()
  })

  it('should insert a ten User doc into collection', async () => {
    for (let index = 0; index < 10; index++) {
      const userData = testGenerators.userSimple()

      mockUser = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        rights: testGenerators.randomArrayElements(['admin', 'users', 'models', 'connections', 'attributes'], { min: 1, max: 5 }),
        token: userData.token
      }
      await users.insertOne(mockUser)
      const insertedUser = await users.findOne(mockUser)

      expect(insertedUser).toEqual(mockUser)
    }
  })
})
