/**
 * @file        floors.test.js
 * @description Create Floors to DB and test the Floors
 * @version 2024-10-29 C2RLO - Init
 */

import { faker } from '@faker-js/faker'
import '../utils/loadEnvironment.js'
import { MongoClient } from 'mongodb'
import { capitalizeFirstLetter } from '../utils/strings.js'

describe('create 10 floors', () => {
  let conn
  let db
  let mockFloors
  let insertedFloors

  beforeAll(async () => {
    conn = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = conn.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await conn.close()
  })

  it('should insert a 10 floors', async () => {
    const floors = db.collection('floors')
    await floors.deleteMany({})
    for (let index = 0; index < 10; index++) {
      mockFloors = {
        name:
          capitalizeFirstLetter(faker.color.human()) +
          ' ' +
          faker.commerce.product(),
        address: {
          street: faker.location.street(),
          city: faker.location.city(),
          country: faker.location.country(),
          postcode: faker.number.int({ min: 10000, max: 99999 }),
        },
        dimension: [
          {
            description: faker.commerce.productDescription(),
            x: faker.number.int({ min: 10, max: 100 }),
            y: faker.number.int({ min: 10, max: 100 }),
            h: faker.number.int({ min: 10, max: 100 }),
            xPos: faker.number.int({ min: 10, max: 100 }),
            yPos: faker.number.int({ min: 10, max: 100 }),
            hPos: faker.number.int({ min: 10, max: 100 }),
          },
        ],
      }
      await floors.insertOne(mockFloors)
      insertedFloors = await floors.findOne(mockFloors)
      expect(insertedFloors).toEqual(mockFloors)
    }
  })
})
