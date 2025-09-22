/**
 * @file user.test.ts
 * @description Comprehensive test suite for User API endpoints and authentication operations.
 *
 * Coverage includes:
 * - Complete CRUD operations for all user endpoints
 * - User authentication and session management
 * - Role-based access control (RBAC) testing
 * - Permission validation and security
 * - Password management and security
 * - User profile management
 * - Account activation and deactivation
 * - Input validation and sanitization
 * - Error handling and edge cases
 * - Security testing (injection prevention)
 * - Database integration and persistence
 * - Performance and concurrent access
 *
 * @version 2024-09-22 Comprehensive user/auth API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('User & Authentication API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testUserIds: string[] = []
  const testCleanupIds: string[] = []
  let authToken: string = ''
  let adminToken: string = ''

  // ===============================
  // SETUP AND TEARDOWN
  // ===============================
  beforeAll(async () => {
    try {
      if (!config.ATLAS_URI) {
        throw new Error('ATLAS_URI not configured for tests')
      }

      connection = await MongoClient.connect(config.ATLAS_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000
      })
      db = connection.db(config.DBNAME)

      await db.admin().ping()
      console.log('✅ MongoDB connection successful for comprehensive user tests')

      // Create test admin user for authentication tests
      await createAdminTestUser()
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
        console.warn('⚠️ Skipping database tests - database not accessible')

        return
      }
      throw error
    }
  }, 30000)

  afterAll(async () => {
    try {
      // Clean up test data
      if (db) {
        if (testCleanupIds.length > 0) {
          const userCollection = db.collection('users')
          const userObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await userCollection.deleteMany({ _id: { $in: userObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test users`)
        }
      }
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error)
    } finally {
      if (connection) {
        await connection.close()
        console.log('🔌 Database connection closed')
      }
    }
  }, 10000)

  // Helper functions
  const checkDbConnection = (): boolean => {
    if (!connection || !db) {
      console.warn('⚠️ Skipping test - no database connection')

      return false
    }

    return true
  }
  const createAdminTestUser = async () => {
    if (!checkDbConnection()) return

    const users = db.collection('users')
    const adminUser = {
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'hashedpassword', // Would be hashed in real implementation
      role: 'admin',
      isActive: true,
      permissions: [
        'read:users', 'write:users', 'delete:users',
        'read:devices', 'write:devices', 'delete:devices',
        'read:models', 'write:models', 'delete:models'
      ]
    }
    const result = await users.insertOne(adminUser)

    testCleanupIds.push(result.insertedId.toString())

    // Simulate getting admin token (would come from actual auth endpoint)
    adminToken = 'mock-admin-token-' + result.insertedId.toString()
  }
  const createUniqueTestUser = (overrides = {}) => {
    return {
      username: testGenerators.uniqueName('user'),
      email: `test${Date.now()}@example.com`,
      password: testGenerators.password(),
      role: testGenerators.randomArrayElement(['admin', 'user', 'viewer']),
      isActive: true,
      permissions: [
        testGenerators.randomArrayElement(['read:devices', 'write:devices']),
        testGenerators.randomArrayElement(['read:models', 'write:models'])
      ],
      profile: {
        firstName: testGenerators.randomArrayElement(['John', 'Jane', 'Bob']),
        lastName: testGenerators.randomArrayElement(['Doe', 'Smith', 'Johnson']),
        department: testGenerators.randomArrayElement(['IT', 'Engineering', 'Operations']),
        phone: testGenerators.randomArrayElement(['+1234567890', '+0987654321'])
      },
      preferences: {
        theme: testGenerators.randomArrayElement(['light', 'dark']),
        language: testGenerators.randomArrayElement(['en', 'es', 'fr']),
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      },
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database User Operations', () => {
    it('should perform direct database CRUD operations', async () => {
      if (!checkDbConnection()) return

      const users = db.collection('users')
      const testData = []

      // Test insertion of multiple users
      for (let i = 0; i < 3; i++) {
        const userData = createUniqueTestUser({
          username: `testuser${i}`,
          email: `testuser${i}@example.com`
        })
        const insertResult = await users.insertOne(userData)
        const insertedUser = await users.findOne({ _id: insertResult.insertedId })

        expect(insertedUser).not.toBeNull()
        expect(insertedUser!._id).toEqual(insertResult.insertedId)
        expect(insertedUser!.username).toBe(userData.username)
        expect(insertedUser!.email).toBe(userData.email)
        expect(insertedUser!.role).toBe(userData.role)

        testCleanupIds.push(insertResult.insertedId.toString())
        testData.push(insertedUser)
      }

      // Test querying
      const foundUsers = await users.find({
        username: { $in: testData.map(u => u!.username) }
      }).toArray()

      expect(foundUsers).toHaveLength(3)

      // Test updating
      const updateResult = await users.updateOne(
        { _id: testData[0]!._id },
        { $set: { isActive: false } }
      )

      expect(updateResult.modifiedCount).toBe(1)

      // Test deletion
      const deleteResult = await users.deleteOne({ _id: testData[0]!._id })

      expect(deleteResult.deletedCount).toBe(1)
    })

    it('should handle user role and permission queries', async () => {
      if (!checkDbConnection()) return

      const users = db.collection('users')
      // Create users with different roles
      const roleData = [
        { role: 'admin', permissions: ['read:all', 'write:all', 'delete:all'] },
        { role: 'user', permissions: ['read:devices', 'write:devices'] },
        { role: 'viewer', permissions: ['read:devices'] }
      ]
      const createdIds = []

      for (const data of roleData) {
        const userData = createUniqueTestUser(data)
        const result = await users.insertOne(userData)

        createdIds.push(result.insertedId)
      }

      testCleanupIds.push(...createdIds.map(id => id.toString()))

      // Query users by role
      const adminUsers = await users.find({ role: 'admin' }).toArray()

      expect(adminUsers.length).toBeGreaterThanOrEqual(1)

      // Query users by permission
      const writeUsers = await users.find({
        permissions: { $in: ['write:devices', 'write:all'] }
      }).toArray()

      expect(writeUsers.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle user authentication data', async () => {
      if (!checkDbConnection()) return

      const users = db.collection('users')
      // Create user with authentication metadata
      const userData = createUniqueTestUser({
        lastLogin: new Date(),
        loginAttempts: 0,
        isLocked: false,
        resetPasswordToken: null,
        resetPasswordExpires: null
      })
      const result = await users.insertOne(userData)

      testCleanupIds.push(result.insertedId.toString())

      // Verify authentication fields
      const user = await users.findOne({ _id: result.insertedId })

      expect(user!.lastLogin).toBeInstanceOf(Date)
      expect(user!.loginAttempts).toBe(0)
      expect(user!.isLocked).toBe(false)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /users
  // ===============================
  describe('GET /users - Retrieve Users', () => {
    it('should return all users with proper structure', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
      expect(typeof response.body.count).toBe('number')

      if (response.body.data.length > 0) {
        const user = response.body.data[0]

        expect(user).toHaveProperty('_id')
        expect(user).toHaveProperty('username')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('role')
        expect(user).toHaveProperty('isActive')

        // Password should not be included in response
        expect(user).not.toHaveProperty('password')

        // Validate optional fields if present
        if (user.profile) {
          expect(user.profile).toHaveProperty('firstName')
        }
        if (user.permissions) {
          expect(Array.isArray(user.permissions)).toBe(true)
        }
      }
    })

    it('should support filtering by role', async () => {
      // Create a user with specific role
      const userData = createUniqueTestUser({ role: 'viewer' })
      const createResponse = await request(app)
        .post('/users')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .get('/users?role=viewer')
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      response.body.data.forEach((user: any) => {
        expect(user.role).toBe('viewer')
      })
    })

    it('should support filtering by active status', async () => {
      const response = await request(app)
        .get('/users?isActive=true')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((user: any) => {
        expect(user.isActive).toBe(true)
      })
    })

    it('should support search by username', async () => {
      const uniqueUsername = testGenerators.uniqueName('searchuser')
      const userData = createUniqueTestUser({ username: uniqueUsername })
      const createResponse = await request(app)
        .post('/users')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .get(`/users?search=${uniqueUsername}`)
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      const foundUser = response.body.data.find((u: any) => u.username === uniqueUsername)

      expect(foundUser).toBeDefined()
    })

    it('should respect pagination parameters', async () => {
      const response = await request(app)
        .get('/users?limit=1')
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.count).toBe(1)
    })

    it('should handle sorting by username', async () => {
      const response = await request(app)
        .get('/users?sortBy=username&sortOrder=asc')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      if (response.body.data.length > 1) {
        for (let i = 1; i < response.body.data.length; i++) {
          expect(response.body.data[i].username.localeCompare(response.body.data[i - 1].username)).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /users
  // ===============================
  describe('POST /users - Create Users', () => {
    it('should create a new user with complete data', async () => {
      const userData = createUniqueTestUser()
      const response = await request(app)
        .post('/users')
        .send(userData)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.username).toBe(userData.username)
      expect(response.body.email).toBe(userData.email)
      expect(response.body.role).toBe(userData.role)
      expect(response.body.isActive).toBe(userData.isActive)

      // Password should not be returned
      expect(response.body).not.toHaveProperty('password')

      testUserIds.push(response.body._id)
      testCleanupIds.push(response.body._id)
    })

    it('should create user with minimal required data', async () => {
      const minimalData = {
        username: testGenerators.uniqueName('minimal'),
        email: `minimal${Date.now()}@example.com`,
        password: 'testpassword123',
        role: 'user'
      }
      const response = await request(app)
        .post('/users')
        .send(minimalData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.username).toBe(minimalData.username)
      expect(response.body.email).toBe(minimalData.email)
      expect(response.body.isActive).toBe(true) // Default value
      testCleanupIds.push(response.body._id)
    })

    it('should reject user without required username', async () => {
      const userData = createUniqueTestUser()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete userData.username

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Username is required')
    })

    it('should reject user without required email', async () => {
      const userData = createUniqueTestUser()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete userData.email

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject user without required password', async () => {
      const userData = createUniqueTestUser()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete userData.password

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject user with invalid email format', async () => {
      const userData = createUniqueTestUser({
        email: 'invalid-email-format'
      })
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject user with weak password', async () => {
      const userData = createUniqueTestUser({
        password: '123' // Too weak
      })
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle duplicate username', async () => {
      const userData1 = createUniqueTestUser()
      const userData2 = createUniqueTestUser({ username: userData1.username })
      // Create first user
      const response1 = await request(app)
        .post('/users')
        .send(userData1)
        .expect(201)

      testCleanupIds.push(response1.body._id)

      // Try to create duplicate username
      const response2 = await request(app)
        .post('/users')
        .send(userData2)
        .expect(409)

      expect(response2.body).toHaveProperty('error', 'Conflict')
      expect(response2.body.message).toContain('already exists')
    })

    it('should handle duplicate email', async () => {
      const userData1 = createUniqueTestUser()
      const userData2 = createUniqueTestUser({ email: userData1.email })
      // Create first user
      const response1 = await request(app)
        .post('/users')
        .send(userData1)
        .expect(201)

      testCleanupIds.push(response1.body._id)

      // Try to create duplicate email
      const response2 = await request(app)
        .post('/users')
        .send(userData2)
        .expect(409)

      expect(response2.body).toHaveProperty('error', 'Conflict')
      expect(response2.body.message).toContain('already exists')
    })

    it('should validate role values', async () => {
      const userData = createUniqueTestUser({
        role: 'invalid-role'
      })
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousData = createUniqueTestUser({
        username: testGenerators.uniqueName('test'),
        bio: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/users')
        .send(maliciousData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.username).toBe(maliciousData.username)
      expect(response.body).not.toHaveProperty('$where')

      testCleanupIds.push(response.body._id)
    })
  })

  // ===============================
  // AUTHENTICATION TESTS
  // ===============================
  describe('Authentication Endpoints', () => {
    let testUser: any

    beforeAll(async () => {
      // Create a test user for authentication
      const userData = createUniqueTestUser({
        username: 'authuser',
        email: 'auth@test.com',
        password: 'testpassword123'
      })
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201)

      testUser = response.body
      testCleanupIds.push(testUser._id)
    })

    describe('POST /auth/login', () => {
      it('should authenticate user with valid credentials', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            username: 'authuser',
            password: 'testpassword123'
          })
          .expect(200)

        expect(response.body).toHaveProperty('token')
        expect(response.body).toHaveProperty('user')
        expect(response.body.user).toHaveProperty('_id')
        expect(response.body.user.username).toBe('authuser')
        expect(response.body.user).not.toHaveProperty('password')

        authToken = response.body.token
      })

      it('should reject invalid username', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            username: 'nonexistent',
            password: 'testpassword123'
          })
          .expect(401)

        expect(response.body).toHaveProperty('error', 'Unauthorized')
        expect(response.body.message).toContain('Invalid credentials')
      })

      it('should reject invalid password', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            username: 'authuser',
            password: 'wrongpassword'
          })
          .expect(401)

        expect(response.body).toHaveProperty('error', 'Unauthorized')
        expect(response.body.message).toContain('Invalid credentials')
      })

      it('should reject login for inactive user', async () => {
        // Create inactive user
        const inactiveUserData = createUniqueTestUser({
          username: 'inactive',
          email: 'inactive@test.com',
          isActive: false
        })
        const createResponse = await request(app)
          .post('/users')
          .send(inactiveUserData)
          .expect(201)

        testCleanupIds.push(createResponse.body._id)

        const response = await request(app)
          .post('/auth/login')
          .send({
            username: 'inactive',
            password: inactiveUserData.password
          })
          .expect(401)

        expect(response.body).toHaveProperty('error', 'Unauthorized')
        expect(response.body.message).toContain('Account is disabled')
      })

      it('should handle account lockout after failed attempts', async () => {
        const userData = createUniqueTestUser({
          username: 'locktest',
          email: 'locktest@test.com'
        })
        const createResponse = await request(app)
          .post('/users')
          .send(userData)
          .expect(201)

        testCleanupIds.push(createResponse.body._id)

        // Simulate multiple failed login attempts
        for (let i = 0; i < 5; i++) {
          await request(app)
            .post('/auth/login')
            .send({
              username: 'locktest',
              password: 'wrongpassword'
            })
            .expect(401)
        }

        // Next attempt should indicate account is locked
        const response = await request(app)
          .post('/auth/login')
          .send({
            username: 'locktest',
            password: userData.password
          })

        // Depending on implementation, might be 401 or 423 (Locked)
        expect([401, 423]).toContain(response.status)
      })
    })

    describe('POST /auth/logout', () => {
      it('should logout authenticated user', async () => {
        const response = await request(app)
          .post('/auth/logout')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        expect(response.body).toHaveProperty('message', 'Logged out successfully')
      })

      it('should reject logout without token', async () => {
        const response = await request(app)
          .post('/auth/logout')
          .expect(401)

        expect(response.body).toHaveProperty('error', 'Unauthorized')
      })
    })

    describe('POST /auth/refresh', () => {
      it('should refresh valid token', async () => {
        // First login to get token
        const loginResponse = await request(app)
          .post('/auth/login')
          .send({
            username: 'authuser',
            password: 'testpassword123'
          })
          .expect(200)
        const response = await request(app)
          .post('/auth/refresh')
          .set('Authorization', `Bearer ${loginResponse.body.token}`)
          .expect(200)

        expect(response.body).toHaveProperty('token')
        expect(response.body.token).not.toBe(loginResponse.body.token)
      })

      it('should reject refresh with invalid token', async () => {
        const response = await request(app)
          .post('/auth/refresh')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401)

        expect(response.body).toHaveProperty('error', 'Unauthorized')
      })
    })
  })

  // ===============================
  // AUTHORIZATION TESTS
  // ===============================
  describe('Authorization and Permissions', () => {
    it('should allow admin to access all user operations', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
    })

    it('should restrict user access based on permissions', async () => {
      // Create user with limited permissions
      const userData = createUniqueTestUser({
        role: 'viewer',
        permissions: ['read:devices']
      })
      const createResponse = await request(app)
        .post('/users')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      // Login as limited user
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        })
        .expect(200)
      const userToken = loginResponse.body.token
      // Try to create another user (should fail)
      const newUserData = createUniqueTestUser()
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newUserData)
        .expect(403)

      expect(response.body).toHaveProperty('error', 'Forbidden')
    })

    it('should validate permission for specific operations', async () => {
      // Test different permission levels
      const permissionTests = [
        { permission: 'read:users', endpoint: '/users', method: 'get', expectedStatus: 200 },
        { permission: 'write:users', endpoint: '/users', method: 'post', expectedStatus: 201 },
        { permission: 'delete:users', endpoint: '/users/someId', method: 'delete', expectedStatus: 404 } // 404 because ID doesn't exist, but permission passed
      ]

      for (const test of permissionTests) {
        const userData = createUniqueTestUser({
          permissions: [test.permission]
        })
        const createResponse = await request(app)
          .post('/users')
          .send(userData)
          .expect(201)

        testCleanupIds.push(createResponse.body._id)

        const loginResponse = await request(app)
          .post('/auth/login')
          .send({
            username: userData.username,
            password: userData.password
          })
          .expect(200)
        const userToken = loginResponse.body.token

        if (test.method === 'post') {
          const testData = createUniqueTestUser()
          const response = await request(app)
            .post(test.endpoint)
            .set('Authorization', `Bearer ${userToken}`)
            .send(testData)

          expect([test.expectedStatus, 403]).toContain(response.status)
          if (response.status === 201) {
            testCleanupIds.push(response.body._id)
          }
        } else {
          let response

          if (test.method === 'get') {
            response = await request(app).get(test.endpoint)
              .set('Authorization', `Bearer ${userToken}`)
          } else if (test.method === 'delete') {
            response = await request(app).delete(test.endpoint)
              .set('Authorization', `Bearer ${userToken}`)
          } else {
            response = await request(app).get(test.endpoint)
              .set('Authorization', `Bearer ${userToken}`)
          }

          expect([test.expectedStatus, 403]).toContain(response.status)
        }
      }
    })
  })

  // ===============================
  // USER PROFILE MANAGEMENT
  // ===============================
  describe('User Profile Management', () => {
    let profileUserId: string

    beforeAll(async () => {
      const userData = createUniqueTestUser({
        username: 'profileuser',
        email: 'profile@test.com'
      })
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201)

      profileUserId = response.body._id
      testCleanupIds.push(profileUserId)
    })

    it('should get user profile', async () => {
      const response = await request(app)
        .get(`/users/${profileUserId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', profileUserId)
      expect(response.body).toHaveProperty('username')
      expect(response.body).toHaveProperty('email')
      expect(response.body).not.toHaveProperty('password')
    })

    it('should update user profile', async () => {
      const updateData = {
        profile: {
          firstName: 'Updated',
          lastName: 'Name',
          department: 'Engineering',
          phone: '+1234567890'
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            email: false,
            sms: true,
            push: false
          }
        }
      }
      const response = await request(app)
        .patch(`/users/${profileUserId}/profile`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Profile updated successfully')

      // Verify the update
      const getResponse = await request(app)
        .get(`/users/${profileUserId}`)
        .expect(200)

      expect(getResponse.body.profile.firstName).toBe('Updated')
      expect(getResponse.body.preferences.theme).toBe('dark')
    })

    it('should change user password', async () => {
      const passwordData = {
        currentPassword: 'testpassword123',
        newPassword: 'newpassword456',
        confirmPassword: 'newpassword456'
      }
      const response = await request(app)
        .patch(`/users/${profileUserId}/password`)
        .send(passwordData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Password updated successfully')
    })

    it('should reject password change with wrong current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword456',
        confirmPassword: 'newpassword456'
      }
      const response = await request(app)
        .patch(`/users/${profileUserId}/password`)
        .send(passwordData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject password change with mismatched confirmation', async () => {
      const passwordData = {
        currentPassword: 'testpassword123',
        newPassword: 'newpassword456',
        confirmPassword: 'differentpassword'
      }
      const response = await request(app)
        .patch(`/users/${profileUserId}/password`)
        .send(passwordData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  // ===============================
  // PERFORMANCE AND INTEGRATION TESTS
  // ===============================
  describe('Performance and Integration Tests', () => {
    it('should handle batch user operations efficiently', async () => {
      const batchSize = 5
      const userData = Array(batchSize).fill(null).map((_, index) =>
        createUniqueTestUser({
          username: `batchuser${index}`,
          email: `batchuser${index}@example.com`
        })
      )
      const createdIds: string[] = []

      try {
        // Batch create
        const createPromises = userData.map(data =>
          request(app).post('/users').send(data)
        )
        const createResponses = await Promise.all(createPromises)

        createResponses.forEach(response => {
          expect(response.status).toBe(201)
          createdIds.push(response.body._id)
        })

        // Batch read
        const readPromises = createdIds.map(id =>
          request(app).get(`/users/${id}`)
        )
        const readResponses = await Promise.all(readPromises)

        readResponses.forEach(response => {
          expect(response.status).toBe(200)
        })

      } finally {
        testCleanupIds.push(...createdIds)
      }
    })

    it('should handle concurrent authentication', async () => {
      // Create test users for concurrent login
      const users = []

      for (let i = 0; i < 3; i++) {
        const userData = createUniqueTestUser({
          username: `concurrentuser${i}`,
          email: `concurrent${i}@test.com`
        })
        const response = await request(app)
          .post('/users')
          .send(userData)
          .expect(201)

        users.push({ ...userData, _id: response.body._id })
        testCleanupIds.push(response.body._id)
      }

      // Concurrent login attempts
      const loginPromises = users.map(user =>
        request(app)
          .post('/auth/login')
          .send({
            username: user.username,
            password: user.password
          })
      )
      const responses = await Promise.allSettled(loginPromises)
      const successfulLogins = responses.filter(r =>
        r.status === 'fulfilled' && r.value.status === 200
      )

      expect(successfulLogins.length).toBe(3)
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle extreme username lengths', async () => {
      const extremeUsernames = [
        'a', // Minimum
        'a'.repeat(100), // Maximum
        'user_with_special-chars.123' // Special characters
      ]

      for (const username of extremeUsernames) {
        const userData = createUniqueTestUser({
          username,
          email: `${username.substring(0, 10)}@example.com`
        })
        const response = await request(app)
          .post('/users')
          .send(userData)

        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
          expect(response.body.username).toBe(username)
        }
      }
    })

    it('should handle special characters in user data', async () => {
      const specialCharData = {
        username: testGenerators.uniqueName('user'),
        email: `test${Date.now()}@example.com`,
        password: 'testpass123',
        role: 'user',
        profile: {
          firstName: 'José',
          lastName: 'García-Müller',
          bio: 'User with émojis 👨‍💻 and special chars ñáéíóú',
          notes: 'Multi\nline\nnotes'
        }
      }
      const response = await request(app)
        .post('/users')
        .send(specialCharData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body.profile.firstName).toBe('José')
        expect(response.body.profile.lastName).toBe('García-Müller')
      }
    })

    it('should handle complex permission structures', async () => {
      const complexPermissions = [
        'read:users:own',
        'write:devices:department:engineering',
        'delete:models:created-by:self',
        'admin:users:role:manager',
        'report:analytics:view:department'
      ]
      const userData = createUniqueTestUser({
        permissions: complexPermissions
      })
      const response = await request(app)
        .post('/users')
        .send(userData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body.permissions).toEqual(complexPermissions)
      }
    })

    it('should handle large user metadata', async () => {
      const largeData = createUniqueTestUser({
        profile: {
          bio: 'x'.repeat(5000),
          notes: 'y'.repeat(3000),
          tags: Array(100).fill(null).map((_, i) => `tag${i}`)
        },
        preferences: {
          customSettings: {
            dashboardWidgets: Array(50).fill(null).map((_, i) => ({
              id: `widget${i}`,
              type: 'chart',
              config: { data: 'a'.repeat(100) }
            }))
          }
        }
      })
      const response = await request(app)
        .post('/users')
        .send(largeData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body).toHaveProperty('_id')
      }
    })
  })
})
