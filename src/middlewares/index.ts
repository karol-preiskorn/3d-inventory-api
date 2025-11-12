// Authentication middlewares
export { Permission, UserRole, optionalAuth, requireAdmin, requireAuth, requirePermission, requireRole } from './auth'

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
export { apiRateLimit, authRateLimit, corsErrorRecovery, corsOptions, ipWhitelist, requestTimeout, sanitizeInput, securityHeaders } from './security'

// Monitoring and observability middlewares
export { correlationMiddleware, generateCorrelationId, getCorrelationId } from '../middleware/correlation'
export { MonitoredDatabase, createMonitoredDatabase, databaseMonitor } from '../middleware/database-monitor'
export { AlertType, HealthStatus, getAlerts, getHealthCheck, healthMonitor } from '../middleware/health-alerting'
export { getMetrics, getPrometheusMetrics, metricsMiddleware } from '../middleware/metrics'
