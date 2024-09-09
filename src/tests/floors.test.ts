/**
 * @file        floors.test.js
 * @description Create Floors to DB and test the Floors
 * @version 2024-04-12 C2RLO - convert to typescript
 * @version 2023-10-29 C2RLO - Init
 */

import '../utils/loadEnvironment';

import { Db, MongoClient } from 'mongodb';

import { faker } from '@faker-js/faker';

import { capitalizeFirstLetter } from '../utils/strings';

describe('create 10 floors', () => {
  let conn: MongoClient
  let db: Db
  let insertedFloors

  beforeAll(async () => {
    if (!process.env.ATLAS_URI) {
      throw new Error('ATLAS_URI environment variable is not defined.')
    }
    conn = await MongoClient.connect(process.env.ATLAS_URI, {})
    db = conn.db(process.env.DBNAME)
  })

  afterAll(async () => {
    await conn.close()
  })

  it('should insert a 10 floors', async () => {
    const floors = db.collection('floors')
    let mockFloors: {
      name: string
      address: { street: string; city: string; country: string; postcode: number }
      dimension: { description: string; x: number; y: number; h: number; xPos: number; yPos: number; hPos: number }[]
    } = {
      name: capitalizeFirstLetter(faker.color.human()) + ' ' + faker.commerce.product(),
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
    for (let index = 0; index < 10; index++) {
      mockFloors = {
        name: capitalizeFirstLetter(faker.color.human()[0]) + ' ' + faker.commerce.product(),
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
