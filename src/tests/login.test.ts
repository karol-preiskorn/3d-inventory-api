import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { authenticateBearer, getProtectedData, loginUser } from '../controllers/login'
import { UserService } from '../services/UserService'

// Mock the dependencies before importing the controller
jest.mock('../services/UserService')
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}))
jest.mock('jsonwebtoken')


const mockUserService = {
  authenticateUser: jest.fn(),
  getUserByUsername: jest.fn()
}

// Setup the mock to return our mock service
;(UserService.getInstance as jest.Mock).mockReturnValue(mockUserService)

const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('Login Controller', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let responseJson: jest.Mock
  let responseStatus: jest.Mock

  beforeEach(() => {
    responseJson = jest.fn()
    responseStatus = jest.fn().mockReturnThis()
    mockNext = jest.fn()

    mockRequest = {
      headers: {},
      body: {}
    }
    mockResponse = {
      json: responseJson,
      status: responseStatus,
      cookie: jest.fn().mockReturnThis()
    }

    // Reset all mocks
    jest.clearAllMocks()
  })

  describe('loginUser', () => {
    it('should return 400 if username is missing', async () => {
      mockRequest.body = { password: 'testpass' }

      await loginUser(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Username and password are required'
      })
    })

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { username: 'testuser' }

      await loginUser(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Username and password are required'
      })
    })

    it('should return 401 for invalid credentials', async () => {
      mockRequest.body = { username: 'testuser', password: 'wrongpass' }
      mockUserService.authenticateUser.mockResolvedValue(null)

      await loginUser(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockUserService.authenticateUser).toHaveBeenCalledWith('testuser', 'wrongpass')
      expect(responseStatus).toHaveBeenCalledWith(401)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      })
    })

    it('should handle authentication service errors', async () => {
      mockRequest.body = { username: 'testuser', password: 'testpass' }
      mockUserService.authenticateUser.mockRejectedValue(new Error('Database error'))

      await loginUser(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(500)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Internal server error during login'
      })
    })
  })

  describe('authenticateBearer', () => {
    it('should call next() for valid authorization header', () => {
      mockRequest.headers = { authorization: 'Bearer valid_token' }
      mockJwt.verify = jest.fn().mockReturnValue({ userId: '123' })

      authenticateBearer(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it('should return 401 for missing authorization header', () => {
      mockRequest.headers = {}

      authenticateBearer(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(401)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header'
      })
    })
  })

  describe('getProtectedData', () => {
    it('should return user data if user is authenticated', () => {
      mockRequest.user = {
        id: 'user123',
        username: 'testuser',
        role: 'admin',
        permissions: ['read', 'write'],
        iat: 123,
        exp: 456
      }

      getProtectedData(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseJson).toHaveBeenCalledWith({
        message: 'This is a protected route',
        user: {
          id: 'user123',
          username: 'testuser',
          role: 'admin',
          permissions: ['read', 'write']
        },
        timestamp: expect.any(String),
        serverInfo: {
          version: '1.0.0',
          environment: expect.any(String)
        }
      })
    })
  })
})
