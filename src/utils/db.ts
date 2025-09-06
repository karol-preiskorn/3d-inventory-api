/**
 * @resume Connect to Mongo Atlas DB.
 * @module db/conn
 * @description This module exports a MongoDB client and a database connection.
 */

import type { Db, MongoClientOptions } from 'mongodb';
import { MongoClient } from 'mongodb';
import config from './config';
import log from './logger';

const logger = log('db');

// Configurable emoji usage for logs and errors
const useEmoji = config.USE_EMOJI ?? true;

/**
 * MongoDB connection options.
 * @type {MongoClientOptions}
 */
const mongoOptions: MongoClientOptions = {
  // SSL/TLS configuration
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: false,

  // Connection settings
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 1,

  // Retry configuration
  w: 'majority'

};

/**
 * Connects to the MongoDB Atlas cluster.
 * @returns {Promise<MongoClient>} The connected MongoDB client.
 * @throws {Error} If the connection fails or ATLAS_URI is not set.
 */
export async function connectToCluster(): Promise<MongoClient> {
  const mongoUri = config.ATLAS_URI;

  if (!mongoUri || typeof mongoUri !== 'string') {
    const msg = `${useEmoji ? '❌ ' : ''}ATLAS_URI environment variable is not set or invalid.`

    logger.error(msg);
    throw new Error(msg);
  }

  try {
    const client = new MongoClient(mongoUri, mongoOptions);

    await client.connect();
    logger.info(`${useEmoji ? '✅ ' : ''}Connected to MongoDB Atlas Cluster`);

    return client;
  } catch (error) {
    const errMsg = `${useEmoji ? '❌ ' : ''}MongoDB connection to ${config.DBNAME} failed: ${error instanceof Error ? error.message : String(error)}`;

    logger.error(errMsg);
    throw new Error(errMsg);
  }
}

/**
 * Connects to the specified MongoDB database.
 * @param {MongoClient} client - The connected MongoDB client.
 * @returns {Db} The MongoDB database instance.
 */
export function connectToDb(client: MongoClient): Db {
  if (!config.DBNAME || typeof config.DBNAME !== 'string') {
    throw new Error('Invalid or undefined DBNAME in configuration.');
  }
  try {
    const db = client.db(config.DBNAME);

    logger.info(`✅ Successfully connected to Atlas DB ${config.DBNAME}`);

    return db;
  } catch (error) {
    logger.error(`❌ Connection to Atlas DB failed (${config.DBNAME}): ${error instanceof Error ? error.message : error}`);
    throw new Error(`❌ Connection to Atlas DB failed (${config.DBNAME}): ${error}`);
  }
}


/**
 * Closes the MongoDB connection.
 * @param {MongoClient} connection - The MongoDB connection.
 * @returns {void}
 */
export async function closeConnection(client: MongoClient): Promise<void> {
  try {
    await client.close();
    logger.info('✅ MongoDB connection closed successfully.');
  } catch (error) {
    logger.error(`❌ Failed to close MongoDB connection: ${error}`);
    // Optionally, rethrow or handle the error as needed
    throw error;
  }
}
