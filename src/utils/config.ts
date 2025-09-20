/**
 * @file config.ts
 * @description Loads and validates environment variables for the application.
 */

import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve('./.env') })

interface Config {
  API_YAML_FILE: string;
  ATLAS_URI: string;
  COOKIE_EXPIRESIN: number;
  DBNAME: string;
  HOST: string;
  JWT_SECRET: string;
  NODE_ENV?: 'development' | 'production' | 'test';
  PORT: number;
  USE_EMOJI?: boolean;
}

const DEFAULTS = {
  API_YAML_FILE: './api.yaml',
  ATLAS_URI: 'mongodb://localhost:27017',
  COOKIE_EXPIRESIN: 3600,
  DBNAME: '3d-inventory',
  HOST: '0.0.0.0',
  JWT_SECRET: 'your-api-key',
  NODE_ENV: 'development',
  PORT: 8080,
  USE_EMOJI: true
}

function getEnvVar(key: string, required = false): string | undefined {
  const value = process.env[key]

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

const config: Config = {
  API_YAML_FILE: getEnvVar('API_YAML_FILE') || DEFAULTS.API_YAML_FILE,
  ATLAS_URI: getEnvVar('ATLAS_URI', true)!,
  COOKIE_EXPIRESIN: Number(getEnvVar('COOKIE_EXPIRESIN')) || DEFAULTS.COOKIE_EXPIRESIN,
  DBNAME: getEnvVar('DBNAME') || DEFAULTS.DBNAME,
  HOST: getEnvVar('HOST') || DEFAULTS.HOST,
  JWT_SECRET: getEnvVar('JWT_SECRET', true)!,
  NODE_ENV: getEnvVar('NODE_ENV') as 'development' | 'production' | 'test' || DEFAULTS.NODE_ENV,
  PORT: Number(getEnvVar('PORT')) || DEFAULTS.PORT,
  USE_EMOJI: process.env.USE_EMOJI !== undefined ? process.env.USE_EMOJI === 'true' : DEFAULTS.USE_EMOJI
}

export default config
