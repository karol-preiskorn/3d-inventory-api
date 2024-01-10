/**
 * File:        /tests/device.test.ts
 * Description: create device in mongo DB /api/devices
 *              https://jestjs.io/docs/bypassing-module-mocks
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-26  C2RLO  Initial
 **/

import { faker } from "@faker-js/faker"
import "../loadEnvironment.mjs"
import db from "../db/conn.mjs"
import { ObjectId } from "mongodb"
import { deviceType, deviceCategory } from "./deviceType.mjs"

// Delete all devices
describe("delete all devices", () => {
  it("should delete all devices from collection devices", async () => {
    const device = db.collection("devices")
    const mock = {}
    await device.deleteMany(mock)
    const inserted = await device.findOne(mock)
    // testModelId = { _id: new ObjectId(inserted) }
    // console.log("Return testDeviceId: " + JSON.stringify(inserted))
    expect(inserted).toEqual(null)
  })
})

// Delete all models
describe("delete all models", () => {
  it("should delete all models from collection models", async () => {
    const model = db.collection("models")
    const mock = {}
    await model.deleteMany(mock)
    const inserted = await model.findOne(mock)
    // console.log("Return testModelId: " + JSON.stringify(inserted))
    expect(inserted).toEqual(null)
  })
})

// Create test models by mongo driver
describe("create model", () => {
  it("should insert a model doc into collection models", async () => {
    for (let index = 0; index < 3; index++) {
      const model = db.collection("models")
      const mockModel = {
        name: faker.commerce.product() + " " + faker.color.human() + " " + faker.animal.type(),
        dimension: {
          width: faker.number.int({ min: 1, max: 10 }),
          height: faker.number.int({ min: 1, max: 10 }),
          depth: faker.number.int({ min: 1, max: 10 }),
        },
        texture: {
          front: "/assets/r710-2.5-nobezel__29341.png",
          back: "/assets/r710-2.5-nobezel__29341.png",
          side: "/assets/r710-2.5-nobezel__29341.png",
          top: "/assets/r710-2.5-nobezel__29341.png",
          botom: "/assets/r710-2.5-nobezel__29341.png",
        },
        type: faker.helpers.arrayElement(deviceType).name,
        category: faker.helpers.arrayElement(deviceCategory).name,
      }
      await model.insertOne(mockModel)
      const insertedModel = await model.findOne(mockModel)
      // testModelId = { _id: new ObjectId(insertedModel) }
      // console.log("Return testModelId: " + JSON.stringify(insertedModel))
      // console.log("Return testModelId._id: " + JSON.stringify(insertedModel._id))
      expect(insertedModel).toEqual(mockModel)

      const device = db.collection("devices")
      for (let index = 0; index < 5; index++) {
        const mockDevice = {
          name: faker.commerce.product() + " " + faker.color.human() + "-" + faker.animal.type(),
          modelId: insertedModel._id,
          position: {
            x: faker.number.int({ min: 1, max: 100 }),
            y: faker.number.int({ min: 1, max: 100 }),
            h: faker.number.int({ min: 1, max: 10 }),
          },
        }
        await device.insertOne(mockDevice)
        const insertedDevice = await device.findOne(mockDevice)
        expect(insertedDevice).toEqual(mockDevice)
      }
    }
  })
})
