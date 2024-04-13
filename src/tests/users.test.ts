/**
 * @file:        index.js
 * @description: Connect to MongoDB 3d-inventory claster
 * @version: 2023-11-26  C2RLO  Add mongo test
 * @version: 2023-11-20  C2RLO  Add logger
 * @version: 2023-10-29  C2RLO  Init
 */

import { faker } from '@faker-js/faker'
import '../../../../../src/utils/loadEnvironment.js'
import { connectToCluster, connectToDb } from '../db/conn'
import { User } from '../routers/users.js'
import { Db, Collection, Document, MongoClient, ObjectId } from 'mongodb'

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
    const mockUser: User = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 10 }),
      rigths: faker.helpers.arrayElements(['admin', 'users', 'models', 'connections', 'attributes'], { min: 1, max: 5 }),
      token: faker.internet.password({ length: 50 }),
      _id: new ObjectId
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
    const deleted = await users.findOne(mock) as User | null
    expect(deleted).toBeNull()
  })

  it('should insert a ten User doc into collection', async () => {
    for (let index = 0; index < 10; index++) {
      mockUser = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password({ length: 10 }),
        rights: faker.helpers.arrayElements(['admin', 'users', 'models', 'connections', 'attributes'], { min: 1, max: 5 }),
        token: faker.internet.password({ length: 50 }),
      }
      await users.insertOne(mockUser)
      const insertedUser = await users.findOne(mockUser)
      expect(insertedUser).toEqual(mockUser)
    }
  })
})
