/**
 * File:        /tests/devices.mjs
 * Description: Test devices api operation
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2024-01-06  C2RLO  Add array test
 * 2024-01-03  C2RLO  Initial
 */

// import faker from "@faker-js/faker"
import request from "supertest"
import app from "../index.mjs"
import assert from "assert"

let respond

describe("GET /devices", () => {
  it("GET /devices => array of items", () => request(app)
    .get("/devices")
    .expect("Content-Type", /json/)
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
            modelId: expect.any(String),
            position: {
              x: expect.any(Number),
              y: expect.any(Number),
              h: expect.any(Number),
            },
          }),
        ])
      )
    }).then(function (_err, res) {
      if (res) respond = res
    }))

  describe("Check responses", () => {
    it("check respond variable", () => {
      expect(respond).toEqual(expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          modelId: expect.any(String),
          position: {
            x: expect.any(Number),
            y: expect.any(Number),
            h: expect.any(Number),
          },
        }),
      ]))
      // assert.isArray(respond, "[array]")
    }) // Add closing parenthesis here
  }) // Add closing parenthesis here
})
