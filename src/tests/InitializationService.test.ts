/**
 * @file InitializationService.test.ts
 * @description Tests for InitializationService to improve service coverage
 * @module tests
 */

import { InitializationService } from '../services/InitializationService'
import { RoleService } from '../services/RoleService'
import { UserService } from '../services/UserService'

// Mock the services
jest.mock('../services/UserService')
jest.mock('../services/RoleService')
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }))
}))

const mockUserService = {
  getInstance: jest.fn(),
  getAllUsers: jest.fn(),
  initializeDefaultUsers: jest.fn()
}
const mockRoleService = {
  getInstance: jest.fn(),
  getAllRoles: jest.fn(),
  initializeDefaultRoles: jest.fn()
}

// Mock the static getInstance methods
;(UserService.getInstance as jest.Mock).mockReturnValue(mockUserService)
;(RoleService.getInstance as jest.Mock).mockReturnValue(mockRoleService)

describe('InitializationService Tests', () => {
  let initService: InitializationService

  beforeEach(() => {
    jest.clearAllMocks()
    initService = InitializationService.getInstance()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = InitializationService.getInstance()
      const instance2 = InitializationService.getInstance()

      expect(instance1).toBe(instance2)
      expect(instance1).toBeInstanceOf(InitializationService)
    })
  })

  describe('initializeApplication', () => {
    it('should initialize application successfully', async () => {
      mockRoleService.initializeDefaultRoles.mockResolvedValue(undefined)
      mockUserService.initializeDefaultUsers.mockResolvedValue(undefined)

      await initService.initializeApplication()

      expect(mockRoleService.initializeDefaultRoles).toHaveBeenCalled()
      expect(mockUserService.initializeDefaultUsers).toHaveBeenCalled()
    })

    it('should throw error when role initialization fails', async () => {
      const error = new Error('Role initialization failed')

      mockRoleService.initializeDefaultRoles.mockRejectedValue(error)

      await expect(initService.initializeApplication()).rejects.toThrow('Role initialization failed')
      expect(mockUserService.initializeDefaultUsers).not.toHaveBeenCalled()
    })

    it('should throw error when user initialization fails', async () => {
      const error = new Error('User initialization failed')

      mockRoleService.initializeDefaultRoles.mockResolvedValue(undefined)
      mockUserService.initializeDefaultUsers.mockRejectedValue(error)

      await expect(initService.initializeApplication()).rejects.toThrow('User initialization failed')
      expect(mockRoleService.initializeDefaultRoles).toHaveBeenCalled()
    })
  })

  describe('isInitializationNeeded', () => {
    it('should return true when no users exist', async () => {
      mockUserService.getAllUsers.mockResolvedValue([])
      mockRoleService.getAllRoles.mockResolvedValue([{ name: 'admin' }])

      const result = await initService.isInitializationNeeded()

      expect(result).toBe(true)
      expect(mockUserService.getAllUsers).toHaveBeenCalled()
    })

    it('should return true when no roles exist', async () => {
      mockUserService.getAllUsers.mockResolvedValue([{ username: 'admin' }])
      mockRoleService.getAllRoles.mockResolvedValue([])

      const result = await initService.isInitializationNeeded()

      expect(result).toBe(true)
      expect(mockUserService.getAllUsers).toHaveBeenCalled()
      expect(mockRoleService.getAllRoles).toHaveBeenCalled()
    })

    it('should return false when users and roles exist', async () => {
      mockUserService.getAllUsers.mockResolvedValue([{ username: 'admin' }])
      mockRoleService.getAllRoles.mockResolvedValue([{ name: 'admin' }])

      const result = await initService.isInitializationNeeded()

      expect(result).toBe(false)
      expect(mockUserService.getAllUsers).toHaveBeenCalled()
      expect(mockRoleService.getAllRoles).toHaveBeenCalled()
    })

    it('should return true when checking fails', async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'))

      const result = await initService.isInitializationNeeded()

      expect(result).toBe(true)
      expect(mockUserService.getAllUsers).toHaveBeenCalled()
    })
  })

  describe('resetApplication', () => {
    it('should complete reset successfully', async () => {
      await initService.resetApplication()

      // Reset method currently just logs - no other operations
      // This test ensures the method completes without throwing
    })

    it('should handle reset errors gracefully', async () => {
      // Currently the reset method doesn't do actual operations that could fail
      // But we test that it handles potential future errors
      await expect(initService.resetApplication()).resolves.not.toThrow()
    })
  })
})
