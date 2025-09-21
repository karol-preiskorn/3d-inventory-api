/**
 * @file: /tests/setup.js
 * @module: /tests
 * @description: This file contains the global setup for Jest testing.
 * @version 2024-01-15 C2RLO - Initial
 */
import config from '../utils/config'

export const __MONGOD__ = config.ATLAS_URI
