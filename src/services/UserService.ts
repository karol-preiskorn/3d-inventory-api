/**
 * @file /services/UserService.ts
 * @description User service for MongoDB operations with enhanced security
 * @module services
 */

import bcrypt from 'bcrypt'
import { Collection, Db, ObjectId, MongoClient } from 'mongodb'
import { UserRole, ROLE_PERMISSIONS } from '../middlewares/auth'
import { User, CreateUserRequest, UpdateUserRequest, UserResponse, toUserResponse, USER_VALIDATION } from '../models/User'
import { connectToCluster, connectToDb, closeConnection } from '../utils/db'
import getLogger from '../utils/logger'

const logger = getLogger('UserService')
const COLLECTION_NAME = 'users'
const SALT_ROUNDS = 12
// Default passwords for initial setup
const DEFAULT_PASSWORDS = {
  ADMIN: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123!',
  USER: process.env.DEFAULT_USER_PASSWORD || 'user123!',
  CARLO: process.env.DEFAULT_CARLO_PASSWORD || 'carlo123!',
  VIEWER: process.env.DEFAULT_VIEWER_PASSWORD || 'viewer123!'
} as const

export class UserService {
  private static instance: UserService

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }

    return UserService.instance
  }

  /**
   * Create a new user with hashed password
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    let client: MongoClient | null = null

    try {
      // Validate input
      this.validateUserData(userData)

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      // Check if user already exists
      const existingUser = await collection.findOne({
        $or: [{ username: userData.username.toLowerCase() }, { email: userData.email.toLowerCase() }]
      })

      if (existingUser) {
        throw new Error('User with this username or email already exists')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS)
      // Get permissions for the role
      const permissions = ROLE_PERMISSIONS[userData.role] || []
      const newUser: Omit<User, '_id'> = {
        username: userData.username.toLowerCase().trim(),
        email: userData.email.toLowerCase().trim(),
        password: hashedPassword,
        role: userData.role,
        permissions,
        isActive: userData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        loginAttempts: 0
      }
      const result = await collection.insertOne(newUser as User)

      if (!result.acknowledged || !result.insertedId) {
        throw new Error('Failed to create user')
      }

      const createdUser = await collection.findOne({ _id: result.insertedId })

      if (!createdUser) {
        throw new Error('Failed to retrieve created user')
      }

      logger.info(`User created successfully: ${userData.username} (${userData.role})`)

      return toUserResponse(createdUser)
    } catch (error) {
      logger.error(`Error creating user: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponse | null> {
    let client: MongoClient | null = null

    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format')
      }

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const user = await collection.findOne({
        _id: new ObjectId(userId),
        isActive: { $ne: false }
      })

      return user ? toUserResponse(user) : null
    } catch (error) {
      logger.error(`Error getting user by ID: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Get user by username (for login)
   */
  async getUserByUsername(username: string): Promise<User | null> {
    let client: MongoClient | null = null

    try {
      if (!username || typeof username !== 'string') {
        return null
      }

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const user = await collection.findOne({
        username: username.toLowerCase().trim(),
        isActive: { $ne: false }
      })

      return user
    } catch (error) {
      logger.error(`Error getting user by username: ${error instanceof Error ? error.message : String(error)}`)

      return null
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserResponse | null> {
    let client: MongoClient | null = null

    try {
      if (!email || typeof email !== 'string') {
        return null
      }

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const user = await collection.findOne({
        email: email.toLowerCase().trim(),
        isActive: { $ne: false }
      })

      return user ? toUserResponse(user) : null
    } catch (error) {
      logger.error(`Error getting user by email: ${error instanceof Error ? error.message : String(error)}`)

      return null
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(includeInactive: boolean = false): Promise<UserResponse[]> {
    let client: MongoClient | null = null

    try {
      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const query = includeInactive ? {} : { isActive: { $ne: false } }
      const users = await collection.find(query).sort({ username: 1 }).toArray()

      return users.map(toUserResponse)
    } catch (error) {
      logger.error(`Error getting all users: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<UserResponse> {
    let client: MongoClient | null = null

    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format')
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('Update data is required')
      }

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      // Check if user exists
      const existingUser = await collection.findOne({ _id: new ObjectId(userId) })

      if (!existingUser) {
        throw new Error('User not found')
      }

      // Build update fields
      const updateFields: Partial<User> = {
        updatedAt: new Date()
      }

      // Handle username update
      if (updateData.username) {
        const normalizedUsername = updateData.username.toLowerCase().trim()

        if (normalizedUsername !== existingUser.username) {
          // Check for duplicate username
          const duplicateUser = await collection.findOne({
            username: normalizedUsername,
            _id: { $ne: new ObjectId(userId) }
          })

          if (duplicateUser) {
            throw new Error('Username already exists')
          }
          updateFields.username = normalizedUsername
        }
      }

      // Handle email update
      if (updateData.email) {
        const normalizedEmail = updateData.email.toLowerCase().trim()

        if (normalizedEmail !== existingUser.email) {
          // Validate email format
          if (!USER_VALIDATION.EMAIL_REGEX.test(normalizedEmail)) {
            throw new Error('Invalid email format')
          }
          // Check for duplicate email
          const duplicateUser = await collection.findOne({
            email: normalizedEmail,
            _id: { $ne: new ObjectId(userId) }
          })

          if (duplicateUser) {
            throw new Error('Email already exists')
          }
          updateFields.email = normalizedEmail
        }
      }

      // Hash password if provided
      if (updateData.password) {
        if (updateData.password.length < USER_VALIDATION.PASSWORD_MIN_LENGTH) {
          throw new Error(`Password must be at least ${USER_VALIDATION.PASSWORD_MIN_LENGTH} characters long`)
        }
        updateFields.password = await bcrypt.hash(updateData.password, SALT_ROUNDS)
      }

      // Update permissions if role changed
      if (updateData.role && updateData.role !== existingUser.role) {
        if (!Object.values(UserRole).includes(updateData.role)) {
          throw new Error('Invalid user role')
        }
        updateFields.role = updateData.role
        updateFields.permissions = ROLE_PERMISSIONS[updateData.role] || []
      }

      // Handle isActive field
      if (updateData.isActive !== undefined) {
        updateFields.isActive = updateData.isActive
      }

      const result = await collection.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: updateFields }, { returnDocument: 'after' })

      if (!result) {
        throw new Error('Update failed')
      }

      logger.info(`User updated successfully: ${result.username}`)

      return toUserResponse(result)
    } catch (error) {
      logger.error(`Error updating user: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Soft delete user (mark as inactive)
   */
  async deactivateUser(userId: string): Promise<boolean> {
    let client: MongoClient | null = null

    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format')
      }

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            isActive: false,
            updatedAt: new Date()
          }
        }
      )

      if (result.modifiedCount === 1) {
        logger.info(`User deactivated successfully: ${userId}`)

        return true
      }

      return false
    } catch (error) {
      logger.error(`Error deactivating user: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Hard delete user (permanent deletion)
   */
  async deleteUser(userId: string): Promise<boolean> {
    let client: MongoClient | null = null

    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format')
      }

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      // Check if user exists
      const user = await collection.findOne({ _id: new ObjectId(userId) })

      if (!user) {
        throw new Error('User not found')
      }

      // Prevent deletion of admin users in production
      if (process.env.NODE_ENV === 'production' && user.role === UserRole.ADMIN) {
        throw new Error('Cannot delete admin users in production environment')
      }

      const result = await collection.deleteOne({ _id: new ObjectId(userId) })

      if (result.deletedCount === 1) {
        logger.info(`User deleted successfully: ${userId}`)

        return true
      }

      return false
    } catch (error) {
      logger.error(`Error deleting user: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Authenticate user with password
   */
  async authenticateUser(username: string, password: string): Promise<User | null> {
    let client: MongoClient | null = null

    try {
      if (!username || !password) {
        return null
      }

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const user = await collection.findOne({
        username: username.toLowerCase().trim(),
        isActive: { $ne: false }
      })

      if (!user) {
        return null
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        const lockTimeRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60)

        throw new Error(`Account is locked. Try again in ${lockTimeRemaining} minutes.`)
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        // Increment login attempts
        if (user._id) {
          await this.incrementLoginAttempts(user._id)
        }

        return null
      }

      // Reset login attempts and update last login
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            lastLogin: new Date(),
            updatedAt: new Date()
          },
          $unset: {
            loginAttempts: 1,
            lockUntil: 1
          }
        }
      )

      logger.info(`User authenticated successfully: ${user.username}`)

      return user
    } catch (error) {
      logger.error(`Error authenticating user: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Initialize default users (for first-time setup)
   */
  async initializeDefaultUsers(): Promise<void> {
    try {
      logger.info('Initializing default users...')

      const defaultUsers = [
        {
          username: 'admin',
          email: 'admin@3d-inventory.com',
          password: DEFAULT_PASSWORDS.ADMIN,
          role: UserRole.ADMIN
        },
        {
          username: 'user',
          email: 'user@3d-inventory.com',
          password: DEFAULT_PASSWORDS.USER,
          role: UserRole.USER
        },
        {
          username: 'carlo',
          email: 'carlo@3d-inventory.com',
          password: DEFAULT_PASSWORDS.CARLO,
          role: UserRole.USER
        },
        {
          username: 'viewer',
          email: 'viewer@3d-inventory.com',
          password: DEFAULT_PASSWORDS.VIEWER,
          role: UserRole.VIEWER
        }
      ]

      // Validate all default passwords
      for (const user of defaultUsers) {
        if (!user.password || user.password.length < USER_VALIDATION.PASSWORD_MIN_LENGTH) {
          logger.warn(`Default password for user "${user.username}" is too weak or not set. Using fallback.`)
        }
      }

      for (const userData of defaultUsers) {
        try {
          const existingUser = await this.getUserByUsername(userData.username)

          if (!existingUser) {
            await this.createUser(userData)
            logger.info(`Default user created: ${userData.username}`)
          } else {
            logger.info(`Default user already exists: ${userData.username}`)
          }
        } catch (error) {
          logger.warn(`Failed to create default user ${userData.username}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      logger.info('Default users initialization completed')
    } catch (error) {
      logger.error(`Error initializing default users: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    let client: MongoClient | null = null

    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format')
      }

      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required')
      }

      if (newPassword.length < USER_VALIDATION.PASSWORD_MIN_LENGTH) {
        throw new Error(`New password must be at least ${USER_VALIDATION.PASSWORD_MIN_LENGTH} characters long`)
      }

      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const user = await collection.findOne({ _id: new ObjectId(userId) })

      if (!user) {
        throw new Error('User not found')
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)

      if (!isValidPassword) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            password: hashedNewPassword,
            updatedAt: new Date()
          }
        }
      )

      if (result.modifiedCount === 1) {
        logger.info(`Password changed successfully for user: ${user.username}`)

        return true
      }

      return false
    } catch (error) {
      logger.error(`Error changing password: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Get users count
   */
  async getUsersCount(includeInactive: boolean = false): Promise<number> {
    let client: MongoClient | null = null

    try {
      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const query = includeInactive ? {} : { isActive: { $ne: false } }

      return await collection.countDocuments(query)
    } catch (error) {
      logger.error(`Error getting users count: ${error instanceof Error ? error.message : String(error)}`)

      return 0
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Increment login attempts and lock account if necessary
   */
  private async incrementLoginAttempts(userId: ObjectId): Promise<void> {
    let client: MongoClient | null = null

    try {
      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const user = await collection.findOne({ _id: userId })

      if (!user) return

      const attempts = (user.loginAttempts || 0) + 1
      const updateData: Partial<User> = {
        loginAttempts: attempts,
        updatedAt: new Date()
      }

      // Lock account if max attempts reached
      if (attempts >= USER_VALIDATION.MAX_LOGIN_ATTEMPTS) {
        updateData.lockUntil = new Date(Date.now() + USER_VALIDATION.LOCK_TIME)
        logger.warn(`Account locked for user: ${user.username} (attempts: ${attempts})`)
      }

      await collection.updateOne({ _id: userId }, { $set: updateData })
    } catch (error) {
      logger.error(`Error incrementing login attempts: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Validate user data
   */
  private validateUserData(userData: CreateUserRequest): void {
    if (!userData.username || typeof userData.username !== 'string') {
      throw new Error('Username is required')
    }

    if (userData.username.length < USER_VALIDATION.USERNAME_MIN_LENGTH) {
      throw new Error(`Username must be at least ${USER_VALIDATION.USERNAME_MIN_LENGTH} characters long`)
    }

    if (userData.username.length > USER_VALIDATION.USERNAME_MAX_LENGTH) {
      throw new Error(`Username must be less than ${USER_VALIDATION.USERNAME_MAX_LENGTH} characters long`)
    }

    if (!userData.email || !USER_VALIDATION.EMAIL_REGEX.test(userData.email)) {
      throw new Error('Invalid email format')
    }

    if (!userData.password || userData.password.length < USER_VALIDATION.PASSWORD_MIN_LENGTH) {
      throw new Error(`Password must be at least ${USER_VALIDATION.PASSWORD_MIN_LENGTH} characters long`)
    }

    if (userData.password.length > USER_VALIDATION.PASSWORD_MAX_LENGTH) {
      throw new Error(`Password must be less than ${USER_VALIDATION.PASSWORD_MAX_LENGTH} characters long`)
    }

    if (!Object.values(UserRole).includes(userData.role)) {
      throw new Error('Invalid user role')
    }
  }
}

// Export singleton instance
export default UserService.getInstance()
