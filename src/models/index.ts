/**
 * @file /models/index.ts
 * @description Central export file for all models, types, and validation utilities
 * @module models
 */

// User and Role models
export * from './User'
export * from './Role'

// Core inventory models
export * from './Device'
export * from './Model'
export * from './Connection'
export * from './Attribute'
export * from './Floor'
export * from './Log'

// Shared types and utilities
export * from './types'
export * from './validation'

// Re-export commonly used interfaces with clear naming
export type {
  User,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse
} from './User'

export type {
  Role,
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest
} from './Role'

export type {
  Device,
  DeviceResponse,
  CreateDeviceRequest,
  UpdateDeviceRequest,
  Position,
  DeviceAttribute
} from './Device'

export type {
  Model,
  ModelResponse,
  CreateModelRequest,
  UpdateModelRequest,
  Dimension,
  Texture,
  ModelSpecification
} from './Model'

export type {
  Connection,
  ConnectionResponse,
  CreateConnectionRequest,
  UpdateConnectionRequest,
  ConnectionAttribute
} from './Connection'

export type {
  Attribute,
  AttributeResponse,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  AttributeValidation
} from './Attribute'

export type {
  Floor,
  FloorResponse,
  CreateFloorRequest,
  UpdateFloorRequest,
  Address,
  FloorDimension,
  FloorCapacity,
  EnvironmentalConditions
} from './Floor'

export type {
  Log,
  LogResponse,
  CreateLogRequest,
  LogQueryParams,
  LogDetails
} from './Log'

// Re-export key enums for easy access
export {
  UserRole,
  Permission
} from '../middlewares/auth'

export {
  DeviceStatus,
  DeviceType,
  DeviceCategory
} from './Device'

export {
  ModelType,
  ModelCategory
} from './Model'

export {
  ConnectionType,
  ConnectionCategory,
  ConnectionStatus,
  NetworkProtocol
} from './Connection'

export {
  AttributeValueType,
  AttributeComponent,
  AttributeCategory
} from './Attribute'

export {
  FloorType,
  FloorStatus,
  DimensionType
} from './Floor'

export {
  LogOperation,
  LogComponent,
  LogStatus,
  LogSeverity
} from './Log'

export {
  CommonStatus,
  Priority,
  Category,
  TemperatureUnit,
  PowerUnit,
  DistanceUnit,
  WeightUnit,
  AreaUnit,
  VolumeUnit,
  DataUnit,
  BandwidthUnit,
  TimeUnit,
  ResponseStatus,
  ErrorType,
  SortOrder,
  HealthStatus
} from './types'

// Re-export validation utilities
export {
  validateRequired,
  validateString,
  validateNumber,
  validateBoolean,
  validateObjectId,
  validateEmail,
  validateUrl,
  validateIpAddress,
  validateMacAddress,
  validateEnum,
  validateArray,
  validateDate,
  validateDateRange,
  validatePattern,
  validateObject,
  validateMultiple,
  sanitizeInput,
  validatePaginationParams,
  validateSortParams,
  validateSearchParams,
  validateBatch,
  FieldValidators
} from './validation'

export type {
  ValidationResult
} from './validation'

// Re-export commonly used types
export type {
  PaginationParams,
  PaginatedResponse,
  DateRange,
  Coordinates,
  Position as GenericPosition,
  Metadata,
  AuditInfo,
  HealthCheck,
  SearchFilters,
  SortOption
} from './types'

// Export validation constants and patterns
export {
  VALIDATION_PATTERNS,
  VALIDATION_CONSTANTS
} from './types'

// Export utility functions
export {
  UnitConverter,
  generateId,
  formatBytes,
  isValidEmail,
  isValidUrl,
  isValidIPv4,
  isValidMacAddress,
  sanitizeString,
  truncateString,
  capitalizeFirstLetter,
  formatTimestamp
} from './types'

// Model transformation utilities
export {
  toUserResponse
} from './User'

export {
  toRoleResponse as transformRoleResponse
} from './Role'

export {
  toDeviceResponse as transformDeviceResponse,
  createDeviceFromRequest,
  updateDeviceFromRequest,
  validateDeviceInput,
  validateDeviceAttributes
} from './Device'

export {
  toModelResponse as transformModelResponse,
  createModelFromRequest,
  updateModelFromRequest,
  validateModelInput,
  validateDimension,
  validateTexture,
  validateModelSpecifications,
  getDefaultTexture
} from './Model'

export {
  toConnectionResponse as transformConnectionResponse,
  createConnectionFromRequest,
  updateConnectionFromRequest,
  validateConnectionInput,
  validateConnectionAttributes,
  getConnectionDisplayName,
  isConnectionBidirectional,
  getConnectionCapacity
} from './Connection'

export {
  toAttributeResponse as transformAttributeResponse,
  createAttributeFromRequest,
  updateAttributeFromRequest,
  validateAttributeInput,
  validateAttributeValue,
  validateAttributeValidation,
  getFormattedValue,
  sortAttributesByDisplayOrder
} from './Attribute'

export {
  toFloorResponse as transformFloorResponse,
  createFloorFromRequest,
  updateFloorFromRequest,
  validateFloorInput,
  validateAddress,
  validateFloorDimensions,
  validateSingleDimension,
  getFloorDisplayName,
  calculateFloorUtilization,
  getAvailableSpace
} from './Floor'

export {
  toLogResponse as transformLogResponse,
  createLogFromRequest,
  validateLogInput,
  validateLogDetails,
  validateLogQueryParams,
  getLogSummary,
  getLogSeverityColor,
  getLogDurationFormatted,
  isLogCritical,
  groupLogsByComponent,
  getLogStatistics
} from './Log'

// Model validation constants for easy access
export {
  USER_VALIDATION
} from './User'

export {
  DEFAULT_ROLES
} from './Role'

export {
  DEVICE_VALIDATION
} from './Device'

export {
  MODEL_VALIDATION,
  DEFAULT_TEXTURE_PATHS
} from './Model'

export {
  CONNECTION_VALIDATION
} from './Connection'

export {
  ATTRIBUTE_VALIDATION
} from './Attribute'

export {
  FLOOR_VALIDATION
} from './Floor'

export {
  LOG_VALIDATION
} from './Log'
