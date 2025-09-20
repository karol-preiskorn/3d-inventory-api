/**
 * @file /models/Attribute.ts
 * @description Attribute model interface and validation for flexible metadata management
 * @module models
 */

import { ObjectId } from 'mongodb'

export interface Attribute {
  _id?: ObjectId;
  name: string;
  key: string;
  value: string;
  type: AttributeValueType;
  component: AttributeComponent;
  entityId: ObjectId;
  category?: string;
  unit?: string;
  description?: string;
  isRequired: boolean;
  isSystem: boolean;
  isActive: boolean;
  validation?: AttributeValidation;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttributeValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  allowedValues?: string[];
}

export interface CreateAttributeRequest {
  name: string;
  key: string;
  value: string;
  type: AttributeValueType;
  component: AttributeComponent;
  entityId: string;
  category?: string;
  unit?: string;
  description?: string;
  isRequired?: boolean;
  isSystem?: boolean;
  isActive?: boolean;
  validation?: AttributeValidation;
  displayOrder?: number;
}

export interface UpdateAttributeRequest {
  name?: string;
  key?: string;
  value?: string;
  type?: AttributeValueType;
  component?: AttributeComponent;
  entityId?: string;
  category?: string;
  unit?: string;
  description?: string;
  isRequired?: boolean;
  isSystem?: boolean;
  isActive?: boolean;
  validation?: AttributeValidation;
  displayOrder?: number;
}

export interface AttributeResponse {
  _id: ObjectId;
  name: string;
  key: string;
  value: string;
  type: AttributeValueType;
  component: AttributeComponent;
  entityId: ObjectId;
  category?: string;
  unit?: string;
  description?: string;
  isRequired: boolean;
  isSystem: boolean;
  isActive: boolean;
  validation?: AttributeValidation;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum AttributeValueType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date',
  OBJECT = 'Object',
  ARRAY = 'Array',
  URL = 'URL',
  EMAIL = 'Email',
  IP_ADDRESS = 'IPAddress',
  MAC_ADDRESS = 'MACAddress',
}

export enum AttributeComponent {
  DEVICES = 'Devices',
  MODELS = 'Models',
  CONNECTIONS = 'Connections',
  FLOORS = 'Floors',
  USERS = 'Users',
}

export enum AttributeCategory {
  TECHNICAL = 'Technical',
  PHYSICAL = 'Physical',
  NETWORK = 'Network',
  POWER = 'Power',
  ENVIRONMENTAL = 'Environmental',
  BUSINESS = 'Business',
  SECURITY = 'Security',
  MAINTENANCE = 'Maintenance',
}

// Attribute validation constants
export const ATTRIBUTE_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  KEY_MIN_LENGTH: 2,
  KEY_MAX_LENGTH: 100,
  VALUE_MAX_LENGTH: 2000,
  CATEGORY_MAX_LENGTH: 50,
  UNIT_MAX_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 500,
  PATTERN_MAX_LENGTH: 200,
  MAX_ALLOWED_VALUES: 100,
  ALLOWED_VALUE_MAX_LENGTH: 100,
  DISPLAY_ORDER_MIN: 0,
  DISPLAY_ORDER_MAX: 9999
}

