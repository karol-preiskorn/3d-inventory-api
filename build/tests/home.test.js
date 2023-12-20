"use strict"
/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "request.**.expect"] }] */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod }
}
Object.defineProperty(exports, "__esModule", { value: true })
const supertest_1 = __importDefault(require("supertest"))
const index_1 = __importDefault(require("../src/index"))
describe("GET /", () => {
    it("should return 200 OK", () => {
        return new Promise(resolve => {
            (0, supertest_1.default)(index_1.default).get("/").expect("Content-Type", /json/).expect(200, resolve)
        })
    })
})
describe("GET /doc", () => {
    it("should return 200 OK", () => {
        return new Promise(resolve => {
            (0, supertest_1.default)(index_1.default).get("/doc").expect("Content-Type", /json/).expect(200, resolve)
        })
    })
})
