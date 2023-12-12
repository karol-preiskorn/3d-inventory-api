"use strict";
/*
 * File:        index.js
 * Description: Connect to MongoDB 3d-inventory claster
 * Used by:     testing connect to Mongo Atlas
 * Dependency:  .env (not push to git)
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-11-26  C2RLO  Add mongo test
 * 2023-11-20  C2RLO  Add logger
 * 2023-10-29  C2RLO  Init
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { expect } from "chai"
const db = __importStar(require("../src/services/database.service"));
const logger_1 = __importDefault(require("../src/util/logger"));
test("Call runQuery", () => {
    const data = db.runQuery("devices", {});
    logger_1.default.info("runQuery: " + data);
    expect(data).not.toBeNull();
    logger_1.default.info("runQuery: " + data);
});
