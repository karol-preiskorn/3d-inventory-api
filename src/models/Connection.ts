/**
 * @file /models/Connection.ts
 * @description Connection model interface and validation for device relationships
 * @module models
 */

import { ObjectId } from 'mongodb'

export interface Connection {
  _id?: ObjectId;
  name: string;
  type: ConnectionType;
  category: ConnectionCategory;
  deviceIdFrom: ObjectId;
  deviceIdTo: ObjectId;
  portFrom?: string;
  portTo?: string;
  bandwidth?: number;
  protocol?: string;
  status: ConnectionStatus;
  isActive: boolean;
  attributes?: ConnectionAttribute[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  lastVerified?: Date;
}

export interface ConnectionAttribute {
  key: string;
  value: string;
  type?: 'String' | 'Number' | 'Boolean';
  description?: string;
}

export interface CreateConnectionRequest {
  name: string;
  type: ConnectionType;
  category: ConnectionCategory;
  deviceIdFrom: string;
  deviceIdTo: string;
  portFrom?: string;
  portTo?: string;
  bandwidth?: number;
  protocol?: string;
  status?: ConnectionStatus;
  isActive?: boolean;
  attributes?: ConnectionAttribute[];
  description?: string;
}

export interface UpdateConnectionRequest {
  name?: string;
  type?: ConnectionType;
  category?: ConnectionCategory;
  deviceIdFrom?: string;
  deviceIdTo?: string;
  portFrom?: string;
  portTo?: string;
  bandwidth?: number;
  protocol?: string;
  status?: ConnectionStatus;
  isActive?: boolean;
  attributes?: ConnectionAttribute[];
  description?: string;
}

export interface ConnectionResponse {
  _id: ObjectId;
  name: string;
  type: ConnectionType;
  category: ConnectionCategory;
  deviceIdFrom: ObjectId;
  deviceIdTo: ObjectId;
  portFrom?: string;
  portTo?: string;
  bandwidth?: number;
  protocol?: string;
  status: ConnectionStatus;
  isActive: boolean;
  attributes: ConnectionAttribute[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  lastVerified?: Date;
}

export enum ConnectionType {
  PHYSICAL = 'Physical',
  LOGICAL = 'Logical',
  VIRTUAL = 'Virtual',
  WIRELESS = 'Wireless',
}

export enum ConnectionCategory {
  NETWORK = 'Network',
  POWER = 'Power',
  DATA = 'Data',
  MANAGEMENT = 'Management',
  STORAGE = 'Storage',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  SERIAL = 'Serial',
}

export enum ConnectionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PLANNED = 'planned',
  MAINTENANCE = 'maintenance',
  FAILED = 'failed',
  DEPRECATED = 'deprecated',
}

export enum NetworkProtocol {
  ETHERNET = 'Ethernet',
  FIBER = 'Fiber',
  INFINIBAND = 'InfiniBand',
  USB = 'USB',
  THUNDERBOLT = 'Thunderbolt',
  HDMI = 'HDMI',
  DISPLAYPORT = 'DisplayPort',
  SATA = 'SATA',
  SAS = 'SAS',
  NVME = 'NVMe',
}

// Connection validation constants
export const CONNECTION_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PORT_MAX_LENGTH: 50,
  PROTOCOL_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  BANDWIDTH_MIN: 0,
  BANDWIDTH_MAX: 1000000, // 1TB in Mbps
  MAX_ATTRIBUTES: 50,
  ATTRIBUTE_KEY_MAX_LENGTH: 100,
  ATTRIBUTE_VALUE_MAX_LENGTH: 500
}

