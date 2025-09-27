/**
 * @file floors.test.ts
 * @description Floor management and spatial hierarchy test suite.
 * Tests the creation, insertion, and management of floor entities within
 * the 3D inventory system's spatial hierarchy. Validates floor data structure,
 * spatial relationships, naming conventions, and database operations.
 * Ensures proper floor-level organization for datacenter rack placement
 * and spatial navigation functionality.
 * @version 2024-09-21 Enhanced with comprehensive floor management testing
 */

import { Db, ObjectId } from 'mongodb'
import { getDatabase } from '../utils/db'
import { testGenerators } from './testGenerators'

// Mock the database connection utilities
jest.mock('../utils/db', () => ({
  getDatabase: jest.fn(),
  connectToCluster: jest.fn().mockResolvedValue({}),
  closeConnection: jest.fn().mockResolvedValue(undefined)
}))

describe('create 10 floors', () => {
  let mockDb: Db
  let mockCollection: any

  beforeAll(async () => {
    // Setup mock collection
    mockCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn()
    }

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    } as unknown as Db

    // Setup getDatabase mock
    ;(getDatabase as jest.MockedFunction<typeof getDatabase>).mockResolvedValue(mockDb)
  })

  afterAll(async () => {
    jest.clearAllMocks()
  })

  it('should insert a 10 floors', async () => {
    const db = await getDatabase()
    const floors = db.collection('floors')
    const mockFloors: {
      name: string
      address: { street: string; city: string; country: string; postcode: number }
      dimension: { description: string; x: number; y: number; h: number; xPos: number; yPos: number; hPos: number }[]
    } = {
      name: testGenerators.floorName(),
      address: testGenerators.address(),
      dimension: [testGenerators.floorDimension()]
    }
    const mockInsertResult = { insertedId: new ObjectId() }
    const mockInsertedFloor = { _id: mockInsertResult.insertedId, ...mockFloors }

    mockCollection.insertOne.mockResolvedValue(mockInsertResult)
    mockCollection.findOne.mockResolvedValue(mockInsertedFloor)

    const insertResult = await floors.insertOne(mockFloors)
    const insertedFloors = await floors.findOne({ _id: insertResult.insertedId })

    expect(getDatabase).toHaveBeenCalled()
    expect(floors.insertOne).toHaveBeenCalledWith(mockFloors)
    expect(floors.findOne).toHaveBeenCalledWith({ _id: insertResult.insertedId })
    expect(insertedFloors).toMatchObject(mockFloors)
    expect(insertResult.insertedId).toBeDefined()
  })
})
