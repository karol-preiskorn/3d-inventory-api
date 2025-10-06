/**
 * @file RoleService.test.ts
 * @description Comprehensive tests for RoleService to improve service coverage
 * @module tests
 */

import { ObjectId } from 'mongodb'
import { Permission, UserRole } from '../middlewares/auth'
import { RoleService } from '../services/RoleService'
import { closeConnection, connectToCluster, connectToDb } from '../utils/db'

// Mock dependencies
jest.mock('../utils/db')
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

describe('RoleService - Service Layer Coverage Tests', () => {
  let roleService: RoleService
  let mockClient: any
  let mockDb: any
  let mockCollection: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Get singleton instance
    roleService = RoleService.getInstance()

    // Setup MongoDB mocks
    mockCollection = {
      findOne: jest.fn(),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn()
      }),
      insertOne: jest.fn(),
      insertMany: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      countDocuments: jest.fn()
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    }

    mockClient = {
      close: jest.fn(),
      db: jest.fn().mockReturnValue(mockDb)
    }

    mockConnectToCluster.mockResolvedValue(mockClient)
    mockConnectToDb.mockReturnValue(mockDb)
    mockCloseConnection.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = RoleService.getInstance()
      const instance2 = RoleService.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  describe('createRole', () => {
    it('should create a new role successfully', async () => {
      const roleData = {
        name: UserRole.USER,
        permissions: [Permission.READ_DEVICES]
      }
      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId()
      }
      const mockCreatedRole = {
        _id: mockInsertResult.insertedId,
        name: UserRole.USER,
        permissions: [Permission.READ_DEVICES],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockCollection.findOne
        .mockResolvedValueOnce(null) // Role doesn't exist
        .mockResolvedValueOnce(mockCreatedRole) // Return created role

      mockCollection.insertOne.mockResolvedValue(mockInsertResult)

      const result = await roleService.createRole(roleData)

      expect(mockConnectToCluster).toHaveBeenCalled()
      expect(mockConnectToDb).toHaveBeenCalledWith(mockClient)
      expect(mockCollection.findOne).toHaveBeenCalledWith({ name: UserRole.USER })
      expect(mockCollection.insertOne).toHaveBeenCalled()
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
      expect(result.name).toBe(UserRole.USER)
      expect(result.permissions).toEqual([Permission.READ_DEVICES])
    })

    it('should throw error for invalid role data', async () => {
      const invalidRoleData = {
        name: null as any,
        permissions: []
      }

      await expect(roleService.createRole(invalidRoleData))
        .rejects.toThrow('Invalid role data: name and permissions are required')

      expect(mockConnectToCluster).not.toHaveBeenCalled()
    })

    it('should throw error for invalid permissions', async () => {
      const roleData = {
        name: UserRole.USER,
        permissions: ['invalid_permission' as any]
      }

      await expect(roleService.createRole(roleData))
        .rejects.toThrow('Invalid permissions: invalid_permission')
    })

    it('should handle role already exists error', async () => {
      const roleData = {
        name: UserRole.ADMIN,
        permissions: [Permission.READ_DEVICES]
      }
      const existingRole = {
        _id: new ObjectId(),
        name: UserRole.ADMIN,
        permissions: [Permission.READ_DEVICES]
      }

      mockCollection.findOne.mockResolvedValue(existingRole)

      await expect(roleService.createRole(roleData))
        .rejects.toThrow('Role admin already exists')

      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('getRoleByName', () => {
    it('should retrieve role by name successfully', async () => {
      const mockRole = {
        _id: new ObjectId(),
        name: UserRole.USER,
        permissions: [Permission.READ_DEVICES],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockCollection.findOne.mockResolvedValue(mockRole)

      const result = await roleService.getRoleByName(UserRole.USER)

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        name: UserRole.USER,
        isActive: { $ne: false }
      })
      expect(result?.name).toBe(UserRole.USER)
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should return null for non-existent role', async () => {
      mockCollection.findOne.mockResolvedValue(null)

      const result = await roleService.getRoleByName(UserRole.VIEWER)

      expect(result).toBeNull()
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('getAllRoles', () => {
    it('should retrieve all roles successfully', async () => {
      const mockRoles = [
        {
          _id: new ObjectId(),
          name: UserRole.ADMIN,
          permissions: [Permission.READ_DEVICES, Permission.WRITE_DEVICES]
        },
        {
          _id: new ObjectId(),
          name: UserRole.USER,
          permissions: [Permission.READ_DEVICES]
        }
      ]

      mockCollection.find().toArray.mockResolvedValue(mockRoles)

      const result = await roleService.getAllRoles()

      expect(mockCollection.find).toHaveBeenCalledWith({ isActive: { $ne: false } })
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe(UserRole.ADMIN)
      expect(result[1].name).toBe(UserRole.USER)
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should return empty array when no roles exist', async () => {
      mockCollection.find().toArray.mockResolvedValue([])

      const result = await roleService.getAllRoles()

      expect(result).toHaveLength(0)
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      const updateData = {
        permissions: [Permission.READ_DEVICES, Permission.WRITE_DEVICES]
      }
      const mockUpdatedRole = {
        _id: new ObjectId(),
        name: UserRole.USER,
        permissions: updateData.permissions,
        updatedAt: new Date()
      }

      mockCollection.findOneAndUpdate.mockResolvedValue(mockUpdatedRole)

      const result = await roleService.updateRole(UserRole.USER, updateData)

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { name: UserRole.USER },
        expect.objectContaining({
          $set: expect.objectContaining({
            permissions: updateData.permissions,
            updatedAt: expect.any(Date)
          })
        }),
        { returnDocument: 'after' }
      )
      expect(result?.permissions).toEqual(updateData.permissions)
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should throw error for non-existent role', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue(null)

      await expect(roleService.updateRole(UserRole.VIEWER, { permissions: [] }))
        .rejects.toThrow('Role not found or update failed')

      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      const mockRole = {
        _id: new ObjectId(),
        name: UserRole.USER,
        isActive: true
      }

      mockCollection.findOne.mockResolvedValue(mockRole)
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 })

      const result = await roleService.deleteRole(UserRole.USER)

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        name: UserRole.USER
      })
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ name: UserRole.USER })
      expect(result).toBe(true)
      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should throw error for non-existent role', async () => {
      mockCollection.findOne.mockResolvedValue(null)

      await expect(roleService.deleteRole(UserRole.VIEWER))
        .rejects.toThrow('Role not found')

      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })
  })

  describe('Error Handling and Connection Management', () => {
    it('should always close database connection on success', async () => {
      mockCollection.find().toArray.mockResolvedValue([])

      await roleService.getAllRoles()

      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should always close database connection on error', async () => {
      mockCollection.find().toArray.mockRejectedValue(new Error('Database error'))

      await expect(roleService.getAllRoles()).rejects.toThrow()

      expect(mockCloseConnection).toHaveBeenCalledWith(mockClient)
    })

    it('should handle connection errors gracefully', async () => {
      mockConnectToCluster.mockRejectedValue(new Error('Connection failed'))

      await expect(roleService.getAllRoles()).rejects.toThrow('Connection failed')

      // Connection should not be closed if it was never established
      expect(mockCloseConnection).not.toHaveBeenCalled()
    })
  })

  describe('initializeDefaultRoles', () => {
    it('should initialize default roles when none exist', async () => {
      // Mock getRoleByName to return null (role doesn't exist)
      mockCollection.findOne.mockResolvedValue(null)

      // Mock successful role creation
      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId()
      }

      mockCollection.insertOne.mockResolvedValue(mockInsertResult)

      // Mock the created role
      const mockCreatedRole = {
        _id: mockInsertResult.insertedId,
        name: UserRole.ADMIN,
        permissions: []
      }

      mockCollection.findOne.mockResolvedValueOnce(null).mockResolvedValue(mockCreatedRole)

      await roleService.initializeDefaultRoles()

      // Should have called findOne for checking if roles exist
      expect(mockCollection.findOne).toHaveBeenCalled()
      expect(mockCloseConnection).toHaveBeenCalled()
    })

    it('should skip role creation when roles already exist', async () => {
      // Mock getRoleByName to return existing roles
      const mockExistingRole = {
        _id: new ObjectId(),
        name: UserRole.ADMIN,
        permissions: []
      }

      mockCollection.findOne.mockResolvedValue(mockExistingRole)

      await roleService.initializeDefaultRoles()

      // Should have checked for existing roles but not created new ones
      expect(mockCollection.findOne).toHaveBeenCalled()
      expect(mockCollection.insertOne).not.toHaveBeenCalled()
      expect(mockCloseConnection).toHaveBeenCalled()
    })
  })
})
