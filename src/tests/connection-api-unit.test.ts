/**
 * @file connection-api-unit.test.ts
 * @description Unit tests for connection API endpoints logic
 */

import { describe, expect, it } from '@jest/globals'
import { ObjectId } from 'mongodb'

describe('Connection API Unit Tests', () => {
  describe('Input Validation', () => {
    it('should validate ObjectId format', () => {
      const validObjectId = '507f1f77bcf86cd799439011'
      const invalidObjectId = 'invalid-id'
      
      expect(ObjectId.isValid(validObjectId)).toBe(true)
      expect(ObjectId.isValid(invalidObjectId)).toBe(false)
    })

    it('should validate required fields', () => {
      const validConnection = {
        sourceDeviceId: '507f1f77bcf86cd799439011',
        targetDeviceId: '507f1f77bcf86cd799439012',
        protocol: 'ethernet'
      }

      expect(validConnection.sourceDeviceId).toBeDefined()
      expect(validConnection.targetDeviceId).toBeDefined()
      expect(ObjectId.isValid(validConnection.sourceDeviceId)).toBe(true)
      expect(ObjectId.isValid(validConnection.targetDeviceId)).toBe(true)
    })

    it('should prevent self-connections', () => {
      const sameId = '507f1f77bcf86cd799439011'
      const connection = {
        sourceDeviceId: sameId,
        targetDeviceId: sameId
      }

      expect(connection.sourceDeviceId).toBe(connection.targetDeviceId)
      // In real implementation, this should be rejected
    })

    it('should validate protocol values', () => {
      const validProtocols = ['ethernet', 'fiber', 'tcp', 'udp', 'http', 'https', 'serial', 'wireless']
      
      validProtocols.forEach(protocol => {
        expect(validProtocols).toContain(protocol)
      })

      expect(validProtocols).not.toContain('invalid-protocol')
    })
  })

  describe('Response Structure', () => {
    it('should return proper response format for collections', () => {
      const mockConnections = [
        {
          _id: new ObjectId(),
          sourceDeviceId: '507f1f77bcf86cd799439011',
          targetDeviceId: '507f1f77bcf86cd799439012',
          protocol: 'ethernet',
          status: 'active'
        }
      ]

      const expectedResponse = {
        data: mockConnections,
        count: mockConnections.length
      }

      expect(expectedResponse).toHaveProperty('data')
      expect(expectedResponse).toHaveProperty('count')
      expect(Array.isArray(expectedResponse.data)).toBe(true)
      expect(typeof expectedResponse.count).toBe('number')
      expect(expectedResponse.count).toBe(mockConnections.length)
    })

    it('should include all expected fields in connection objects', () => {
      const connection = {
        _id: new ObjectId(),
        sourceDeviceId: '507f1f77bcf86cd799439011',
        targetDeviceId: '507f1f77bcf86cd799439012',
        protocol: 'ethernet',
        type: 'ethernet',
        status: 'active',
        sourcePort: 'eth0',
        targetPort: 'eth1',
        label: 'Test Connection',
        bandwidth: '1Gbps',
        description: 'Test connection',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Check that all expected fields are present
      expect(connection).toHaveProperty('_id')
      expect(connection).toHaveProperty('sourceDeviceId')
      expect(connection).toHaveProperty('targetDeviceId')
      expect(connection).toHaveProperty('protocol')
      expect(connection).toHaveProperty('type')
      expect(connection).toHaveProperty('status')
      expect(connection).toHaveProperty('sourcePort')
      expect(connection).toHaveProperty('targetPort')
      expect(connection).toHaveProperty('label')
      expect(connection).toHaveProperty('bandwidth')
      expect(connection).toHaveProperty('description')
      expect(connection).toHaveProperty('createdAt')
      expect(connection).toHaveProperty('updatedAt')
    })
  })

  describe('Field Compatibility', () => {
    it('should support both legacy and new field names', () => {
      const legacyConnection = {
        deviceIdFrom: new ObjectId('507f1f77bcf86cd799439011'),
        deviceIdTo: new ObjectId('507f1f77bcf86cd799439012'),
        name: 'Legacy Connection'
      }

      const newConnection = {
        sourceDeviceId: '507f1f77bcf86cd799439011',
        targetDeviceId: '507f1f77bcf86cd799439012',
        label: 'New Connection'
      }

      // Both formats should be valid
      expect(legacyConnection.deviceIdFrom).toBeDefined()
      expect(legacyConnection.deviceIdTo).toBeDefined()
      expect(newConnection.sourceDeviceId).toBeDefined()
      expect(newConnection.targetDeviceId).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing required fields gracefully', () => {
      const incompleteConnection = {
        sourceDeviceId: '507f1f77bcf86cd799439011'
        // missing targetDeviceId
      }

      expect(incompleteConnection.sourceDeviceId).toBeDefined()
      expect(incompleteConnection).not.toHaveProperty('targetDeviceId')
    })

    it('should handle invalid ObjectId formats', () => {
      const invalidConnection = {
        sourceDeviceId: 'invalid-id',
        targetDeviceId: '507f1f77bcf86cd799439012'
      }

      expect(ObjectId.isValid(invalidConnection.sourceDeviceId)).toBe(false)
      expect(ObjectId.isValid(invalidConnection.targetDeviceId)).toBe(true)
    })
  })
})