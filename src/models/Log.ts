/**
 * @file /models/Log.ts
 * @description Log model interface and validation for audit trails and system monitoring
 * @module models
 */

import { ObjectId } from 'mongodb'

export interface Log {
  _id?: ObjectId;
  objectId: ObjectId;
  operation: LogOperation;
  component: LogComponent;
  timestamp: Date;
  userId?: ObjectId;
  username?: string;
  userIP?: string;
  userAgent?: string;
  details?: LogDetails;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  status: LogStatus;
  severity: LogSeverity;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  requestId?: string;
  createdAt: Date;
}

export interface LogDetails {
  description?: string;
  affectedFields?: string[];
  reason?: string;
  source?: string;
  additionalInfo?: Record<string, unknown>;
}

export interface CreateLogRequest {
  objectId: string;
  operation: LogOperation;
  component: LogComponent;
  userId?: string;
  username?: string;
  userIP?: string;
  userAgent?: string;
  details?: LogDetails;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  status?: LogStatus;
  severity?: LogSeverity;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  requestId?: string;
}

export interface LogResponse {
  _id: ObjectId;
  objectId: ObjectId;
  operation: LogOperation;
  component: LogComponent;
  timestamp: Date;
  userId?: ObjectId;
  username?: string;
  userIP?: string;
  userAgent?: string;
  details?: LogDetails;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  status: LogStatus;
  severity: LogSeverity;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  requestId?: string;
  createdAt: Date;
}

