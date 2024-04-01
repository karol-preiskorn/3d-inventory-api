'use strict'
/**
 * @file /routers/logs copy.js
 * @description attributes.js, is a module that sets up routes for a server using the Express.js framework. It's designed to interact with a MongoDB database, specifically with a collection named 'attributes'.
 * @version 2024-03-06 C2RLO - add _id to schema
 * @version 2024-01-30 C2RLO - Initial
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
const collectionName = 'attributes'
const router = express_1.default.Router()
router.get('/', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const results = await collection.find({}).limit(10).toArray()
  if (!results) {
    res.status(404).send('Not found')
  } else {
    res.status(200).send(results)
  }
  ;(0, conn_js_1.connectionClose)(client)
})
router.get('/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const query = { _id: new mongodb_1.ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.sendStatus(404)
  else res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
router.get('/model/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const query = { modelId: new mongodb_1.ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) {
    res.sendStatus(404)
  } else {
    res.send(result).status(200)
  }
  ;(0, conn_js_1.connectionClose)(client)
})
router.get('/device/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const query = { deviceId: new mongodb_1.ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.sendStatus(404)
  else res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
router.post('/', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const newDocument = req.body
  newDocument.date = new Date()
  const results = await collection.insertOne(newDocument)
  if (!results) res.sendStatus(404)
  else res.status(200).send(results)
  ;(0, conn_js_1.connectionClose)(client)
})
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
router.delete('/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new mongodb_1.ObjectId(req.params.id) }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteOne(query)
  if (!result) {
    res.status(404).send('Not found models to delete')
  } else {
    res.status(200).send(result)
  }
  ;(0, conn_js_1.connectionClose)(client)
})
router.delete('/', async (req, res) => {
  const query = {}
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  if (!result) {
    res.status(404).send('Not found models to delete')
  } else {
    res.status(200).send(result)
  }
  ;(0, conn_js_1.connectionClose)(client)
})
router.delete('/model/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { modelId: new mongodb_1.ObjectId(req.params.id) }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  if (!result) {
    res.status(404).send('Not found models to delete')
  } else {
    res.status(200).send(result)
  }
  ;(0, conn_js_1.connectionClose)(client)
})
exports.default = router
//# sourceMappingURL=attributes.js.map
