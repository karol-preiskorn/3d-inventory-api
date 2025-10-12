import { RequestHandler, Router } from 'express'
import { createLog, deleteAllLogs, deleteLog, getAllLogs, getLoginLogsByUserId, getLoginLogsByUsername, getLogsByComponent, getLogsByModelId, getLogsByObjectId, VALID_COMPONENTS } from '../controllers/logs'
import { validateObjectId } from '../middlewares'
import getLogger from '../utils/logger'

const logger = getLogger('logs')
// Middleware to validate component parameter
const validateComponent: RequestHandler = (req, res, next) => {
  const component = req.params.component
  const validComponentsString = VALID_COMPONENTS.join(', ')

  if (!component) {
    logger.warn('No component name provided')
    res.status(400).json({
      error: 'Invalid component',
      message: `Component name is required. Valid components are: [${validComponentsString}]`
    })

    return
  }

  if (!VALID_COMPONENTS.includes(component as (typeof VALID_COMPONENTS)[number])) {
    logger.warn(`Invalid component: ${component}`)
    res.status(400).json({
      error: 'Invalid component',
      message: `Invalid component: ${component}. Valid components are: [${validComponentsString}]`
    })

    return
  }

  next()
}
// Middleware to validate objectId parameter (not ObjectId format, just string)
const validateObjectIdParam: RequestHandler = (req, res, next) => {
  const { id } = req.params

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    logger.warn('No ID provided or invalid ID format')
    res.status(400).json({
      error: 'Invalid ID',
      message: 'ID is required and must be a non-empty string'
    })

    return
  }

  next()
}
// Middleware to validate log input
const validateLogInput: RequestHandler = (req, res, next) => {
  const { objectId, operation, component, message } = req.body

  if (!objectId || typeof objectId !== 'string' || objectId.trim().length === 0) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'objectId must be a non-empty string'
    })

    return
  }

  if (!operation || typeof operation !== 'string' || operation.trim().length === 0) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'operation must be a non-empty string'
    })

    return
  }

  if (!component || typeof component !== 'string' || !VALID_COMPONENTS.includes(component as (typeof VALID_COMPONENTS)[number])) {
    res.status(400).json({
      error: 'Invalid input data',
      message: `component must be one of: [${VALID_COMPONENTS.join(', ')}]`
    })

    return
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'message must be a non-empty string'
    })

    return
  }

  next()
}

/**
 * Creates and configures the logs router
 * @returns {Router} Configured Express router
 */
export function createLogsRouter(): Router {
  const router = Router()

  // Basic CRUD routes
  router.get('/', getAllLogs)
  router.post('/', validateLogInput, createLog)
  router.delete('/', deleteAllLogs)

  // Specialized query routes - MUST come before generic :id route
  router.get('/component/:component', validateComponent, getLogsByComponent)
  router.get('/model/:id', validateObjectId, getLogsByModelId)
  router.get('/login/username/:username', getLoginLogsByUsername)
  router.get('/login/user/:userId', getLoginLogsByUserId)

  // Generic ID-based routes - MUST come last to avoid conflicts
  router.get('/:id', validateObjectIdParam, getLogsByObjectId)
  router.delete('/:id', validateObjectId, deleteLog)

  return router
}
