/**
 * File:        /routers/devices.mjs
 * Description:
 * Used by:
 * Dependency:
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-29  C2RLO  Initial
 **/

import express from "express"
import db from "../db/conn.mjs"
import { ObjectId } from "mongodb"

const router = express.Router()

/**
 * @openapi
 * /devices:
 *    get:
 *      tags:
 *        - "devices"
 *      description: Get all devices
 *      responses:
 *        "200":
 *          description: Ok
 *        "404":
 *          description: Not found
 */
router.get("/", async (req, res) => {
  const collection = await db.collection("devices")
  const results = await collection.find({}).limit(50).toArray()
  res.send(results).status(200)
})

export default router
