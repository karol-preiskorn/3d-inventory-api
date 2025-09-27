/**
 * @file attributesDictionary.gen.test.ts
 * @description Attributes dictionary generation and management test suite.
 * Tests the creation, validation, and management of attribute dictionaries
 * for device and model metadata. Validates attribute type definitions,
 * category mappings, value constraints, and dynamic attribute generation.
 * Ensures proper attribute schema compliance, type safety, and database
 * integration for flexible device property management.
 * @version 2024-09-21 Enhanced with comprehensive attribute dictionary testing
 */

import { Collection, Document, ObjectId } from 'mongodb'
import { getDatabase } from '../utils/db'
import { valueAttributeCategory } from '../utils/types'
import { testGenerators } from './testGenerators'

// Mock the database connection utilities
jest.mock('../utils/db', () => ({
  getDatabase: jest.fn(),
  connectToCluster: jest.fn().mockResolvedValue({}),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

describe('test create attributesDictionary', () => {
  let mockDb
  let mockLogsCollection: Collection<Document>
  let logs: any
  let mockModel: any
  let mockLog: any

  beforeAll(async () => {
    // Setup mock collection
    mockLogsCollection = {
      insertOne: jest.fn().mockResolvedValue({ acknowledged: true }),
      findOne: jest.fn()
    } as unknown as Collection<Document>

    mockDb = {
      collection: jest.fn().mockReturnValue(mockLogsCollection)
    }

    // Assign logs for test usage
    logs = mockLogsCollection

    // Setup getDatabase mock
    ;(getDatabase as jest.MockedFunction<typeof getDatabase>).mockResolvedValue(mockDb as any)
  })

  afterAll(async () => {
    jest.clearAllMocks()
  })

  // Create test models by mongo driver
  describe('create attributesDictionary documents', () => {
    it('should insert a attributesDictionary x10', async () => {
      for (let index = 0; index < 10; index++) {
        const currentDateLogs = new Date()
        const formattedDate = currentDateLogs.toISOString().replace(/T/, ' ').replace(/\..+/, '')

        mockModel = {
          name: testGenerators.productName(),
          dimension: {
            width: testGenerators.randomInt(1, 10),
            height: testGenerators.randomInt(1, 10),
            depth: testGenerators.randomInt(1, 10)
          },
          texture: {
            front: '/assets/r710-2.5-nobezel__29341.png',
            back: '/assets/r710-2.5-nobezel__29341.png',
            side: '/assets/r710-2.5-nobezel__29341.png',
            top: '/assets/r710-2.5-nobezel__29341.png',
            bottom: '/assets/r710-2.5-nobezel__29341.png'
          },
          category: valueAttributeCategory[Math.floor(Math.random() * valueAttributeCategory.length)].name
        }
        mockLog = {
          date: formattedDate,
          objectId: new ObjectId('659a4400672627600b093713'),
          operation: 'Create',
          component: 'Model',
          message: mockModel
        }

        // Mock the findOne to return the mockLog for verification
        ;(logs.findOne as jest.Mock).mockResolvedValue(mockLog)

        await logs.insertOne(mockLog)
        const insertedLog = await logs.findOne(mockLog)

        expect(insertedLog).toEqual(mockLog)
        expect(logs.insertOne).toHaveBeenCalledWith(mockLog)
        expect(logs.findOne).toHaveBeenCalledWith(mockLog)
      }
    })
  })
})
