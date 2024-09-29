/**
 * @file /routers/floors.js
 * @module /routers
 * @description floors router
 * @version 2024-04-05 C2RLO - Convert to typescript
 * @version 2024-02-13 C2RLO - init
 */

import '../utils/loadEnvironment'

import express, { RequestHandler } from 'express'
import { Collection, Db, ObjectId, UpdateFilter } from 'mongodb'
import sanitize from 'sanitize-html'

import { connectionClose, connectToCluster, connectToDb } from '../db/dbUtils'

interface Floor {
  _id: ObjectId
  name: string
  address: Address
  dimension: Dimension[]
}

interface Address {
  street: string
  city: string
  country: string
  postcode: string
}

interface Dimension {
  description: string
  x: number
  y: number
  h: number
  xPos: number
  yPos: number
  hPos: number
}

const collectionName = 'floors'
const router = express.Router()

router.get('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const results: object[] = await collection.find({}).limit(10).toArray()
  if (!results) res.status(404).send('Not found')
  else res.status(200).send(results)
  await connectionClose(client)
}) as RequestHandler)

router.get('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { _id: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).json({ message: 'Not found' })
  else res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

router.get('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const query = { modelId: new ObjectId(req.params.id) }
  const result = await collection.findOne(query)
  if (!result) res.status(404).json({ message: 'Not found' })
  else res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

router.post('/', (async (req, res) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const newDocument: Floor = req.body as Floor
  const result = await collection.insertOne(newDocument)
  const insertedDocument = await collection.findOne({ _id: result.insertedId })
  if (!insertedDocument) {
    res.status(404).send('Inserted document not found')
    await connectionClose(client)
    return
  }

  const sanitizedResult = {
    ...insertedDocument,
    name: sanitize(typeof insertedDocument.name === 'string' ? insertedDocument.name : ''),
    address: {
      ...insertedDocument.address,
      street: sanitize(typeof (insertedDocument.address as Address).street === 'string' ? (insertedDocument.address as Address).street : ''),
      city: sanitize(typeof (insertedDocument.address as Address).city === 'string' ? (insertedDocument.address as Address).city : ''),
      country: sanitize(typeof (insertedDocument.address as Address).country === 'string' ? (insertedDocument.address as Address).country : ''),
      postcode: sanitize(typeof (insertedDocument.address as Address).postcode === 'string' ? (insertedDocument.address as Address).postcode : ''),
    },
    dimension: (insertedDocument.dimension as Dimension[]).map((dim: Dimension) => ({
      ...dim,
      description: sanitize(typeof dim.description === 'string' ? dim.description : ''),
    })),
  }
  res.status(200).json(sanitizedResult)
  await connectionClose(client)
}) as RequestHandler)

router.patch('/dimension/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  const updates: UpdateFilter<Document>[] = [{ $push: { dimension: req.body as Dimension } }]
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.updateOne(query, updates)
  res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

router.delete('/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { _id: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteOne(query)
  res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

router.delete('/', (async (req, res) => {
  const query = {}
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).send(result)
  await connectionClose(client)
}) as RequestHandler)

router.delete('/model/:id', (async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404)
  }
  const query = { modelId: new ObjectId(req.params.id) }
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const result = await collection.deleteMany(query)
  res.status(200).json(result)
  await connectionClose(client)
}) as RequestHandler)

export default router
