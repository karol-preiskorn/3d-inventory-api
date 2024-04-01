'use strict'
/**
 * @file /routers/components.js
 * @module /routers
 * @description This file contains the router for compaonent configurasions.
 * @version 2024-03-29 C2RLO - Initial
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
const collectionName = 'components'
const router = express_1.default.Router()
router.get('/', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  const results = await collection
    .find({})
    .sort({ date: -1 })
    .limit(200)
    .toArray()
  if (!results) res.sendStatus(404)
  else {
    res.sendStatus(200)
  }
  ;(0, conn_js_1.connectionClose)(client)
})
router.get('/collection/:collection', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  if (!req.params.collection) {
    res.sendStatus(400)
    return
  }
  const query = { collection: new mongodb_1.ObjectId(req.params.collection) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found ' + JSON.stringify(query))
  else res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
router.get('/component/:component', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  if (!mongodb_1.ObjectId.isValid(req.params.component)) {
    res.sendStatus(400)
    return
  }
  const query = { component: new mongodb_1.ObjectId(req.params.component) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found ' + JSON.stringify(query))
  else res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
router.get('/attributes/:has', async (req, res) => {
  const client = await (0, conn_js_1.connectToCluster)()
  const db = await (0, conn_js_1.connectToDb)(client)
  const collection = db.collection(collectionName)
  let query
  if (req.params.has === 'true' || req.params.has === 'false') {
    res.sendStatus(400)
    return
  }
  if (req.params.has === 'true') {
    query = { attributes: true }
  } else {
    query = { attributes: false }
  }
  const result = await collection.findOne(query)
  if (!result) res.status(404).send('Not found ' + JSON.stringify(query))
  else res.status(200).send(result)
  ;(0, conn_js_1.connectionClose)(client)
})
exports.default = router
//# sourceMappingURL=componets.js.map
