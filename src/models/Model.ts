/**
 * @file /models/Model.ts
 * @description Model entity interface and validation for 3D inventory system
 * @module models
 */

import { ObjectId } from 'mongodb'

export interface Dimension {
  width: number;
  height: number;
  depth: number;
}

export interface Texture {
  front: string;
  back: string;
  side: string;
  top: string;
  bottom: string;
}

export interface Model {
  _id?: ObjectId;
  name: string;
  dimension: Dimension;
  texture: Texture;
  type?: string;
  category?: string;
  description?: string;
  manufacturer?: string;
  modelNumber?: string;
  specifications?: ModelSpecification[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelSpecification {
  key: string;
  value: string;
  unit?: string;
  description?: string;
}

export interface CreateModelRequest {
  name: string;
  dimension: Dimension;
  texture: Texture;
  type?: string;
  category?: string;
  description?: string;
  manufacturer?: string;
  modelNumber?: string;
  specifications?: ModelSpecification[];
  isActive?: boolean;
}

export interface UpdateModelRequest {
  name?: string;
  dimension?: Dimension;
  texture?: Texture;
  type?: string;
  category?: string;
  description?: string;
  manufacturer?: string;
  modelNumber?: string;
  specifications?: ModelSpecification[];
  isActive?: boolean;
}

export interface ModelResponse {
  _id: ObjectId;
  name: string;
  dimension: Dimension;
  texture: Texture;
  type?: string;
  category?: string;
  description?: string;
  manufacturer?: string;
  modelNumber?: string;
  specifications: ModelSpecification[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ModelType {
  SERVER = 'Server',
  SWITCH = 'Switch',
  ROUTER = 'Router',
  FIREWALL = 'Firewall',
  STORAGE = 'Storage',
  UPS = 'UPS',
  PDU = 'PDU',
  RACK = 'Rack',
  CABLE = 'Cable',
  PATCH_PANEL = 'Patch Panel',
  KVM = 'KVM',
  MONITOR = 'Monitor',
}

export enum ModelCategory {
  COMPUTE = 'Compute',
  NETWORK = 'Network',
  STORAGE = 'Storage',
  POWER = 'Power',
  INFRASTRUCTURE = 'Infrastructure',
  ACCESSORIES = 'Accessories',
}

// Model validation constants
export const MODEL_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  TYPE_MAX_LENGTH: 50,
  CATEGORY_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  MANUFACTURER_MAX_LENGTH: 100,
  MODEL_NUMBER_MAX_LENGTH: 100,
  TEXTURE_PATH_MAX_LENGTH: 500,
  DIMENSION_MIN: 0.1,
  DIMENSION_MAX: 10000,
  MAX_SPECIFICATIONS: 50,
  SPEC_KEY_MAX_LENGTH: 100,
  SPEC_VALUE_MAX_LENGTH: 500,
  SPEC_UNIT_MAX_LENGTH: 20
}

// Validation functions
export function validateModelInput(data: Partial<CreateModelRequest>): { isValid: boolean; error?: string } {
  const { name, dimension, texture } = data

  if (!name || typeof name !== 'string' || name.trim().length < MODEL_VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${MODEL_VALIDATION.NAME_MIN_LENGTH} characters long` }
  }

  if (name.length > MODEL_VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, error: `Name cannot exceed ${MODEL_VALIDATION.NAME_MAX_LENGTH} characters` }
  }

  if (!dimension || typeof dimension !== 'object') {
    return { isValid: false, error: 'Dimension is required' }
  }

  const dimensionValidation = validateDimension(dimension)

  if (!dimensionValidation.isValid) {
    return dimensionValidation
  }

  if (!texture || typeof texture !== 'object') {
    return { isValid: false, error: 'Texture is required' }
  }

  const textureValidation = validateTexture(texture)

  if (!textureValidation.isValid) {
    return textureValidation
  }

  return { isValid: true }
}

export function validateDimension(dimension: Dimension): { isValid: boolean; error?: string } {
  const { width, height, depth } = dimension

  if (typeof width !== 'number' || width < MODEL_VALIDATION.DIMENSION_MIN || width > MODEL_VALIDATION.DIMENSION_MAX) {
    return { isValid: false, error: `Width must be a number between ${MODEL_VALIDATION.DIMENSION_MIN} and ${MODEL_VALIDATION.DIMENSION_MAX}` }
  }

  if (typeof height !== 'number' || height < MODEL_VALIDATION.DIMENSION_MIN || height > MODEL_VALIDATION.DIMENSION_MAX) {
    return { isValid: false, error: `Height must be a number between ${MODEL_VALIDATION.DIMENSION_MIN} and ${MODEL_VALIDATION.DIMENSION_MAX}` }
  }

  if (typeof depth !== 'number' || depth < MODEL_VALIDATION.DIMENSION_MIN || depth > MODEL_VALIDATION.DIMENSION_MAX) {
    return { isValid: false, error: `Depth must be a number between ${MODEL_VALIDATION.DIMENSION_MIN} and ${MODEL_VALIDATION.DIMENSION_MAX}` }
  }

  return { isValid: true }
}

export function validateTexture(texture: Texture): { isValid: boolean; error?: string } {
  const { front, back, side, top, bottom } = texture
  const textureFields = [
    { name: 'front', value: front },
    { name: 'back', value: back },
    { name: 'side', value: side },
    { name: 'top', value: top },
    { name: 'bottom', value: bottom }
  ]

  for (const field of textureFields) {
    if (!field.value || typeof field.value !== 'string' || field.value.trim().length === 0) {
      return { isValid: false, error: `Texture ${field.name} is required and must be a non-empty string` }
    }

    if (field.value.length > MODEL_VALIDATION.TEXTURE_PATH_MAX_LENGTH) {
      return { isValid: false, error: `Texture ${field.name} path cannot exceed ${MODEL_VALIDATION.TEXTURE_PATH_MAX_LENGTH} characters` }
    }
  }

  return { isValid: true }
}

export function validateModelSpecifications(specifications: ModelSpecification[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(specifications)) {
    return { isValid: false, error: 'Specifications must be an array' }
  }

  if (specifications.length > MODEL_VALIDATION.MAX_SPECIFICATIONS) {
    return { isValid: false, error: `Cannot exceed ${MODEL_VALIDATION.MAX_SPECIFICATIONS} specifications` }
  }

  for (const spec of specifications) {
    if (!spec.key || typeof spec.key !== 'string' || spec.key.trim().length === 0) {
      return { isValid: false, error: 'Specification key is required and must be a non-empty string' }
    }

    if (spec.key.length > MODEL_VALIDATION.SPEC_KEY_MAX_LENGTH) {
      return { isValid: false, error: `Specification key cannot exceed ${MODEL_VALIDATION.SPEC_KEY_MAX_LENGTH} characters` }
    }

    if (!spec.value || typeof spec.value !== 'string') {
      return { isValid: false, error: 'Specification value is required and must be a string' }
    }

    if (spec.value.length > MODEL_VALIDATION.SPEC_VALUE_MAX_LENGTH) {
      return { isValid: false, error: `Specification value cannot exceed ${MODEL_VALIDATION.SPEC_VALUE_MAX_LENGTH} characters` }
    }

    if (spec.unit && (typeof spec.unit !== 'string' || spec.unit.length > MODEL_VALIDATION.SPEC_UNIT_MAX_LENGTH)) {
      return { isValid: false, error: `Specification unit cannot exceed ${MODEL_VALIDATION.SPEC_UNIT_MAX_LENGTH} characters` }
    }
  }

  return { isValid: true }
}

// Convert Model to ModelResponse
export function toModelResponse(model: Model): ModelResponse {
  if (!model._id) {
    throw new Error('Model _id is required to create ModelResponse')
  }

  return {
    _id: model._id,
    name: model.name,
    dimension: model.dimension,
    texture: model.texture,
    type: model.type,
    category: model.category,
    description: model.description,
    manufacturer: model.manufacturer,
    modelNumber: model.modelNumber,
    specifications: model.specifications || [],
    isActive: model.isActive,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt
  }
}

// Helper functions
export function createModelFromRequest(request: CreateModelRequest): Omit<Model, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    name: request.name.trim(),
    dimension: request.dimension,
    texture: {
      front: request.texture.front.trim(),
      back: request.texture.back.trim(),
      side: request.texture.side.trim(),
      top: request.texture.top.trim(),
      bottom: request.texture.bottom.trim()
    },
    type: request.type?.trim(),
    category: request.category?.trim(),
    description: request.description?.trim(),
    manufacturer: request.manufacturer?.trim(),
    modelNumber: request.modelNumber?.trim(),
    specifications: request.specifications || [],
    isActive: request.isActive !== undefined ? request.isActive : true
  }
}

export function updateModelFromRequest(currentModel: Model, request: UpdateModelRequest): Partial<Model> {
  const updates: Partial<Model> = {
    updatedAt: new Date()
  }

  if (request.name !== undefined) updates.name = request.name.trim()
  if (request.dimension !== undefined) updates.dimension = request.dimension
  if (request.texture !== undefined) {
    updates.texture = {
      front: request.texture.front.trim(),
      back: request.texture.back.trim(),
      side: request.texture.side.trim(),
      top: request.texture.top.trim(),
      bottom: request.texture.bottom.trim()
    }
  }
  if (request.type !== undefined) updates.type = request.type?.trim()
  if (request.category !== undefined) updates.category = request.category?.trim()
  if (request.description !== undefined) updates.description = request.description?.trim()
  if (request.manufacturer !== undefined) updates.manufacturer = request.manufacturer?.trim()
  if (request.modelNumber !== undefined) updates.modelNumber = request.modelNumber?.trim()
  if (request.specifications !== undefined) updates.specifications = request.specifications
  if (request.isActive !== undefined) updates.isActive = request.isActive

  return updates
}

// Default texture paths
export const DEFAULT_TEXTURE_PATHS = {
  SERVER: '/assets/textures/server-default.png',
  NETWORK: '/assets/textures/network-default.png',
  STORAGE: '/assets/textures/storage-default.png',
  POWER: '/assets/textures/power-default.png',
  RACK: '/assets/textures/rack-default.png'
}

// Get default texture for model type
export function getDefaultTexture(modelType?: string): Texture {
  const defaultPath =
    modelType && DEFAULT_TEXTURE_PATHS[modelType as keyof typeof DEFAULT_TEXTURE_PATHS]
      ? DEFAULT_TEXTURE_PATHS[modelType as keyof typeof DEFAULT_TEXTURE_PATHS]
      : '/assets/textures/generic-default.png'

  return {
    front: defaultPath,
    back: defaultPath,
    side: defaultPath,
    top: defaultPath,
    bottom: defaultPath
  }
}
