/**
 * @module /src/services
 * @description This util module exports a function that creates a new log entry.
 * @version 2024-08-04 C2RLO - Initial
 **/

import { Collection, Db, InsertOneResult, ObjectId } from 'mongodb'
import { Observable, of } from 'rxjs'
import { connectToCluster, connectToDb } from '../db/dbUtils'

import { format } from 'date-fns'

/**
 * Represents a log entry.
 */
export interface Log {
  _id: ObjectId
  date: string
  objectId?: string
  operation: string // [create, update, delete, clone]
  component: string // [device, model, category, floor]
  message: object // object json
}

/**
 * Represents the input for creating a log entry.
 */
export interface LogCreate {
  objectId?: string
  operation: string
  component: string
  date: string
  message: object
}

/**
 * Creates a new log entry.
 * @param data - The log input data.
 * @returns An Observable that emits a Log or LogIn object.
 */
export async function CreateLog(objectId: string, message: object, operation: string, component: string): Promise<Observable<InsertOneResult<Document>>> {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection('logs')

  const log: LogCreate = {
    date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    message: message,
    operation: operation,
    component: component,
    objectId: objectId,
  }

  console.log('LogCreate: ' + JSON.stringify(log, null, ' '))
  const result: InsertOneResult<Document> = await collection.insertOne(log) // Replace 'collection' with the correct collection name
  return of(result)
}
