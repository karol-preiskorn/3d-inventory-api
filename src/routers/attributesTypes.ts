/**
 * @file /routers/attributesTypes.js
 * @description attributesTypes router
 * @module routers
 */

import express, { RequestHandler } from 'express';
import { Collection, Db, ObjectId, WithoutId } from 'mongodb';
import { AttributesDictionary } from '../controllers/attributesDictionary';
import { validateObjectId } from '../middlewares';
import { closeConnection, connectToCluster, connectToDb } from '../utils/db';

export interface AttributesTypes {
  _id: ObjectId;
  component: string;
  description: string;
  length: number;
  name: string;
  type: string;
  value: string;
}

const collectionName = 'attributesDictionary';
const router: express.Router = express.Router();

router.get('/', (async (req, res) => {
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const results: object[] = await collection.find({}).limit(10).toArray();

  if (!results) res.status(404).send('Not found');
  else {
    res.status(200).json(results);
  }
  await closeConnection(client);
}) as RequestHandler);

router.get('/:id', validateObjectId, (async (req, res) => {
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const query = { _id: new ObjectId(req.params.id) };
  const result = await collection.findOne(query);

  if (!result) res.status(404).json({ message: 'Not found' });
  else res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

router.get('/model/:id', validateObjectId, (async (req, res) => {
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const query = { modelId: new ObjectId(req.params.id) };
  const result = await collection.findOne(query);

  if (!result) res.status(404).json({ message: 'Not found' });
  else res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

router.post('/', (async (req, res) => {
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const newDocument = req.body as WithoutId<AttributesDictionary>;
  const results = await collection.insertOne(newDocument);
  const insertedDocument = await collection.findOne({ _id: results.insertedId });

  res.status(201).json(insertedDocument);
  await closeConnection(client);
}) as RequestHandler);

router.delete('/:id', validateObjectId, (async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const result = await collection.deleteOne(query);

  res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

router.delete('/', (async (req, res) => {
  const query = {};
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const result = await collection.deleteMany(query);

  res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

router.delete('/model/:id', validateObjectId, (async (req, res) => {
  const query = { modelId: new ObjectId(req.params.id) };
  const client = await connectToCluster();
  const db: Db = connectToDb(client);
  const collection: Collection = db.collection(collectionName);
  const result = await collection.deleteMany(query);

  res.status(200).json(result);
  await closeConnection(client);
}) as RequestHandler);

export default router;
