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

/**
 * MongoDB connection options.
 * @type {MongoClientOptions}
 */
const mongoOptions: MongoClientOptions = {
  // SSL/TLS configuration
  tls: true,
  tlsAllowInvalidCertificates: false,
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
 * @throws {Error} If the connection fails or MONGODB_URI is not set.
 */
export async function connectToCluster(): Promise<MongoClient> {
  const mongoUri = config.ATLAS_URI;

  if (!mongoUri) {
    throw new Error('❌ ATLAS_URI environment variable is not set');
  }

  try {
    logger.info('✅ Attempting to connect to MongoDB Atlas...');
    const client = new MongoClient(mongoUri, mongoOptions);

    // Test the connection
    await client.connect();
    await client.db().admin().ping();

    logger.info('✅ Successfully connected to MongoDB Atlas');

    return client;
  } catch (error: unknown) {
    logger.error(
      '❌ MongoDB connection failed:',
      error instanceof Error ? error.message : error
    );
    throw error;
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
