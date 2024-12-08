/**
 * @file /routers/floors.js
 * @module routers
 * @description floors router
 */

import '../utils/loadEnvironment';

import express, { RequestHandler } from 'express';
import { Collection, Db, ObjectId, UpdateFilter } from 'mongodb';
import sanitize from 'sanitize-html';

import { connectionClose, connectToCluster, connectToDb } from '../db/dbUtils.js';

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
const router: express.Router = express.Router()

router.get('/', (async (req: express.Request, res: express.Response) => {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection(collectionName)
  const results: object[] = await collection.find({}).limit(10).toArray()
  if (!results) res.status(404).send('Not found')
  else {
    const sanitizedResults = results.map((result) => {
      const floor = result as Floor
      return {
        ...floor,
        name: sanitize(floor.name),
        address: {
          ...floor.address,
          street: sanitize(floor.address.street),
          city: sanitize(floor.address.city),
          country: sanitize(floor.address.country),
          postcode: sanitize(floor.address.postcode),
        },
        dimension: floor.dimension.map((dim: Dimension) => ({
          ...dim,
          description: sanitize(dim.description),
        })),
      }
    })
    res.status(200).json(sanitizedResults)
  }
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
  const insertedDocument = (await collection.findOne({ _id: result.insertedId })) as Floor
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
      street: sanitize(typeof insertedDocument.address.street === 'string' ? insertedDocument.address.street : ''),
      city: sanitize(typeof insertedDocument.address.city === 'string' ? insertedDocument.address.city : ''),
      country: sanitize(typeof insertedDocument.address.country === 'string' ? insertedDocument.address.country : ''),
      postcode: sanitize(typeof insertedDocument.address.postcode === 'string' ? insertedDocument.address.postcode : ''),
    },
    dimension: insertedDocument.dimension.map((dim: Dimension) => ({
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
  const sanitizedResult = sanitize(JSON.stringify(result));
  res.status(200).send(JSON.parse(sanitizedResult));
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
