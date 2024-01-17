/**
 * @file conn.js Connect to Mongo Atlas DB
 * @module db/conn
 * @description This module exports a MongoDB client and a database connection.
 * @version 2024-01-13 C2RLO - Fix async error
 * @version 2023-12-29 C2RLO - Initial
 */

import { MongoClient } from 'mongodb'
import { logger } from '../utils/logger.js'
import '../utils/loadEnvironment'

const uri = process.env.ATLAS_URI || ''
const dbName = process.env.DBNAME
const client = new MongoClient(uri, { monitorCommands: true })

export function database() {
  let database
  try {
    database = client.connect().db(dbName)
    logger.info(`[conn.js] connect to ${dbName}`)
  } catch (error) {
    logger.error(`[conn.js] connect to ${dbName}: ${error}`)
  }
  return database
}
