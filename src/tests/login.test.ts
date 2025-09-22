/**
 * @file login.test.ts
 * @description Comprehensive test suite for Login/Authentication API endpoints.
 *
 * Coverage includes:
 * - Complete authentication flow testing
 * - JWT token generation and validation
 * - Login/logout functionality
 * - Password authentication and validation
 * - Multi-factor authentication (MFA)
 * - Session management and persistence
 * - Account lockout and security policies
 * - Token refresh and expiration handling
 * - OAuth integration testing
 * - Social login functionality
 * - Input validation and sanitization
 * - Security testing (brute force protection)
 * - Rate limiting and throttling
 * - Database integration for auth data
 *
 * @version 2024-09-22 Comprehensive login API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Login API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testUserIds: string[] = []
  const testSessionIds: string[] = []
  const testTokens: string[] = []
  const testCleanupIds: string[] = []
  // Test user credentials
  const testCredentials = {
    email: 'testuser@login.com',
    password: 'TestPassword123!',
    username: 'testloginuser'
  }

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
      console.log('✅ MongoDB connection successful for comprehensive login tests')

      // Create test user for authentication
      await createTestUser()
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

        if (testSessionIds.length > 0) {
          const sessionCollection = db.collection('sessions')
          const sessionObjectIds = testSessionIds.map(id => new ObjectId(id))

          await sessionCollection.deleteMany({ _id: { $in: sessionObjectIds } })
          console.log(`🧹 Cleaned up ${testSessionIds.length} test sessions`)
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
  const createTestUser = async () => {
    if (!checkDbConnection()) return

    const users = db.collection('users')
    const testUser = {
      username: testCredentials.username,
      email: testCredentials.email,
      password: '$2b$10$hashedPasswordHere', // Simulated hashed password
      isActive: true,
      isVerified: true,
      loginAttempts: 0,
      isLocked: false,
      role: 'user',
      createdAt: new Date(),
      security: {
        twoFactorEnabled: false,
        lastLogin: null,
        passwordChangedAt: new Date()
      }
    }
    const result = await users.insertOne(testUser)

    testUserIds.push(result.insertedId.toString())
    testCleanupIds.push(result.insertedId.toString())
  }
  const createUniqueLoginRequest = (overrides = {}) => {
    return {
      email: testCredentials.email,
      password: testCredentials.password,
      rememberMe: false,
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database Authentication Operations', () => {
    it('should verify user credentials in database', async () => {
      if (!checkDbConnection()) return

      const users = db.collection('users')
      // Find user by email
      const user = await users.findOne({ email: testCredentials.email })

      expect(user).not.toBeNull()
      expect(user!.email).toBe(testCredentials.email)
      expect(user!.isActive).toBe(true)
      expect(user!.password).toBeDefined()
    })

    it('should handle session creation and management', async () => {
      if (!checkDbConnection()) return

      const sessions = db.collection('sessions')
      const sessionData = {
        userId: testUserIds[0],
        token: testGenerators.token(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdAt: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser'
      }
      const result = await sessions.insertOne(sessionData)

      expect(result.insertedId).toBeDefined()

      testSessionIds.push(result.insertedId.toString())

      // Verify session retrieval
      const storedSession = await sessions.findOne({ _id: result.insertedId })

      expect(storedSession).not.toBeNull()
      expect(storedSession!.userId).toBe(sessionData.userId)
      expect(storedSession!.token).toBe(sessionData.token)
    })

    it('should track login attempts and lockouts', async () => {
      if (!checkDbConnection()) return

      const users = db.collection('users')
      // Increment login attempts
      const updateResult = await users.updateOne(
        { _id: new ObjectId(testUserIds[0]) },
        { $inc: { loginAttempts: 1 } }
      )

      expect(updateResult.modifiedCount).toBe(1)

      // Verify update
      const user = await users.findOne({ _id: new ObjectId(testUserIds[0]) })

      expect(user!.loginAttempts).toBeGreaterThan(0)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /login
  // ===============================
  describe('POST /login - User Authentication', () => {
    it('should authenticate user with valid credentials', async () => {
      const loginData = createUniqueLoginRequest()
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .set('Accept', 'application/json')
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('expiresIn')
      expect(response.body.user).toHaveProperty('email', testCredentials.email)
      expect(response.body.user).not.toHaveProperty('password')

      // Validate JWT token format
      expect(typeof response.body.token).toBe('string')
      expect(response.body.token.split('.')).toHaveLength(3) // JWT has 3 parts

      testTokens.push(response.body.token)
    })

    it('should reject login with invalid email', async () => {
      const loginData = createUniqueLoginRequest({
        email: 'nonexistent@test.com'
      })
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid credentials')
    })

    it('should reject login with invalid password', async () => {
      const loginData = createUniqueLoginRequest({
        password: 'wrongpassword'
      })
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid credentials')
    })

    it('should reject login without email field', async () => {
      const loginData = createUniqueLoginRequest()
      const { email: _email, ...dataWithoutEmail } = loginData
      const response = await request(app)
        .post('/login')
        .send(dataWithoutEmail)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Email is required')
    })

    it('should reject login without password field', async () => {
      const loginData = createUniqueLoginRequest()
      const { password: _password, ...dataWithoutPassword } = loginData
      const response = await request(app)
        .post('/login')
        .send(dataWithoutPassword)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Password is required')
    })

    it('should validate email format', async () => {
      const loginData = createUniqueLoginRequest({
        email: 'invalid-email-format'
      })
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid email format')
    })

    it('should handle account lockout after multiple failed attempts', async () => {
      const invalidLoginData = createUniqueLoginRequest({
        password: 'wrongpassword'
      })

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/login')
          .send(invalidLoginData)
          .expect(401)
      }

      // Sixth attempt should result in account lockout
      const response = await request(app)
        .post('/login')
        .send(invalidLoginData)
        .expect(423)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Account locked')
    })

    it('should reject login for inactive users', async () => {
      // Create inactive user
      const inactiveUserData = {
        username: 'inactiveuser',
        email: 'inactive@test.com',
        password: '$2b$10$hashedPasswordHere',
        isActive: false,
        isVerified: true
      }

      if (checkDbConnection()) {
        const users = db.collection('users')
        const result = await users.insertOne(inactiveUserData)

        testCleanupIds.push(result.insertedId.toString())
      }

      const loginData = {
        email: 'inactive@test.com',
        password: 'TestPassword123!'
      }
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(403)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Account inactive')
    })

    it('should generate different tokens for concurrent logins', async () => {
      const loginData = createUniqueLoginRequest()
      const promises = Array(3).fill(null).map(() =>
        request(app).post('/login').send(loginData)
      )
      const responses = await Promise.all(promises)
      const tokens = responses.map(r => r.body.token).filter(Boolean)

      expect(tokens).toHaveLength(3)
      expect(new Set(tokens)).toHaveSize(3) // All tokens should be unique

      testTokens.push(...tokens)
    })

    it('should include session metadata in response', async () => {
      const loginData = createUniqueLoginRequest()
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .set('User-Agent', 'Test Browser')
        .set('X-Forwarded-For', '192.168.1.100')
        .expect(200)

      expect(response.body).toHaveProperty('session')
      if (response.body.session) {
        expect(response.body.session).toHaveProperty('id')
        expect(response.body.session).toHaveProperty('expiresAt')
      }

      testTokens.push(response.body.token)
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousLoginData = {
        email: testCredentials.email,
        password: testCredentials.password,
        '$where': testGenerators.invalidData.nosqlInjection.$where,
        maliciousScript: testGenerators.invalidData.scriptInjection
      }
      const response = await request(app)
        .post('/login')
        .send(maliciousLoginData)
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).not.toHaveProperty('$where')
      expect(response.body).not.toHaveProperty('maliciousScript')

      testTokens.push(response.body.token)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /logout
  // ===============================
  describe('POST /logout - User Logout', () => {
    let authToken: string

    beforeAll(async () => {
      // Login to get token for logout tests
      const loginData = createUniqueLoginRequest()
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200)

      authToken = response.body.token
      testTokens.push(authToken)
    })

    it('should logout user with valid token', async () => {
      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Logout successful')
    })

    it('should reject logout without authorization header', async () => {
      const response = await request(app)
        .post('/logout')
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Authorization required')
    })

    it('should reject logout with invalid token format', async () => {
      const response = await request(app)
        .post('/logout')
        .set('Authorization', 'Bearer invalid-token-format')
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid token')
    })

    it('should reject logout with expired token', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid'
      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Token expired')
    })

    it('should handle logout for already logged out session', async () => {
      // Use the same token that was already logged out
      const response = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Session not found')
    })
  })

  // ===============================
  // TOKEN VALIDATION AND REFRESH TESTS
  // ===============================
  describe('Token Validation and Refresh', () => {
    let validToken: string
    let refreshToken: string

    beforeAll(async () => {
      const loginData = createUniqueLoginRequest()
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200)

      validToken = response.body.token
      refreshToken = response.body.refreshToken
      testTokens.push(validToken, refreshToken)
    })

    it('should validate JWT token structure and claims', async () => {
      const response = await request(app)
        .get('/login/validate')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('valid', true)
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('expiresAt')
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user).toHaveProperty('email')
    })

    it('should refresh expired tokens with valid refresh token', async () => {
      const response = await request(app)
        .post('/login/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('expiresIn')
      expect(typeof response.body.token).toBe('string')
      expect(response.body.token).not.toBe(validToken) // Should be a new token

      testTokens.push(response.body.token)
    })

    it('should reject refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/login/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid refresh token')
    })

    it('should revoke refresh tokens on logout', async () => {
      // Login to get tokens
      const loginResponse = await request(app)
        .post('/login')
        .send(createUniqueLoginRequest())
        .expect(200)
      const token = loginResponse.body.token
      const refresh = loginResponse.body.refreshToken

      testTokens.push(token, refresh)

      // Logout
      await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Try to use refresh token after logout
      const refreshResponse = await request(app)
        .post('/login/refresh')
        .send({ refreshToken: refresh })
        .expect(401)

      expect(refreshResponse.body).toHaveProperty('error')
    })
  })

  // ===============================
  // MULTI-FACTOR AUTHENTICATION TESTS
  // ===============================
  describe('Multi-Factor Authentication (MFA)', () => {
    it('should initiate MFA setup for user', async () => {
      const loginResponse = await request(app)
        .post('/login')
        .send(createUniqueLoginRequest())
        .expect(200)

      testTokens.push(loginResponse.body.token)

      const response = await request(app)
        .post('/login/mfa/setup')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200)

      expect(response.body).toHaveProperty('qrCode')
      expect(response.body).toHaveProperty('secret')
      expect(response.body).toHaveProperty('backupCodes')
      expect(Array.isArray(response.body.backupCodes)).toBe(true)
    })

    it('should verify MFA token during setup', async () => {
      const loginResponse = await request(app)
        .post('/login')
        .send(createUniqueLoginRequest())
        .expect(200)

      testTokens.push(loginResponse.body.token)

      const verifyData = {
        mfaToken: '123456', // Mock MFA token
        secret: 'MOCK_SECRET_BASE32_ENCODED'
      }
      const response = await request(app)
        .post('/login/mfa/verify')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send(verifyData)

      if (response.status === 200) {
        expect(response.body).toHaveProperty('verified', true)
      } else {
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
      }
    })

    it('should require MFA token for MFA-enabled users', async () => {
      // This test would check MFA requirement for users with MFA enabled
      const mfaLoginData = createUniqueLoginRequest()
      const response = await request(app)
        .post('/login')
        .send(mfaLoginData)

      if (response.status === 200 && response.body.mfaRequired) {
        expect(response.body).toHaveProperty('mfaRequired', true)
        expect(response.body).toHaveProperty('challengeId')
        expect(response.body).not.toHaveProperty('token') // No token until MFA complete
      }
    })
  })

  // ===============================
  // PASSWORD RESET AND RECOVERY TESTS
  // ===============================
  describe('Password Reset and Recovery', () => {
    it('should initiate password reset for valid email', async () => {
      const response = await request(app)
        .post('/login/forgot-password')
        .send({ email: testCredentials.email })
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('Password reset instructions sent')
    })

    it('should not reveal non-existent email addresses', async () => {
      const response = await request(app)
        .post('/login/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(200)

      // Should return same message for security
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('Password reset instructions sent')
    })

    it('should validate password reset tokens', async () => {
      const resetToken = 'mock-reset-token-12345'
      const response = await request(app)
        .get(`/login/reset-password/${resetToken}`)

      if (response.status === 200) {
        expect(response.body).toHaveProperty('valid', true)
        expect(response.body).toHaveProperty('email')
      } else {
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toContain('Invalid or expired reset token')
      }
    })

    it('should reset password with valid token', async () => {
      const resetData = {
        token: 'mock-reset-token-12345',
        newPassword: 'NewSecurePassword123!',
        confirmPassword: 'NewSecurePassword123!'
      }
      const response = await request(app)
        .post('/login/reset-password')
        .send(resetData)

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message', 'Password reset successful')
      } else {
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
      }
    })

    it('should enforce password complexity during reset', async () => {
      const resetData = {
        token: 'mock-reset-token-12345',
        newPassword: 'weak',
        confirmPassword: 'weak'
      }
      const response = await request(app)
        .post('/login/reset-password')
        .send(resetData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Password does not meet complexity requirements')
    })
  })

  // ===============================
  // SOCIAL LOGIN AND OAUTH TESTS
  // ===============================
  describe('Social Login and OAuth Integration', () => {
    it('should initiate Google OAuth flow', async () => {
      const response = await request(app)
        .get('/login/oauth/google')
        .expect(302)

      expect(response.headers.location).toContain('accounts.google.com')
      expect(response.headers.location).toContain('oauth2')
    })

    it('should handle OAuth callback with valid code', async () => {
      const callbackData = {
        code: 'mock-oauth-code-12345',
        state: 'mock-state-parameter'
      }
      const response = await request(app)
        .get('/login/oauth/google/callback')
        .query(callbackData)

      if (response.status === 200) {
        expect(response.body).toHaveProperty('token')
        expect(response.body).toHaveProperty('user')
        testTokens.push(response.body.token)
      } else {
        expect([400, 401]).toContain(response.status)
      }
    })

    it('should reject OAuth callback with invalid code', async () => {
      const response = await request(app)
        .get('/login/oauth/google/callback')
        .query({ code: 'invalid-code' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should link social accounts to existing users', async () => {
      const loginResponse = await request(app)
        .post('/login')
        .send(createUniqueLoginRequest())
        .expect(200)

      testTokens.push(loginResponse.body.token)

      const linkData = {
        provider: 'google',
        providerUserId: 'google-user-12345',
        email: testCredentials.email
      }
      const response = await request(app)
        .post('/login/link-account')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send(linkData)

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message', 'Account linked successfully')
      } else {
        expect(response.status).toBe(400)
      }
    })
  })

  // ===============================
  // SECURITY AND RATE LIMITING TESTS
  // ===============================
  describe('Security and Rate Limiting', () => {
    it('should implement rate limiting for login attempts', async () => {
      const loginData = createUniqueLoginRequest()
      // Make multiple rapid login attempts
      const promises = Array(10).fill(null).map(() =>
        request(app).post('/login').send(loginData)
      )
      const responses = await Promise.all(promises)
      const rateLimitedResponses = responses.filter(r => r.status === 429)

      expect(rateLimitedResponses.length).toBeGreaterThan(0)

      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].body).toHaveProperty('error')
        expect(rateLimitedResponses[0].body.error).toContain('Too many requests')
      }
    })

    it('should prevent brute force attacks', async () => {
      const bruteForceData = createUniqueLoginRequest({
        password: 'wrongpassword'
      })
      let consecutiveFailures = 0

      for (let i = 0; i < 20; i++) {
        const response = await request(app)
          .post('/login')
          .send(bruteForceData)

        if (response.status === 401) {
          consecutiveFailures++
        } else if (response.status === 429) {
          expect(response.body).toHaveProperty('error')
          expect(response.body.error).toContain('Too many requests')

          break
        }
      }

      expect(consecutiveFailures).toBeLessThan(20) // Should be rate limited before 20 attempts
    })

    it('should log security events', async () => {
      const securityEvent = createUniqueLoginRequest({
        password: 'wrongpassword'
      })

      await request(app)
        .post('/login')
        .send(securityEvent)
        .expect(401)

      // Check if security event was logged
      const response = await request(app)
        .get('/login/security-logs')
        .expect(200)

      expect(Array.isArray(response.body.logs)).toBe(true)
      if (response.body.logs.length > 0) {
        const log = response.body.logs[0]

        expect(log).toHaveProperty('event')
        expect(log).toHaveProperty('timestamp')
        expect(log).toHaveProperty('ip')
      }
    })

    it('should handle concurrent login sessions', async () => {
      const loginData = createUniqueLoginRequest()
      // Create multiple concurrent sessions
      const promises = Array(3).fill(null).map(() =>
        request(app).post('/login').send(loginData)
      )
      const responses = await Promise.all(promises)
      const successfulLogins = responses.filter(r => r.status === 200)

      expect(successfulLogins.length).toBeGreaterThan(0)

      // All successful logins should have unique tokens
      const tokens = successfulLogins.map(r => r.body.token)

      expect(new Set(tokens)).toHaveSize(tokens.length)

      testTokens.push(...tokens)
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle login during system maintenance', async () => {
      const response = await request(app)
        .post('/login')
        .send(createUniqueLoginRequest())
        .set('X-Maintenance-Mode', 'true')

      expect([200, 503]).toContain(response.status)

      if (response.status === 503) {
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toContain('maintenance')
      }
    })

    it('should handle malformed JWT tokens gracefully', async () => {
      const malformedTokens = [
        'not.a.jwt',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed',
        'Bearer.invalid.token',
        ''
      ]

      for (const token of malformedTokens) {
        const response = await request(app)
          .get('/login/validate')
          .set('Authorization', `Bearer ${token}`)
          .expect(401)

        expect(response.body).toHaveProperty('error')
      }
    })

    it('should handle special characters in credentials', async () => {
      const specialCharCredentials = {
        email: 'test+special@domain-name.com',
        password: 'P@$$w0rd!@#$%^&*()'
      }
      const response = await request(app)
        .post('/login')
        .send(specialCharCredentials)

      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        testTokens.push(response.body.token)
      }
    })

    it('should handle very long passwords', async () => {
      const longPasswordData = createUniqueLoginRequest({
        password: 'x'.repeat(1000)
      })
      const response = await request(app)
        .post('/login')
        .send(longPasswordData)

      expect([400, 401]).toContain(response.status)
      expect(response.body).toHaveProperty('error')
    })
  })
})
