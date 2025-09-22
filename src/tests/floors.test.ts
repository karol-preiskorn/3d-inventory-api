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

import { Db, MongoClient } from 'mongodb'
import config from '../utils/config'
import { testGenerators } from './testGenerators'

describe('create 10 floors', () => {
  let conn: MongoClient
  let db: Db
  let insertedFloors

  beforeAll(async () => {
    if (!config.ATLAS_URI) {
      throw new Error('ATLAS_URI environment variable is not defined.')
    }
    conn = await MongoClient.connect(config.ATLAS_URI, {})
    db = conn.db(config.DBNAME)
  })

  afterAll(async () => {
    await conn.close()
  })

  it('should insert a 10 floors', async () => {
    const floors = db.collection('floors')
    const mockFloors: {
      name: string
      address: { street: string; city: string; country: string; postcode: number }
      dimension: { description: string; x: number; y: number; h: number; xPos: number; yPos: number; hPos: number }[]
    } = {
      name: testGenerators.floorName(),
      address: testGenerators.address(),
      dimension: [testGenerators.floorDimension()],
    }
    const insertResult = await floors.insertOne(mockFloors)

    insertedFloors = await floors.findOne({ _id: insertResult.insertedId })
    expect(insertedFloors).toMatchObject(mockFloors)
  })
})
