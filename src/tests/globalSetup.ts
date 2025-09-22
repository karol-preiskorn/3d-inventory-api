/**
 * @file: /tests/setup.js
 * @module: /tests
 * @description: This file contains the global setup for Jest testing.
 * @version 2024-01-15 C2RLO - Initial
 */
import config from '../utils/config';
/**
 * Set up a global variable for MongoDB connection string for tests.
 * This allows tests to access the MongoDB URI via global.__MONGOD__.
 */
declare global {
  var __MONGOD__: string;
}

globalThis.__MONGOD__ = config.ATLAS_URI;

export const __MONGOD__ = config.ATLAS_URI;
