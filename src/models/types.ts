/**
 * @file /models/types.ts
 * @description Shared types, enums, and constants used across models
 * @module models
 */

// Common status types used across multiple models
export enum CommonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  PLANNED = 'planned',
  DECOMMISSIONED = 'decommissioned',
}

// Priority levels for various operations
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Common categories for classification
export enum Category {
  INFRASTRUCTURE = 'Infrastructure',
  HARDWARE = 'Hardware',
  SOFTWARE = 'Software',
  NETWORK = 'Network',
  SECURITY = 'Security',
  FACILITY = 'Facility',
  POWER = 'Power',
  COOLING = 'Cooling',
}

// Environmental units
export enum TemperatureUnit {
  CELSIUS = 'C',
  FAHRENHEIT = 'F',
  KELVIN = 'K',
}

export enum PowerUnit {
  WATTS = 'W',
  KILOWATTS = 'kW',
  MEGAWATTS = 'MW',
  BTU = 'BTU',
}

export enum DistanceUnit {
  MILLIMETERS = 'mm',
  CENTIMETERS = 'cm',
  METERS = 'm',
  INCHES = 'in',
  FEET = 'ft',
}

export enum WeightUnit {
  GRAMS = 'g',
  KILOGRAMS = 'kg',
  POUNDS = 'lbs',
  OUNCES = 'oz',
}

export enum AreaUnit {
  SQUARE_METERS = 'm²',
  SQUARE_FEET = 'ft²',
  SQUARE_INCHES = 'in²',
}

export enum VolumeUnit {
  CUBIC_METERS = 'm³',
  CUBIC_FEET = 'ft³',
  LITERS = 'L',
  GALLONS = 'gal',
}

// Data and network units
export enum DataUnit {
  BITS = 'bits',
  BYTES = 'B',
  KILOBYTES = 'KB',
  MEGABYTES = 'MB',
  GIGABYTES = 'GB',
  TERABYTES = 'TB',
  PETABYTES = 'PB',
}

export enum BandwidthUnit {
  BPS = 'bps',
  KBPS = 'Kbps',
  MBPS = 'Mbps',
  GBPS = 'Gbps',
}

// Time units
export enum TimeUnit {
  MILLISECONDS = 'ms',
  SECONDS = 's',
  MINUTES = 'min',
  HOURS = 'h',
  DAYS = 'd',
  WEEKS = 'w',
  MONTHS = 'mo',
  YEARS = 'y',
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IPV6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  URL: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]+$/,
  HOSTNAME: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  SEMANTIC_VERSION:
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
}

// Common validation constants
export const VALIDATION_CONSTANTS = {
  // String lengths
  SHORT_STRING_MIN: 1,
  SHORT_STRING_MAX: 50,
  MEDIUM_STRING_MIN: 1,
  MEDIUM_STRING_MAX: 100,
  LONG_STRING_MIN: 1,
  LONG_STRING_MAX: 500,
  TEXT_AREA_MIN: 1,
  TEXT_AREA_MAX: 2000,

  // Numeric ranges
  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,
  POSITIVE_NUMBER_MIN: 0,
  COORDINATE_MIN: -999999,
  COORDINATE_MAX: 999999,

  // Array limits
  MAX_ARRAY_SIZE: 1000,
  MAX_TAGS: 50,
  MAX_ATTRIBUTES: 100,

  // File and media
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB

  // Database limits
  MAX_PAGINATION_LIMIT: 1000,
  DEFAULT_PAGINATION_LIMIT: 50,
  MIN_PAGINATION_LIMIT: 1
}

