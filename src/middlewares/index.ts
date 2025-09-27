// Authentication middlewares
export { optionalAuth, Permission, requireAdmin, requireAuth, requirePermission, requireRole, UserRole } from './auth'

// Validation middlewares
export {
  handleValidationErrors,
  validateAttributeInput,
  validateAttributeInputEnhanced,
  validateConnectionInput,
  validateDeviceInput,
  validateDeviceUpdate,
  validateDimensionUpdate,
  validateModelInput,
  validateModelUpdate,
  validateObjectId,
  validateObjectIdFields,
  validateObjectIdParam,
  validatePagination,
  validatePositionUpdate,
  validateRequiredFields,
  validateStringFields,
  validateStringParam,
  validateTextureUpdate
} from './validation'

// Logging middlewares
export { errorLogger, performanceMonitor, requestLogger } from './logging'

// Security middlewares
export { apiRateLimit, authRateLimit, corsOptions, ipWhitelist, requestTimeout, sanitizeInput, securityHeaders } from './security'
