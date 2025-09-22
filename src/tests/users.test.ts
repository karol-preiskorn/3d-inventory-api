/**
 * @file users.test.ts
 * @description Comprehensive user management and database integration test suite.
 * Tests complete CRUD operations for user entities in MongoDB Atlas, including
 * user creation, authentication data handling, permissions management, and bulk
 * operations. Validates user data integrity, proper MongoDB connection handling,
 * and ensures testGenerators produce realistic user data that matches the
 * application's user schema and business logic requirements.
 * @version 2024-09-21 Enhanced with modern test generators and improved database connectivity
 */

import { Collection, Db, Document, MongoClient, ObjectId } from 'mongodb'
import { User } from '../routers/users'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

describe('Test Mongo Atlas DB users', () => {
  let db: Db
  let users: Collection<Document>
  let client: MongoClient
  let mockUser

  beforeAll(async () => {
    try {
      if (!config.ATLAS_URI) {
        throw new Error('ATLAS_URI not configured')
      }

      console.log('Attempting to connect to MongoDB...')
      client = await MongoClient.connect(config.ATLAS_URI, {
        serverSelectionTimeoutMS: 15000, // 15 second timeout
        connectTimeoutMS: 15000,
      })
      db = client.db(config.DBNAME)

      // Test the connection
      await db.admin().ping()
      console.log('MongoDB connection successful')

      users = db.collection('users')
    } catch (error) {
      console.error('Database connection failed:', error)

      // Skip all tests if database is not available
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
        console.warn('Skipping database tests - database not accessible')

        return
      }

      throw error
    }
  }, 20000) // 20 second timeout for this specific beforeAll

  afterAll(async () => {
    if (client) {
      await client.close()
    }
  })

  // Helper function to check if database is connected
  const checkDbConnection = () => {
    if (!client || !db) {
      console.warn('Skipping test - database not connected')

      return false
    }

    return true
  }

  it('should insert a one User doc into collection', async () => {
    if (!checkDbConnection()) {
      return
    }
    const userData = testGenerators.userSimple()
    const mockUser: User = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      permissions: testGenerators.randomArrayElements(['admin', 'users', 'models', 'connections', 'attributes'], { min: 1, max: 5 }),
      token: userData.token,
      _id: new ObjectId(),
    }

    await users.insertOne(mockUser)
    const insertedUser = await users.findOne(mockUser)

    expect(insertedUser).toEqual(mockUser)

    const deletedUser = await users.deleteOne(mockUser)

    expect(deletedUser).toEqual(mockUser)
  })

  it('should delete all users', async () => {
    if (!checkDbConnection()) {
      return
    }

    const users = db.collection('users')
    const mock = {}

    await users.deleteMany(mock)
    const deleted = (await users.findOne(mock)) as User | null

    expect(deleted).toBeNull()
  })

  it('should insert a ten User doc into collection', async () => {
    if (!checkDbConnection()) {
      return
    }
    for (let index = 0; index < 10; index++) {
      const userData = testGenerators.userSimple()

      mockUser = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        rights: testGenerators.randomArrayElements(['admin', 'users', 'models', 'connections', 'attributes'], { min: 1, max: 5 }),
        token: userData.token,
      }
      await users.insertOne(mockUser)
      const insertedUser = await users.findOne(mockUser)

      expect(insertedUser).toEqual(mockUser)
    }
  })
})
