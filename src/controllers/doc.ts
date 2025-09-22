import fs from 'fs'
import { RequestHandler } from 'express'
import swaggerUi, { JsonObject } from 'swagger-ui-express'
import YAML from 'yaml'
import getLogger from '../utils/logger'

const logger = getLogger('doc')

/**
 * Get the YAML filename from environment or default
 */
export function getYamlFilename(): string {
  return process.env.API_YAML_FILE ?? './api.yaml'
}

/**
 * Load and parse the Swagger YAML document
 */
export function loadSwaggerDocument(): JsonObject | null {
  const yamlFilename = getYamlFilename()

  try {
    const file = fs.readFileSync(yamlFilename, 'utf8')
    const swaggerDocument = YAML.parse(file) as JsonObject

    logger.info(`✅ Swagger ${yamlFilename} loaded successfully (${JSON.stringify(swaggerDocument).length} bytes)`)

    return swaggerDocument
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      const errorWithCode = err as { code?: string }

      if (errorWithCode.code === 'ENOENT') {
        logger.error(`File not found: ${yamlFilename}`)
      } else if (errorWithCode.code === 'EACCES') {
        logger.error(`No permission to file ${yamlFilename}`)
      } else if (err instanceof Error) {
        logger.error('Open swaggerUI exception: ' + err.message)
      } else {
        logger.error('Unknown error occurred.')
      }
    } else if (err instanceof Error) {
      logger.error('Open swaggerUI exception: ' + err.message)
    } else {
      logger.error('Unknown error occurred.')
    }

    return null
  }
}

/**
 * Get Swagger UI serve middleware
 */
export function getSwaggerServe(): RequestHandler[] {
  return swaggerUi.serve
}

/**
 * Get Swagger UI setup middleware
 */
export function getSwaggerSetup(): RequestHandler {
  const swaggerDocument = loadSwaggerDocument()

  if (!swaggerDocument) {
    // Return a middleware that serves an error page
    return (req, res) => {
      logger.warn(`Swagger documentation unavailable for ${req.method} ${req.originalUrl}`)
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Swagger documentation is currently unavailable. Please check server logs.'
      })
    }
  }

  logger.info('Swagger UI setup configured successfully')

  return swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: '3D Inventory API Documentation',
    customfavIcon: '/favicon.ico'
  })
}

/**
 * Health check for documentation service
 */
export const getDocumentationHealth: RequestHandler = (req, res): void => {
  try {
    const yamlFilename = getYamlFilename()
    const exists = fs.existsSync(yamlFilename)

    if (exists) {
      const stats = fs.statSync(yamlFilename)

      logger.info(`Documentation health check passed for ${req.method} ${req.originalUrl}`)

      res.json({
        status: 'healthy',
        yamlFile: yamlFilename,
        fileSize: stats.size,
        lastModified: stats.mtime,
        message: 'Swagger documentation is available'
      })
    } else {
      logger.warn(`Documentation health check failed - file not found: ${yamlFilename}`)

      res.status(503).json({
        status: 'unhealthy',
        yamlFile: yamlFilename,
        message: 'Swagger YAML file not found'
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.error(`Error in documentation health check: ${errorMessage}`)

    res.status(500).json({
      status: 'error',
      message: 'Error checking documentation health',
      error: errorMessage
    })
  }
}
