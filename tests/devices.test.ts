/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "request.**.expect"] }] */

import request from "supertest"
import { expect, jest, test } from '@jest/globals'
import app from "../src/app"

describe("GET /api/device", () => {
  it("should return 200 OK", () => {
    return new Promise(resolve => {
      request(app).get("/api/devices").expect("Content-Type", /json/).expect(200, resolve)
    })
  })
})
