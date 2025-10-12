/**
 * RoleController Tests
 * Tests for role management functionality with RBAC operations
 */
import { Request, Response } from 'express'
import { RoleController } from '../controllers/RoleController'
import { Permission, UserRole } from '../middlewares/auth'
import { RoleService } from '../services/RoleService'
// Mock RoleService before importing controllers
jest.mock('../services/RoleService')

// Get the mocked service
const mockRoleService = {
  getAllRoles: jest.fn(),
  getRoleByName: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  initializeDefaultRoles: jest.fn(),
  getRolePermissions: jest.fn()
}

// Setup the mock to return our mock service
;(RoleService.getInstance as jest.Mock).mockReturnValue(mockRoleService)

jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}))



describe('RoleController', () => {
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

  describe('getAllRoles', () => {
    it('should return all roles successfully', async () => {
      const mockRoles = [
        { name: UserRole.ADMIN, permissions: [Permission.ADMIN_FULL] },
        { name: UserRole.USER, permissions: [Permission.DEVICE_READ] },
        { name: UserRole.VIEWER, permissions: [Permission.DEVICE_READ] }
      ]

      mockRoleService.getAllRoles.mockResolvedValue(mockRoles)

      await RoleController.getAllRoles(mockRequest as Request, mockResponse as Response)

      expect(mockRoleService.getAllRoles).toHaveBeenCalled()
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Roles retrieved successfully',
        roles: mockRoles,
        count: mockRoles.length
      })
    })

    it('should handle database errors', async () => {
      mockRoleService.getAllRoles.mockRejectedValue(new Error('Database error'))

      await RoleController.getAllRoles(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(500)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to retrieve roles'
      })
    })
  })

  describe('getRoleByName', () => {
    it('should return role by valid name', async () => {
      const mockRole = {
        name: UserRole.USER,
        permissions: [Permission.DEVICE_READ]
      }

      mockRequest.params = { name: UserRole.USER }
      mockRoleService.getRoleByName.mockResolvedValue(mockRole)

      await RoleController.getRoleByName(mockRequest as Request, mockResponse as Response)

      expect(mockRoleService.getRoleByName).toHaveBeenCalledWith(UserRole.USER)
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Role retrieved successfully',
        role: mockRole
      })
    })

    it('should return 400 for invalid role name', async () => {
      mockRequest.params = { name: 'INVALID_ROLE' }

      await RoleController.getRoleByName(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
      })
    })

    it('should return 404 when role not found', async () => {
      mockRequest.params = { name: UserRole.USER }
      mockRoleService.getRoleByName.mockResolvedValue(null)

      await RoleController.getRoleByName(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Role not found'
      })
    })

    it('should handle database errors', async () => {
      mockRequest.params = { name: UserRole.USER }
      mockRoleService.getRoleByName.mockRejectedValue(new Error('Database error'))

      await RoleController.getRoleByName(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(500)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Failed to retrieve role'
      })
    })
  })

  describe('createRole', () => {
    it('should create role with valid data', async () => {
      const roleData = {
        name: UserRole.USER,
        permissions: [Permission.DEVICE_READ, Permission.DEVICE_CREATE]
      }
      const createdRole = {
        _id: 'role-id',
        name: UserRole.USER,
        permissions: [Permission.DEVICE_READ, Permission.DEVICE_CREATE],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockRequest.body = roleData
      mockRoleService.createRole.mockResolvedValue(createdRole)

      await RoleController.createRole(mockRequest as Request, mockResponse as Response)

      expect(mockRoleService.createRole).toHaveBeenCalledWith(roleData)
      expect(responseStatus).toHaveBeenCalledWith(201)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Role created successfully',
        role: createdRole
      })
    })

    it('should return 400 for missing required fields', async () => {
      mockRequest.body = { name: UserRole.USER }

      await RoleController.createRole(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Name and permissions array are required'
      })
    })

    it('should return 400 for invalid role name', async () => {
      mockRequest.body = {
        name: 'INVALID_ROLE',
        permissions: [Permission.DEVICE_READ]
      }

      await RoleController.createRole(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
      })
    })

    it('should handle role already exists error', async () => {
      const roleData = {
        name: UserRole.USER,
        permissions: [Permission.DEVICE_READ]
      }

      mockRequest.body = roleData
      mockRoleService.createRole.mockRejectedValue(new Error('Role already exists'))

      await RoleController.createRole(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(409)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'Role already exists'
      })
    })
  })

  describe('updateRole', () => {
    it('should update role permissions successfully', async () => {
      const updateData = {
        permissions: [Permission.DEVICE_READ, Permission.DEVICE_CREATE, Permission.DEVICE_DELETE]
      }
      const updatedRole = {
        _id: 'role-id',
        name: UserRole.USER,
        permissions: updateData.permissions,
        updatedAt: new Date()
      }

      mockRequest.params = { name: UserRole.USER }
      mockRequest.body = updateData
      mockRoleService.updateRole.mockResolvedValue(updatedRole)

      await RoleController.updateRole(mockRequest as Request, mockResponse as Response)

      expect(mockRoleService.updateRole).toHaveBeenCalledWith(UserRole.USER, updateData)
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Role updated successfully',
        role: updatedRole
      })
    })

    it('should return 400 for invalid role name', async () => {
      mockRequest.params = { name: 'INVALID_ROLE' }
      mockRequest.body = { permissions: [Permission.DEVICE_READ] }

      await RoleController.updateRole(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
      })
    })

    it('should return 404 when role not found', async () => {
      mockRequest.params = { name: UserRole.USER }
      mockRequest.body = { permissions: [Permission.ADMIN_FULL] }
      mockRoleService.updateRole.mockRejectedValue(new Error('Role not found'))

      await RoleController.updateRole(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Role not found'
      })
    })
  })

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      mockRequest.params = { name: UserRole.USER }
      mockRoleService.deleteRole.mockResolvedValue(true)

      await RoleController.deleteRole(mockRequest as Request, mockResponse as Response)

      expect(mockRoleService.deleteRole).toHaveBeenCalledWith(UserRole.USER)
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Role deleted successfully'
      })
    })

    it('should return 400 for invalid role name', async () => {
      mockRequest.params = { name: 'INVALID_ROLE' }

      await RoleController.deleteRole(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
      })
    })

    it('should return 404 when role not found', async () => {
      mockRequest.params = { name: UserRole.USER }
      mockRoleService.deleteRole.mockResolvedValue(false)

      await RoleController.deleteRole(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(404)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Role not found'
      })
    })

    it('should prevent deletion of ADMIN role', async () => {
      mockRequest.params = { name: UserRole.ADMIN }
      mockRoleService.deleteRole.mockRejectedValue(new Error('Cannot delete ADMIN role'))

      await RoleController.deleteRole(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Cannot delete ADMIN role'
      })
    })
  })

  describe('getRolePermissions', () => {
    it('should get role permissions successfully', async () => {
      const mockPermissions = [Permission.DEVICE_READ, Permission.DEVICE_CREATE]

      mockRequest.params = { name: UserRole.USER }
      mockRoleService.getRolePermissions.mockResolvedValue(mockPermissions)

      await RoleController.getRolePermissions(mockRequest as Request, mockResponse as Response)

      expect(mockRoleService.getRolePermissions).toHaveBeenCalledWith(UserRole.USER)
      expect(responseStatus).toHaveBeenCalledWith(200)
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Role permissions retrieved successfully',
        role: UserRole.USER,
        permissions: mockPermissions
      })
    })

    it('should return 400 for invalid role name', async () => {
      mockRequest.params = { name: 'INVALID_ROLE' }

      await RoleController.getRolePermissions(mockRequest as Request, mockResponse as Response)

      expect(responseStatus).toHaveBeenCalledWith(400)
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
      })
    })
  })
})