// Response status codes
export enum ResponseStatus {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// Common error types
export enum ErrorType {
  VALIDATION_ERROR = 'ValidationError',
  NOT_FOUND_ERROR = 'NotFoundError',
  DUPLICATE_ERROR = 'DuplicateError',
  PERMISSION_ERROR = 'PermissionError',
  AUTHENTICATION_ERROR = 'AuthenticationError',
  NETWORK_ERROR = 'NetworkError',
  DATABASE_ERROR = 'DatabaseError',
  CONFIGURATION_ERROR = 'ConfigurationError',
  BUSINESS_LOGIC_ERROR = 'BusinessLogicError',
}

// Sorting options
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface SortOption {
  field: string;
  order: SortOrder;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Date range interface
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Coordinate system
export interface Coordinates {
  x: number;
  y: number;
  z?: number;
}

export interface Position extends Coordinates {
  rotation?: number;
  scale?: number;
}

// Common metadata structure
export interface Metadata {
  version?: string;
  tags?: string[];
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  customFields?: Record<string, unknown>;
}

// Audit trail interface
export interface AuditInfo {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
}

// Health status for monitoring
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

export interface HealthCheck {
  status: HealthStatus;
  message?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

// Common search filters
export interface SearchFilters {
  query?: string;
  status?: string[];
  category?: string[];
  tags?: string[];
  dateRange?: DateRange;
  isActive?: boolean;
}

// Unit conversion utilities
export class UnitConverter {
  static temperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
    if (from === to) return value

    // Convert to Celsius first
    let celsius: number

    switch (from) {
    case TemperatureUnit.FAHRENHEIT:
      celsius = ((value - 32) * 5) / 9
      break
    case TemperatureUnit.KELVIN:
      celsius = value - 273.15
      break
    default:
      celsius = value
    }

    // Convert from Celsius to target
    switch (to) {
    case TemperatureUnit.FAHRENHEIT:
      return (celsius * 9) / 5 + 32
    case TemperatureUnit.KELVIN:
      return celsius + 273.15
    default:
      return celsius
    }
  }

  static distance(value: number, from: DistanceUnit, to: DistanceUnit): number {
    if (from === to) return value

    // Convert to meters first
    let meters: number

    switch (from) {
    case DistanceUnit.MILLIMETERS:
      meters = value / 1000
      break
    case DistanceUnit.CENTIMETERS:
      meters = value / 100
      break
    case DistanceUnit.INCHES:
      meters = value * 0.0254
      break
    case DistanceUnit.FEET:
      meters = value * 0.3048
      break
    default:
      meters = value
    }

    // Convert from meters to target
    switch (to) {
    case DistanceUnit.MILLIMETERS:
      return meters * 1000
    case DistanceUnit.CENTIMETERS:
      return meters * 100
    case DistanceUnit.INCHES:
      return meters / 0.0254
    case DistanceUnit.FEET:
      return meters / 0.3048
    default:
      return meters
    }
  }

  static weight(value: number, from: WeightUnit, to: WeightUnit): number {
    if (from === to) return value

    // Convert to kilograms first
    let kilograms: number

    switch (from) {
    case WeightUnit.GRAMS:
      kilograms = value / 1000
      break
    case WeightUnit.POUNDS:
      kilograms = value * 0.453592
      break
    case WeightUnit.OUNCES:
      kilograms = value * 0.0283495
      break
    default:
      kilograms = value
    }

    // Convert from kilograms to target
    switch (to) {
    case WeightUnit.GRAMS:
      return kilograms * 1000
    case WeightUnit.POUNDS:
      return kilograms / 0.453592
    case WeightUnit.OUNCES:
      return kilograms / 0.0283495
    default:
      return kilograms
    }
  }
}

// Utility functions
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.EMAIL.test(email)
}

export function isValidUrl(url: string): boolean {
  return VALIDATION_PATTERNS.URL.test(url)
}

export function isValidIPv4(ip: string): boolean {
  return VALIDATION_PATTERNS.IPV4.test(ip)
}

export function isValidMacAddress(mac: string): boolean {
  return VALIDATION_PATTERNS.MAC_ADDRESS.test(mac)
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>"/\\&]/g, '')
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str

  return str.substring(0, maxLength - 3) + '...'
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function formatTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19)
}
