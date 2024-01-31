/*
 * File:        index.js
 * Description: Connect to MongoDB 3d-inventory claster
 * Used by:     testing connect to Mongo Atlas
 * Dependency:  .env (not push to git)
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-11-26  C2RLO  Add mongo test
 * 2023-11-20  C2RLO  Add logger
 * 2023-10-29  C2RLO  Init
 */

import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { connectToCluster, connectToDb } from '../db/conn.js'

describe('Test Mongo Atlas DB users', () => {

  let db
  let users
  let client
  let mockUser

  beforeAll(async () => {
    client = await connectToCluster()
    db = await connectToDb(client)
    users = db.collection('users')
  })

  afterAll(async () => {
    await client.close()
  })

  it('should insert a one User doc into collection', async () => {

    mockUser = {
      'name': faker.person.fullName(),
      'email': faker.internet.email(),
      'password': faker.internet.password({ length: 10 }),
      'rights': faker.helpers.arrayElements(['admin', 'users', 'models', 'connections', 'attributes'], { min: 1, max: 5 }),
      'token': faker.internet.password({ length: 50 })
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
    const deleted = await users.findOne(mock)
    expect(deleted).toBeNull()
  })

  it('should insert a ten User doc into collection', async () => {
    for (let index = 0; index < 10; index++) {
      mockUser = {
        'name': faker.person.fullName(),
        'email': faker.internet.email(),
        'password': faker.internet.password({ length: 10 }),
        'rights': faker.helpers.arrayElements(['admin', 'users', 'models', 'connections', 'attributes'], { min: 1, max: 5 }),
        'token': faker.internet.password({ length: 50 })
      }
      await users.insertOne(mockUser)
      const insertedUser = await users.findOne(mockUser)
      expect(insertedUser).toEqual(mockUser)
    }
  })
})
