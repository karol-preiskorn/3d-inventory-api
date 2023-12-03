/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "request.**.expect"] }] */

import request from "supertest"
import app from "../src/app"
import { expect } from "chai"

describe("POST /login", () => {

  test("should return some defined error message with valid parameters", () => {
    return new Promise(resolve => {
      try {
        request(app).post("/login")
          .field("email", "john@me.com")
          .field("password", "Hunter2")
          .end(function (resolve) {
            expect(200, resolve)
          })
          .expect(302)
      } catch (error) {
        resolve(error)
      }
    })
  })
})
