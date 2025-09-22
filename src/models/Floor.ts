/**
 * @file /models/Floor.ts
 * @description Floor model interface and validation for spatial organization
 * @module models
 */

import { ObjectId } from 'mongodb';

export interface Address {
  street: string;
  city: string;
  country: string;
  postcode: string;
  state?: string;
  region?: string;
}

export interface FloorDimension {
  description: string;
  x: number;
  y: number;
  h: number;
  xPos: number;
  yPos: number;
  hPos: number;
  type?: DimensionType;
  isActive?: boolean;
}

export interface Floor {
  _id?: ObjectId;
  name: string;
  address: Address;
  dimension: FloorDimension[];
  level: number;
  buildingId?: ObjectId;
  totalArea?: number;
  usableArea?: number;
  ceilingHeight?: number;
  floorType: FloorType;
  status: FloorStatus;
  isActive: boolean;
  capacity?: FloorCapacity;
  environmentalConditions?: EnvironmentalConditions;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FloorCapacity {
  maxDevices: number;
  maxWeight: number;
  maxPowerConsumption: number;
  currentDevices?: number;
  currentWeight?: number;
  currentPowerConsumption?: number;
}

export interface EnvironmentalConditions {
  temperature?: TemperatureRange;
  humidity?: HumidityRange;
  powerRedundancy?: string;
  coolingType?: string;
  fireSuppressionType?: string;
}

export interface TemperatureRange {
  min: number;
  max: number;
  optimal: number;
  unit: 'C' | 'F';
}

export interface HumidityRange {
  min: number;
  max: number;
  optimal: number;
}

export interface CreateFloorRequest {
  name: string;
  address: Address;
  dimension?: FloorDimension[];
  level: number;
  buildingId?: string;
  totalArea?: number;
  usableArea?: number;
  ceilingHeight?: number;
  floorType: FloorType;
  status?: FloorStatus;
  isActive?: boolean;
  capacity?: FloorCapacity;
  environmentalConditions?: EnvironmentalConditions;
  description?: string;
}

export interface UpdateFloorRequest {
  name?: string;
  address?: Address;
  dimension?: FloorDimension[];
  level?: number;
  buildingId?: string;
  totalArea?: number;
  usableArea?: number;
  ceilingHeight?: number;
  floorType?: FloorType;
  status?: FloorStatus;
  isActive?: boolean;
  capacity?: FloorCapacity;
  environmentalConditions?: EnvironmentalConditions;
  description?: string;
}

export interface FloorResponse {
  _id: ObjectId;
  name: string;
  address: Address;
  dimension: FloorDimension[];
  level: number;
  buildingId?: ObjectId;
  totalArea?: number;
  usableArea?: number;
  ceilingHeight?: number;
  floorType: FloorType;
  status: FloorStatus;
  isActive: boolean;
  capacity?: FloorCapacity;
  environmentalConditions?: EnvironmentalConditions;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum FloorType {
  DATA_CENTER = 'Data Center',
  SERVER_ROOM = 'Server Room',
  NETWORK_CLOSET = 'Network Closet',
  WAREHOUSE = 'Warehouse',
  OFFICE = 'Office',
  LABORATORY = 'Laboratory',
  MANUFACTURING = 'Manufacturing',
  STORAGE = 'Storage',
}

export enum FloorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  PLANNED = 'planned',
  DECOMMISSIONED = 'decommissioned',
  UNDER_CONSTRUCTION = 'under_construction',
}

export enum DimensionType {
  RACK_SPACE = 'Rack Space',
  OPEN_AREA = 'Open Area',
  RESTRICTED = 'Restricted',
  COOLING = 'Cooling',
  POWER = 'Power',
  CABLE_TRAY = 'Cable Tray',
  WALKWAY = 'Walkway',
  EMERGENCY_EXIT = 'Emergency Exit',
}

// Floor validation constants
export const FLOOR_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  STREET_MIN_LENGTH: 5,
  STREET_MAX_LENGTH: 200,
  CITY_MIN_LENGTH: 2,
  CITY_MAX_LENGTH: 100,
  COUNTRY_MIN_LENGTH: 2,
  COUNTRY_MAX_LENGTH: 100,
  POSTCODE_MIN_LENGTH: 3,
  POSTCODE_MAX_LENGTH: 20,
  STATE_MAX_LENGTH: 100,
  REGION_MAX_LENGTH: 100,
  LEVEL_MIN: -50,
  LEVEL_MAX: 200,
  AREA_MIN: 1,
  AREA_MAX: 1000000,
  CEILING_HEIGHT_MIN: 2,
  CEILING_HEIGHT_MAX: 50,
  DIMENSION_DESCRIPTION_MAX_LENGTH: 200,
  MAX_DIMENSIONS: 1000,
  COORDINATE_MIN: -999999,
  COORDINATE_MAX: 999999,
  CAPACITY_MAX_DEVICES: 100000,
  CAPACITY_MAX_WEIGHT: 1000000,
  CAPACITY_MAX_POWER: 10000000,
  TEMPERATURE_MIN: -50,
  TEMPERATURE_MAX: 100,
  HUMIDITY_MIN: 0,
  HUMIDITY_MAX: 100,
};

