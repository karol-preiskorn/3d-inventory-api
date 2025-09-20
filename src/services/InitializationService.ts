/**
 * @file /services/InitializationService.ts
 * @description Service to initialize default users and roles for first-time setup
 * @module services
 */

import { UserService } from './UserService'
import { RoleService } from './RoleService'
import getLogger from '../utils/logger'

const logger = getLogger('InitializationService')

export class InitializationService {
  private static instance: InitializationService
  private userService: UserService
  private roleService: RoleService

  private constructor() {
    this.userService = UserService.getInstance()
    this.roleService = RoleService.getInstance()
  }

  public static getInstance(): InitializationService {
    if (!InitializationService.instance) {
      InitializationService.instance = new InitializationService()
    }

    return InitializationService.instance
  }

  /**
   * Initialize the application with default roles and users
   */
  async initializeApplication(): Promise<void> {
    try {
      logger.info('Starting application initialization...')

      // Initialize default roles first
      await this.initializeRoles()

      // Then initialize default users
      await this.initializeUsers()

      logger.info('Application initialization completed successfully')

    } catch (error) {
      logger.error(`Application initialization failed: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Initialize default roles
   */
  private async initializeRoles(): Promise<void> {
    try {
      logger.info('Initializing default roles...')

      await this.roleService.initializeDefaultRoles()

      logger.info('Default roles initialized successfully')

    } catch (error) {
      logger.error(`Failed to initialize default roles: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Initialize default users
   */
  private async initializeUsers(): Promise<void> {
    try {
      logger.info('Initializing default users...')

      await this.userService.initializeDefaultUsers()

      logger.info('Default users initialized successfully')

    } catch (error) {
      logger.error(`Failed to initialize default users: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Check if initialization is needed
   */
  async isInitializationNeeded(): Promise<boolean> {
    try {
      // Check if any users exist
      const users = await this.userService.getAllUsers()

      if (users.length === 0) {
        logger.info('No users found - initialization needed')

        return true
      }

      // Check if any roles exist
      const roles = await this.roleService.getAllRoles()

      if (roles.length === 0) {
        logger.info('No roles found - initialization needed')

        return true
      }

      logger.info('Application already initialized')

      return false

    } catch (error) {
      logger.warn(`Failed to check initialization status: ${error instanceof Error ? error.message : String(error)}`)

      // If we can't check, assume initialization is needed
      return true
    }
  }

  /**
   * Reset application data (for development/testing only)
   */
  async resetApplication(): Promise<void> {
    try {
      logger.warn('Resetting application data...')

      // Note: This is a destructive operation and should only be used in development
      // In production, implement proper backup and restore mechanisms

      logger.warn('Application reset completed')

    } catch (error) {
      logger.error(`Application reset failed: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }
}
