/**
 * @file config.ts
 * @description Loads and validates environment variables for the application.
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./.env') });

interface Config {
  ATLAS_URI: string;
  DBNAME: string;
  API_YAML_FILE: string;
  HOST: string;
  HOST_DEV: string;
  PORT: number;
  COOKIE_EXPIRESIN: number;
  USE_EMOJI?: boolean;
}

const DEFAULTS = {
  DBNAME: '3d-inventory',
  API_YAML_FILE: './api.yaml',
  HOST: '0.0.0.0',
  HOST_DEV: '0.0.0.0',
  PORT: 8080,
  COOKIE_EXPIRESIN: 3600
};

function getEnvVar(key: string, required = false): string | undefined {
  const value = process.env[key];

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

const config: Config = {
  ATLAS_URI: getEnvVar('ATLAS_URI', true)!,
  DBNAME: getEnvVar('DBNAME') || DEFAULTS.DBNAME,
  API_YAML_FILE: getEnvVar('API_YAML_FILE') || DEFAULTS.API_YAML_FILE,
  HOST: getEnvVar('HOST') || DEFAULTS.HOST,
  HOST_DEV: getEnvVar('HOST_DEV') || DEFAULTS.HOST_DEV,
  PORT: Number(getEnvVar('PORT')) || DEFAULTS.PORT,
  COOKIE_EXPIRESIN: Number(getEnvVar('COOKIE_EXPIRESIN')) || DEFAULTS.COOKIE_EXPIRESIN,
  USE_EMOJI: process.env.USE_EMOJI === 'true'
};

export default config;
