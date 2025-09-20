import { RequestHandler } from 'express'
import { ObjectId } from 'mongodb'
import getLogger from '../utils/logger'

const logger = getLogger('validation-middleware')

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: string;
  message: string;
  field?: string;
}

/**
 * Middleware to validate ObjectId in req.params.id
 */
export const validateObjectId: RequestHandler = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'Invalid ObjectId format',
      field: 'id'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid ObjectId format: ${req.params.id}`)
    res.status(400).json(errorResponse)

    return
  }

  next()
}

/**
 * Middleware to validate attribute input
 */
export const validateAttributeInput: RequestHandler = (req, res, next) => {
  const { attributeDictionaryId, connectionId, deviceId, modelId, value } = req.body

  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'value must be a non-empty string',
      field: 'value'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid value field`)
    res.status(400).json(errorResponse)

    return
  }

  if (!attributeDictionaryId || typeof attributeDictionaryId !== 'string' || !ObjectId.isValid(attributeDictionaryId)) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'attributeDictionaryId must be a valid ObjectId string',
      field: 'attributeDictionaryId'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid attributeDictionaryId field`)
    res.status(400).json(errorResponse)

    return
  }

  // At least one of connectionId, deviceId, or modelId must be provided
  if (!connectionId && !deviceId && !modelId) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'At least one of connectionId, deviceId, or modelId must be provided'
    }

    logger.error(`${req.method} ${req.originalUrl} - missing required reference fields`)
    res.status(400).json(errorResponse)

    return
  }

  // Validate ObjectIds if provided
  if (connectionId && (!ObjectId.isValid(connectionId))) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'connectionId must be a valid ObjectId string if provided',
      field: 'connectionId'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid connectionId field`)
    res.status(400).json(errorResponse)

    return
  }

  if (deviceId && (!ObjectId.isValid(deviceId))) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'deviceId must be a valid ObjectId string if provided',
      field: 'deviceId'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid deviceId field`)
    res.status(400).json(errorResponse)

    return
  }

  if (modelId && (!ObjectId.isValid(modelId))) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'modelId must be a valid ObjectId string if provided',
      field: 'modelId'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid modelId field`)
    res.status(400).json(errorResponse)

    return
  }

  next()
}

/**
 * Middleware to validate ObjectId in req.params with custom parameter name
 */
export const validateObjectIdParam = (paramName: string): RequestHandler => {
  return (req, res, next) => {
    const paramValue = req.params[paramName]

    if (!paramValue || !ObjectId.isValid(paramValue)) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid Input',
        message: `Invalid ObjectId format for parameter '${paramName}'`,
        field: paramName
      }

      logger.error(`${req.method} ${req.originalUrl} - invalid ObjectId format for ${paramName}: ${paramValue}`)
      res.status(400).json(errorResponse)

      return
    }

    next()
  }
}

/**
 * Middleware to validate that a string parameter exists and is not empty
 */
export const validateStringParam = (paramName: string): RequestHandler => {
  return (req, res, next) => {
    const paramValue = req.params[paramName]

    if (!paramValue || typeof paramValue !== 'string' || paramValue.trim().length === 0) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid Input',
        message: `Parameter '${paramName}' must be a non-empty string`,
        field: paramName
      }

      logger.error(`${req.method} ${req.originalUrl} - invalid string parameter ${paramName}: ${paramValue}`)
      res.status(400).json(errorResponse)

      return
    }

    next()
  }
}

/**
 * Middleware to validate required fields in request body
 */
export const validateRequiredFields = (fields: string[]): RequestHandler => {
  return (req, res, next) => {
    const missingFields: string[] = []

    for (const field of fields) {
      if (!(field in req.body) || req.body[field] === null || req.body[field] === undefined) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      const errorResponse: ErrorResponse = {
        error: 'Missing Required Fields',
        message: `The following required fields are missing: ${missingFields.join(', ')}`
      }

      logger.error(`${req.method} ${req.originalUrl} - missing required fields: ${missingFields.join(', ')}`)
      res.status(400).json(errorResponse)

      return
    }

    next()
  }
}

/**
 * Middleware to validate string fields in request body
 */
export const validateStringFields = (fields: string[], allowEmpty = false): RequestHandler => {
  return (req, res, next) => {
    const invalidFields: string[] = []

    for (const field of fields) {
      const value = req.body[field]

      if (value !== undefined && value !== null) {
        if (typeof value !== 'string' || (!allowEmpty && value.trim().length === 0)) {
          invalidFields.push(field)
        }
      }
    }

    if (invalidFields.length > 0) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid Field Types',
        message: `The following fields must be ${allowEmpty ? 'strings' : 'non-empty strings'}: ${invalidFields.join(', ')}`
      }

      logger.error(`${req.method} ${req.originalUrl} - invalid string fields: ${invalidFields.join(', ')}`)
      res.status(400).json(errorResponse)

      return
    }

    next()
  }
}

/**
 * Middleware to validate ObjectId fields in request body
 */
export const validateObjectIdFields = (fields: string[]): RequestHandler => {
  return (req, res, next) => {
    const invalidFields: string[] = []

    for (const field of fields) {
      const value = req.body[field]

      if (value !== undefined && value !== null) {
        if (typeof value !== 'string' || !ObjectId.isValid(value)) {
          invalidFields.push(field)
        }
      }
    }

    if (invalidFields.length > 0) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid ObjectId Fields',
        message: `The following fields must be valid ObjectId strings: ${invalidFields.join(', ')}`
      }

      logger.error(`${req.method} ${req.originalUrl} - invalid ObjectId fields: ${invalidFields.join(', ')}`)
      res.status(400).json(errorResponse)

      return
    }

    next()
  }
}

/**
 * Middleware to validate connection input
 */
export const validateConnectionInput: RequestHandler = (req, res, next) => {
  const { name, deviceIdFrom, deviceIdTo } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'name must be a non-empty string',
      field: 'name'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid name field`)
    res.status(400).json(errorResponse)

    return
  }

  if (!deviceIdFrom || !ObjectId.isValid(deviceIdFrom)) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'deviceIdFrom must be a valid ObjectId string',
      field: 'deviceIdFrom'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid deviceIdFrom field`)
    res.status(400).json(errorResponse)

    return
  }

  if (!deviceIdTo || !ObjectId.isValid(deviceIdTo)) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'deviceIdTo must be a valid ObjectId string',
      field: 'deviceIdTo'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid deviceIdTo field`)
    res.status(400).json(errorResponse)

    return
  }

  next()
}
