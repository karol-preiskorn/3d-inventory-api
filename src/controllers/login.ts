import { NextFunction, Request, RequestHandler, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../middlewares/auth'
import { CreateLog } from '../services/logs'
import { UserService } from '../services/UserService'
import config from '../utils/config'
import getLogger from '../utils/logger'

const logger = getLogger('login')
const JWT_SECRET = config.JWT_SECRET

/**
 * Extract client IP address from request
 * Handles various proxy configurations and fallback scenarios
 */
function getClientIP(req: Request): string {
  const xForwardedFor = req.headers['x-forwarded-for']
  const clientIP = xForwardedFor
    ? Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor.split(',')[0].trim()
    : req.ip || req.socket.remoteAddress || 'unknown'

  return clientIP || 'unknown'
}

// Extend Express Request interface to include 'user' property using module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload
  }
}

/**
 * Handle user login and JWT token generation with MongoDB authentication
 * Creates audit log entry with user IP address
 */
export const loginUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body
    const clientIP = getClientIP(req)
    const userAgent = req.headers['user-agent'] || 'unknown'

    if (!username || !password) {
      logger.warn(`Login attempt without username or password from IP: ${clientIP}`)

      // Log failed login attempt (missing credentials)
      await CreateLog(
        'system',
        {
          action: 'login_failed',
          reason: 'missing_credentials',
          ip: clientIP,
          userAgent: userAgent,
          timestamp: new Date().toISOString()
        },
        'authentication',
        'auth'
      )

      res.status(400).json({
        error: 'Bad Request',
        message: 'Username and password are required'
      })

      return
    }

    // Authenticate user with MongoDB
    const user = await UserService.getInstance().authenticateUser(username, password)

    if (!user) {
      logger.warn(`Invalid login attempt for user: ${username} from IP: ${clientIP}`)

      // Log failed login attempt (invalid credentials)
      await CreateLog(
        'system',
        {
          action: 'login_failed',
          reason: 'invalid_credentials',
          username: username,
          ip: clientIP,
          userAgent: userAgent,
          timestamp: new Date().toISOString()
        },
        'authentication',
        'auth'
      )

      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      })

      return
    }

    // Generate enhanced JWT token with role and permissions
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      id: user._id ? user._id.toString() : '',
      username: user.username,
      role: user.role,
      permissions: user.permissions
    }
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h', // Extended to 24 hours for better UX
      issuer: '3d-inventory-api',
      audience: '3d-inventory-client'
    })

    // Log successful login with IP address and user details
    logger.info(`User logged in successfully: ${username} (role: ${user.role}) from IP: ${clientIP}`)

    await CreateLog(
      user._id ? user._id.toString() : 'unknown',
      {
        action: 'login_success',
        username: user.username,
        role: user.role,
        ip: clientIP,
        userAgent: userAgent,
        permissions: user.permissions?.length || 0,
        timestamp: new Date().toISOString()
      },
      'authentication',
      'auth',
      user._id ? user._id.toString() : undefined,
      user.username
    )

    res.json({
      token,
      user: {
        id: user._id ? user._id.toString() : '',
        username: user.username,
        role: user.role,
        permissions: user.permissions
      },
      expiresIn: '24h'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const clientIP = getClientIP(req)

    logger.error(`Error during login from IP ${clientIP}: ${errorMessage}`)

    // Log system error during login
    await CreateLog(
      'system',
      {
        action: 'login_error',
        error: errorMessage,
        ip: clientIP,
        userAgent: req.headers['user-agent'] || 'unknown',
        timestamp: new Date().toISOString()
      },
      'authentication',
      'auth'
    )

    if (error instanceof Error && error.message.includes('locked')) {
      res.status(423).json({
        error: 'Locked',
        message: error.message
      })

      return
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Internal server error during login'
    })
  }
}

/**
 * Enhanced middleware to verify Bearer token (now using centralized auth middleware)
 * This is kept for backward compatibility but should use requireAuth from middlewares
 */
export function authenticateBearer(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`Missing or invalid Authorization header for ${req.method} ${req.originalUrl}`)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header'
    })

    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: '3d-inventory-api',
      audience: '3d-inventory-client'
    }) as JwtPayload

    // Attach payload to request
    req.user = payload
    logger.info(`Bearer token authenticated for user: ${payload.username} (role: ${payload.role || 'unknown'})`)
    next()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    if (err instanceof jwt.TokenExpiredError) {
      logger.warn(`Expired token for ${req.method} ${req.originalUrl}`)
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired'
      })
    } else if (err instanceof jwt.JsonWebTokenError) {
      logger.warn(`Invalid token for ${req.method} ${req.originalUrl}: ${message}`)
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      })
    } else {
      logger.error(`Token verification error for ${req.method} ${req.originalUrl}: ${message}`)
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication service error'
      })
    }
  }
}

/**
 * Handle protected route access with enhanced user info
 */
export const getProtectedData: RequestHandler = (req: Request, res: Response): void => {
  try {
    const user = req.user

    if (!user) {
      logger.warn(`Protected route accessed without user context for ${req.method} ${req.originalUrl}`)
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User context not found'
      })

      return
    }

    logger.info(`Protected route accessed by user: ${user.username} (role: ${user.role || 'unknown'})`)
    res.json({
      message: 'This is a protected route',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions || []
      },
      timestamp: new Date().toISOString(),
      serverInfo: {
        version: '1.0.0',
        environment: config.NODE_ENV || 'development'
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.error(`Error in protected route: ${errorMessage}`)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Internal server error'
    })
  }
}