// Validation functions
export function validateConnectionInput(data: Partial<CreateConnectionRequest>): { isValid: boolean; error?: string } {
  const { name, type, category, deviceIdFrom, deviceIdTo } = data

  if (!name || typeof name !== 'string' || name.trim().length < CONNECTION_VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${CONNECTION_VALIDATION.NAME_MIN_LENGTH} characters long` }
  }

  if (name.length > CONNECTION_VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, error: `Name cannot exceed ${CONNECTION_VALIDATION.NAME_MAX_LENGTH} characters` }
  }

  if (!type || !Object.values(ConnectionType).includes(type)) {
    return { isValid: false, error: 'Valid connection type is required' }
  }

  if (!category || !Object.values(ConnectionCategory).includes(category)) {
    return { isValid: false, error: 'Valid connection category is required' }
  }

  if (!deviceIdFrom || !ObjectId.isValid(deviceIdFrom)) {
    return { isValid: false, error: 'Valid deviceIdFrom is required' }
  }

  if (!deviceIdTo || !ObjectId.isValid(deviceIdTo)) {
    return { isValid: false, error: 'Valid deviceIdTo is required' }
  }

  if (deviceIdFrom === deviceIdTo) {
    return { isValid: false, error: 'deviceIdFrom and deviceIdTo cannot be the same' }
  }

  // Validate optional fields
  if (data.bandwidth !== undefined) {
    if (typeof data.bandwidth !== 'number' || data.bandwidth < CONNECTION_VALIDATION.BANDWIDTH_MIN || data.bandwidth > CONNECTION_VALIDATION.BANDWIDTH_MAX) {
      return { isValid: false, error: `Bandwidth must be between ${CONNECTION_VALIDATION.BANDWIDTH_MIN} and ${CONNECTION_VALIDATION.BANDWIDTH_MAX} Mbps` }
    }
  }

  if (data.portFrom && (typeof data.portFrom !== 'string' || data.portFrom.length > CONNECTION_VALIDATION.PORT_MAX_LENGTH)) {
    return { isValid: false, error: `Port from cannot exceed ${CONNECTION_VALIDATION.PORT_MAX_LENGTH} characters` }
  }

  if (data.portTo && (typeof data.portTo !== 'string' || data.portTo.length > CONNECTION_VALIDATION.PORT_MAX_LENGTH)) {
    return { isValid: false, error: `Port to cannot exceed ${CONNECTION_VALIDATION.PORT_MAX_LENGTH} characters` }
  }

  if (data.protocol && (typeof data.protocol !== 'string' || data.protocol.length > CONNECTION_VALIDATION.PROTOCOL_MAX_LENGTH)) {
    return { isValid: false, error: `Protocol cannot exceed ${CONNECTION_VALIDATION.PROTOCOL_MAX_LENGTH} characters` }
  }

  if (data.description && (typeof data.description !== 'string' || data.description.length > CONNECTION_VALIDATION.DESCRIPTION_MAX_LENGTH)) {
    return { isValid: false, error: `Description cannot exceed ${CONNECTION_VALIDATION.DESCRIPTION_MAX_LENGTH} characters` }
  }

  return { isValid: true }
}

export function validateConnectionAttributes(attributes: ConnectionAttribute[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(attributes)) {
    return { isValid: false, error: 'Attributes must be an array' }
  }

  if (attributes.length > CONNECTION_VALIDATION.MAX_ATTRIBUTES) {
    return { isValid: false, error: `Cannot exceed ${CONNECTION_VALIDATION.MAX_ATTRIBUTES} attributes` }
  }

  for (const attr of attributes) {
    if (!attr.key || typeof attr.key !== 'string' || attr.key.trim().length === 0) {
      return { isValid: false, error: 'Attribute key is required and must be a non-empty string' }
    }

    if (attr.key.length > CONNECTION_VALIDATION.ATTRIBUTE_KEY_MAX_LENGTH) {
      return { isValid: false, error: `Attribute key cannot exceed ${CONNECTION_VALIDATION.ATTRIBUTE_KEY_MAX_LENGTH} characters` }
    }

    if (attr.value && typeof attr.value === 'string' && attr.value.length > CONNECTION_VALIDATION.ATTRIBUTE_VALUE_MAX_LENGTH) {
      return { isValid: false, error: `Attribute value cannot exceed ${CONNECTION_VALIDATION.ATTRIBUTE_VALUE_MAX_LENGTH} characters` }
    }
  }

  return { isValid: true }
}

// Convert Connection to ConnectionResponse
export function toConnectionResponse(connection: Connection): ConnectionResponse {
  if (!connection._id) {
    throw new Error('Connection _id is required to create ConnectionResponse')
  }

  return {
    _id: connection._id,
    name: connection.name,
    type: connection.type,
    category: connection.category,
    deviceIdFrom: connection.deviceIdFrom,
    deviceIdTo: connection.deviceIdTo,
    portFrom: connection.portFrom,
    portTo: connection.portTo,
    bandwidth: connection.bandwidth,
    protocol: connection.protocol,
    status: connection.status,
    isActive: connection.isActive,
    attributes: connection.attributes || [],
    description: connection.description,
    createdAt: connection.createdAt,
    updatedAt: connection.updatedAt,
    lastVerified: connection.lastVerified
  }
}

// Helper functions
export function createConnectionFromRequest(request: CreateConnectionRequest): Omit<Connection, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    name: request.name.trim(),
    type: request.type,
    category: request.category,
    deviceIdFrom: new ObjectId(request.deviceIdFrom),
    deviceIdTo: new ObjectId(request.deviceIdTo),
    portFrom: request.portFrom?.trim(),
    portTo: request.portTo?.trim(),
    bandwidth: request.bandwidth,
    protocol: request.protocol?.trim(),
    status: request.status || ConnectionStatus.PLANNED,
    isActive: request.isActive !== undefined ? request.isActive : true,
    attributes: request.attributes || [],
    description: request.description?.trim()
  }
}

export function updateConnectionFromRequest(currentConnection: Connection, request: UpdateConnectionRequest): Partial<Connection> {
  const updates: Partial<Connection> = {
    updatedAt: new Date()
  }

  if (request.name !== undefined) updates.name = request.name.trim()
  if (request.type !== undefined) updates.type = request.type
  if (request.category !== undefined) updates.category = request.category
  if (request.deviceIdFrom !== undefined) updates.deviceIdFrom = new ObjectId(request.deviceIdFrom)
  if (request.deviceIdTo !== undefined) updates.deviceIdTo = new ObjectId(request.deviceIdTo)
  if (request.portFrom !== undefined) updates.portFrom = request.portFrom?.trim()
  if (request.portTo !== undefined) updates.portTo = request.portTo?.trim()
  if (request.bandwidth !== undefined) updates.bandwidth = request.bandwidth
  if (request.protocol !== undefined) updates.protocol = request.protocol?.trim()
  if (request.status !== undefined) updates.status = request.status
  if (request.isActive !== undefined) updates.isActive = request.isActive
  if (request.attributes !== undefined) updates.attributes = request.attributes
  if (request.description !== undefined) updates.description = request.description?.trim()

  return updates
}

// Utility functions
export function getConnectionDisplayName(connection: Connection): string {
  const portInfo = connection.portFrom && connection.portTo ? ` (${connection.portFrom} → ${connection.portTo})` : ''

  return `${connection.name}${portInfo}`
}

export function isConnectionBidirectional(connection: Connection): boolean {
  return connection.category === ConnectionCategory.NETWORK || connection.category === ConnectionCategory.DATA || connection.type === ConnectionType.LOGICAL
}

export function getConnectionCapacity(connection: Connection): string {
  if (!connection.bandwidth) {
    return 'Unknown'
  }

  if (connection.bandwidth >= 1000) {
    return `${(connection.bandwidth / 1000).toFixed(1)} Gbps`
  }

  return `${connection.bandwidth} Mbps`
}
