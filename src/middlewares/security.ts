import { RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import getLogger from '../utils/logger'

const logger = getLogger('security-middleware')

/**
 * Enhanced security headers middleware using helmet
 */
export const securityHeaders: RequestHandler = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\''],
      fontSrc: ['\'self\''],
      objectSrc: ['\'none\''],
      mediaSrc: ['\'self\''],
      frameSrc: ['\'none\'']
    }
  },
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false,
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  // Frame Options
  frameguard: { action: 'deny' },
  // Hide Powered By
  hidePoweredBy: true,
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  // IE No Open
  ieNoOpen: true,
  // No Sniff
  noSniff: true,
  // Origin Agent Cluster
  originAgentCluster: true,
  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,
  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },
  // X-XSS-Protection
  xssFilter: true
})

/**
 * Rate limiting middleware for API endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP ${req.ip} on ${req.method} ${req.originalUrl}`)
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60
    })
  }
})

/**
 * Stricter rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too Many Login Attempts',
    message: 'Too many login attempts from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP ${req.ip} on ${req.method} ${req.originalUrl}`)
    res.status(429).json({
      error: 'Too Many Login Attempts',
      message: 'Too many login attempts from this IP, please try again later.',
      retryAfter: 15 * 60
    })
  }
})

/**
 * CORS configuration middleware
 */
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    // List of allowed origins (customize as needed)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://your-frontend-domain.com'
    ]

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}

/**
 * Request sanitization middleware to prevent injection attacks
 */
export const sanitizeInput: RequestHandler = (req, res, next) => {
  // Remove any potentially dangerous characters from query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/[<>'"]/g, '') // Remove HTML/JS injection chars
          .trim()
      }
    }
  }

  // Sanitize request body (for JSON payloads)
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body)
  }

  next()
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = (obj[key] as string)
        .replace(/[<>'"]/g, '') // Remove HTML/JS injection chars
        .trim()
    } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      sanitizeObject(obj[key] as Record<string, unknown>)
    }
  }
}

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs: number = 30000): RequestHandler => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      logger.warn(`Request timeout for ${req.method} ${req.originalUrl} from IP ${req.ip}`)
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: 'Request took too long to process'
        })
      }
    }, timeoutMs)

    // Clear timeout if response is sent
    res.on('finish', () => clearTimeout(timeout))
    res.on('close', () => clearTimeout(timeout))

    next()
  }
}

/**
 * IP whitelist middleware (for admin endpoints)
 */
export const ipWhitelist = (allowedIPs: string[]): RequestHandler => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      logger.warn(`IP ${clientIP} denied access to ${req.method} ${req.originalUrl}`)
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied from this IP address'
      })

      return
    }

    logger.info(`IP ${clientIP} granted access to ${req.method} ${req.originalUrl}`)
    next()
  }
}
