import { RequestHandler } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { ObjectId } from 'mongodb'
import { formatValidationErrors } from '../utils/errors'
import getLogger from '../utils/logger'

const logger = getLogger('validation-middleware')

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: string
  message: string
  field?: string
}

/**
 * Attribute body interface for validation
 */
interface AttributeBody {
  value?: string
  attributeDictionaryId?: string
  connectionId?: string
  deviceId?: string
  modelId?: string
}

/**
 * Middleware to handle validation errors from express-validator
 */
export const handleValidationErrors: RequestHandler = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const validationError = formatValidationErrors(errors.array())

    throw validationError
  }
  next()
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
 * Express-validator-based ObjectId validation
 */
export const validateObjectIdParam = (paramName = 'id') => [
  param(paramName).custom((value: string) => {
    if (!ObjectId.isValid(value)) {
      throw new Error(`Invalid ObjectId format for ${paramName}`)
    }

    return true
  }),
  handleValidationErrors
]

/**
 * Device validation rules
 */
export const validateDeviceInput = [
  body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Name must be a string between 1 and 100 characters'),
  body('modelId').custom((value: string) => {
    if (!ObjectId.isValid(value)) {
      throw new Error('ModelId must be a valid ObjectId')
    }

    return true
  }),
  body('position.x').isNumeric().withMessage('Position x must be a number'),
  body('position.y').isNumeric().withMessage('Position y must be a number'),
  body('position.h').isNumeric().withMessage('Position h must be a number'),
  body('attributes').optional().isArray().withMessage('Attributes must be an array'),
  body('attributes.*.key').if(body('attributes').exists()).isString().isLength({ min: 1 }).withMessage('Attribute key must be a non-empty string'),
  body('attributes.*.value').if(body('attributes').exists()).isString().withMessage('Attribute value must be a string'),
  handleValidationErrors
]

/**
 * Device update validation rules (partial update)
 */
export const validateDeviceUpdate = [
  body('name').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Name must be a string between 1 and 100 characters'),
  body('modelId')
    .optional()
    .custom((value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('ModelId must be a valid ObjectId')
      }

      return true
    }),
  body('position.x').optional().isNumeric().withMessage('Position x must be a number'),
  body('position.y').optional().isNumeric().withMessage('Position y must be a number'),
  body('position.h').optional().isNumeric().withMessage('Position h must be a number'),
  body('attributes').optional().isArray().withMessage('Attributes must be an array'),
  handleValidationErrors
]

/**
 * Model validation rules
 */
export const validateModelInput = [
  body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Name must be a string between 1 and 100 characters'),
  body('type').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Type must be a string between 1 and 50 characters'),
  body('dimension.width').isNumeric().isFloat({ min: 0 }).withMessage('Dimension width must be a positive number'),
  body('dimension.height').isNumeric().isFloat({ min: 0 }).withMessage('Dimension height must be a positive number'),
  body('dimension.depth').isNumeric().isFloat({ min: 0 }).withMessage('Dimension depth must be a positive number'),
  body('texture.front').optional().isString().withMessage('Texture front must be a string'),
  body('texture.back').optional().isString().withMessage('Texture back must be a string'),
  body('texture.side').optional().isString().withMessage('Texture side must be a string'),
  body('texture.top').optional().isString().withMessage('Texture top must be a string'),
  body('texture.bottom').optional().isString().withMessage('Texture bottom must be a string'),
  handleValidationErrors
]

/**
 * Model update validation rules
 */
export const validateModelUpdate = [
  body('name').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Name must be a string between 1 and 100 characters'),
  body('type').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Type must be a string between 1 and 50 characters'),
  handleValidationErrors
]

/**
 * Dimension validation rules
 */
export const validateDimensionUpdate = [
  body('width').optional().isNumeric().isFloat({ min: 0 }).withMessage('Width must be a positive number'),
  body('height').optional().isNumeric().isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('depth').optional().isNumeric().isFloat({ min: 0 }).withMessage('Depth must be a positive number'),
  handleValidationErrors
]

/**
 * Texture validation rules
 */
export const validateTextureUpdate = [
  body('front').optional().isString().withMessage('Front texture must be a string'),
  body('back').optional().isString().withMessage('Back texture must be a string'),
  body('side').optional().isString().withMessage('Side texture must be a string'),
  body('top').optional().isString().withMessage('Top texture must be a string'),
  body('bottom').optional().isString().withMessage('Bottom texture must be a string'),
  handleValidationErrors
]

/**
 * Position validation rules
 */
export const validatePositionUpdate = [
  body('x').isNumeric().withMessage('Position x must be a number'),
  body('y').isNumeric().withMessage('Position y must be a number'),
  body('h').isNumeric().withMessage('Position h must be a number'),
  handleValidationErrors
]

/**
 * Pagination validation rules
 */
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100'),
  query('sortBy').optional().isString().withMessage('SortBy must be a string'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('SortOrder must be either "asc" or "desc"'),
  handleValidationErrors
]

/**
 * Enhanced attribute validation rules using express-validator
 */
export const validateAttributeInputEnhanced = [
  body('value').isString().isLength({ min: 1 }).withMessage('Value must be a non-empty string'),
  body('attributeDictionaryId').custom((value: string) => {
    if (!ObjectId.isValid(value)) {
      throw new Error('AttributeDictionaryId must be a valid ObjectId')
    }

    return true
  }),
  body('connectionId')
    .optional()
    .custom((value: string) => {
      if (value && !ObjectId.isValid(value)) {
        throw new Error('ConnectionId must be a valid ObjectId if provided')
      }

      return true
    }),
  body('deviceId')
    .optional()
    .custom((value: string) => {
      if (value && !ObjectId.isValid(value)) {
        throw new Error('DeviceId must be a valid ObjectId if provided')
      }

      return true
    }),
  body('modelId')
    .optional()
    .custom((value: string) => {
      if (value && !ObjectId.isValid(value)) {
        throw new Error('ModelId must be a valid ObjectId if provided')
      }

      return true
    }),
  // Custom validation to ensure at least one reference ID is provided
  body().custom((value: AttributeBody) => {
    if (!value.connectionId && !value.deviceId && !value.modelId) {
      throw new Error('At least one of connectionId, deviceId, or modelId must be provided')
    }

    return true
  }),
  handleValidationErrors
]

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
  if (connectionId && !ObjectId.isValid(connectionId)) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'connectionId must be a valid ObjectId string if provided',
      field: 'connectionId'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid connectionId field`)
    res.status(400).json(errorResponse)

    return
  }

  if (deviceId && !ObjectId.isValid(deviceId)) {
    const errorResponse: ErrorResponse = {
      error: 'Invalid Input',
      message: 'deviceId must be a valid ObjectId string if provided',
      field: 'deviceId'
    }

    logger.error(`${req.method} ${req.originalUrl} - invalid deviceId field`)
    res.status(400).json(errorResponse)

    return
  }

  if (modelId && !ObjectId.isValid(modelId)) {
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
