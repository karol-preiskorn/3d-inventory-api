/**
 * @file /services/UserService.ts
 * @description User service for MongoDB operations with enhanced security
 * @module services
 */

import bcrypt from 'bcrypt'
import { Collection, Db, ObjectId, MongoClient } from 'mongodb'
import { User, CreateUserRequest, UpdateUserRequest, UserResponse, toUserResponse, USER_VALIDATION } from '../models/User'
import { UserRole, ROLE_PERMISSIONS } from '../middlewares/auth'
import { connectToCluster, connectToDb, closeConnection } from '../utils/db'
import getLogger from '../utils/logger'

const logger = getLogger('UserService')
const COLLECTION_NAME = 'users'
const SALT_ROUNDS = 12

export class UserService {
  private static instance: UserService

  private constructor() { }

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
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      })

      if (existingUser) {
        throw new Error('User with this username or email already exists')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS)
      // Get permissions for the role
      const permissions = ROLE_PERMISSIONS[userData.role] || []
      const newUser: Omit<User, '_id'> = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        permissions,
        isActive: userData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        loginAttempts: 0
      }
      const result = await collection.insertOne(newUser as User)

      if (!result.insertedId) {
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
      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const user = await collection.findOne({ _id: new ObjectId(userId) })

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
      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const user = await collection.findOne({ username })

      return user

    } catch (error) {
      logger.error(`Error getting user by username: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    } finally {
      if (client) {
        await closeConnection(client)
      }
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<UserResponse[]> {
    let client: MongoClient | null = null

    try {
      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const users = await collection.find({}).toArray()

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
      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const updateFields: Partial<User> = {
        ...updateData,
        updatedAt: new Date()
      }

      // Hash password if provided
      if (updateData.password) {
        updateFields.password = await bcrypt.hash(updateData.password, SALT_ROUNDS)
      }

      // Update permissions if role changed
      if (updateData.role) {
        updateFields.permissions = ROLE_PERMISSIONS[updateData.role] || []
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateFields },
        { returnDocument: 'after' }
      )

      if (!result) {
        throw new Error('User not found or update failed')
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
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    let client: MongoClient | null = null

    try {
      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
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
      client = await connectToCluster()
      const db: Db = connectToDb(client)
      const collection: Collection<User> = db.collection(COLLECTION_NAME)
      const user = await collection.findOne({ username, isActive: true })

      if (!user) {
        return null
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        throw new Error('Account is locked due to too many failed login attempts')
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        // Increment login attempts
        if (user._id) {
          await this.incrementLoginAttempts(user._id)
        } else {
          logger.error('User object is missing _id when incrementing login attempts')
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
      const defaultUsers = [
        { username: 'admin', email: 'admin@3d-inventory.com', password: 'admin123456', role: UserRole.ADMIN },
        { username: 'user', email: 'user@3d-inventory.com', password: 'user123456', role: UserRole.USER },
        { username: 'carlo', email: 'carlo@3d-inventory.com', password: 'carlo123456', role: UserRole.USER },
        { username: 'viewer', email: 'viewer@3d-inventory.com', password: 'viewer123456', role: UserRole.VIEWER }
      ]

      for (const userData of defaultUsers) {
        try {
          const existingUser = await this.getUserByUsername(userData.username)

          if (!existingUser) {
            await this.createUser(userData)
            logger.info(`Default user created: ${userData.username}`)
          }
        } catch (error) {
          logger.warn(`Failed to create default user ${userData.username}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

    } catch (error) {
      logger.error(`Error initializing default users: ${error instanceof Error ? error.message : String(error)}`)
      throw error
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
        logger.warn(`Account locked for user: ${user.username}`)
      }

      await collection.updateOne(
        { _id: userId },
        { $set: updateData }
      )

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
    if (!userData.username || userData.username.length < USER_VALIDATION.USERNAME_MIN_LENGTH) {
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
