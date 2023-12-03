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

// import { expect } from "chai"
import * as db from "../src/services/database.service"
import * as inventory from "../src/models/3d-inventory"
import logger from "../src/util/logger"

test("Call runQuery", () => {
  const data = db.runQuery("devices", {})
  logger.info("runQuery: " + data)
  expect(data).not.toBeNull()
  logger.info("runQuery: " + data)
})

test("two plus two is four", () => {
  expect(2 + 2).toBe(4)
})
