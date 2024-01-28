/**
 * @file conn.js Connect to Mongo Atlas DB
 * @module db/conn
 * @description This module exports a MongoDB client and a database connection.
 * @version 2024-01-27 C2RLO - add exit(1) on error
 * @version 2024-01-25 C2RLO - Add connectionClose()
 * @version 2024-01-13 C2RLO - Fix async error
 * @version 2023-12-29 C2RLO - Initial
 */

import { MongoClient } from 'mongodb'
import { logger } from '../utils/logger.js'
import '../utils/loadEnvironment'

const uri = process.env.ATLAS_URI || ''
export async function connectToCluster() {
  let client
  let connect
  try {
    client = new MongoClient(uri)
    logger.info('Connecting to MongoDB Atlas cluster...')
    connect = await client.connect()
    logger.info('Successfully connected to MongoDB Atlas!')
    return connect
  } catch (error) {
    logger.error('Connection to MongoDB Atlas failed!', error)
    process.exit(1)
  }
}

export async function connectToDb(client) {
  let db
  try {
    logger.info('Connecting to MongoDB Atlas db...')
    db = await client.db(process.env.DBNAME)
    logger.info('Successfully to MongoDB Atlas db...')
    return db
  } catch (error) {
    logger.error('Connection to MongoDB DB failed!', error)
    process.exit(1)
  }
}

export async function connectionClose(connection) {
  try {
    await connection.close()
    logger.info('Successfully closed the connection.')
  } catch (error) {
    logger.error('Failed to close the connection!', error)
  }
}
