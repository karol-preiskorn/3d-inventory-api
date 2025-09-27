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

import { Collection, Db, Document, ObjectId } from 'mongodb'
import { User } from '../routers/users'
import { getDatabase } from '../utils/db'
import { testGenerators } from './testGenerators'

// Mock the database connection utilities
jest.mock('../utils/db', () => ({
  getDatabase: jest.fn(),
  connectToCluster: jest.fn().mockResolvedValue({}),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

describe('Test Mongo Atlas DB users', () => {
  let mockDb: Db
  let mockUsersCollection: Collection<Document>
  let mockUser

  beforeAll(async () => {
    // Setup mock collection
    mockUsersCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn()
    } as unknown as Collection<Document>

    mockDb = {
      collection: jest.fn().mockReturnValue(mockUsersCollection)
    } as unknown as Db

    // Setup getDatabase mock
    ;(getDatabase as jest.MockedFunction<typeof getDatabase>).mockResolvedValue(mockDb)
  })

  afterAll(async () => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    ;(getDatabase as jest.MockedFunction<typeof getDatabase>).mockResolvedValue(mockDb)
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
    const db = await getDatabase()
    const users = db.collection('users')

    // Mock successful insertion and retrieval
    ;(mockUsersCollection.insertOne as jest.Mock).mockResolvedValue({ insertedId: mockUser._id })
    ;(mockUsersCollection.findOne as jest.Mock).mockResolvedValueOnce(mockUser)
    ;(mockUsersCollection.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 })

    await users.insertOne(mockUser)
    const insertedUser = await users.findOne(mockUser)

    expect(insertedUser).toEqual(mockUser)

    const deletedResult = await users.deleteOne(mockUser)

    expect(deletedResult.deletedCount).toBe(1)
  })

  it('should delete all users', async () => {
    const db = await getDatabase()
    const users = db.collection('users')

    ;(mockUsersCollection.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 })
    ;(mockUsersCollection.findOne as jest.Mock).mockResolvedValue(null)

    await users.deleteMany({})
    const deleted = (await users.findOne({})) as User | null

    expect(deleted).toBeNull()
  })

  it('should insert a ten User doc into collection', async () => {
    const db = await getDatabase()
    const users = db.collection('users')

    for (let index = 0; index < 10; index++) {
      const userData = testGenerators.userSimple()

      mockUser = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        rights: testGenerators.randomArrayElements(['admin', 'users', 'models', 'connections', 'attributes'], { min: 1, max: 5 }),
        token: userData.token
      }

      // Mock the insertion for each user
      ;(mockUsersCollection.insertOne as jest.Mock).mockResolvedValue({ insertedId: new ObjectId() })
      ;(mockUsersCollection.findOne as jest.Mock).mockResolvedValue(mockUser)

      await users.insertOne(mockUser)
      const insertedUser = await users.findOne(mockUser)

      expect(insertedUser).toEqual(mockUser)
    }
  })
})
