/**
 * @module /src/services
 * @description This util module exports a function that creates a new log entry.
 * @version 2024-08-04 C2RLO - Initial
 **/

import { format } from 'date-fns'
import { Collection, Db, Document, InsertOneResult, ObjectId } from 'mongodb'
import { Observable, of } from 'rxjs'
import { connectToCluster, connectToDb } from '../utils/db'

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
  userId?: string // User ID who performed the action
  username?: string // Username who performed the action
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
  userId?: string // User ID who performed the action
  username?: string // Username who performed the action
}

/**
 * Creates a new log entry.
 * @param objectId - The object ID related to the log entry
 * @param message - The log message as an object
 * @param operation - The operation performed (create, update, delete, clone)
 * @param component - The component (device, model, category, floor)
 * @param userId - Optional user ID who performed the action
 * @param username - Optional username who performed the action
 * @returns An Observable that emits a Log or LogIn object.
 */
export async function CreateLog(
  objectId: string,
  message: object,
  operation: string,
  component: string,
  userId?: string,
  username?: string
): Promise<Observable<InsertOneResult<Document>>> {
  const client = await connectToCluster()
  const db: Db = connectToDb(client)
  const collection: Collection = db.collection('logs')
  const log: LogCreate = {
    date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    message: message,
    operation: operation,
    component: component,
    objectId: objectId,
    userId: userId,
    username: username
  }

  console.log('LogCreate: ' + JSON.stringify(log, null, ' '))
  const result: InsertOneResult<Document> = await collection.insertOne(log) // Replace 'collection' with the correct collection name

  return of(result)
}
