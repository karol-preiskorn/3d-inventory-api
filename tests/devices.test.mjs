/**
 * File:        /tests/device.test.ts
 * Description: create device in mongo DB
 *              /api/devices
 *              https://jestjs.io/docs/bypassing-module-mocks
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-26  C2RLO  Initial
 **/

import express from "express"
import request from "supertest"
import assert from "assert"
import { faker } from "@faker-js/faker"
import "../loadEnvironment.mjs"
import db from "../db/conn.mjs"

const app = express()

describe("GET /devices", () => {
  it("Should create Device by API", async () => {
    return new Promise((resolve, reject) => {
      try {
        request(app)
          .get("/devices")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(resolve.statusCode)
          .toBe(200)
          .expect(resolve.body.length)
          .toBeGreaterThan(0)

        expect.assertions(1)
      } catch (error) {
        resolve(error).expect(error.statusCode).not.toBe(200)
      }
    })
  }, 10000)
})

describe("Create Device", () => {
  it("should insert a Device doc into collection devices", async () => {
    const device = db.collection("devices")
    const mockDevice = {
      "name": faker.commerce.product() + " " + faker.color.human() + "-" + faker.animal.type(),
      "modelId": faker.string.uuid(),
      "position": {
        x: faker.number.int(100),
        y: faker.number.int(100),
        h: faker.number.int(100),
      },
    }

    await device.insertOne(mockDevice)
    const insertedDevice = await device.findOne(mockDevice)
    expect(insertedDevice).toEqual(mockDevice)
  })
})
