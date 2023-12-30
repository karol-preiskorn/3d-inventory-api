/**
 * File:        /routers/devices.mjs
 * Description:
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2023-12-29  C2RLO  Initial
 **/

import express from "express"
import db from "../db/conn.mjs"
import { ObjectId } from "mongodb"

const router = express.Router()

// Get all
router.get("/", async (req, res) => {
  const collection = await db.collection("devices")
  const results = await collection.find({}).limit(50).toArray()
  res.send(results).status(200)
})

// Get a single post
router.get("/:id", async (req, res) => {
  const collection = await db.collection("devices")
  const query = { _id: ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.send("Not found").status(404)
  else res.send(result).status(200)
})

// Create
router.post("/", async (req, res) => {
  const collection = await db.collection("devices")
  const newDocument = req.body
  newDocument.date = new Date()
  const results = await collection.insertOne(newDocument)
  res.send(results).status(204)
})

// Update the device's :id position
router.patch("/position/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) }
  const updates = {
    $push: { position: req.body }
  }
  const collection = await db.collection("devices")
  const result = await collection.updateOne(query, updates)
  res.send(result).status(200)
})

// Delete an entry
router.delete("/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) }
  const collection = db.collection("devices")
  const result = await collection.deleteOne(query)
  res.send(result).status(200)
})

router.delete("/all", async (req, res) => {
  const query = { }
  const collection = db.collection("devices")
  const result = await collection.deleteMany(query)
  res.send(result).status(200)
})

router.delete("/model/:id", async (req, res) => {
  const query = { modelId: ObjectId(req.params.id) }
  const collection = db.collection("devices")
  const result = await collection.deleteMany(query)
  res.send(result).status(200)
})


export default router