// Validation functions
export function validateFloorInput(data: Partial<CreateFloorRequest>): { isValid: boolean; error?: string } {
  const { name, address, level, floorType } = data;

  if (!name || typeof name !== 'string' || name.trim().length < FLOOR_VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${FLOOR_VALIDATION.NAME_MIN_LENGTH} characters long` };
  }

  if (name.length > FLOOR_VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, error: `Name cannot exceed ${FLOOR_VALIDATION.NAME_MAX_LENGTH} characters` };
  }

  if (!address || typeof address !== 'object') {
    return { isValid: false, error: 'Address is required' };
  }

  const addressValidation = validateAddress(address);

  if (!addressValidation.isValid) {
    return addressValidation;
  }

  if (typeof level !== 'number' || level < FLOOR_VALIDATION.LEVEL_MIN || level > FLOOR_VALIDATION.LEVEL_MAX) {
    return { isValid: false, error: `Level must be between ${FLOOR_VALIDATION.LEVEL_MIN} and ${FLOOR_VALIDATION.LEVEL_MAX}` };
  }

  if (!floorType || !Object.values(FloorType).includes(floorType)) {
    return { isValid: false, error: 'Valid floor type is required' };
  }

  // Validate optional fields
  if (data.totalArea !== undefined) {
    if (typeof data.totalArea !== 'number' || data.totalArea < FLOOR_VALIDATION.AREA_MIN || data.totalArea > FLOOR_VALIDATION.AREA_MAX) {
      return { isValid: false, error: `Total area must be between ${FLOOR_VALIDATION.AREA_MIN} and ${FLOOR_VALIDATION.AREA_MAX} square meters` };
    }
  }

  if (data.usableArea !== undefined) {
    if (typeof data.usableArea !== 'number' || data.usableArea < FLOOR_VALIDATION.AREA_MIN || data.usableArea > FLOOR_VALIDATION.AREA_MAX) {
      return { isValid: false, error: `Usable area must be between ${FLOOR_VALIDATION.AREA_MIN} and ${FLOOR_VALIDATION.AREA_MAX} square meters` };
    }
  }

  if (data.ceilingHeight !== undefined) {
    if (
      typeof data.ceilingHeight !== 'number' ||
      data.ceilingHeight < FLOOR_VALIDATION.CEILING_HEIGHT_MIN ||
      data.ceilingHeight > FLOOR_VALIDATION.CEILING_HEIGHT_MAX
    ) {
      return {
        isValid: false,
        error: `Ceiling height must be between ${FLOOR_VALIDATION.CEILING_HEIGHT_MIN} and ${FLOOR_VALIDATION.CEILING_HEIGHT_MAX} meters`,
      };
    }
  }

  if (data.buildingId && !ObjectId.isValid(data.buildingId)) {
    return { isValid: false, error: 'Invalid buildingId format' };
  }

  if (data.description && (typeof data.description !== 'string' || data.description.length > FLOOR_VALIDATION.DESCRIPTION_MAX_LENGTH)) {
    return { isValid: false, error: `Description cannot exceed ${FLOOR_VALIDATION.DESCRIPTION_MAX_LENGTH} characters` };
  }

  return { isValid: true };
}

export function validateAddress(address: Address): { isValid: boolean; error?: string } {
  if (!address.street || typeof address.street !== 'string' || address.street.trim().length < FLOOR_VALIDATION.STREET_MIN_LENGTH) {
    return { isValid: false, error: `Street must be at least ${FLOOR_VALIDATION.STREET_MIN_LENGTH} characters long` };
  }

  if (address.street.length > FLOOR_VALIDATION.STREET_MAX_LENGTH) {
    return { isValid: false, error: `Street cannot exceed ${FLOOR_VALIDATION.STREET_MAX_LENGTH} characters` };
  }

  if (!address.city || typeof address.city !== 'string' || address.city.trim().length < FLOOR_VALIDATION.CITY_MIN_LENGTH) {
    return { isValid: false, error: `City must be at least ${FLOOR_VALIDATION.CITY_MIN_LENGTH} characters long` };
  }

  if (address.city.length > FLOOR_VALIDATION.CITY_MAX_LENGTH) {
    return { isValid: false, error: `City cannot exceed ${FLOOR_VALIDATION.CITY_MAX_LENGTH} characters` };
  }

  if (!address.country || typeof address.country !== 'string' || address.country.trim().length < FLOOR_VALIDATION.COUNTRY_MIN_LENGTH) {
    return { isValid: false, error: `Country must be at least ${FLOOR_VALIDATION.COUNTRY_MIN_LENGTH} characters long` };
  }

  if (address.country.length > FLOOR_VALIDATION.COUNTRY_MAX_LENGTH) {
    return { isValid: false, error: `Country cannot exceed ${FLOOR_VALIDATION.COUNTRY_MAX_LENGTH} characters` };
  }

  if (!address.postcode || typeof address.postcode !== 'string' || address.postcode.trim().length < FLOOR_VALIDATION.POSTCODE_MIN_LENGTH) {
    return { isValid: false, error: `Postcode must be at least ${FLOOR_VALIDATION.POSTCODE_MIN_LENGTH} characters long` };
  }

  if (address.postcode.length > FLOOR_VALIDATION.POSTCODE_MAX_LENGTH) {
    return { isValid: false, error: `Postcode cannot exceed ${FLOOR_VALIDATION.POSTCODE_MAX_LENGTH} characters` };
  }

  if (address.state && (typeof address.state !== 'string' || address.state.length > FLOOR_VALIDATION.STATE_MAX_LENGTH)) {
    return { isValid: false, error: `State cannot exceed ${FLOOR_VALIDATION.STATE_MAX_LENGTH} characters` };
  }

  if (address.region && (typeof address.region !== 'string' || address.region.length > FLOOR_VALIDATION.REGION_MAX_LENGTH)) {
    return { isValid: false, error: `Region cannot exceed ${FLOOR_VALIDATION.REGION_MAX_LENGTH} characters` };
  }

  return { isValid: true };
}

export function validateFloorDimensions(dimensions: FloorDimension[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(dimensions)) {
    return { isValid: false, error: 'Dimensions must be an array' };
  }

  if (dimensions.length > FLOOR_VALIDATION.MAX_DIMENSIONS) {
    return { isValid: false, error: `Cannot exceed ${FLOOR_VALIDATION.MAX_DIMENSIONS} dimensions` };
  }

  for (const dimension of dimensions) {
    const validation = validateSingleDimension(dimension);

    if (!validation.isValid) {
      return validation;
    }
  }

  return { isValid: true };
}

export function validateSingleDimension(dimension: FloorDimension): { isValid: boolean; error?: string } {
  if (!dimension.description || typeof dimension.description !== 'string' || dimension.description.trim().length === 0) {
    return { isValid: false, error: 'Dimension description is required' };
  }

  if (dimension.description.length > FLOOR_VALIDATION.DIMENSION_DESCRIPTION_MAX_LENGTH) {
    return { isValid: false, error: `Dimension description cannot exceed ${FLOOR_VALIDATION.DIMENSION_DESCRIPTION_MAX_LENGTH} characters` };
  }

  const coordinates = [
    { name: 'x', value: dimension.x },
    { name: 'y', value: dimension.y },
    { name: 'h', value: dimension.h },
    { name: 'xPos', value: dimension.xPos },
    { name: 'yPos', value: dimension.yPos },
    { name: 'hPos', value: dimension.hPos },
  ];

  for (const coord of coordinates) {
    if (typeof coord.value !== 'number' || coord.value < FLOOR_VALIDATION.COORDINATE_MIN || coord.value > FLOOR_VALIDATION.COORDINATE_MAX) {
      return { isValid: false, error: `${coord.name} must be between ${FLOOR_VALIDATION.COORDINATE_MIN} and ${FLOOR_VALIDATION.COORDINATE_MAX}` };
    }
  }

  return { isValid: true };
}

// Convert Floor to FloorResponse
export function toFloorResponse(floor: Floor): FloorResponse {
  if (!floor._id) {
    throw new Error('Floor _id is required to create FloorResponse');
  }

  return {
    _id: floor._id,
    name: floor.name,
    address: floor.address,
    dimension: floor.dimension,
    level: floor.level,
    buildingId: floor.buildingId,
    totalArea: floor.totalArea,
    usableArea: floor.usableArea,
    ceilingHeight: floor.ceilingHeight,
    floorType: floor.floorType,
    status: floor.status,
    isActive: floor.isActive,
    capacity: floor.capacity,
    environmentalConditions: floor.environmentalConditions,
    description: floor.description,
    createdAt: floor.createdAt,
    updatedAt: floor.updatedAt,
  };
}

// Helper functions
export function createFloorFromRequest(request: CreateFloorRequest): Omit<Floor, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    name: request.name.trim(),
    address: {
      street: request.address.street.trim(),
      city: request.address.city.trim(),
      country: request.address.country.trim(),
      postcode: request.address.postcode.trim(),
      state: request.address.state?.trim(),
      region: request.address.region?.trim(),
    },
    dimension: request.dimension || [],
    level: request.level,
    buildingId: request.buildingId ? new ObjectId(request.buildingId) : undefined,
    totalArea: request.totalArea,
    usableArea: request.usableArea,
    ceilingHeight: request.ceilingHeight,
    floorType: request.floorType,
    status: request.status || FloorStatus.PLANNED,
    isActive: request.isActive !== undefined ? request.isActive : true,
    capacity: request.capacity,
    environmentalConditions: request.environmentalConditions,
    description: request.description?.trim(),
  };
}

export function updateFloorFromRequest(currentFloor: Floor, request: UpdateFloorRequest): Partial<Floor> {
  const updates: Partial<Floor> = {
    updatedAt: new Date(),
  };

  if (request.name !== undefined) updates.name = request.name.trim();
  if (request.address !== undefined) {
    updates.address = {
      street: request.address.street.trim(),
      city: request.address.city.trim(),
      country: request.address.country.trim(),
      postcode: request.address.postcode.trim(),
      state: request.address.state?.trim(),
      region: request.address.region?.trim(),
    };
  }
  if (request.dimension !== undefined) updates.dimension = request.dimension;
  if (request.level !== undefined) updates.level = request.level;
  if (request.buildingId !== undefined) updates.buildingId = request.buildingId ? new ObjectId(request.buildingId) : undefined;
  if (request.totalArea !== undefined) updates.totalArea = request.totalArea;
  if (request.usableArea !== undefined) updates.usableArea = request.usableArea;
  if (request.ceilingHeight !== undefined) updates.ceilingHeight = request.ceilingHeight;
  if (request.floorType !== undefined) updates.floorType = request.floorType;
  if (request.status !== undefined) updates.status = request.status;
  if (request.isActive !== undefined) updates.isActive = request.isActive;
  if (request.capacity !== undefined) updates.capacity = request.capacity;
  if (request.environmentalConditions !== undefined) updates.environmentalConditions = request.environmentalConditions;
  if (request.description !== undefined) updates.description = request.description?.trim();

  return updates;
}

// Utility functions
export function getFloorDisplayName(floor: Floor): string {
  return `${floor.name} (Level ${floor.level})`;
}

export function calculateFloorUtilization(floor: Floor): number {
  if (!floor.capacity || !floor.capacity.maxDevices || floor.capacity.maxDevices === 0) {
    return 0;
  }

  const currentDevices = floor.capacity.currentDevices || 0;

  return Math.round((currentDevices / floor.capacity.maxDevices) * 100);
}

export function getAvailableSpace(floor: Floor): number {
  if (!floor.totalArea || !floor.usableArea) {
    return 0;
  }

  return Math.max(0, floor.usableArea - (floor.totalArea - floor.usableArea));
}
