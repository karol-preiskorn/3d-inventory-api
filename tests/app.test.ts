import request from "supertest"
import app from "../src/server"

describe("GET /random-url", () => {
  it("should return 403", () => {return new Promise((resolve) => {
    request(app).get("/reset")
      .expect(404, resolve)
  })})
})