// Validation functions
export function validateAttributeInput(data: Partial<CreateAttributeRequest>): { isValid: boolean; error?: string } {
  const { name, key, value, type, component, entityId } = data

  if (!name || typeof name !== 'string' || name.trim().length < ATTRIBUTE_VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${ATTRIBUTE_VALIDATION.NAME_MIN_LENGTH} characters long` }
  }

  if (name.length > ATTRIBUTE_VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, error: `Name cannot exceed ${ATTRIBUTE_VALIDATION.NAME_MAX_LENGTH} characters` }
  }

  if (!key || typeof key !== 'string' || key.trim().length < ATTRIBUTE_VALIDATION.KEY_MIN_LENGTH) {
    return { isValid: false, error: `Key must be at least ${ATTRIBUTE_VALIDATION.KEY_MIN_LENGTH} characters long` }
  }

  if (key.length > ATTRIBUTE_VALIDATION.KEY_MAX_LENGTH) {
    return { isValid: false, error: `Key cannot exceed ${ATTRIBUTE_VALIDATION.KEY_MAX_LENGTH} characters` }
  }

  if (!value || typeof value !== 'string') {
    return { isValid: false, error: 'Value is required and must be a string' }
  }

  if (value.length > ATTRIBUTE_VALIDATION.VALUE_MAX_LENGTH) {
    return { isValid: false, error: `Value cannot exceed ${ATTRIBUTE_VALIDATION.VALUE_MAX_LENGTH} characters` }
  }

  if (!type || !Object.values(AttributeValueType).includes(type)) {
    return { isValid: false, error: 'Valid attribute type is required' }
  }

  if (!component || !Object.values(AttributeComponent).includes(component)) {
    return { isValid: false, error: 'Valid component is required' }
  }

  if (!entityId || !ObjectId.isValid(entityId)) {
    return { isValid: false, error: 'Valid entityId is required' }
  }

  // Validate value based on type
  const valueValidation = validateAttributeValue(value, type)

  if (!valueValidation.isValid) {
    return valueValidation
  }

  // Validate optional fields
  if (data.category && (typeof data.category !== 'string' || data.category.length > ATTRIBUTE_VALIDATION.CATEGORY_MAX_LENGTH)) {
    return { isValid: false, error: `Category cannot exceed ${ATTRIBUTE_VALIDATION.CATEGORY_MAX_LENGTH} characters` }
  }

  if (data.unit && (typeof data.unit !== 'string' || data.unit.length > ATTRIBUTE_VALIDATION.UNIT_MAX_LENGTH)) {
    return { isValid: false, error: `Unit cannot exceed ${ATTRIBUTE_VALIDATION.UNIT_MAX_LENGTH} characters` }
  }

  if (data.description && (typeof data.description !== 'string' || data.description.length > ATTRIBUTE_VALIDATION.DESCRIPTION_MAX_LENGTH)) {
    return { isValid: false, error: `Description cannot exceed ${ATTRIBUTE_VALIDATION.DESCRIPTION_MAX_LENGTH} characters` }
  }

  if (data.displayOrder !== undefined) {
    if (
      typeof data.displayOrder !== 'number' ||
      data.displayOrder < ATTRIBUTE_VALIDATION.DISPLAY_ORDER_MIN ||
      data.displayOrder > ATTRIBUTE_VALIDATION.DISPLAY_ORDER_MAX
    ) {
      return { isValid: false, error: `Display order must be between ${ATTRIBUTE_VALIDATION.DISPLAY_ORDER_MIN} and ${ATTRIBUTE_VALIDATION.DISPLAY_ORDER_MAX}` }
    }
  }

  return { isValid: true }
}

export function validateAttributeValue(value: string, type: AttributeValueType): { isValid: boolean; error?: string } {
  switch (type) {
  case AttributeValueType.NUMBER:
    if (isNaN(Number(value))) {
      return { isValid: false, error: 'Value must be a valid number' }
    }
    break

  case AttributeValueType.BOOLEAN:
    if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())) {
      return { isValid: false, error: 'Value must be a valid boolean (true/false, 1/0, yes/no)' }
    }
    break

  case AttributeValueType.DATE:
    if (isNaN(Date.parse(value))) {
      return { isValid: false, error: 'Value must be a valid date' }
    }
    break

  case AttributeValueType.EMAIL:
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Value must be a valid email address' }
    }
    break

  case AttributeValueType.URL:
    try {
      new URL(value)
    } catch {
      return { isValid: false, error: 'Value must be a valid URL' }
    }
    break

  case AttributeValueType.IP_ADDRESS:
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

    if (!ipRegex.test(value)) {
      return { isValid: false, error: 'Value must be a valid IP address' }
    }
    break

  case AttributeValueType.MAC_ADDRESS:
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

    if (!macRegex.test(value)) {
      return { isValid: false, error: 'Value must be a valid MAC address' }
    }
    break

  case AttributeValueType.OBJECT:
    try {
      JSON.parse(value)
    } catch {
      return { isValid: false, error: 'Value must be valid JSON for Object type' }
    }
    break

  case AttributeValueType.ARRAY:
    try {
      const parsed = JSON.parse(value)

      if (!Array.isArray(parsed)) {
        return { isValid: false, error: 'Value must be a valid JSON array' }
      }
    } catch {
      return { isValid: false, error: 'Value must be valid JSON for Array type' }
    }
    break

  case AttributeValueType.STRING:
  default:
    // String validation is already done in main validation
    break
  }

  return { isValid: true }
}

export function validateAttributeValidation(validation: AttributeValidation): { isValid: boolean; error?: string } {
  if (validation.minLength !== undefined && (typeof validation.minLength !== 'number' || validation.minLength < 0)) {
    return { isValid: false, error: 'minLength must be a non-negative number' }
  }

  if (validation.maxLength !== undefined && (typeof validation.maxLength !== 'number' || validation.maxLength < 0)) {
    return { isValid: false, error: 'maxLength must be a non-negative number' }
  }

  if (validation.minLength !== undefined && validation.maxLength !== undefined && validation.minLength > validation.maxLength) {
    return { isValid: false, error: 'minLength cannot be greater than maxLength' }
  }

  if (validation.minValue !== undefined && typeof validation.minValue !== 'number') {
    return { isValid: false, error: 'minValue must be a number' }
  }

  if (validation.maxValue !== undefined && typeof validation.maxValue !== 'number') {
    return { isValid: false, error: 'maxValue must be a number' }
  }

  if (validation.minValue !== undefined && validation.maxValue !== undefined && validation.minValue > validation.maxValue) {
    return { isValid: false, error: 'minValue cannot be greater than maxValue' }
  }

  if (validation.pattern && (typeof validation.pattern !== 'string' || validation.pattern.length > ATTRIBUTE_VALIDATION.PATTERN_MAX_LENGTH)) {
    return { isValid: false, error: `Pattern cannot exceed ${ATTRIBUTE_VALIDATION.PATTERN_MAX_LENGTH} characters` }
  }

  if (validation.allowedValues) {
    if (!Array.isArray(validation.allowedValues)) {
      return { isValid: false, error: 'allowedValues must be an array' }
    }

    if (validation.allowedValues.length > ATTRIBUTE_VALIDATION.MAX_ALLOWED_VALUES) {
      return { isValid: false, error: `Cannot exceed ${ATTRIBUTE_VALIDATION.MAX_ALLOWED_VALUES} allowed values` }
    }

    for (const allowedValue of validation.allowedValues) {
      if (typeof allowedValue !== 'string' || allowedValue.length > ATTRIBUTE_VALIDATION.ALLOWED_VALUE_MAX_LENGTH) {
        return { isValid: false, error: `Allowed value cannot exceed ${ATTRIBUTE_VALIDATION.ALLOWED_VALUE_MAX_LENGTH} characters` }
      }
    }
  }

  return { isValid: true }
}

// Convert Attribute to AttributeResponse
export function toAttributeResponse(attribute: Attribute): AttributeResponse {
  if (!attribute._id) {
    throw new Error('Attribute _id is required to create AttributeResponse')
  }

  return {
    _id: attribute._id,
    name: attribute.name,
    key: attribute.key,
    value: attribute.value,
    type: attribute.type,
    component: attribute.component,
    entityId: attribute.entityId,
    category: attribute.category,
    unit: attribute.unit,
    description: attribute.description,
    isRequired: attribute.isRequired,
    isSystem: attribute.isSystem,
    isActive: attribute.isActive,
    validation: attribute.validation,
    displayOrder: attribute.displayOrder,
    createdAt: attribute.createdAt,
    updatedAt: attribute.updatedAt
  }
}

// Helper functions
export function createAttributeFromRequest(request: CreateAttributeRequest): Omit<Attribute, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    name: request.name.trim(),
    key: request.key.trim(),
    value: request.value,
    type: request.type,
    component: request.component,
    entityId: new ObjectId(request.entityId),
    category: request.category?.trim(),
    unit: request.unit?.trim(),
    description: request.description?.trim(),
    isRequired: request.isRequired || false,
    isSystem: request.isSystem || false,
    isActive: request.isActive !== undefined ? request.isActive : true,
    validation: request.validation,
    displayOrder: request.displayOrder
  }
}

export function updateAttributeFromRequest(currentAttribute: Attribute, request: UpdateAttributeRequest): Partial<Attribute> {
  const updates: Partial<Attribute> = {
    updatedAt: new Date()
  }

  if (request.name !== undefined) updates.name = request.name.trim()
  if (request.key !== undefined) updates.key = request.key.trim()
  if (request.value !== undefined) updates.value = request.value
  if (request.type !== undefined) updates.type = request.type
  if (request.component !== undefined) updates.component = request.component
  if (request.entityId !== undefined) updates.entityId = new ObjectId(request.entityId)
  if (request.category !== undefined) updates.category = request.category?.trim()
  if (request.unit !== undefined) updates.unit = request.unit?.trim()
  if (request.description !== undefined) updates.description = request.description?.trim()
  if (request.isRequired !== undefined) updates.isRequired = request.isRequired
  if (request.isSystem !== undefined) updates.isSystem = request.isSystem
  if (request.isActive !== undefined) updates.isActive = request.isActive
  if (request.validation !== undefined) updates.validation = request.validation
  if (request.displayOrder !== undefined) updates.displayOrder = request.displayOrder

  return updates
}

// Utility functions
export function getFormattedValue(attribute: Attribute): string {
  switch (attribute.type) {
  case AttributeValueType.BOOLEAN:
    return ['true', '1', 'yes'].includes(attribute.value.toLowerCase()) ? 'Yes' : 'No'

  case AttributeValueType.NUMBER:
    const num = Number(attribute.value)

    return attribute.unit ? `${num} ${attribute.unit}` : num.toString()

  case AttributeValueType.DATE:
    return new Date(attribute.value).toLocaleDateString()

  default:
    return attribute.value
  }
}

export function sortAttributesByDisplayOrder(attributes: Attribute[]): Attribute[] {
  return attributes.sort((a, b) => {
    const orderA = a.displayOrder ?? 9999
    const orderB = b.displayOrder ?? 9999

    if (orderA !== orderB) {
      return orderA - orderB
    }

    return a.name.localeCompare(b.name)
  })
}
