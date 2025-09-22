/**
 * @file /models/Device.ts
 * @description Device model interface and validation for 3D inventory management
 * @module models
 */

import { ObjectId } from 'mongodb';

export interface Position {
  x: number;
  y: number;
  h: number;
  floorId?: ObjectId;
}

export interface DeviceAttribute {
  key: string;
  value: string;
  type?: 'String' | 'Number' | 'Boolean' | 'Object';
  description?: string;
}

export interface Device {
  _id?: ObjectId;
  name: string;
  type: string;
  category: string;
  modelId: ObjectId;
  position: Position;
  attributes: DeviceAttribute[];
  connections?: ObjectId[];
  status: DeviceStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMaintenance?: Date;
  description?: string;
}

export interface CreateDeviceRequest {
  name: string;
  type: string;
  category: string;
  modelId: string;
  position: Position;
  attributes?: DeviceAttribute[];
  status?: DeviceStatus;
  isActive?: boolean;
  description?: string;
}

export interface UpdateDeviceRequest {
  name?: string;
  type?: string;
  category?: string;
  modelId?: string;
  position?: Position;
  attributes?: DeviceAttribute[];
  status?: DeviceStatus;
  isActive?: boolean;
  description?: string;
}

export interface DeviceResponse {
  _id: ObjectId;
  name: string;
  type: string;
  category: string;
  modelId: ObjectId;
  position: Position;
  attributes: DeviceAttribute[];
  connections: ObjectId[];
  status: DeviceStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMaintenance?: Date;
  description?: string;
}

export enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DECOMMISSIONED = 'decommissioned',
  PLANNED = 'planned',
}

export enum DeviceType {
  SERVER = 'Server',
  NETWORK = 'Network',
  STORAGE = 'Storage',
  POWER = 'Power',
  COOLING = 'Cooling',
  RACK = 'Rack',
  CABLE = 'Cable',
  SENSOR = 'Sensor',
}

export enum DeviceCategory {
  INFRASTRUCTURE = 'Infrastructure',
  HARDWARE = 'Hardware',
  SOFTWARE = 'Software',
  FACILITY = 'Facility',
  SECURITY = 'Security',
}

// Device validation constants
export const DEVICE_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  TYPE_MAX_LENGTH: 50,
  CATEGORY_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_ATTRIBUTES: 50,
  ATTRIBUTE_KEY_MAX_LENGTH: 100,
  ATTRIBUTE_VALUE_MAX_LENGTH: 1000,
  POSITION_MIN: -999999,
  POSITION_MAX: 999999,
};

// Validation functions
export function validateDeviceInput(data: Partial<CreateDeviceRequest>): { isValid: boolean; error?: string } {
  const { name, type, category, modelId, position } = data;

  if (!name || typeof name !== 'string' || name.trim().length < DEVICE_VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${DEVICE_VALIDATION.NAME_MIN_LENGTH} characters long` };
  }

  if (name.length > DEVICE_VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, error: `Name cannot exceed ${DEVICE_VALIDATION.NAME_MAX_LENGTH} characters` };
  }

  if (!type || typeof type !== 'string' || type.trim().length === 0) {
    return { isValid: false, error: 'Type is required and must be a non-empty string' };
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return { isValid: false, error: 'Category is required and must be a non-empty string' };
  }

  if (!modelId || !ObjectId.isValid(modelId)) {
    return { isValid: false, error: 'Valid modelId is required' };
  }

  if (!position || typeof position !== 'object') {
    return { isValid: false, error: 'Position is required' };
  }

  if (typeof position.x !== 'number' || typeof position.y !== 'number' || typeof position.h !== 'number') {
    return { isValid: false, error: 'Position must have numeric x, y, and h coordinates' };
  }

  if (
    position.x < DEVICE_VALIDATION.POSITION_MIN ||
    position.x > DEVICE_VALIDATION.POSITION_MAX ||
    position.y < DEVICE_VALIDATION.POSITION_MIN ||
    position.y > DEVICE_VALIDATION.POSITION_MAX ||
    position.h < DEVICE_VALIDATION.POSITION_MIN ||
    position.h > DEVICE_VALIDATION.POSITION_MAX
  ) {
    return { isValid: false, error: 'Position coordinates must be within valid range' };
  }

  return { isValid: true };
}

export function validateDeviceAttributes(attributes: DeviceAttribute[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(attributes)) {
    return { isValid: false, error: 'Attributes must be an array' };
  }

  if (attributes.length > DEVICE_VALIDATION.MAX_ATTRIBUTES) {
    return { isValid: false, error: `Cannot exceed ${DEVICE_VALIDATION.MAX_ATTRIBUTES} attributes` };
  }

  for (const attr of attributes) {
    if (!attr.key || typeof attr.key !== 'string' || attr.key.trim().length === 0) {
      return { isValid: false, error: 'Attribute key is required and must be a non-empty string' };
    }

    if (attr.key.length > DEVICE_VALIDATION.ATTRIBUTE_KEY_MAX_LENGTH) {
      return { isValid: false, error: `Attribute key cannot exceed ${DEVICE_VALIDATION.ATTRIBUTE_KEY_MAX_LENGTH} characters` };
    }

    if (attr.value && typeof attr.value === 'string' && attr.value.length > DEVICE_VALIDATION.ATTRIBUTE_VALUE_MAX_LENGTH) {
      return { isValid: false, error: `Attribute value cannot exceed ${DEVICE_VALIDATION.ATTRIBUTE_VALUE_MAX_LENGTH} characters` };
    }
  }

  return { isValid: true };
}

// Convert Device to DeviceResponse
export function toDeviceResponse(device: Device): DeviceResponse {
  if (!device._id) {
    throw new Error('Device _id is required to create DeviceResponse');
  }

  return {
    _id: device._id,
    name: device.name,
    type: device.type,
    category: device.category,
    modelId: device.modelId,
    position: device.position,
    attributes: device.attributes || [],
    connections: device.connections || [],
    status: device.status,
    isActive: device.isActive,
    createdAt: device.createdAt,
    updatedAt: device.updatedAt,
    lastMaintenance: device.lastMaintenance,
    description: device.description,
  };
}

// Helper functions
export function createDeviceFromRequest(request: CreateDeviceRequest): Omit<Device, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    name: request.name.trim(),
    type: request.type.trim(),
    category: request.category.trim(),
    modelId: new ObjectId(request.modelId),
    position: request.position,
    attributes: request.attributes || [],
    connections: [],
    status: request.status || DeviceStatus.PLANNED,
    isActive: request.isActive !== undefined ? request.isActive : true,
    description: request.description?.trim(),
  };
}

export function updateDeviceFromRequest(currentDevice: Device, request: UpdateDeviceRequest): Partial<Device> {
  const updates: Partial<Device> = {
    updatedAt: new Date(),
  };

  if (request.name !== undefined) updates.name = request.name.trim();
  if (request.type !== undefined) updates.type = request.type.trim();
  if (request.category !== undefined) updates.category = request.category.trim();
  if (request.modelId !== undefined) updates.modelId = new ObjectId(request.modelId);
  if (request.position !== undefined) updates.position = request.position;
  if (request.attributes !== undefined) updates.attributes = request.attributes;
  if (request.status !== undefined) updates.status = request.status;
  if (request.isActive !== undefined) updates.isActive = request.isActive;
  if (request.description !== undefined) updates.description = request.description?.trim();

  return updates;
}
