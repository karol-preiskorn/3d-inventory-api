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

const express = require("express")
const request = require("supertest")
const assert = require("assert")
const logger = require("../utils/logger.js")

const app = express()

logger.info("1")
describe("GET /devices", () => {
  logger.info("2")
  it("Should create Device by API", async () => {
    logger.info("3")
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
        logger.info(JSON.stringify(resolve.body))
          .end(function (resolve) {
            assert(resolve.body.email).toBeGreaterThan(0)
            logger.info(JSON.stringify(resolve.body))
          })
      } catch (error) {
        logger.error(JSON.stringify(error))
        logger.error(JSON.stringify(resolve.body))
        resolve(error).expect(error.statusCode).not.toBe(200)
      }
    })
  }, 10000)
})
