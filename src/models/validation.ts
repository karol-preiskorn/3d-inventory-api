/**
 * @file /models/validation.ts
 * @description Comprehensive validation schemas and functions for all models
 * @module models
 */

import { ObjectId } from 'mongodb'
import { VALIDATION_PATTERNS, VALIDATION_CONSTANTS } from './types'

// Generic validation result interface
export interface ValidationResult {
  isValid: boolean
  error?: string
  field?: string
}

// Base validation functions
export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required`, field: fieldName }
  }

  return { isValid: true }
}

export function validateString(value: unknown, fieldName: string, minLength = 0, maxLength = Infinity): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string`, field: fieldName }
  }

  const trimmed = value.trim()

  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long`, field: fieldName }
  }

  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters`, field: fieldName }
  }

  return { isValid: true }
}

export function validateNumber(value: unknown, fieldName: string, min = -Infinity, max = Infinity): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number`, field: fieldName }
  }

  if (value < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}`, field: fieldName }
  }

  if (value > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}`, field: fieldName }
  }

  return { isValid: true }
}

export function validateBoolean(value: unknown, fieldName: string): ValidationResult {
  if (typeof value !== 'boolean') {
    return { isValid: false, error: `${fieldName} must be a boolean`, field: fieldName }
  }

  return { isValid: true }
}

export function validateObjectId(value: unknown, fieldName: string): ValidationResult {
  if (typeof value !== 'string' || !ObjectId.isValid(value)) {
    return { isValid: false, error: `${fieldName} must be a valid ObjectId`, field: fieldName }
  }

  return { isValid: true }
}

export function validateEmail(value: unknown, fieldName: string): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string`, field: fieldName }
  }

  if (!VALIDATION_PATTERNS.EMAIL.test(value)) {
    return { isValid: false, error: `${fieldName} must be a valid email address`, field: fieldName }
  }

  return { isValid: true }
}

export function validateUrl(value: unknown, fieldName: string): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string`, field: fieldName }
  }

  try {
    new URL(value)

    return { isValid: true }
  } catch {
    return { isValid: false, error: `${fieldName} must be a valid URL`, field: fieldName }
  }
}

export function validateIpAddress(value: unknown, fieldName: string): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string`, field: fieldName }
  }

  if (!VALIDATION_PATTERNS.IPV4.test(value) && !VALIDATION_PATTERNS.IPV6.test(value)) {
    return { isValid: false, error: `${fieldName} must be a valid IP address`, field: fieldName }
  }

  return { isValid: true }
}

export function validateMacAddress(value: unknown, fieldName: string): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string`, field: fieldName }
  }

  if (!VALIDATION_PATTERNS.MAC_ADDRESS.test(value)) {
    return { isValid: false, error: `${fieldName} must be a valid MAC address`, field: fieldName }
  }

  return { isValid: true }
}

export function validateEnum<T>(value: unknown, fieldName: string, enumObject: Record<string, T>): ValidationResult {
  const validValues = Object.values(enumObject)

  if (!validValues.includes(value as T)) {
    return {
      isValid: false,
      error: `${fieldName} must be one of: ${validValues.join(', ')}`,
      field: fieldName
    }
  }

  return { isValid: true }
}

export function validateArray(value: unknown, fieldName: string, minLength = 0, maxLength = Infinity): ValidationResult {
  if (!Array.isArray(value)) {
    return { isValid: false, error: `${fieldName} must be an array`, field: fieldName }
  }

  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must have at least ${minLength} items`, field: fieldName }
  }

  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot have more than ${maxLength} items`, field: fieldName }
  }

  return { isValid: true }
}

export function validateDate(value: unknown, fieldName: string): ValidationResult {
  if (!(value instanceof Date) && typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a valid date`, field: fieldName }
  }

  const date = value instanceof Date ? value : new Date(value)

  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName} must be a valid date`, field: fieldName }
  }

  return { isValid: true }
}

export function validateDateRange(startDate: unknown, endDate: unknown, fieldName: string): ValidationResult {
  const startValidation = validateDate(startDate, `${fieldName}.startDate`)

  if (!startValidation.isValid) return startValidation

  const endValidation = validateDate(endDate, `${fieldName}.endDate`)

  if (!endValidation.isValid) return endValidation

  const start = startDate instanceof Date ? startDate : new Date(startDate as string)
  const end = endDate instanceof Date ? endDate : new Date(endDate as string)

  if (start >= end) {
    return { isValid: false, error: `${fieldName} start date must be before end date`, field: fieldName }
  }

  return { isValid: true }
}

export function validatePattern(value: unknown, fieldName: string, pattern: RegExp): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be a string`, field: fieldName }
  }

  if (!pattern.test(value)) {
    return { isValid: false, error: `${fieldName} format is invalid`, field: fieldName }
  }

  return { isValid: true }
}

