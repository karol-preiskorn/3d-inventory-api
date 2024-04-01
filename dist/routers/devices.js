'use strict'
/**
 * @file /routers/devices.js
 * @module /routers
 * @description devices router
 * @version 2024-01-25 C2RLO - add new way to connect to DB
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const express_1 = __importDefault(require('express'))
const mongodb_1 = require('mongodb')
require('../utils/loadEnvironment.js')
const conn_js_1 = require('../db/conn.js')
const collectionName = 'devices'
const router = express_1.default.Router()
// Get all
router.get('/', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const results = await collection.find({}).limit(10).toArray()
  if (!results) res.status(404)
  else res.status(200).send(results)
  ;(0, conn_js_1.connectionClose)(client)
})
// Get a single post
router.get('/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const query = { _id: new mongodb_1.ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
router.put('/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new mongodb_1.ObjectId(req.params.id) }
  const updates = {
    $set: {
      name: req.body.name,
      modelId: req.body.modelId,
      position: req.body.position,
    },
  }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  if (!result) res.status(404).send('Not found devices to update')
  res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
// Get a single post
router.get('/model/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const query = { modelId: new mongodb_1.ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
// Create
router.post('/', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const newDocument = req.body
  newDocument.date = new Date()
  const results = await collection.insertOne(newDocument)
  res.status(200).send(results)
  ;(0, conn_js_1.connectionClose)(client)
})
// Update the device's :id position
router.patch('/position/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new mongodb_1.ObjectId(req.params.id) }
  const updates = {
    $push: { position: req.body },
  }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
// Delete an entry
router.delete('/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new mongodb_1.ObjectId(req.params.id) }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteOne(query)
  res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
// delete all devices
router.delete('/', async (req, res) => {
  const query = {}
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
// delete all devices with specific :id model
router.delete('/model/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { modelId: new mongodb_1.ObjectId(req.params.id) }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
exports.default = router
//# sourceMappingURL=devices.js.map
