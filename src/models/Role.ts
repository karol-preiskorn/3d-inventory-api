/**
 * @file /models/Role.ts
 * @description Role model interface and permission management
 * @module models
 */

import { ObjectId } from 'mongodb'
import { UserRole, Permission } from '../middlewares/auth'

export interface Role {
  _id?: ObjectId;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleRequest {
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  isActive?: boolean;
}

export interface UpdateRoleRequest {
  displayName?: string;
  description?: string;
  permissions?: Permission[];
  isActive?: boolean;
}

export interface RoleResponse {
  _id: ObjectId;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Default roles configuration
export const DEFAULT_ROLES: Omit<Role, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: UserRole.ADMIN,
    displayName: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: [
      Permission.READ_DEVICES, Permission.WRITE_DEVICES, Permission.DELETE_DEVICES,
      Permission.READ_MODELS, Permission.WRITE_MODELS, Permission.DELETE_MODELS,
      Permission.READ_CONNECTIONS, Permission.WRITE_CONNECTIONS, Permission.DELETE_CONNECTIONS,
      Permission.READ_LOGS, Permission.DELETE_LOGS,
      Permission.ADMIN_ACCESS
    ],
    isActive: true
  },
  {
    name: UserRole.USER,
    displayName: 'User',
    description: 'Standard user with read/write access to most resources',
    permissions: [
      Permission.READ_DEVICES, Permission.WRITE_DEVICES,
      Permission.READ_MODELS, Permission.WRITE_MODELS,
      Permission.READ_CONNECTIONS, Permission.WRITE_CONNECTIONS,
      Permission.READ_LOGS
    ],
    isActive: true
  },
  {
    name: UserRole.VIEWER,
    displayName: 'Viewer',
    description: 'Read-only access to system resources',
    permissions: [
      Permission.READ_DEVICES,
      Permission.READ_MODELS,
      Permission.READ_CONNECTIONS,
      Permission.READ_LOGS
    ],
    isActive: true
  }
]

// Convert Role to RoleResponse
export function toRoleResponse(role: Role): RoleResponse {
  return {
    _id: role._id!,
    name: role.name,
    displayName: role.displayName,
    description: role.description,
    permissions: role.permissions,
    isActive: role.isActive,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt
  }
}
