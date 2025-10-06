/**
 * @file auth.middleware.test.ts
 * @description Comprehensive tests for authentication and authorization middleware
 * @module tests
 */

import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import {
  JwtPayload,
  optionalAuth,
  Permission,
  requireAuth,
  requirePermission,
  requireRole,
  ROLE_PERMISSIONS,
  UserRole
} from '../middlewares/auth'

// Mock dependencies first
jest.mock('../utils/config', () => ({
  JWT_SECRET: 'test-secret-key'
}))

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }))
}))

jest.mock('jsonwebtoken')

const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('Auth Middleware - Authentication and Authorization Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let responseStatus: jest.Mock
  let responseJson: jest.Mock

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup response mocks
    responseStatus = jest.fn().mockReturnThis()
    responseJson = jest.fn()
    mockNext = jest.fn()

    mockRequest = {
      headers: {},
      user: undefined
    }

    mockResponse = {
      status: responseStatus,
      json: responseJson
    }
  })

  describe('requireAuth', () => {
    it('should authenticate valid JWT token', () => {
      const mockPayload: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: UserRole.USER,
        permissions: [Permission.READ_DEVICES]
      }

      mockRequest.headers = {
        authorization: 'Bearer valid-jwt-token'
      }

      mockJwt.verify.mockReturnValue(mockPayload as any)

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockJwt.verify).toHaveBeenCalledWith('valid-jwt-token', 'test-secret-key')
      expect(mockRequest.user).toEqual(mockPayload)
      expect(mockNext).toHaveBeenCalled()
      expect(responseStatus).not.toHaveBeenCalled()
    })

    it('should reject request without authorization header', () => {
      mockRequest.headers = {}

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(401)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Please provide a valid Bearer token.'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request with invalid JWT token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      }

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(500)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Authentication service error'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject expired JWT token', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token'
      }

      const tokenExpiredError = new Error('Token expired')

      tokenExpiredError.name = 'TokenExpiredError'
      mockJwt.verify.mockImplementation(() => {
        throw tokenExpiredError
      })

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(500)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Authentication service error'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle malformed authorization header', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token'
      }

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(401)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Please provide a valid Bearer token.'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('optionalAuth', () => {
    it('should authenticate valid JWT token when provided', () => {
      const mockPayload: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: UserRole.USER,
        permissions: [Permission.READ_DEVICES]
      }

      mockRequest.headers = {
        authorization: 'Bearer valid-jwt-token'
      }

      mockJwt.verify.mockReturnValue(mockPayload as any)

      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockJwt.verify).toHaveBeenCalledWith('valid-jwt-token', 'test-secret-key')
      expect(mockRequest.user).toEqual(mockPayload)
      expect(mockNext).toHaveBeenCalled()
      expect(responseStatus).not.toHaveBeenCalled()
    })

    it('should continue without authentication when no token provided', () => {
      mockRequest.headers = {}

      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockJwt.verify).not.toHaveBeenCalled()
      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
      expect(responseStatus).not.toHaveBeenCalled()
    })

    it('should continue without authentication when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      }

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockRequest.user).toBeUndefined()
      expect(mockNext).toHaveBeenCalled()
      expect(responseStatus).not.toHaveBeenCalled()
    })
  })

  describe('requireRole', () => {
    it('should authorize user with required role', () => {
      const mockUser: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'admin',
        role: UserRole.ADMIN,
        permissions: ROLE_PERMISSIONS[UserRole.ADMIN]
      }

      mockRequest.user = mockUser

      const middleware = requireRole(UserRole.ADMIN)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(responseStatus).not.toHaveBeenCalled()
    })

    it('should reject user without required role', () => {
      const mockUser: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'user',
        role: UserRole.USER,
        permissions: ROLE_PERMISSIONS[UserRole.USER]
      }

      mockRequest.user = mockUser

      const middleware = requireRole(UserRole.ADMIN)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(403)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Access denied. Required role: admin'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request without authenticated user', () => {
      mockRequest.user = undefined

      const middleware = requireRole(UserRole.USER)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(401)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('requirePermission', () => {
    it('should authorize user with required permission', () => {
      const mockUser: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: UserRole.USER,
        permissions: [Permission.READ_DEVICES, Permission.WRITE_DEVICES]
      }

      mockRequest.user = mockUser

      const middleware = requirePermission(Permission.READ_DEVICES)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(responseStatus).not.toHaveBeenCalled()
    })

    it('should reject user without required permission', () => {
      const mockUser: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: UserRole.VIEWER,
        permissions: [Permission.READ_DEVICES]
      }

      mockRequest.user = mockUser

      const middleware = requirePermission(Permission.WRITE_DEVICES)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(403)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Access denied. Required permission: write:devices'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject request without authenticated user', () => {
      mockRequest.user = undefined

      const middleware = requirePermission(Permission.READ_DEVICES)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(401)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should authorize admin user for any permission', () => {
      const mockUser: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'admin',
        role: UserRole.ADMIN,
        permissions: ROLE_PERMISSIONS[UserRole.ADMIN]
      }

      mockRequest.user = mockUser

      const middleware = requirePermission(Permission.DELETE_DEVICES)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(responseStatus).not.toHaveBeenCalled()
    })

    it('should handle user with empty permissions array', () => {
      const mockUser: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: UserRole.USER,
        permissions: []
      }

      mockRequest.user = mockUser

      const middleware = requirePermission(Permission.READ_DEVICES)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      // Should pass because permissions are combined with role permissions
      expect(mockNext).toHaveBeenCalled()
      expect(responseStatus).not.toHaveBeenCalled()
    })
  })

  describe('Role Permissions Integration', () => {
    it('should validate ADMIN role has all permissions', () => {
      const adminPermissions = ROLE_PERMISSIONS[UserRole.ADMIN]
      const allPermissions = Object.values(Permission)

      // Admin should have all available permissions
      allPermissions.forEach(permission => {
        expect(adminPermissions).toContain(permission)
      })
    })

    it('should validate USER role has appropriate permissions', () => {
      const userPermissions = ROLE_PERMISSIONS[UserRole.USER]

      // User should have read and write permissions but not delete
      expect(userPermissions).toContain(Permission.READ_DEVICES)
      expect(userPermissions).toContain(Permission.WRITE_DEVICES)
      expect(userPermissions).toContain(Permission.READ_MODELS)
      expect(userPermissions).toContain(Permission.WRITE_MODELS)
    })

    it('should validate VIEWER role has only read permissions', () => {
      const viewerPermissions = ROLE_PERMISSIONS[UserRole.VIEWER]

      // Viewer should only have read permissions
      expect(viewerPermissions).toContain(Permission.READ_DEVICES)
      expect(viewerPermissions).toContain(Permission.READ_MODELS)
      expect(viewerPermissions).not.toContain(Permission.WRITE_DEVICES)
      expect(viewerPermissions).not.toContain(Permission.DELETE_DEVICES)
    })
  })

  describe('Error Handling Edge Cases', () => {
    it('should handle null authorization header', () => {
      mockRequest.headers = {
        authorization: null as any
      }

      requireAuth(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(401)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Please provide a valid Bearer token.'
      })
    })

    it('should handle undefined user role', () => {
      const mockUser: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: undefined,
        permissions: []
      }

      mockRequest.user = mockUser

      const middleware = requireRole(UserRole.USER)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(responseStatus).toHaveBeenCalledWith(403)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'No role assigned to user'
      })
    })

    it('should handle undefined permissions array', () => {
      const mockUser: JwtPayload = {
        id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: UserRole.USER,
        permissions: undefined
      }

      mockRequest.user = mockUser

      const middleware = requirePermission(Permission.READ_DEVICES)

      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      // Should pass because role permissions are used when user permissions are undefined
      expect(mockNext).toHaveBeenCalled()
      expect(responseStatus).not.toHaveBeenCalled()
    })
  })
})
