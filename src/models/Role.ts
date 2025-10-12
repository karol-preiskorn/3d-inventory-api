/**
 * @file /models/Role.ts
 * @description Role model interface and permission management
 * @module models
 */

import { ObjectId } from 'mongodb'
import { Permission, UserRole } from '../middlewares/auth'

export interface Role {
  _id?: ObjectId
  name: UserRole
  displayName: string
  description: string
  permissions: Permission[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateRoleRequest {
  name: UserRole
  displayName: string
  description: string
  permissions: Permission[]
  isActive?: boolean
}

export interface UpdateRoleRequest {
  displayName?: string
  description?: string
  permissions?: Permission[]
  isActive?: boolean
}

export interface RoleResponse {
  _id: ObjectId
  name: UserRole
  displayName: string
  description: string
  permissions: Permission[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Default roles configuration
export const DEFAULT_ROLES: Omit<Role, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: UserRole.ADMIN,
    displayName: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: [
      Permission.DEVICE_READ,
      Permission.DEVICE_CREATE,
      Permission.DEVICE_UPDATE,
      Permission.DEVICE_DELETE,
      Permission.MODEL_READ,
      Permission.MODEL_CREATE,
      Permission.MODEL_UPDATE,
      Permission.MODEL_DELETE,
      Permission.CONNECTION_READ,
      Permission.CONNECTION_CREATE,
      Permission.CONNECTION_UPDATE,
      Permission.CONNECTION_DELETE,
      Permission.ATTRIBUTE_READ,
      Permission.ATTRIBUTE_CREATE,
      Permission.ATTRIBUTE_UPDATE,
      Permission.ATTRIBUTE_DELETE,
      Permission.FLOOR_READ,
      Permission.FLOOR_CREATE,
      Permission.FLOOR_UPDATE,
      Permission.FLOOR_DELETE,
      Permission.USER_READ,
      Permission.USER_CREATE,
      Permission.USER_UPDATE,
      Permission.USER_DELETE,
      Permission.LOG_READ,
      Permission.LOG_CREATE,
      Permission.LOG_DELETE,
      Permission.ADMIN_FULL
    ],
    isActive: true
  },
  {
    name: UserRole.USER,
    displayName: 'User',
    description: 'Standard user with read/write access to most resources',
    permissions: [
      Permission.DEVICE_READ,
      Permission.DEVICE_CREATE,
      Permission.DEVICE_UPDATE,
      Permission.MODEL_READ,
      Permission.MODEL_CREATE,
      Permission.MODEL_UPDATE,
      Permission.CONNECTION_READ,
      Permission.CONNECTION_CREATE,
      Permission.CONNECTION_UPDATE,
      Permission.ATTRIBUTE_READ,
      Permission.FLOOR_READ,
      Permission.LOG_READ
    ],
    isActive: true
  },
  {
    name: UserRole.VIEWER,
    displayName: 'Viewer',
    description: 'Read-only access to system resources',
    permissions: [
      Permission.DEVICE_READ,
      Permission.MODEL_READ,
      Permission.CONNECTION_READ,
      Permission.ATTRIBUTE_READ,
      Permission.FLOOR_READ,
      Permission.LOG_READ
    ],
    isActive: true
  }
]

// Convert Role to RoleResponse
export function toRoleResponse(role: Role): RoleResponse {
  if (!role._id) {
    throw new Error('Role _id is required to create RoleResponse')
  }

  return {
    _id: role._id,
    name: role.name,
    displayName: role.displayName,
    description: role.description,
    permissions: role.permissions,
    isActive: role.isActive,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt
  }
}
