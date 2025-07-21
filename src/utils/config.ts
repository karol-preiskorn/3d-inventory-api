/**
 * @file config.ts
 * @description Loads and validates environment variables.
 *              This module is responsible for loading environment variables
 *              from a .env file and providing a configuration object to the
 *              rest of the application.
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./.env') });

type EnvVars = {
  ATLAS_URI?: string;
  DBNAME?: string;
  API_YAML_FILE?: string;
  HOST?: string;
  PORT?: string;
  COOKIE_EXPIRESIN?: string;
};

type Config = {
  ATLAS_URI: string;
  DBNAME: string;
  API_YAML_FILE: string;
  HOST: string;
  PORT: number;
  COOKIE_EXPIRESIN: number;
};

const DEFAULTS = {
  DBNAME: '3d-inventory',
  API_YAML_FILE: 'src/api/openapi.yaml',
  HOST: '0.0.0.0',
  PORT: 8080,
  COOKIE_EXPIRESIN: 3600
};

function loadEnv(): EnvVars {
  return {
    ATLAS_URI: process.env.ATLAS_URI,
    DBNAME: process.env.DBNAME,
    API_YAML_FILE: process.env.API_YAML_FILE,
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    COOKIE_EXPIRESIN: process.env.COOKIE_EXPIRESIN
  };
}

function sanitizeEnv(env: EnvVars): Config {
  if (!env.ATLAS_URI) {
    throw new Error('Missing required environment variable: ATLAS_URI');
  }

  return {
    ATLAS_URI: env.ATLAS_URI,
    DBNAME: env.DBNAME || DEFAULTS.DBNAME,
    API_YAML_FILE: env.API_YAML_FILE || DEFAULTS.API_YAML_FILE,
    HOST: env.HOST || DEFAULTS.HOST,
    PORT: env.PORT ? Number(env.PORT) : DEFAULTS.PORT,
    COOKIE_EXPIRESIN: env.COOKIE_EXPIRESIN ? Number(env.COOKIE_EXPIRESIN) : DEFAULTS.COOKIE_EXPIRESIN
  };
}

const config = sanitizeEnv(loadEnv());

export default config;
