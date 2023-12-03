/*
 * File:        /tests/mongo.test copy.ts
 * Description: test set/use and config .env
 * Used by:
 * Dependency:  dotenv
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-29  C2RLO    Initial
 */

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
