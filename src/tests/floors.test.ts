/**
 * Import Jest types for global functions like describe, it, expect.
 * This ensures TypeScript recognizes Jest globals.
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
      dimension: [testGenerators.floorDimension()]
    }
    const insertResult = await floors.insertOne(mockFloors)

    insertedFloors = await floors.findOne({ _id: insertResult.insertedId })
    expect(insertedFloors).toMatchObject(mockFloors)
  })
})
