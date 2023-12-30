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
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Devices"
 *        "404":
 *          description: Not found
 */
router.get("/", async (req, res) => {
  const collection = await db.collection("devices")
  const results = await collection.find({}).limit(50).toArray()
  res.send(results).status(200)
})

/**
 * @openapi
 * /devices:
 *    post:
 *      tags:
 *        - "devices"
 *      description: Create device
 *      responses:
 *        "200":
 *          description: Ok
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Devices"
 *        "404":
 *          description: Not found
 */
router.post("/", async (req, res) => {
  const collection = await db.collection("devices")
  const newDocument = req.body
  newDocument.date = new Date()
  const results = await collection.insertOne(newDocument)
  res.send(results).status(204)
})

// Update the post with a new comment
router.patch("/comment/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) }
  const updates = {
    $push: { comments: req.body }
  }

  const collection = await db.collection("posts")
  const result = await collection.updateOne(query, updates)

  res.send(result).status(200)
})

// Delete an entry
router.delete("/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) }

  const collection = db.collection("posts")
  const result = await collection.deleteOne(query)

  res.send(result).status(200)
})


export default router
