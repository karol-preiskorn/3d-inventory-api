import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import config from '../utils/config'
import getLogger from '../utils/logger'

const logger = getLogger('auth-middleware')

export interface JwtPayload {
  id: string;
  username: string;
  role?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

// Define user roles and their permissions
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export enum Permission {
  READ_DEVICES = 'read:devices',
  WRITE_DEVICES = 'write:devices',
  DELETE_DEVICES = 'delete:devices',
  READ_MODELS = 'read:models',
  WRITE_MODELS = 'write:models',
  DELETE_MODELS = 'delete:models',
  READ_CONNECTIONS = 'read:connections',
  WRITE_CONNECTIONS = 'write:connections',
  DELETE_CONNECTIONS = 'delete:connections',
  READ_LOGS = 'read:logs',
  DELETE_LOGS = 'delete:logs',
  ADMIN_ACCESS = 'admin:access',
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.READ_DEVICES,
    Permission.WRITE_DEVICES,
    Permission.DELETE_DEVICES,
    Permission.READ_MODELS,
    Permission.WRITE_MODELS,
    Permission.DELETE_MODELS,
    Permission.READ_CONNECTIONS,
    Permission.WRITE_CONNECTIONS,
    Permission.DELETE_CONNECTIONS,
    Permission.READ_LOGS,
    Permission.DELETE_LOGS,
    Permission.ADMIN_ACCESS
  ],
  [UserRole.USER]: [
    Permission.READ_DEVICES,
    Permission.WRITE_DEVICES,
    Permission.READ_MODELS,
    Permission.WRITE_MODELS,
    Permission.READ_CONNECTIONS,
    Permission.WRITE_CONNECTIONS,
    Permission.READ_LOGS
  ],
  [UserRole.VIEWER]: [Permission.READ_DEVICES, Permission.READ_MODELS, Permission.READ_CONNECTIONS, Permission.READ_LOGS]
}

// Extend Express Request interface to include 'user' property
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

/**
 * Enhanced JWT authentication middleware with proper validation and error handling
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`requireAuth: Missing or invalid Authorization header for ${req.method} ${req.originalUrl}`)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Please provide a valid Bearer token.'
    })

    return
  }

  const token = authHeader.substring('Bearer '.length).trim()

  if (!token) {
    logger.warn(`requireAuth: Empty Bearer token for ${req.method} ${req.originalUrl}`)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Bearer token is empty'
    })

    return
  }

  try {
    // Verify JWT token with proper secret
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload

    // Additional security checks
    if (!payload.id || !payload.username) {
      logger.warn(`requireAuth: Invalid token payload for ${req.method} ${req.originalUrl}`)
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token payload'
      })

      return
    }

    // Check token expiration (JWT library already does this, but we can add custom logic)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      logger.warn(`requireAuth: Expired token for user ${payload.username} on ${req.method} ${req.originalUrl}`)
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired'
      })

      return
    }

    // Attach user to request
    req.user = payload
    logger.info(`requireAuth: User ${payload.username} authenticated for ${req.method} ${req.originalUrl}`)
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (error instanceof jwt.TokenExpiredError) {
      logger.warn(`requireAuth: Expired token for ${req.method} ${req.originalUrl}`)
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired'
      })
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`requireAuth: Invalid JWT token for ${req.method} ${req.originalUrl}: ${errorMessage}`)
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format'
      })
    } else {
      logger.error(`requireAuth: Token verification error for ${req.method} ${req.originalUrl}: ${errorMessage}`)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication service error'
      })
    }

    return
  }
}

/**
 * Optional authentication middleware - allows both authenticated and unauthenticated requests
 */
export const optionalAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No authentication provided, continue without user context
    logger.debug(`optionalAuth: No authentication provided for ${req.method} ${req.originalUrl}`)
    next()

    return
  }

  const token = authHeader.substring('Bearer '.length).trim()

  if (!token) {
    logger.debug(`optionalAuth: Empty Bearer token for ${req.method} ${req.originalUrl}`)
    next()

    return
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload

    if (payload.id && payload.username) {
      req.user = payload
      logger.info(`optionalAuth: User ${payload.username} authenticated for ${req.method} ${req.originalUrl}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.warn(`optionalAuth: Invalid token provided for ${req.method} ${req.originalUrl}: ${errorMessage}`)
    // Continue without authentication for optional auth
  }

  next()
}

/**
 * Role-based authorization middleware factory
 */
export const requireRole = (requiredRole: UserRole): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn(`requireRole: No authenticated user for ${req.method} ${req.originalUrl}`)
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })

      return
    }

    const userRole = req.user.role as UserRole

    if (!userRole) {
      logger.warn(`requireRole: No role assigned to user ${req.user.username} for ${req.method} ${req.originalUrl}`)
      res.status(403).json({
        error: 'Forbidden',
        message: 'No role assigned to user'
      })

      return
    }

    // Admin has access to everything
    if (userRole === UserRole.ADMIN) {
      logger.info(`requireRole: Admin user ${req.user.username} authorized for ${req.method} ${req.originalUrl}`)
      next()

      return
    }

    // Check if user has the required role
    if (userRole !== requiredRole) {
      logger.warn(`requireRole: User ${req.user.username} with role ${userRole} denied access to ${req.method} ${req.originalUrl} (requires ${requiredRole})`)
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${requiredRole}`
      })

      return
    }

    logger.info(`requireRole: User ${req.user.username} with role ${userRole} authorized for ${req.method} ${req.originalUrl}`)
    next()
  }
}

/**
 * Permission-based authorization middleware factory
 */
export const requirePermission = (requiredPermission: Permission): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn(`requirePermission: No authenticated user for ${req.method} ${req.originalUrl}`)
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })

      return
    }

    const userRole = req.user.role as UserRole
    const userPermissions = req.user.permissions || []
    // Get permissions from role if not explicitly set
    const rolePermissions = userRole ? ROLE_PERMISSIONS[userRole] || [] : []
    const allPermissions = [...userPermissions, ...rolePermissions]

    if (!allPermissions.includes(requiredPermission)) {
      logger.warn(`requirePermission: User ${req.user.username} denied ${requiredPermission} for ${req.method} ${req.originalUrl}`)
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required permission: ${requiredPermission}`
      })

      return
    }

    logger.info(`requirePermission: User ${req.user.username} authorized with ${requiredPermission} for ${req.method} ${req.originalUrl}`)
    next()
  }
}

/**
 * Admin-only access middleware
 */
export const requireAdmin: RequestHandler = requireRole(UserRole.ADMIN)
