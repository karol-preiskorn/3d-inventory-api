'use strict'
/**
 * @file:        /routers/models.js
 * @description: This file contains the router for handling model-related API endpoints.
 * @version: 2023-12-29  C2RLO  Initial
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
const router = express_1.default.Router()
router.get('/', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection('models')
  const results = await collection.find({}).limit(50).toArray()
  res.status(200).send(results)
  ;(0, conn_js_1.connectionClose)(client)
})
router.get('/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection('models')
  const query = { _id: new mongodb_1.ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found')
  else res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
router.put('/:id', async (req, res) => {
  if (!mongodb_1.ObjectId.isValid(req.params.id)) {
    res.status(404).send('Not correct id')
  }
  const query = { _id: new mongodb_1.ObjectId(req.params.id) }
  console.log('models.router.put: ' + JSON.stringify(req.body))
  const updates = {
    $set: {
      name: req.body.name,
      'dimension.width': req.body.dimension.width,
      'dimension.height': req.body.dimension.height,
      'dimension.depth': req.body.dimension.depth,
      'texture.front': req.body.texture.front,
      'texture.back': req.body.texture.back,
      'texture.side': req.body.texture.side,
      'texture.top': req.body.texture.top,
      'texture.botom': req.body.texture.botom,
      type: req.body.type,
      category: req.body.category,
    },
  }
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection('models')
  const result = await collection.updateOne(query, updates)
  if (!result) res.status(404).send('Not found models to update')
  res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
router.post('/', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection('models')
  const newDocument = req.body
  const results = await collection.insertOne(newDocument)
  res.status(200).send(results)
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
  const collection = db.collection('models')
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
  const collection = db.collection('models')
  const result = await collection.deleteOne(query)
  res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
router.delete('/', async (req, res) => {
  const query = {}
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection('models')
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
exports.default = router
//# sourceMappingURL=models.js.map
