/**
 * @file config.ts
 * @description Loads and validates environment variables for the application.
 */

import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve('./.env') })

interface Config {
  API_YAML_FILE: string
  ATLAS_URI: string
  COOKIE_EXPIRESIN: number
  CORS_ORIGIN: string[]
  DBNAME: string
  HOST: string
  JWT_SECRET: string
  NODE_ENV: string
  PORT: number
  USE_EMOJI: boolean
}

const DEFAULTS = {
  API_YAML_FILE: './api.yaml',
  ATLAS_URI: 'mongodb://localhost:27017',
  COOKIE_EXPIRESIN: 3600,
  CORS_ORIGIN: [
    'http://localhost:4200',
    'https://localhost:4200',
    'http://localhost:8080',
    'https://localhost:8080',
    'https://3d-inventory-api.ultimasolution.pl',
    'https://3d-inventory-ui.ultimasolution.pl'
  ],
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
  ATLAS_URI: (() => {
    const value = getEnvVar('ATLAS_URI', true)

    if (!value) throw new Error('Missing required environment variable: ATLAS_URI')

    return value
  })(),
  COOKIE_EXPIRESIN: (() => {
    const value = Number(getEnvVar('COOKIE_EXPIRESIN'))

    return isNaN(value) ? DEFAULTS.COOKIE_EXPIRESIN : value
  })(),
  CORS_ORIGIN: (() => {
    const value = getEnvVar('CORS_ORIGIN')

    if (value) {
      return value.split(',').map(origin => origin.trim())
    }

    return DEFAULTS.CORS_ORIGIN
  })(),
  DBNAME: getEnvVar('DBNAME') || DEFAULTS.DBNAME,
  HOST: getEnvVar('HOST') || DEFAULTS.HOST,
  JWT_SECRET: (() => {
    const value = getEnvVar('JWT_SECRET', true)

    if (!value) throw new Error('Missing required environment variable: JWT_SECRET')

    return value
  })(),
  NODE_ENV: ((): 'development' | 'production' | 'test' => {
    const value = getEnvVar('NODE_ENV') as 'development' | 'production' | 'test' | undefined

    if (!value) throw new Error('Missing required environment variable: NODE_ENV')

    return value
  })(),
  PORT: (() => {
    const value = Number(getEnvVar('PORT'))

    return isNaN(value) ? DEFAULTS.PORT : value
  })(),
  USE_EMOJI: process.env.USE_EMOJI !== undefined ? process.env.USE_EMOJI === 'true' : DEFAULTS.USE_EMOJI
}

export default config
