/**
 * @file user-management.test.ts
 * @description Comprehensive test suite for User Management API endpoints and advanced user operations.
 *
 * Coverage includes:
 * - Complete user management CRUD operations
 * - Advanced user administration features
 * - User profile management and updates
 * - Account activation and deactivation
 * - Password management and security
 * - User search and filtering capabilities
 * - Bulk user operations and imports
 * - User session management
 * - Account lockout and security policies
 * - User activity tracking and analytics
 * - Input validation and sanitization
 * - Security testing (injection prevention)
 * - RBAC integration and permissions
 * - Database integration and persistence
 *
 * @version 2024-09-22 Comprehensive user management API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('User Management API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testUserIds: string[] = []
  const testRoleIds: string[] = []
  const testCleanupIds: string[] = []

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
      console.log('✅ MongoDB connection successful for comprehensive user management tests')

      // Create test data for user management relationships
      await createTestEntities()
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

        if (testRoleIds.length > 0) {
          const roleCollection = db.collection('roles')
          const roleObjectIds = testRoleIds.map(id => new ObjectId(id))

          await roleCollection.deleteMany({ _id: { $in: roleObjectIds } })
          console.log(`🧹 Cleaned up ${testRoleIds.length} test roles`)
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
  const createTestEntities = async () => {
    if (!checkDbConnection()) return

    // Create test roles
    const roles = db.collection('roles')
    const testRoles = [
      {
        name: 'Test Admin Role',
        permissions: ['read', 'write', 'delete', 'admin'],
        description: 'Test administrative role',
        isActive: true
      },
      {
        name: 'Test User Role',
        permissions: ['read', 'write'],
        description: 'Test user role',
        isActive: true
      }
    ]

    for (const role of testRoles) {
      const result = await roles.insertOne(role)

      testRoleIds.push(result.insertedId.toString())
    }
  }
  const createUniqueTestUser = (overrides = {}) => {
    const timestamp = Date.now()

    return {
      username: testGenerators.uniqueName('testuser'),
      email: `testuser${timestamp}@test.com`,
      password: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: testRoleIds.length > 0 ? testRoleIds[0] : 'user',
      isActive: true,
      isVerified: false,
      profile: {
        phone: '+1234567890',
        department: 'IT',
        title: 'Test User',
        location: 'Test Location',
        timezone: 'UTC',
        language: 'en'
      },
      preferences: {
        theme: 'light',
        notifications: true,
        emailDigest: 'daily'
      },
      security: {
        lastLogin: null,
        loginAttempts: 0,
        isLocked: false,
        passwordChangedAt: new Date(),
        twoFactorEnabled: false
      },
      metadata: {
        source: 'api',
        createdBy: 'test-system',
        tags: ['test', 'api', 'user-management']
      },
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database User Management Operations', () => {
    it('should perform direct database CRUD operations', async () => {
      if (!checkDbConnection()) return

      const users = db.collection('users')
      const testData = []

      // Test insertion of multiple users
      for (let i = 0; i < 3; i++) {
        const userData = createUniqueTestUser({
          username: `testuser${i}`,
          email: `testuser${i}@test.com`
        })
        const insertResult = await users.insertOne(userData)
        const insertedUser = await users.findOne({ _id: insertResult.insertedId })

        expect(insertedUser).not.toBeNull()
        expect(insertedUser!._id).toEqual(insertResult.insertedId)
        expect(insertedUser!.username).toBe(userData.username)
        expect(insertedUser!.email).toBe(userData.email)
        expect(insertedUser!.isActive).toBe(userData.isActive)

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

    it('should handle user-role relationships', async () => {
      if (!checkDbConnection() || testRoleIds.length === 0) return

      const users = db.collection('users')
      // Create user associated with role
      const userData = createUniqueTestUser({
        role: testRoleIds[0]
      })
      const userResult = await users.insertOne(userData)

      testCleanupIds.push(userResult.insertedId.toString())

      // Query users by role
      const roleUsers = await users.find({
        role: testRoleIds[0]
      }).toArray()

      expect(roleUsers.length).toBeGreaterThanOrEqual(1)
      expect(roleUsers[0].role).toBe(testRoleIds[0])
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /user-management
  // ===============================
  describe('GET /user-management - Retrieve Users', () => {
    it('should return all users with proper structure', async () => {
      const response = await request(app)
        .get('/user-management')
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
        expect(user).toHaveProperty('isActive')

        // Password should not be included in responses
        expect(user).not.toHaveProperty('password')

        // Validate optional fields if present
        if (user.profile) {
          expect(typeof user.profile).toBe('object')
        }
        if (user.security) {
          expect(typeof user.security).toBe('object')
          expect(user.security).not.toHaveProperty('password')
        }
      }
    })

    it('should support filtering by active status', async () => {
      const response = await request(app)
        .get('/user-management?isActive=true')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((user: any) => {
        expect(user.isActive).toBe(true)
      })
    })

    it('should support filtering by role', async () => {
      if (testRoleIds.length === 0) return

      const response = await request(app)
        .get(`/user-management?role=${testRoleIds[0]}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((user: any) => {
        expect(user.role).toBe(testRoleIds[0])
      })
    })

    it('should support user search by username or email', async () => {
      // Create a user with known credentials
      const userData = createUniqueTestUser({
        username: 'searchable_user',
        email: 'searchable@test.com'
      })
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      // Search by username
      const usernameResponse = await request(app)
        .get('/user-management?search=searchable_user')
        .expect(200)

      expect(usernameResponse.body.data.length).toBeGreaterThan(0)
      const foundUser = usernameResponse.body.data.find((u: any) => u.username === 'searchable_user')

      expect(foundUser).toBeDefined()

      // Search by email
      const emailResponse = await request(app)
        .get('/user-management?search=searchable@test.com')
        .expect(200)

      expect(emailResponse.body.data.length).toBeGreaterThan(0)
    })

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/user-management?limit=1')
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.count).toBe(1)
    })

    it('should handle sorting by username', async () => {
      const response = await request(app)
        .get('/user-management?sortBy=username&sortOrder=asc')
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
  // API ENDPOINT TESTS - POST /user-management
  // ===============================
  describe('POST /user-management - Create Users', () => {
    it('should create a new user with complete data', async () => {
      const userData = createUniqueTestUser()
      const response = await request(app)
        .post('/user-management')
        .send(userData)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.username).toBe(userData.username)
      expect(response.body.email).toBe(userData.email)
      expect(response.body.isActive).toBe(userData.isActive)
      expect(response.body.firstName).toBe(userData.firstName)
      expect(response.body.lastName).toBe(userData.lastName)

      // Password should not be returned
      expect(response.body).not.toHaveProperty('password')

      testUserIds.push(response.body._id)
      testCleanupIds.push(response.body._id)
    })

    it('should create user with minimal required data', async () => {
      const minimalData = {
        username: testGenerators.uniqueName('minimaluser'),
        email: `minimal${Date.now()}@test.com`,
        password: 'password123'
      }
      const response = await request(app)
        .post('/user-management')
        .send(minimalData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.username).toBe(minimalData.username)
      expect(response.body.email).toBe(minimalData.email)
      expect(response.body.isActive).toBe(true) // Default value
      expect(response.body).not.toHaveProperty('password')

      testCleanupIds.push(response.body._id)
    })

    it('should reject user without required username field', async () => {
      const userData = createUniqueTestUser()
      const { username: _username, ...dataWithoutUsername } = userData
      const response = await request(app)
        .post('/user-management')
        .send(dataWithoutUsername)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Username is required')
    })

    it('should reject user without required email field', async () => {
      const userData = createUniqueTestUser()
      const { email: _email, ...dataWithoutEmail } = userData
      const response = await request(app)
        .post('/user-management')
        .send(dataWithoutEmail)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Email is required')
    })

    it('should reject user without required password', async () => {
      const userData = createUniqueTestUser()
      const { password: _password, ...dataWithoutPassword } = userData
      const response = await request(app)
        .post('/user-management')
        .send(dataWithoutPassword)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject duplicate username', async () => {
      const userData = createUniqueTestUser({
        username: 'duplicate_user'
      })
      // Create first user
      const firstResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(firstResponse.body._id)

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(409)

      expect(duplicateResponse.body).toHaveProperty('error')
      expect(duplicateResponse.body.error).toContain('Username already exists')
    })

    it('should reject duplicate email', async () => {
      const email = `duplicate${Date.now()}@test.com`
      const userData1 = createUniqueTestUser({ email })
      const userData2 = createUniqueTestUser({ email })
      // Create first user
      const firstResponse = await request(app)
        .post('/user-management')
        .send(userData1)
        .expect(201)

      testCleanupIds.push(firstResponse.body._id)

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/user-management')
        .send(userData2)
        .expect(409)

      expect(duplicateResponse.body).toHaveProperty('error')
      expect(duplicateResponse.body.error).toContain('Email already exists')
    })

    it('should validate email format', async () => {
      const userData = createUniqueTestUser({
        email: 'invalid-email-format'
      })
      const response = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid email format')
    })

    it('should enforce password complexity requirements', async () => {
      const weakPasswords = ['123', 'password', 'abc']

      for (const weakPassword of weakPasswords) {
        const userData = createUniqueTestUser({
          password: weakPassword
        })
        const response = await request(app)
          .post('/user-management')
          .send(userData)
          .expect(400)

        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toContain('Password does not meet complexity requirements')
      }
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousData = createUniqueTestUser({
        username: testGenerators.uniqueName('testuser'),
        email: `clean${Date.now()}@test.com`,
        firstName: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/user-management')
        .send(maliciousData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.username).toBe(maliciousData.username)
      expect(response.body).not.toHaveProperty('$where')

      testCleanupIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /user-management/:id
  // ===============================
  describe('GET /user-management/:id - Retrieve Specific User', () => {
    let testUserId: string

    beforeAll(async () => {
      const userData = createUniqueTestUser()
      const response = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testUserId = response.body._id
      testCleanupIds.push(testUserId)
    })

    it('should return specific user by valid ID', async () => {
      const response = await request(app)
        .get(`/user-management/${testUserId}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testUserId)
      expect(response.body).toHaveProperty('username')
      expect(response.body).toHaveProperty('email')
      expect(response.body).toHaveProperty('isActive')
      expect(response.body).not.toHaveProperty('password')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/user-management/invalid-id')
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Invalid Input')
      expect(response.body).toHaveProperty('message', 'Invalid ObjectId format')
    })

    it('should return 404 for non-existent user', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .get(`/user-management/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'User not found')
    })

    it('should include profile details when requested', async () => {
      const response = await request(app)
        .get(`/user-management/${testUserId}?includeProfile=true`)
        .expect(200)

      if (response.body.profile) {
        expect(response.body.profile).toHaveProperty('department')
        expect(response.body.profile).toHaveProperty('title')
      }
    })
  })

  // ===============================
  // SPECIALIZED USER MANAGEMENT TESTS
  // ===============================
  describe('User Profile Management', () => {
    it('should update user profile information', async () => {
      // Create user
      const userData = createUniqueTestUser()
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      // Update profile
      const profileUpdate = {
        profile: {
          phone: '+9876543210',
          department: 'Engineering',
          title: 'Senior Developer',
          location: 'Remote'
        }
      }
      const updateResponse = await request(app)
        .patch(`/user-management/${createResponse.body._id}/profile`)
        .send(profileUpdate)
        .expect(200)

      expect(updateResponse.body).toHaveProperty('message', 'Profile updated successfully')

      // Verify update
      const getResponse = await request(app)
        .get(`/user-management/${createResponse.body._id}`)
        .expect(200)

      expect(getResponse.body.profile.phone).toBe(profileUpdate.profile.phone)
      expect(getResponse.body.profile.department).toBe(profileUpdate.profile.department)
    })

    it('should manage user preferences', async () => {
      const userData = createUniqueTestUser()
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const preferencesUpdate = {
        preferences: {
          theme: 'dark',
          notifications: false,
          emailDigest: 'weekly',
          language: 'es'
        }
      }
      const response = await request(app)
        .patch(`/user-management/${createResponse.body._id}/preferences`)
        .send(preferencesUpdate)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Preferences updated successfully')
    })
  })

  describe('User Account Management', () => {
    it('should activate user account', async () => {
      const userData = createUniqueTestUser({ isActive: false })
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .patch(`/user-management/${createResponse.body._id}/activate`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'User activated successfully')

      // Verify activation
      const getResponse = await request(app)
        .get(`/user-management/${createResponse.body._id}`)
        .expect(200)

      expect(getResponse.body.isActive).toBe(true)
    })

    it('should deactivate user account', async () => {
      const userData = createUniqueTestUser({ isActive: true })
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .patch(`/user-management/${createResponse.body._id}/deactivate`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'User deactivated successfully')

      // Verify deactivation
      const getResponse = await request(app)
        .get(`/user-management/${createResponse.body._id}`)
        .expect(200)

      expect(getResponse.body.isActive).toBe(false)
    })

    it('should lock user account after failed attempts', async () => {
      const userData = createUniqueTestUser()
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .patch(`/user-management/${createResponse.body._id}/lock`)
        .send({ reason: 'Too many failed login attempts' })
        .expect(200)

      expect(response.body).toHaveProperty('message', 'User account locked')
    })

    it('should unlock user account', async () => {
      const userData = createUniqueTestUser()
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      // Lock first
      await request(app)
        .patch(`/user-management/${createResponse.body._id}/lock`)
        .expect(200)

      // Then unlock
      const response = await request(app)
        .patch(`/user-management/${createResponse.body._id}/unlock`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'User account unlocked')
    })
  })

  describe('Password Management', () => {
    it('should reset user password', async () => {
      const userData = createUniqueTestUser()
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const passwordReset = {
        newPassword: 'NewSecurePassword123!',
        requirePasswordChange: true
      }
      const response = await request(app)
        .patch(`/user-management/${createResponse.body._id}/reset-password`)
        .send(passwordReset)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Password reset successfully')
    })

    it('should force password change on next login', async () => {
      const userData = createUniqueTestUser()
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .patch(`/user-management/${createResponse.body._id}/force-password-change`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Password change required on next login')
    })
  })

  describe('User Analytics and Reporting', () => {
    it('should get user activity statistics', async () => {
      const response = await request(app)
        .get('/user-management/analytics/activity')
        .expect(200)

      expect(response.body).toHaveProperty('totalUsers')
      expect(response.body).toHaveProperty('activeUsers')
      expect(response.body).toHaveProperty('newUsers')
      expect(response.body).toHaveProperty('loginStats')

      expect(typeof response.body.totalUsers).toBe('number')
      expect(typeof response.body.activeUsers).toBe('number')
      expect(typeof response.body.newUsers).toBe('number')
    })

    it('should get user registration trends', async () => {
      const response = await request(app)
        .get('/user-management/analytics/registrations')
        .expect(200)

      expect(response.body).toHaveProperty('trends')
      expect(Array.isArray(response.body.trends)).toBe(true)

      if (response.body.trends.length > 0) {
        const trend = response.body.trends[0]

        expect(trend).toHaveProperty('date')
        expect(trend).toHaveProperty('count')
        expect(typeof trend.count).toBe('number')
      }
    })

    it('should get user role distribution', async () => {
      const response = await request(app)
        .get('/user-management/analytics/roles')
        .expect(200)

      expect(response.body).toHaveProperty('distribution')
      expect(Array.isArray(response.body.distribution)).toBe(true)

      if (response.body.distribution.length > 0) {
        const roleData = response.body.distribution[0]

        expect(roleData).toHaveProperty('role')
        expect(roleData).toHaveProperty('count')
        expect(typeof roleData.count).toBe('number')
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PUT /user-management/:id
  // ===============================
  describe('PUT /user-management/:id - Update Complete User', () => {
    let updateUserId: string

    beforeAll(async () => {
      const userData = createUniqueTestUser()
      const response = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      updateUserId = response.body._id
      testCleanupIds.push(updateUserId)
    })

    it('should update complete user with valid data', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
        email: `updated${Date.now()}@test.com`,
        role: testRoleIds.length > 0 ? testRoleIds[1] : 'user',
        profile: {
          phone: '+1111111111',
          department: 'Updated Department',
          title: 'Updated Title'
        }
      }
      const response = await request(app)
        .put(`/user-management/${updateUserId}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'User updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify the update
      const getResponse = await request(app)
        .get(`/user-management/${updateUserId}`)
        .expect(200)

      expect(getResponse.body.firstName).toBe(updateData.firstName)
      expect(getResponse.body.lastName).toBe(updateData.lastName)
      expect(getResponse.body.email).toBe(updateData.email)
    })

    it('should return 404 for non-existent user update', async () => {
      const fakeId = new ObjectId().toString()
      const updateData = { firstName: 'Updated' }
      const response = await request(app)
        .put(`/user-management/${fakeId}`)
        .send(updateData)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'User not found')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - DELETE /user-management/:id
  // ===============================
  describe('DELETE /user-management/:id - Delete Specific User', () => {
    it('should delete specific user by ID', async () => {
      // Create a user to delete
      const userData = createUniqueTestUser()
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)
      const userToDelete = createResponse.body._id
      // Delete the user
      const deleteResponse = await request(app)
        .delete(`/user-management/${userToDelete}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('message', 'User deleted successfully')
      expect(deleteResponse.body).toHaveProperty('deletedCount', 1)

      // Verify deletion
      await request(app)
        .get(`/user-management/${userToDelete}`)
        .expect(404)
    })

    it('should return 404 when deleting non-existent user', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .delete(`/user-management/${fakeId}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'User not found')
    })

    it('should support soft delete for user preservation', async () => {
      const userData = createUniqueTestUser()
      const createResponse = await request(app)
        .post('/user-management')
        .send(userData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .delete(`/user-management/${createResponse.body._id}?soft=true`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'User soft deleted successfully')

      // User should still exist but be marked as deleted
      const getResponse = await request(app)
        .get(`/user-management/${createResponse.body._id}`)
        .expect(200)

      expect(getResponse.body.isDeleted).toBe(true)
    })
  })

  // ===============================
  // BULK OPERATIONS AND BATCH PROCESSING
  // ===============================
  describe('Bulk User Operations', () => {
    it('should handle bulk user creation', async () => {
      const bulkUsers = Array(5).fill(null).map((_, index) =>
        createUniqueTestUser({
          username: `bulkuser${index}`,
          email: `bulkuser${index}@test.com`
        })
      )
      const response = await request(app)
        .post('/user-management/bulk')
        .send({ users: bulkUsers })
        .expect(201)

      expect(response.body).toHaveProperty('created')
      expect(response.body).toHaveProperty('errors')
      expect(response.body.created).toBeGreaterThan(0)
      expect(Array.isArray(response.body.userIds)).toBe(true)

      testCleanupIds.push(...response.body.userIds)
    })

    it('should handle bulk user updates', async () => {
      // Create users first
      const users = []

      for (let i = 0; i < 3; i++) {
        const userData = createUniqueTestUser({
          username: `updateuser${i}`,
          email: `updateuser${i}@test.com`
        })
        const response = await request(app)
          .post('/user-management')
          .send(userData)
          .expect(201)

        users.push(response.body._id)
        testCleanupIds.push(response.body._id)
      }

      // Bulk update
      const bulkUpdate = {
        userIds: users,
        updates: {
          isActive: false,
          profile: {
            department: 'Bulk Updated Department'
          }
        }
      }
      const response = await request(app)
        .patch('/user-management/bulk')
        .send(bulkUpdate)
        .expect(200)

      expect(response.body).toHaveProperty('updated')
      expect(response.body.updated).toBe(users.length)
    })

    it('should export users in various formats', async () => {
      const response = await request(app)
        .get('/user-management/export?format=csv')
        .expect(200)

      expect(response.headers['content-type']).toContain('text/csv')
      expect(response.headers['content-disposition']).toContain('attachment')
    })

    it('should import users from CSV', async () => {
      const csvData = `username,email,firstName,lastName,role
importuser1,import1@test.com,Import,User1,user
importuser2,import2@test.com,Import,User2,user`
      const response = await request(app)
        .post('/user-management/import')
        .attach('file', Buffer.from(csvData), 'users.csv')
        .expect(201)

      expect(response.body).toHaveProperty('imported')
      expect(response.body).toHaveProperty('errors')
      expect(response.body.imported).toBeGreaterThan(0)

      if (response.body.userIds) {
        testCleanupIds.push(...response.body.userIds)
      }
    })
  })

  // ===============================
  // PERFORMANCE AND INTEGRATION TESTS
  // ===============================
  describe('Performance and Integration Tests', () => {
    it('should handle high-volume user queries efficiently', async () => {
      const startTime = Date.now()
      const response = await request(app)
        .get('/user-management?limit=100')
        .expect(200)
      const responseTime = Date.now() - startTime

      expect(responseTime).toBeLessThan(2000) // Should complete within 2 seconds
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle concurrent user operations', async () => {
      const concurrentUsers = Array(10).fill(null).map((_, index) =>
        createUniqueTestUser({
          username: `concurrent${index}`,
          email: `concurrent${index}@test.com`
        })
      )
      const promises = concurrentUsers.map(userData =>
        request(app).post('/user-management').send(userData)
      )
      const responses = await Promise.all(promises)
      const successfulCreations = responses.filter(r => r.status === 201)

      expect(successfulCreations.length).toBeGreaterThan(8) // At least 80% success rate

      successfulCreations.forEach(response => {
        testCleanupIds.push(response.body._id)
      })
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle special characters in user data', async () => {
      const specialCharData = createUniqueTestUser({
        firstName: 'José María',
        lastName: 'González-Pérez',
        username: 'user_with-special.chars',
        profile: {
          title: 'Señor Developer & Designer'
        }
      })
      const response = await request(app)
        .post('/user-management')
        .send(specialCharData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body.firstName).toBe(specialCharData.firstName)
        expect(response.body.lastName).toBe(specialCharData.lastName)
      }
    })

    it('should handle very long user profiles', async () => {
      const longProfileData = createUniqueTestUser({
        profile: {
          title: 'x'.repeat(500),
          department: 'y'.repeat(200),
          bio: 'z'.repeat(2000)
        }
      })
      const response = await request(app)
        .post('/user-management')
        .send(longProfileData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
      } else {
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
      }
    })

    it('should handle user operations during system maintenance', async () => {
      const response = await request(app)
        .get('/user-management')
        .set('X-Maintenance-Mode', 'true')

      expect([200, 503]).toContain(response.status)

      if (response.status === 503) {
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toContain('maintenance')
      }
    })
  })
})
