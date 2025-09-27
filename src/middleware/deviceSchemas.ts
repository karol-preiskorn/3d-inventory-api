import { JSONSchemaType } from 'ajv'
import { CommonSchemas } from './validation'

/**
 * Device position interface
 */
export interface Position {
  x: number
  y: number
  h: number
}

/**
 * Device attribute interface
 */
export interface DeviceAttribute {
  key: string
  value: string
  type?: 'string' | 'number' | 'boolean' | 'date'
  unit?: string
  description?: string
}

/**
 * Device input interface for creation
 */
export interface DeviceInput {
  name: string
  modelId: string
  position?: Position
  attributes?: DeviceAttribute[]
}

/**
 * Device update interface
 */
export interface DeviceUpdate {
  name?: string
  modelId?: string
  position?: Position
  attributes?: DeviceAttribute[]
}

/**
 * Device query parameters
 */
export interface DeviceQuery {
  page?: number
  limit?: number
  sort?: string | null
  search?: string | null
  modelId?: string
}

/**
 * Position validation schema
 */
export const positionSchema: JSONSchemaType<Position> = {
  type: 'object',
  properties: {
    x: {
      type: 'number',
      minimum: 0,
      maximum: 1000
    },
    y: {
      type: 'number',
      minimum: 0,
      maximum: 1000
    },
    h: {
      type: 'number',
      minimum: 0,
      maximum: 100
    }
  },
  required: ['x', 'y', 'h'],
  additionalProperties: false
}

/**
 * Device attribute validation schema
 */
export const deviceAttributeSchema: JSONSchemaType<DeviceAttribute> = {
  type: 'object',
  properties: {
    key: {
      type: 'string',
      pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$',
      minLength: 1,
      maxLength: 100
    },
    value: {
      type: 'string',
      minLength: 0,
      maxLength: 500
    },
    type: {
      type: 'string',
      enum: ['string', 'number', 'boolean', 'date'],
      nullable: true
    },
    unit: {
      type: 'string',
      maxLength: 20,
      nullable: true
    },
    description: {
      type: 'string',
      maxLength: 500,
      nullable: true
    }
  },
  required: ['key', 'value'],
  additionalProperties: false
}

/**
 * Device input validation schema
 */
export const deviceInputSchema: JSONSchemaType<DeviceInput> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 256
    },
    modelId: CommonSchemas.mongoId,
    position: {
      ...positionSchema,
      nullable: true
    },
    attributes: {
      type: 'array',
      items: deviceAttributeSchema,
      maxItems: 100,
      nullable: true
    }
  },
  required: ['name', 'modelId'],
  additionalProperties: false
}

/**
 * Device update validation schema
 */
export const deviceUpdateSchema: JSONSchemaType<DeviceUpdate> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
      nullable: true
    },
    modelId: {
      ...CommonSchemas.mongoId,
      nullable: true
    },
    position: {
      ...positionSchema,
      nullable: true
    },
    attributes: {
      type: 'array',
      items: deviceAttributeSchema,
      maxItems: 100,
      nullable: true
    }
  },
  required: [],
  additionalProperties: false
}

/**
 * Device query parameters validation schema
 */
export const deviceQuerySchema: JSONSchemaType<DeviceQuery> = {
  type: 'object',
  properties: {
    page: {
      type: 'number',
      minimum: 1,
      nullable: true
    },
    limit: {
      type: 'number',
      minimum: 1,
      maximum: 100,
      nullable: true
    },
    sort: {
      type: 'string',
      pattern: '^[a-zA-Z_][a-zA-Z0-9_]*:(asc|desc)$',
      nullable: true
    },
    search: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      nullable: true
    },
    modelId: {
      ...CommonSchemas.mongoId,
      nullable: true
    }
  },
  required: [],
  additionalProperties: true
}
