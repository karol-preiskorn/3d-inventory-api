/**
 * @file /models/User.ts
 * @description User model interface and validation schema for MongoDB
 * @module models
 */

import { ObjectId } from 'mongodb'
import { UserRole, Permission } from '../middlewares/auth'

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string; // Will be hashed
  role: UserRole;
  permissions?: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserResponse {
  _id: ObjectId;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
  expiresIn: string;
}

// User validation constants
export const USER_VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 2 * 60 * 60 * 1000 // 2 hours in milliseconds
}

// Convert User to UserResponse (remove sensitive fields)
export function toUserResponse(user: User): UserResponse {
  if (!user._id) {
    throw new Error('User _id is required to create UserResponse')
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin
  }
}
