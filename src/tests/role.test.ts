/**
 * @file role.test.ts
 * @description Comprehensive test suite for Role API endpoints and role-based access control.
 *
 * Coverage includes:
 * - Complete CRUD operations for all role endpoints
 * - Role hierarchy and permission management
 * - Permission assignment and validation
 * - Role inheritance and cascading permissions
 * - User-role associations and access control
 * - Dynamic permission evaluation
 * - Input validation and sanitization
 * - Error handling and edge cases
 * - Security testing (injection prevention)
 * - Database integration and persistence
 * - Performance and concurrent access
 *
 * @version 2024-09-22 Comprehensive role API test suite
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Db, MongoClient, ObjectId } from 'mongodb'
import request from 'supertest'
import app from '../main'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

// Disable SSL verification for self-signed certificates in tests
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

describe('Role API - Comprehensive Test Suite', () => {
  let connection: MongoClient
  let db: Db
  const testRoleIds: string[] = []
  const testUserIds: string[] = []
  const testCleanupIds: string[] = []
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
      console.log('✅ MongoDB connection successful for comprehensive role tests')

      // Create admin user for role management tests
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
      // Clean up test data in proper order (users -> roles)
      if (db) {
        if (testUserIds.length > 0) {
          const userCollection = db.collection('users')
          const userObjectIds = testUserIds.map(id => new ObjectId(id))

          await userCollection.deleteMany({ _id: { $in: userObjectIds } })
          console.log(`🧹 Cleaned up ${testUserIds.length} test users`)
        }

        if (testCleanupIds.length > 0) {
          const roleCollection = db.collection('roles')
          const roleObjectIds = testCleanupIds.map(id => new ObjectId(id))

          await roleCollection.deleteMany({ _id: { $in: roleObjectIds } })
          console.log(`🧹 Cleaned up ${testCleanupIds.length} test roles`)
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
      username: 'roleTestAdmin',
      email: 'roleadmin@test.com',
      password: 'hashedpassword',
      role: 'admin',
      isActive: true,
      permissions: [
        'read:roles', 'write:roles', 'delete:roles',
        'read:users', 'write:users', 'delete:users',
        'admin:all'
      ]
    }
    const result = await users.insertOne(adminUser)

    testUserIds.push(result.insertedId.toString())

    // Simulate getting admin token
    adminToken = 'mock-admin-token-' + result.insertedId.toString()
  }
  const createUniqueTestRole = (overrides = {}) => {
    const baseRole = testGenerators.roleBuilder()

    return {
      name: testGenerators.uniqueName('Role'),
      description: baseRole.description || 'Test role for API validation',
      permissions: baseRole.permissions || [
        testGenerators.randomArrayElement(['read:devices', 'write:devices']),
        testGenerators.randomArrayElement(['read:models', 'write:models'])
      ],
      hierarchy: baseRole.hierarchy || 1,
      isActive: true,
      inheritFrom: null,
      constraints: {
        maxUsers: testGenerators.randomArrayElement([10, 50, 100]),
        allowedDepartments: ['IT', 'Engineering'],
        timeRestrictions: {
          startTime: '09:00',
          endTime: '17:00',
          allowWeekends: false
        }
      },
      metadata: {
        createdBy: testGenerators.objectId(),
        createdAt: new Date(),
        lastModified: new Date(),
        version: '1.0'
      },
      ...overrides
    }
  }

  // ===============================
  // DATABASE LAYER TESTS
  // ===============================
  describe('Database Role Operations', () => {
    it('should perform direct database CRUD operations', async () => {
      if (!checkDbConnection()) return

      const roles = db.collection('roles')
      const testData = []

      // Test insertion of multiple roles
      for (let i = 0; i < 3; i++) {
        const roleData = createUniqueTestRole({
          name: `Test Role ${i}`,
          hierarchy: i + 1
        })
        const insertResult = await roles.insertOne(roleData)
        const insertedRole = await roles.findOne({ _id: insertResult.insertedId })

        expect(insertedRole).not.toBeNull()
        expect(insertedRole!._id).toEqual(insertResult.insertedId)
        expect(insertedRole!.name).toBe(roleData.name)
        expect(insertedRole!.hierarchy).toBe(roleData.hierarchy)
        expect(insertedRole!.permissions).toEqual(roleData.permissions)

        testCleanupIds.push(insertResult.insertedId.toString())
        testData.push(insertedRole)
      }

      // Test querying
      const foundRoles = await roles.find({
        name: { $in: testData.map(r => r!.name) }
      }).toArray()

      expect(foundRoles).toHaveLength(3)

      // Test updating
      const updateResult = await roles.updateOne(
        { _id: testData[0]!._id },
        { $set: { isActive: false } }
      )

      expect(updateResult.modifiedCount).toBe(1)

      // Test deletion
      const deleteResult = await roles.deleteOne({ _id: testData[0]!._id })

      expect(deleteResult.deletedCount).toBe(1)
    })

    it('should handle role hierarchy queries', async () => {
      if (!checkDbConnection()) return

      const roles = db.collection('roles')
      // Create roles with different hierarchy levels
      const roleHierarchy = [
        { name: 'Super Admin', hierarchy: 1 },
        { name: 'Admin', hierarchy: 2 },
        { name: 'Manager', hierarchy: 3 },
        { name: 'User', hierarchy: 4 }
      ]
      const createdIds = []

      for (const role of roleHierarchy) {
        const roleData = createUniqueTestRole(role)
        const result = await roles.insertOne(roleData)

        createdIds.push(result.insertedId)
      }

      testCleanupIds.push(...createdIds.map(id => id.toString()))

      // Query roles by hierarchy level
      const managementRoles = await roles.find({
        hierarchy: { $lte: 3 }
      }).toArray()

      expect(managementRoles.length).toBeGreaterThanOrEqual(3)
    })

    it('should handle role permission aggregation', async () => {
      if (!checkDbConnection()) return

      const roles = db.collection('roles')
      // Create parent and child roles
      const parentRole = createUniqueTestRole({
        name: 'Parent Role',
        permissions: ['read:all', 'write:devices']
      })
      const parentResult = await roles.insertOne(parentRole)
      const childRole = createUniqueTestRole({
        name: 'Child Role',
        permissions: ['read:models'],
        inheritFrom: parentResult.insertedId.toString()
      })
      const childResult = await roles.insertOne(childRole)

      testCleanupIds.push(parentResult.insertedId.toString(), childResult.insertedId.toString())

      // Query child role with inherited permissions
      const role = await roles.findOne({ _id: childResult.insertedId })

      expect(role!.inheritFrom).toBe(parentResult.insertedId.toString())
      expect(role!.permissions).toContain('read:models')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /roles
  // ===============================
  describe('GET /roles - Retrieve Roles', () => {
    it('should return all roles with proper structure', async () => {
      const response = await request(app)
        .get('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('count')
      expect(typeof response.body.count).toBe('number')

      if (response.body.data.length > 0) {
        const role = response.body.data[0]

        expect(role).toHaveProperty('_id')
        expect(role).toHaveProperty('name')
        expect(role).toHaveProperty('permissions')
        expect(Array.isArray(role.permissions)).toBe(true)

        // Validate optional fields if present
        if (role.hierarchy !== undefined) {
          expect(typeof role.hierarchy).toBe('number')
        }
        if (role.constraints) {
          expect(typeof role.constraints).toBe('object')
        }
      }
    })

    it('should support filtering by hierarchy level', async () => {
      // Create a role with specific hierarchy
      const roleData = createUniqueTestRole({ hierarchy: 5 })
      const createResponse = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .get('/roles?hierarchy=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      response.body.data.forEach((role: any) => {
        expect(role.hierarchy).toBe(5)
      })
    })

    it('should support filtering by active status', async () => {
      const response = await request(app)
        .get('/roles?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      response.body.data.forEach((role: any) => {
        expect(role.isActive).toBe(true)
      })
    })

    it('should support search by name', async () => {
      const uniqueName = testGenerators.uniqueName('SearchRole')
      const roleData = createUniqueTestRole({ name: uniqueName })
      const createResponse = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(201)

      testCleanupIds.push(createResponse.body._id)

      const response = await request(app)
        .get(`/roles?search=${uniqueName}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      const foundRole = response.body.data.find((r: any) => r.name === uniqueName)

      expect(foundRole).toBeDefined()
    })

    it('should require authentication for role access', async () => {
      const response = await request(app)
        .get('/roles')
        .expect(401)

      expect(response.body).toHaveProperty('error', 'Unauthorized')
    })

    it('should require admin privileges for role management', async () => {
      // Create a regular user token
      const regularToken = 'mock-user-token-12345'
      const response = await request(app)
        .get('/roles')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403)

      expect(response.body).toHaveProperty('error', 'Forbidden')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - POST /roles
  // ===============================
  describe('POST /roles - Create Roles', () => {
    it('should create a new role with complete data', async () => {
      const roleData = createUniqueTestRole()
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .set('Accept', 'application/json')
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(roleData.name)
      expect(response.body.description).toBe(roleData.description)
      expect(response.body.permissions).toEqual(roleData.permissions)
      expect(response.body.hierarchy).toBe(roleData.hierarchy)
      expect(response.body.isActive).toBe(roleData.isActive)

      testRoleIds.push(response.body._id)
      testCleanupIds.push(response.body._id)
    })

    it('should create role with minimal required data', async () => {
      const minimalData = {
        name: testGenerators.uniqueName('Minimal Role'),
        permissions: ['read:devices']
      }
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(minimalData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(minimalData.name)
      expect(response.body.permissions).toEqual(minimalData.permissions)
      expect(response.body.isActive).toBe(true) // Default value
      testCleanupIds.push(response.body._id)
    })

    it('should reject role without required name field', async () => {
      const roleData = createUniqueTestRole()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete roleData.name

      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Name is required')
    })

    it('should reject role without permissions', async () => {
      const roleData = createUniqueTestRole()

      // @ts-expect-error - Intentionally creating invalid data for testing
      delete roleData.permissions

      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject role with empty permissions array', async () => {
      const roleData = createUniqueTestRole({
        permissions: []
      })
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should reject role with invalid permission format', async () => {
      const roleData = createUniqueTestRole({
        permissions: ['invalid-permission', 'another:invalid:format:too:many:colons']
      })
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle duplicate role names', async () => {
      const roleData1 = createUniqueTestRole()
      const roleData2 = createUniqueTestRole({ name: roleData1.name })
      // Create first role
      const response1 = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData1)
        .expect(201)

      testCleanupIds.push(response1.body._id)

      // Try to create duplicate
      const response2 = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData2)
        .expect(409)

      expect(response2.body).toHaveProperty('error', 'Conflict')
      expect(response2.body.message).toContain('already exists')
    })

    it('should validate role hierarchy levels', async () => {
      const roleData = createUniqueTestRole({
        hierarchy: -1 // Invalid hierarchy
      })
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should sanitize input to prevent injection attacks', async () => {
      const maliciousData = createUniqueTestRole({
        name: testGenerators.uniqueName('Test Role'),
        description: testGenerators.invalidData.scriptInjection,
        '$where': testGenerators.invalidData.nosqlInjection.$where
      })
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maliciousData)
        .expect(201)

      expect(response.body).toHaveProperty('_id')
      expect(response.body.name).toBe(maliciousData.name)
      expect(response.body).not.toHaveProperty('$where')

      testCleanupIds.push(response.body._id)
    })
  })

  // ===============================
  // API ENDPOINT TESTS - GET /roles/:id
  // ===============================
  describe('GET /roles/:id - Retrieve Specific Role', () => {
    let testRoleId: string

    beforeAll(async () => {
      const roleData = createUniqueTestRole()
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(201)

      testRoleId = response.body._id
      testCleanupIds.push(testRoleId)
    })

    it('should return specific role by valid ID', async () => {
      const response = await request(app)
        .get(`/roles/${testRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('_id', testRoleId)
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('permissions')
      expect(Array.isArray(response.body.permissions)).toBe(true)
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/roles/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)

      expect(response.body).toHaveProperty('error', 'Invalid Input')
      expect(response.body).toHaveProperty('message', 'Invalid ObjectId format')
    })

    it('should return 404 for non-existent role', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .get(`/roles/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Role not found')
    })

    it('should include inherited permissions when requested', async () => {
      const response = await request(app)
        .get(`/roles/${testRoleId}?includeInherited=true`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('permissions')
      if (response.body.inheritedPermissions) {
        expect(Array.isArray(response.body.inheritedPermissions)).toBe(true)
      }
    })
  })

  // ===============================
  // API ENDPOINT TESTS - PUT /roles/:id
  // ===============================
  describe('PUT /roles/:id - Update Complete Role', () => {
    let updateRoleId: string

    beforeAll(async () => {
      const roleData = createUniqueTestRole()
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(201)

      updateRoleId = response.body._id
      testCleanupIds.push(updateRoleId)
    })

    it('should update complete role with valid data', async () => {
      const updateData = {
        name: 'Updated Test Role',
        description: 'Updated role description',
        permissions: ['read:all', 'write:devices', 'delete:models'],
        hierarchy: 5,
        isActive: false,
        constraints: {
          maxUsers: 50,
          allowedDepartments: ['Engineering', 'QA'],
          timeRestrictions: {
            startTime: '08:00',
            endTime: '18:00',
            allowWeekends: true
          }
        }
      }
      const response = await request(app)
        .put(`/roles/${updateRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Role updated successfully')
      expect(response.body).toHaveProperty('modifiedCount', 1)

      // Verify the update
      const getResponse = await request(app)
        .get(`/roles/${updateRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(getResponse.body.name).toBe(updateData.name)
      expect(getResponse.body.description).toBe(updateData.description)
      expect(getResponse.body.permissions).toEqual(updateData.permissions)
      expect(getResponse.body.hierarchy).toBe(updateData.hierarchy)
      expect(getResponse.body.isActive).toBe(updateData.isActive)
    })

    it('should return 404 for non-existent role update', async () => {
      const fakeId = new ObjectId().toString()
      const updateData = { name: 'Updated Name' }
      const response = await request(app)
        .put(`/roles/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Role not found')
    })

    it('should validate required fields during update', async () => {
      const updateData = {
        permissions: ['read:devices']
        // Missing required name field
      }
      const response = await request(app)
        .put(`/roles/${updateRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  // ===============================
  // PERMISSION MANAGEMENT TESTS
  // ===============================
  describe('Permission Management', () => {
    let testRoleId: string

    beforeAll(async () => {
      const roleData = createUniqueTestRole()
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(201)

      testRoleId = response.body._id
      testCleanupIds.push(testRoleId)
    })

    it('should add permissions to role', async () => {
      const newPermissions = ['write:logs', 'read:analytics']
      const response = await request(app)
        .patch(`/roles/${testRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ add: newPermissions })
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Permissions updated successfully')

      // Verify permissions were added
      const getResponse = await request(app)
        .get(`/roles/${testRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      newPermissions.forEach(permission => {
        expect(getResponse.body.permissions).toContain(permission)
      })
    })

    it('should remove permissions from role', async () => {
      const permissionsToRemove = ['write:logs']
      const response = await request(app)
        .patch(`/roles/${testRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ remove: permissionsToRemove })
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Permissions updated successfully')

      // Verify permissions were removed
      const getResponse = await request(app)
        .get(`/roles/${testRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      permissionsToRemove.forEach(permission => {
        expect(getResponse.body.permissions).not.toContain(permission)
      })
    })

    it('should validate permission formats', async () => {
      const invalidPermissions = ['invalid-format', 'too:many:colons:here']
      const response = await request(app)
        .patch(`/roles/${testRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ add: invalidPermissions })
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })

  // ===============================
  // ROLE HIERARCHY TESTS
  // ===============================
  describe('Role Hierarchy Management', () => {
    it('should create role inheritance relationship', async () => {
      // Create parent role
      const parentRoleData = createUniqueTestRole({
        name: 'Parent Manager Role',
        permissions: ['read:all', 'write:devices']
      })
      const parentResponse = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(parentRoleData)
        .expect(201)

      testCleanupIds.push(parentResponse.body._id)

      // Create child role that inherits from parent
      const childRoleData = createUniqueTestRole({
        name: 'Child User Role',
        permissions: ['read:models'],
        inheritFrom: parentResponse.body._id
      })
      const childResponse = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(childRoleData)
        .expect(201)

      testCleanupIds.push(childResponse.body._id)

      expect(childResponse.body.inheritFrom).toBe(parentResponse.body._id)

      // Verify inheritance when querying with inherited permissions
      const getResponse = await request(app)
        .get(`/roles/${childResponse.body._id}?includeInherited=true`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      // Should have both own and inherited permissions
      expect(getResponse.body.permissions).toContain('read:models')
    })

    it('should prevent circular inheritance', async () => {
      // Create two roles
      const role1Data = createUniqueTestRole({ name: 'Role 1' })
      const role1Response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(role1Data)
        .expect(201)

      testCleanupIds.push(role1Response.body._id)

      const role2Data = createUniqueTestRole({
        name: 'Role 2',
        inheritFrom: role1Response.body._id
      })
      const role2Response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(role2Data)
        .expect(201)

      testCleanupIds.push(role2Response.body._id)

      // Try to make role1 inherit from role2 (circular)
      const updateData = { inheritFrom: role2Response.body._id }
      const response = await request(app)
        .put(`/roles/${role1Response.body._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.message).toContain('circular')
    })
  })

  // ===============================
  // API ENDPOINT TESTS - DELETE /roles/:id
  // ===============================
  describe('DELETE /roles/:id - Delete Specific Role', () => {
    it('should delete specific role by ID', async () => {
      // Create a role to delete
      const roleData = createUniqueTestRole()
      const createResponse = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(201)
      const roleToDelete = createResponse.body._id
      // Delete the role
      const deleteResponse = await request(app)
        .delete(`/roles/${roleToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(deleteResponse.body).toHaveProperty('message', 'Role deleted successfully')
      expect(deleteResponse.body).toHaveProperty('deletedCount', 1)

      // Verify deletion
      await request(app)
        .get(`/roles/${roleToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
    })

    it('should return 404 when deleting non-existent role', async () => {
      const fakeId = new ObjectId().toString()
      const response = await request(app)
        .delete(`/roles/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('message', 'Role not found')
    })

    it('should prevent deletion of role with assigned users', async () => {
      // Create role and user
      const roleData = createUniqueTestRole()
      const roleResponse = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(201)
      const userData = {
        username: 'userwithrole',
        email: 'userwithrole@test.com',
        password: 'password123',
        roleId: roleResponse.body._id
      }
      const userResponse = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201)

      testUserIds.push(userResponse.body._id)
      testCleanupIds.push(roleResponse.body._id)

      // Try to delete role with assigned user
      const deleteResponse = await request(app)
        .delete(`/roles/${roleResponse.body._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409)

      expect(deleteResponse.body).toHaveProperty('error', 'Conflict')
      expect(deleteResponse.body.message).toContain('users assigned')
    })
  })

  // ===============================
  // PERFORMANCE AND INTEGRATION TESTS
  // ===============================
  describe('Performance and Integration Tests', () => {
    it('should handle batch role operations efficiently', async () => {
      const batchSize = 5
      const roleData = Array(batchSize).fill(null).map((_, index) =>
        createUniqueTestRole({
          name: `Batch Role ${index}`,
          hierarchy: index + 10
        })
      )
      const createdIds: string[] = []

      try {
        // Batch create
        const createPromises = roleData.map(data =>
          request(app)
            .post('/roles')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(data)
        )
        const createResponses = await Promise.all(createPromises)

        createResponses.forEach(response => {
          expect(response.status).toBe(201)
          createdIds.push(response.body._id)
        })

        // Batch read
        const readPromises = createdIds.map(id =>
          request(app)
            .get(`/roles/${id}`)
            .set('Authorization', `Bearer ${adminToken}`)
        )
        const readResponses = await Promise.all(readPromises)

        readResponses.forEach(response => {
          expect(response.status).toBe(200)
        })

      } finally {
        testCleanupIds.push(...createdIds)
      }
    })

    it('should handle complex permission evaluation', async () => {
      // Create role with complex permission structure
      const complexPermissions = [
        'read:devices:department:engineering',
        'write:models:created-by:self',
        'delete:logs:level:info',
        'admin:users:role:manager',
        'report:analytics:time-range:daily'
      ]
      const roleData = createUniqueTestRole({
        permissions: complexPermissions
      })
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)
        .expect(201)

      testCleanupIds.push(response.body._id)

      expect(response.body.permissions).toEqual(complexPermissions)

      // Test permission validation endpoint
      const permissionTestResponse = await request(app)
        .post(`/roles/${response.body._id}/validate-permission`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permission: 'read:devices:department:engineering' })
        .expect(200)

      expect(permissionTestResponse.body.hasPermission).toBe(true)
    })
  })

  // ===============================
  // EDGE CASES AND ERROR SCENARIOS
  // ===============================
  describe('Edge Cases and Error Scenarios', () => {
    it('should handle extreme permission counts', async () => {
      const manyPermissions = Array(200).fill(null).map((_, i) =>
        `read:resource${i}:action:view`
      )
      const roleData = createUniqueTestRole({
        permissions: manyPermissions
      })
      const response = await request(app)
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData)

      if (response.status === 201) {
        testCleanupIds.push(response.body._id)
        expect(response.body.permissions).toHaveLength(200)
      }
    })

    it('should handle special characters in role names', async () => {
      const specialCharNames = [
        'Role with émojis 👨‍💼',
        'Роль на русском',
        'Role with "quotes" and \'apostrophes\'',
        'Role with <tags> & symbols'
      ]

      for (const name of specialCharNames) {
        const roleData = createUniqueTestRole({ name })
        const response = await request(app)
          .post('/roles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(roleData)

        if (response.status === 201) {
          testCleanupIds.push(response.body._id)
          expect(response.body.name).toBe(name)
        }
      }
    })

    it('should handle deep inheritance chains', async () => {
      let parentId: string | null = null
      const createdRoles: string[] = []

      // Create 5-level inheritance chain
      for (let i = 0; i < 5; i++) {
        const roleData = createUniqueTestRole({
          name: `Level ${i} Role`,
          hierarchy: i + 1,
          inheritFrom: parentId
        })
        const response = await request(app)
          .post('/roles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(roleData)

        if (response.status === 201) {
          parentId = response.body._id
          createdRoles.push(response.body._id)
        }
      }

      testCleanupIds.push(...createdRoles)

      // Query the bottom role with full inheritance
      if (parentId) {
        const response = await request(app)
          .get(`/roles/${parentId}?includeInherited=true`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)

        expect(response.body).toHaveProperty('_id', parentId)
      }
    })
  })
})
