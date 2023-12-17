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
import * as db from "../src/services/mongoService"
import logger from "../src/utils/logger"

test("Call runQuery", () => {
  const data = db.runQuery("devices", {})
  logger.info("runQuery: " + data)
  expect(data).not.toBeNull()
  logger.info("runQuery: " + data)
})
