"use strict"
/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "request.**.expect"] }] */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod }
}
Object.defineProperty(exports, "__esModule", { value: true })
const supertest_1 = __importDefault(require("supertest"))
const server_1 = __importDefault(require("../src/server"))
const chai_1 = require("chai")
describe("GET /contact", () => {
    it("should return 200 OK", () => {
        return new Promise(resolve => {
            (0, supertest_1.default)(server_1.default).get("/contact")
                .expect(200, resolve)
        })
    })
})
describe("POST /contact", () => {
    test("should return some defined error message with valid parameters", () => {
        return new Promise(resolve => {
            try {
                (0, supertest_1.default)(server_1.default).post("/contact")
                    .field("email", "john@me.com")
                    .field("password", "Hunter2")
                    .end(function (resolve) {
                    (0, chai_1.expect)(200, resolve)
                })
                    .expect(302)
            }
            catch (error) {
                resolve(error)
            }
        })
    })
})
