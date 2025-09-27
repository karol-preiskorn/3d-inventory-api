/**
 * Security validation test suite
 * Tests to ensure security vulnerabilities are properly addressed
 */

import { describe, expect, it, jest } from '@jest/globals'
import { Request, Response } from 'express'
import { mongoSanitize, sanitizeInput } from '../middlewares/security'
import { testGenerators } from './testGenerators'

describe('Security Middleware Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: jest.Mock

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any,
      setHeader: jest.fn() as any
    }
    nextFunction = jest.fn()
  })

  describe('Input Sanitization', () => {
    it('should sanitize dangerous HTML/JS characters', () => {
      mockRequest = {
        query: {
          search: '<script>alert("xss")</script>',
          filter: 'value"<>'
        },
        body: {
          name: '<img src=x onerror=alert(1)>',
          description: 'javascript:alert("xss")'
        }
      }

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.query?.search).not.toContain('<script>')
      expect(mockRequest.query?.search).not.toContain('>')
      expect(mockRequest.body?.name).not.toContain('<img')
      expect(mockRequest.body?.description).not.toContain('javascript:')
      expect(nextFunction).toHaveBeenCalled()
    })

    it('should sanitize SQL injection attempts', () => {
      mockRequest = {
        query: {
          id: '1\' OR \'1\'=\'1\'',
          name: 'test; DROP TABLE users;'
        },
        body: {
          username: 'admin\'; DELETE FROM users; --',
          query: 'SELECT * FROM users WHERE id = 1'
        }
      }

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.query?.id).not.toContain('OR')
      expect(mockRequest.query?.name).not.toContain('DROP')
      expect(mockRequest.body?.username).not.toContain('DELETE')
      expect(mockRequest.body?.query).not.toContain('SELECT')
      expect(nextFunction).toHaveBeenCalled()
    })

    it('should handle deeply nested objects safely', () => {
      mockRequest = {
        body: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: {
                    dangerous: '<script>alert("deep")</script>'
                  }
                }
              }
            }
          }
        }
      }

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.body?.level1?.level2?.level3?.level4?.level5?.dangerous).not.toContain('<script>')
      expect(nextFunction).toHaveBeenCalled()
    })
  })

  describe('MongoDB Injection Protection', () => {
    it('should remove MongoDB operators from queries', () => {
      mockRequest = {
        query: {
          $where: 'this.password == "admin"',
          $ne: 'value',
          'user.name': 'test'
        },
        body: {
          $or: [{ admin: true }, { role: 'admin' }],
          $regex: '.*',
          normal_field: 'safe_value'
        }
      }

      mongoSanitize(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.query).not.toHaveProperty('$where')
      expect(mockRequest.query).not.toHaveProperty('$ne')
      expect(mockRequest.query).not.toHaveProperty('user.name')
      expect(mockRequest.body).not.toHaveProperty('$or')
      expect(mockRequest.body).not.toHaveProperty('$regex')
      expect(mockRequest.body).toHaveProperty('normal_field')
      expect(nextFunction).toHaveBeenCalled()
    })

    it('should handle MongoDB injection in nested objects', () => {
      mockRequest = {
        body: {
          user: {
            $where: 'malicious code',
            profile: {
              $ne: 'test'
            }
          },
          settings: {
            $in: ['admin', 'user']
          }
        }
      }

      mongoSanitize(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.body?.user).not.toHaveProperty('$where')
      expect(mockRequest.body?.user?.profile).not.toHaveProperty('$ne')
      expect(mockRequest.body?.settings).not.toHaveProperty('$in')
      expect(nextFunction).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle circular references without crashing', () => {
      // Create a circular reference
      const circularObj: any = { data: 'test' }

      circularObj.self = circularObj

      mockRequest = {
        body: circularObj
      }

      // This should now handle circular references gracefully
      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
      expect(mockRequest.body.data).toBe('test') // Normal data should still be there
    })

    it('should handle deeply nested circular references', () => {
      const obj: any = {
        level1: {
          level2: {
            data: 'nested test'
          }
        }
      }

      obj.level1.level2.circular = obj

      mockRequest = {
        body: obj
      }

      sanitizeInput(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
      expect(mockRequest.body.level1.level2.data).toBe('nested test')
    })
  })
})

describe('Secure Test Data Generation', () => {
  it('should not contain hardcoded passwords', () => {
    // Generate multiple users to test randomness
    const users = Array.from({ length: 10 }, () => testGenerators.userSimple())

    users.forEach((user) => {
      expect(user.password).not.toBe('password123')
      expect(user.password).not.toBe('admin')
      expect(user.password).not.toBe('123456')
      expect(user.password).toMatch(/^Test_[a-f0-9]+_\d+$/) // Should match our secure pattern
      expect(user.token).toMatch(/^test_token_[a-f0-9-]{36}$/) // Should be UUID format
    })
  })

  it('should generate unique passwords for each test', () => {
    const passwords = Array.from({ length: 5 }, () => testGenerators.userSimple().password)
    const uniquePasswords = new Set(passwords)

    expect(uniquePasswords.size).toBe(passwords.length) // All passwords should be unique
  })
})
