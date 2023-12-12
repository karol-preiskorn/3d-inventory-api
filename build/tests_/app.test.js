"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../src/server"));
describe("GET /random-url", () => {
    it("should return 403", () => {
        return new Promise((resolve) => {
            (0, supertest_1.default)(server_1.default).get("/reset")
                .expect(404, resolve);
        });
    });
});
