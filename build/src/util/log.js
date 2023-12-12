"use strict";
/*
 * File:        /src/util/log.ts
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-26  C2RLO    Initial
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const fileURL = "Log";
// const fileURL = dirname(fileURLToPath(`module.exports = process.env.NODE_ENV === "test" ? "{ADD VALID VALUE FOR TESTS}" : "import.meta.url"`))
const log = (m) => {
    return winston_1.default.info(fileURL + ": " + m);
};
exports.default = log;
