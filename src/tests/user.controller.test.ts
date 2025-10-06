/**
 * UserController Tests
 * Tests for user management functionality with RBAC operations
 */
import { Request, Response } from 'express'
import { UserController } from '../controllers/UserController'
import { UserRole } from '../middlewares/auth'
import { UserService } from '../services/UserService'
// Mock UserService
jest.mock('../services/UserService')

// Mock service instance
const mockUserService = {
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getAllUsers: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  authenticateUser: jest.fn(),
  getUserByUsername: jest.fn()
}

// Setup the mock to return our mock service
;(UserService.getInstance as jest.Mock).mockReturnValue(mockUserService)

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}))


describe('UserController', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let responseJson: jest.Mock
  let responseStatus: jest.Mock

  beforeEach(() => {
    responseJson = jest.fn()
    responseStatus = jest.fn().mockReturnThis()

    mockRequest = {
      params: {},
      body: {},
      user: { id: 'admin-id', username: 'admin', role: UserRole.ADMIN }
    }

    mockResponse = {
      json: responseJson,
      status: responseStatus
    }

    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'password123!',
        role: UserRole.USER
      }
      const createdUser = {
        _id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockRequest.body = userData
      mockUserService.createUser.mockResolvedValue(createdUser)

      await UserController.createUser(mockRequest as Request, mockResponse as Response)

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData)
      expect(responseStatus).toHaveBeenCalledWith(201)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: createdUser
      })
    })

    it('should return 400 for missing required fields', async () => {
      mockRequest.body = { username: 'testuser' }

      await UserController.createUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Missing required fields: username, email, password, role'
      })
    })

    it('should return 400 for invalid role', async () => {
      mockRequest.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123!',
        role: 'INVALID_ROLE'
      }

      await UserController.createUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid role. Must be one of: ADMIN, USER, VIEWER'
      })
    })

    it('should handle user already exists error', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123!',
        role: UserRole.USER
      }

      mockRequest.body = userData
      mockUserService.createUser.mockRejectedValue(new Error('User already exists'))

      await UserController.createUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(409)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'User already exists'
      })
    })
  })

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        {
          _id: 'user1',
          username: 'user1',
          email: 'user1@example.com',
          role: UserRole.USER,
          isActive: true
        },
        {
          _id: 'user2',
          username: 'user2',
          email: 'user2@example.com',
          role: UserRole.VIEWER,
          isActive: true
        }
      ]

      mockUserService.getAllUsers.mockResolvedValue(mockUsers)

      await UserController.getAllUsers(mockRequest as Request, mockResponse as Response)

      expect(mockUserService.getAllUsers).toHaveBeenCalled()
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Users retrieved successfully',
        users: mockUsers,
        count: mockUsers.length
      })
    })

    it('should handle database errors', async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'))

      await UserController.getAllUsers(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(500)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to retrieve users'
      })
    })
  })

  describe('getUserById', () => {
    it('should return user by valid ID', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        isActive: true
      }

      mockRequest.params = { id: 'user-id' }
      mockUserService.getUserById.mockResolvedValue(mockUser)

      await UserController.getUserById(mockRequest as Request, mockResponse as Response)

      expect(mockUserService.getUserById).toHaveBeenCalledWith('user-id')
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'User retrieved successfully',
        user: mockUser
      })
    })

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: 'nonexistent-id' }
      mockUserService.getUserById.mockResolvedValue(null)

      await UserController.getUserById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'User not found'
      })
    })

    it('should return 400 for missing ID', async () => {
      mockRequest.params = {}

      await UserController.getUserById(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'User ID is required'
      })
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        email: 'newemail@example.com',
        role: UserRole.ADMIN
      }
      const updatedUser = {
        _id: 'user-id',
        username: 'testuser',
        email: 'newemail@example.com',
        role: UserRole.ADMIN,
        isActive: true
      }

      mockRequest.params = { id: 'user-id' }
      mockRequest.body = updateData
      mockUserService.updateUser.mockResolvedValue(updatedUser)

      await UserController.updateUser(mockRequest as Request, mockResponse as Response)

      expect(mockUserService.updateUser).toHaveBeenCalledWith('user-id', updateData)
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'User updated successfully',
        user: updatedUser
      })
    })

    it('should return 400 for invalid role in update', async () => {
      mockRequest.params = { id: 'user-id' }
      mockRequest.body = { role: 'INVALID_ROLE' }

      await UserController.updateUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid role. Must be one of: ADMIN, USER, VIEWER'
      })
    })

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: 'nonexistent-id' }
      mockRequest.body = { email: 'new@example.com' }
      mockUserService.updateUser.mockRejectedValue(new Error('User not found'))

      await UserController.updateUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'User not found'
      })
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: 'user-id' }
      mockUserService.deleteUser.mockResolvedValue(true)

      await UserController.deleteUser(mockRequest as Request, mockResponse as Response)

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('user-id')
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'User deleted successfully'
      })
    })

    it('should return 404 when user not found', async () => {
      mockRequest.params = { id: 'nonexistent-id' }
      mockUserService.deleteUser.mockResolvedValue(false)

      await UserController.deleteUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'User not found'
      })
    })

    it('should prevent self-deletion', async () => {
      mockRequest.params = { id: 'admin-id' }

      await UserController.deleteUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'You cannot delete your own account'
      })
    })

    it('should return 400 for missing ID', async () => {
      mockRequest.params = {}

      await UserController.deleteUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'User ID is required'
      })
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user successfully', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        isActive: true
      }

      mockUserService.getUserById.mockResolvedValue(mockUser)

      await UserController.getCurrentUser(mockRequest as Request, mockResponse as Response)

      expect(mockUserService.getUserById).toHaveBeenCalledWith('admin-id')
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Current user profile retrieved successfully',
        user: mockUser
      })
    })

    it('should handle database errors', async () => {
      mockUserService.getUserById.mockRejectedValue(new Error('Database error'))

      await UserController.getCurrentUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(500)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user profile'
      })
    })
  })

  describe('updateCurrentUser', () => {
    it('should update current user successfully', async () => {
      const updateData = {
        email: 'newemail@example.com'
      }
      const updatedUser = {
        _id: 'admin-id',
        username: 'admin',
        email: 'newemail@example.com',
        role: UserRole.ADMIN,
        isActive: true
      }

      mockRequest.body = updateData
      mockUserService.updateUser.mockResolvedValue(updatedUser)

      await UserController.updateCurrentUser(mockRequest as Request, mockResponse as Response)

      expect(mockUserService.updateUser).toHaveBeenCalledWith('admin-id', updateData)
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        user: updatedUser
      })
    })

    it('should prevent role change by current user', async () => {
      mockRequest.body = { role: UserRole.USER }

      await UserController.updateCurrentUser(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(403)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'You cannot change your own role'
      })
    })
  })
})