export function validateObject(value: unknown, fieldName: string): ValidationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { isValid: false, error: `${fieldName} must be an object`, field: fieldName }
  }

  return { isValid: true }
}

// Composite validation function
export function validateMultiple(validations: ValidationResult[]): ValidationResult {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation
    }
  }

  return { isValid: true }
}

// Utility functions for validation
export function sanitizeInput(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim().replace(/[<>"/\\&]/g, '')
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeInput(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

export function validatePaginationParams(page?: number, limit?: number): ValidationResult {
  if (page !== undefined) {
    const pageValidation = validateNumber(page, 'page', 1, 10000)

    if (!pageValidation.isValid) return pageValidation
  }

  if (limit !== undefined) {
    const limitValidation = validateNumber(limit, 'limit', 1, VALIDATION_CONSTANTS.MAX_PAGINATION_LIMIT)

    if (!limitValidation.isValid) return limitValidation
  }

  return { isValid: true }
}

export function validateSortParams(sortBy?: string, sortOrder?: string): ValidationResult {
  if (sortBy !== undefined) {
    const sortByValidation = validateString(sortBy, 'sortBy', 1, 50)

    if (!sortByValidation.isValid) return sortByValidation
  }

  if (sortOrder !== undefined) {
    const validOrders = ['asc', 'desc']

    if (!validOrders.includes(sortOrder)) {
      return { isValid: false, error: 'sortOrder must be "asc" or "desc"', field: 'sortOrder' }
    }
  }

  return { isValid: true }
}

export function validateSearchParams(query?: string, limit?: number): ValidationResult {
  if (query !== undefined) {
    const queryValidation = validateString(query, 'query', 1, 500)

    if (!queryValidation.isValid) return queryValidation
  }

  if (limit !== undefined) {
    const limitValidation = validateNumber(limit, 'limit', 1, 1000)

    if (!limitValidation.isValid) return limitValidation
  }

  return { isValid: true }
}

// Batch validation for arrays of objects
export function validateBatch<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): { isValid: boolean; errors: Array<{ index: number; error: string }> } {
  const errors: Array<{ index: number; error: string }> = []

  for (let i = 0; i < items.length; i++) {
    const result = validator(items[i])

    if (!result.isValid) {
      errors.push({ index: i, error: result.error || 'Validation failed' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Field-level validation helpers
export const FieldValidators = {
  username: (value: unknown) => validateString(value, 'username', 3, 50),
  password: (value: unknown) => validateString(value, 'password', 8, 128),
  email: (value: unknown) => validateEmail(value, 'email'),
  name: (value: unknown) => validateString(value, 'name', 2, 100),
  description: (value: unknown) => validateString(value, 'description', 0, 2000),
  objectId: (value: unknown) => validateObjectId(value, 'id'),
  positiveNumber: (value: unknown) => validateNumber(value, 'number', 0),
  percentage: (value: unknown) => validateNumber(value, 'percentage', 0, 100),
  port: (value: unknown) => validateNumber(value, 'port', 1, 65535),
  ipAddress: (value: unknown) => validateIpAddress(value, 'ipAddress'),
  macAddress: (value: unknown) => validateMacAddress(value, 'macAddress'),
  url: (value: unknown) => validateUrl(value, 'url')
}
