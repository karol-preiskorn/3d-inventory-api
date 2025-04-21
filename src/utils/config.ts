/**
 * @file config.ts
 * @description load environment variables and sanitize them
 */

import dotenv from 'dotenv'
import path from 'path'

// Parsing the env file.
dotenv.config({ path: path.resolve('./.env') })

// Interface to load env variables. Note these variables can possibly be undefined
// as someone could skip these variables or not setup a .env file at all

interface ENV {
  ATLAS_URI: string | undefined
  DBNAME: string | undefined
  API_YAML_FILE: string | undefined
  HOST: string | undefined
  PORT: number
  COOKIE_EXPIRESIN: number
}

interface Config {
  ATLAS_URI: string
  DBNAME: string
  API_YAML_FILE: string
  HOST: string
  PORT: number
  COOKIE_EXPIRESIN: number
}

// Loading process.env as ENV interface if not set use environment variables

const getConfig = (): ENV => {
  return {
    ATLAS_URI: process.env.ATLAS_URI,
    DBNAME: process.env.DBNAME ? String(process.env.DBNAME) : '3d-inventory',
    API_YAML_FILE: process.env.API_YAML_FILE ? String(process.env.API_YAML_FILE) : 'src/api/openapi.yaml',
    HOST: process.env.HOST ? String(process.env.HOST) : 'localhost',
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    COOKIE_EXPIRESIN: process.env.COOKIE_EXPIRESIN ? Number(process.env.COOKIE_EXPIRESIN) : 3600
  }
}

// Throwing an Error if any field was undefined we don't want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return it as Config which just removes the undefined from
// our type definition.

const getSanitizedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in environment variables from .env`)
    }
  }
  return config as Config
}

const configRaw = getConfig()

const config = getSanitizedConfig(configRaw)

export default config
