/**
 * @file UserService.test.ts
 * @description Service layer tests for UserService to improve service coverage
 * @module tests
 */

import * as bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import { UserRole } from '../middlewares/auth'
import { CreateLog } from '../services/logs'
import { UserService } from '../services/UserService'
import { closeConnection, connectToCluster, connectToDb } from '../utils/db'

// Mock dependencies
jest.mock('../utils/db')
jest.mock('../services/logs')
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
  compare: jest.fn().mockResolvedValue(true)
}))
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}))

const mockConnectToCluster = connectToCluster as jest.MockedFunction<typeof connectToCluster>
const mockConnectToDb = connectToDb as jest.MockedFunction<typeof connectToDb>
const mockCloseConnection = closeConnection as jest.MockedFunction<typeof closeConnection>
const mockCreateLog = CreateLog as jest.MockedFunction<typeof CreateLog>
// Helper function to create mock user
const createMockUser = () => ({
  _id: new ObjectId('68e2608640c92a526687cf08'),
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedPassword123',
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  loginAttempts: 0,
  lockUntil: undefined,
  lastLogin: new Date('2024-01-01')
})

describe('UserService - Service Layer Coverage Tests', () => {
  let userService: UserService
  let mockClient: any
  let mockDb: any
  let mockCollection: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock MongoDB objects
    mockCollection = {
      findOne: jest.fn(),
      find: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      createIndex: jest.fn(),
      countDocuments: jest.fn()
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    }

    mockClient = {
      close: jest.fn()
    }

    mockConnectToCluster.mockResolvedValue(mockClient)
    mockConnectToDb.mockReturnValue(mockDb)
    mockCreateLog.mockResolvedValue({} as any)

    // Get service instance
    userService = UserService.getInstance()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = UserService.getInstance()
      const instance2 = UserService.getInstance()

      expect(instance1).toBe(instance2)
      expect(instance1).toBeInstanceOf(UserService)
    })
  })

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123!',
        role: UserRole.USER
      }
      const mockInsertResult = {
        insertedId: new ObjectId(),
        acknowledged: true
      }
      const mockCreatedUser = createMockUser()

      mockCreatedUser._id = mockInsertResult.insertedId

      mockCollection.findOne
        .mockResolvedValueOnce(null) // User doesn't exist initially
        .mockResolvedValueOnce(mockCreatedUser) // Return created user
      mockCollection.insertOne.mockResolvedValue(mockInsertResult)

      const result = await userService.createUser(userData)

      expect(mockConnectToCluster).toHaveBeenCalled()
      expect(mockConnectToDb).toHaveBeenCalledWith(mockClient)
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        $or: [
          { username: 'testuser' },
          { email: 'test@example.com' }
        ]
      })
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedPassword123',
          role: UserRole.USER,
          isActive: true
        })
      )
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
      expect(typeof result._id).toBe('string')
      expect(result.username).toBe('testuser')
      expect(result.email).toBe('test@example.com')
      expect(result.role).toBe(UserRole.USER)
      expect(result.isActive).toBe(true)
    })

    it('should handle duplicate username creation', async () => {
      const userData = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123!',
        role: UserRole.USER
      }

      mockCollection.findOne.mockResolvedValue({ username: 'existinguser' }) // User exists

      await expect(userService.createUser(userData)).rejects.toThrow()
      expect(mockCollection.insertOne).not.toHaveBeenCalled()
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should handle duplicate email creation', async () => {
      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123!',
        role: UserRole.USER
      }

      mockCollection.findOne.mockResolvedValue({ email: 'existing@example.com' }) // Email exists

      await expect(userService.createUser(userData)).rejects.toThrow()
      expect(mockCollection.insertOne).not.toHaveBeenCalled()
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('getUserByUsername', () => {
    it('should retrieve user by username successfully', async () => {
      const mockUser = createMockUser()

      mockCollection.findOne.mockResolvedValue(mockUser)

      const result = await userService.getUserByUsername('testuser')

      expect(mockConnectToCluster).toHaveBeenCalled()
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        username: 'testuser',
        isActive: { $ne: false }
      })
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
      expect(result).toEqual(mockUser)
    })

    it('should return null for non-existent user', async () => {
      mockCollection.findOne.mockResolvedValue(null)

      const result = await userService.getUserByUsername('nonexistent')

      expect(result).toBeNull()
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate valid user credentials', async () => {
      const mockUser = createMockUser()

      mockUser.lockUntil = undefined
      mockUser.loginAttempts = 0

      mockCollection.findOne.mockResolvedValue(mockUser)
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 } as any)
      // Mock bcrypt.compare to return true
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never)

      const result = await userService.authenticateUser('testuser', 'password123!')

      expect(mockConnectToCluster).toHaveBeenCalled()
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        username: 'testuser',
        isActive: { $ne: false }
      })
      expect(bcrypt.compare).toHaveBeenCalledWith('password123!', mockUser.password)
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
      expect(result).toEqual(mockUser)
    })

    it('should return null for invalid credentials', async () => {
      mockCollection.findOne.mockResolvedValue(null)

      const result = await userService.authenticateUser('wronguser', 'wrongpass')

      expect(result).toBeNull()
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should return null for inactive user', async () => {
      // Inactive users won't be found by the query due to isActive: { $ne: false }
      mockCollection.findOne.mockResolvedValue(null)

      const result = await userService.authenticateUser('inactiveuser', 'password123!')

      expect(result).toBeNull()
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('getAllUsers', () => {
    it('should retrieve all users successfully', async () => {
      const mockUsers = [
        {
          _id: new ObjectId(),
          username: 'admin',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: new ObjectId(),
          username: 'user1',
          email: 'user1@example.com',
          role: UserRole.USER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockCollection.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockUsers)
      })

      const result = await userService.getAllUsers()

      expect(mockConnectToCluster).toHaveBeenCalled()
      expect(mockCollection.find).toHaveBeenCalledWith({ isActive: { $ne: false } })
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
      expect(result).toHaveLength(2)
      expect(typeof result[0]._id).toBe('string')
      expect(result[0].username).toBe('admin')
      expect(typeof result[1]._id).toBe('string')
      expect(result[1].username).toBe('user1')
    })

    it('should return empty array when no users exist', async () => {
      mockCollection.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([])
      })

      const result = await userService.getAllUsers()

      expect(result).toEqual([])
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = new ObjectId().toString()
      const updateData = {
        email: 'newemail@example.com',
        role: UserRole.ADMIN
      }
      const mockExistingUser = createMockUser()
      const mockUpdatedUser = {
        ...mockExistingUser,
        email: 'newemail@example.com',
        role: UserRole.ADMIN,
        updatedAt: new Date()
      }

      mockCollection.findOne
        .mockResolvedValueOnce(mockExistingUser) // First call to check if user exists
        .mockResolvedValueOnce(null) // Second call for email duplicate check (no duplicate)
      mockCollection.findOneAndUpdate.mockResolvedValue(mockUpdatedUser)

      const result = await userService.updateUser(userId, updateData)

      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(userId) })
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new ObjectId(userId) },
        {
          $set: expect.objectContaining({
            email: 'newemail@example.com',
            role: UserRole.ADMIN,
            updatedAt: expect.any(Date)
          })
        },
        { returnDocument: 'after' }
      )
      expect(typeof result._id).toBe('string')
      expect(result.username).toBe('testuser')
      expect(result.email).toBe('newemail@example.com')
      expect(result.role).toBe(UserRole.ADMIN)
    })

    it('should handle non-existent user update', async () => {
      const userId = new ObjectId().toString()
      const updateData = { email: 'new@example.com' }

      mockCollection.findOne.mockResolvedValue(null) // User not found

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow('User not found')
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = new ObjectId().toString()
      const mockUser = createMockUser()
      const mockDeleteResult = {
        deletedCount: 1,
        acknowledged: true
      }

      mockCollection.findOne.mockResolvedValue(mockUser) // User exists
      mockCollection.deleteOne.mockResolvedValue(mockDeleteResult)

      const result = await userService.deleteUser(userId)

      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(userId) })
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: new ObjectId(userId) })
      expect(result).toBe(true)
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should handle non-existent user deletion', async () => {
      const userId = new ObjectId().toString()

      mockCollection.findOne.mockResolvedValue(null) // User not found

      await expect(userService.deleteUser(userId)).rejects.toThrow('User not found')
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('Error Handling and Connection Management', () => {
    it('should always close database connection on success', async () => {
      mockCollection.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([])
      })

      await userService.getAllUsers()

      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should always close database connection on error', async () => {
      mockCollection.findOne.mockRejectedValue(new Error('Database error'))

      try {
        await userService.getUserByUsername('testuser')
      } catch (error) {
        // Expected error
        expect(error).toBeInstanceOf(Error)
      }

      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should handle connection errors gracefully', async () => {
      mockConnectToCluster.mockRejectedValue(new Error('Connection failed'))

      await expect(userService.getAllUsers()).rejects.toThrow()
    })
  })

  describe('Password Security', () => {
    it('should hash passwords before storing', async () => {
      const userData = {
        username: 'secureuser',
        email: 'secure@example.com',
        password: 'plainPassword123!',
        role: UserRole.USER
      }
      const mockInsertResult = { insertedId: new ObjectId(), acknowledged: true }
      const mockCreatedUser = createMockUser()

      mockCreatedUser._id = mockInsertResult.insertedId

      mockCollection.findOne
        .mockResolvedValueOnce(null) // User doesn't exist initially
        .mockResolvedValueOnce(mockCreatedUser) // Return created user
      mockCollection.insertOne.mockResolvedValue(mockInsertResult)

      await userService.createUser(userData)

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedPassword123' // Should be hashed, not plain
        })
      )
    })
  })
})