export interface LogQueryParams {
  component?: LogComponent;
  operation?: LogOperation;
  status?: LogStatus;
  severity?: LogSeverity;
  objectId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export enum LogOperation {
  CREATE = 'Create',
  READ = 'Read',
  UPDATE = 'Update',
  DELETE = 'Delete',
  LOGIN = 'Login',
  LOGOUT = 'Logout',
  BACKUP = 'Backup',
  RESTORE = 'Restore',
  IMPORT = 'Import',
  EXPORT = 'Export',
  SYNC = 'Sync',
  MAINTENANCE = 'Maintenance',
  CONFIGURATION = 'Configuration',
  DEPLOYMENT = 'Deployment',
}

export enum LogComponent {
  DEVICES = 'Devices',
  MODELS = 'Models',
  CONNECTIONS = 'Connections',
  FLOORS = 'Floors',
  ATTRIBUTES = 'Attributes',
  USERS = 'Users',
  ROLES = 'Roles',
  AUTH = 'Authentication',
  SYSTEM = 'System',
  API = 'API',
  DATABASE = 'Database',
  SECURITY = 'Security',
}

export enum LogStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum LogSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Log validation constants
export const LOG_VALIDATION = {
  USERNAME_MAX_LENGTH: 100,
  USER_IP_MAX_LENGTH: 45, // IPv6 max length
  USER_AGENT_MAX_LENGTH: 500,
  ERROR_MAX_LENGTH: 2000,
  SESSION_ID_MAX_LENGTH: 100,
  REQUEST_ID_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  REASON_MAX_LENGTH: 500,
  SOURCE_MAX_LENGTH: 200,
  DURATION_MIN: 0,
  DURATION_MAX: 3600000, // 1 hour in milliseconds
  MAX_AFFECTED_FIELDS: 100,
  AFFECTED_FIELD_MAX_LENGTH: 100
}

// Validation functions
export function validateLogInput(data: Partial<CreateLogRequest>): { isValid: boolean; error?: string } {
  const { objectId, operation, component } = data

  if (!objectId || !ObjectId.isValid(objectId)) {
    return { isValid: false, error: 'Valid objectId is required' }
  }

  if (!operation || !Object.values(LogOperation).includes(operation)) {
    return { isValid: false, error: 'Valid operation is required' }
  }

  if (!component || !Object.values(LogComponent).includes(component)) {
    return { isValid: false, error: 'Valid component is required' }
  }

  // Validate optional fields
  if (data.userId && !ObjectId.isValid(data.userId)) {
    return { isValid: false, error: 'Invalid userId format' }
  }

  if (data.username && (typeof data.username !== 'string' || data.username.length > LOG_VALIDATION.USERNAME_MAX_LENGTH)) {
    return { isValid: false, error: `Username cannot exceed ${LOG_VALIDATION.USERNAME_MAX_LENGTH} characters` }
  }

  if (data.userIP && (typeof data.userIP !== 'string' || data.userIP.length > LOG_VALIDATION.USER_IP_MAX_LENGTH)) {
    return { isValid: false, error: `User IP cannot exceed ${LOG_VALIDATION.USER_IP_MAX_LENGTH} characters` }
  }

  if (data.userAgent && (typeof data.userAgent !== 'string' || data.userAgent.length > LOG_VALIDATION.USER_AGENT_MAX_LENGTH)) {
    return { isValid: false, error: `User agent cannot exceed ${LOG_VALIDATION.USER_AGENT_MAX_LENGTH} characters` }
  }

  if (data.error && (typeof data.error !== 'string' || data.error.length > LOG_VALIDATION.ERROR_MAX_LENGTH)) {
    return { isValid: false, error: `Error message cannot exceed ${LOG_VALIDATION.ERROR_MAX_LENGTH} characters` }
  }

  if (data.sessionId && (typeof data.sessionId !== 'string' || data.sessionId.length > LOG_VALIDATION.SESSION_ID_MAX_LENGTH)) {
    return { isValid: false, error: `Session ID cannot exceed ${LOG_VALIDATION.SESSION_ID_MAX_LENGTH} characters` }
  }

  if (data.requestId && (typeof data.requestId !== 'string' || data.requestId.length > LOG_VALIDATION.REQUEST_ID_MAX_LENGTH)) {
    return { isValid: false, error: `Request ID cannot exceed ${LOG_VALIDATION.REQUEST_ID_MAX_LENGTH} characters` }
  }

  if (data.duration !== undefined) {
    if (typeof data.duration !== 'number' || data.duration < LOG_VALIDATION.DURATION_MIN || data.duration > LOG_VALIDATION.DURATION_MAX) {
      return { isValid: false, error: `Duration must be between ${LOG_VALIDATION.DURATION_MIN} and ${LOG_VALIDATION.DURATION_MAX} milliseconds` }
    }
  }

  if (data.status && !Object.values(LogStatus).includes(data.status)) {
    return { isValid: false, error: 'Invalid status value' }
  }

  if (data.severity && !Object.values(LogSeverity).includes(data.severity)) {
    return { isValid: false, error: 'Invalid severity value' }
  }

  // Validate details if provided
  if (data.details) {
    const detailsValidation = validateLogDetails(data.details)

    if (!detailsValidation.isValid) {
      return detailsValidation
    }
  }

  return { isValid: true }
}

export function validateLogDetails(details: LogDetails): { isValid: boolean; error?: string } {
  if (details.description && (typeof details.description !== 'string' || details.description.length > LOG_VALIDATION.DESCRIPTION_MAX_LENGTH)) {
    return { isValid: false, error: `Description cannot exceed ${LOG_VALIDATION.DESCRIPTION_MAX_LENGTH} characters` }
  }

  if (details.reason && (typeof details.reason !== 'string' || details.reason.length > LOG_VALIDATION.REASON_MAX_LENGTH)) {
    return { isValid: false, error: `Reason cannot exceed ${LOG_VALIDATION.REASON_MAX_LENGTH} characters` }
  }

  if (details.source && (typeof details.source !== 'string' || details.source.length > LOG_VALIDATION.SOURCE_MAX_LENGTH)) {
    return { isValid: false, error: `Source cannot exceed ${LOG_VALIDATION.SOURCE_MAX_LENGTH} characters` }
  }

  if (details.affectedFields) {
    if (!Array.isArray(details.affectedFields)) {
      return { isValid: false, error: 'Affected fields must be an array' }
    }

    if (details.affectedFields.length > LOG_VALIDATION.MAX_AFFECTED_FIELDS) {
      return { isValid: false, error: `Cannot exceed ${LOG_VALIDATION.MAX_AFFECTED_FIELDS} affected fields` }
    }

    for (const field of details.affectedFields) {
      if (typeof field !== 'string' || field.length > LOG_VALIDATION.AFFECTED_FIELD_MAX_LENGTH) {
        return { isValid: false, error: `Affected field name cannot exceed ${LOG_VALIDATION.AFFECTED_FIELD_MAX_LENGTH} characters` }
      }
    }
  }

  return { isValid: true }
}

export function validateLogQueryParams(params: LogQueryParams): { isValid: boolean; error?: string } {
  if (params.component && !Object.values(LogComponent).includes(params.component)) {
    return { isValid: false, error: 'Invalid component filter' }
  }

  if (params.operation && !Object.values(LogOperation).includes(params.operation)) {
    return { isValid: false, error: 'Invalid operation filter' }
  }

  if (params.status && !Object.values(LogStatus).includes(params.status)) {
    return { isValid: false, error: 'Invalid status filter' }
  }

  if (params.severity && !Object.values(LogSeverity).includes(params.severity)) {
    return { isValid: false, error: 'Invalid severity filter' }
  }

  if (params.objectId && !ObjectId.isValid(params.objectId)) {
    return { isValid: false, error: 'Invalid objectId format' }
  }

  if (params.userId && !ObjectId.isValid(params.userId)) {
    return { isValid: false, error: 'Invalid userId format' }
  }

  if (params.limit !== undefined && (typeof params.limit !== 'number' || params.limit < 1 || params.limit > 1000)) {
    return { isValid: false, error: 'Limit must be between 1 and 1000' }
  }

  if (params.offset !== undefined && (typeof params.offset !== 'number' || params.offset < 0)) {
    return { isValid: false, error: 'Offset must be a non-negative number' }
  }

  if (params.sortOrder && !['asc', 'desc'].includes(params.sortOrder)) {
    return { isValid: false, error: 'Sort order must be "asc" or "desc"' }
  }

  if (params.startDate && params.endDate && params.startDate > params.endDate) {
    return { isValid: false, error: 'Start date cannot be after end date' }
  }

  return { isValid: true }
}

// Convert Log to LogResponse
export function toLogResponse(log: Log): LogResponse {
  if (!log._id) {
    throw new Error('Log _id is required to create LogResponse')
  }

  return {
    _id: log._id,
    objectId: log.objectId,
    operation: log.operation,
    component: log.component,
    timestamp: log.timestamp,
    userId: log.userId,
    username: log.username,
    userIP: log.userIP,
    userAgent: log.userAgent,
    details: log.details,
    oldData: log.oldData,
    newData: log.newData,
    status: log.status,
    severity: log.severity,
    duration: log.duration,
    error: log.error,
    metadata: log.metadata,
    sessionId: log.sessionId,
    requestId: log.requestId,
    createdAt: log.createdAt
  }
}

// Helper functions
export function createLogFromRequest(request: CreateLogRequest): Omit<Log, '_id' | 'createdAt'> {
  const now = new Date()

  return {
    objectId: new ObjectId(request.objectId),
    operation: request.operation,
    component: request.component,
    timestamp: now,
    userId: request.userId ? new ObjectId(request.userId) : undefined,
    username: request.username?.trim(),
    userIP: request.userIP?.trim(),
    userAgent: request.userAgent?.trim(),
    details: request.details,
    oldData: request.oldData,
    newData: request.newData,
    status: request.status || LogStatus.SUCCESS,
    severity: request.severity || LogSeverity.LOW,
    duration: request.duration,
    error: request.error?.trim(),
    metadata: request.metadata,
    sessionId: request.sessionId?.trim(),
    requestId: request.requestId?.trim()
  }
}

// Utility functions
export function getLogSummary(log: Log): string {
  const userInfo = log.username ? ` by ${log.username}` : ''
  const statusInfo = log.status !== LogStatus.SUCCESS ? ` (${log.status})` : ''

  return `${log.operation} ${log.component}${userInfo}${statusInfo}`
}

export function getLogSeverityColor(severity: LogSeverity): string {
  switch (severity) {
  case LogSeverity.LOW:
    return '#28a745' // Green
  case LogSeverity.MEDIUM:
    return '#ffc107' // Yellow
  case LogSeverity.HIGH:
    return '#fd7e14' // Orange
  case LogSeverity.CRITICAL:
    return '#dc3545' // Red
  default:
    return '#6c757d' // Gray
  }
}

export function getLogDurationFormatted(duration?: number): string {
  if (!duration) {
    return 'N/A'
  }

  if (duration < 1000) {
    return `${duration}ms`
  }

  if (duration < 60000) {
    return `${(duration / 1000).toFixed(2)}s`
  }

  return `${(duration / 60000).toFixed(2)}m`
}

export function isLogCritical(log: Log): boolean {
  return (
    log.severity === LogSeverity.CRITICAL || log.status === LogStatus.FAILURE || (log.component === LogComponent.SECURITY && log.status !== LogStatus.SUCCESS)
  )
}

// Log aggregation helpers
export function groupLogsByComponent(logs: Log[]): Record<LogComponent, Log[]> {
  return logs.reduce(
    (groups, log) => {
      if (!groups[log.component]) {
        groups[log.component] = []
      }
      groups[log.component].push(log)

      return groups
    },
    {} as Record<LogComponent, Log[]>
  )
}

export function getLogStatistics(logs: Log[]): {
  total: number;
  byStatus: Record<LogStatus, number>;
  bySeverity: Record<LogSeverity, number>;
  byComponent: Record<LogComponent, number>;
  averageDuration: number;
  errorRate: number;
} {
  const stats = {
    total: logs.length,
    byStatus: {} as Record<LogStatus, number>,
    bySeverity: {} as Record<LogSeverity, number>,
    byComponent: {} as Record<LogComponent, number>,
    averageDuration: 0,
    errorRate: 0
  }

  if (logs.length === 0) {
    return stats
  }

  let totalDuration = 0
  let errorCount = 0
  let durationCount = 0

  for (const log of logs) {
    // Count by status
    stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1

    // Count by severity
    stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1

    // Count by component
    stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1

    // Calculate duration
    if (log.duration !== undefined) {
      totalDuration += log.duration
      durationCount++
    }

    // Count errors
    if (log.status === LogStatus.FAILURE || log.severity === LogSeverity.CRITICAL) {
      errorCount++
    }
  }

  stats.averageDuration = durationCount > 0 ? totalDuration / durationCount : 0
  stats.errorRate = (errorCount / logs.length) * 100

  return stats
}
