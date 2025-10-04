import { RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import config from '../utils/config'
import getLogger from '../utils/logger'

const logger = getLogger('security-middleware')

/**
 * Enhanced security headers middleware using helmet
 */
export const securityHeaders: RequestHandler = helmet({
  // Enhanced Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\'', '\'nonce-*\''], // Remove unsafe-inline and unsafe-eval
      styleSrc: ['\'self\'', '\'nonce-*\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\''],
      fontSrc: ['\'self\''],
      objectSrc: ['\'none\''],
      mediaSrc: ['\'self\''],
      frameSrc: ['\'none\''],
      baseUri: ['\'self\''],
      formAction: ['\'self\''],
      manifestSrc: ['\'self\''],
      upgradeInsecureRequests: []
    }
  },
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: true,
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
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },
  // Additional security headers
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' }
})

/**
 * Rate limiting middleware for API endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250, // Limit each IP to 250 requests per windowMs
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
    const allowedOrigins = config.CORS_ORIGIN

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
 * Enhanced request sanitization middleware to prevent injection attacks
 */
export const sanitizeInput: RequestHandler = (req, res, next) => {
  try {
    // Sanitize query parameters
    if (req.query) {
      for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeString(req.query[key] as string)
        } else if (Array.isArray(req.query[key])) {
          req.query[key] = (req.query[key] as string[]).map(sanitizeString)
        }
      }
    }

    // Sanitize request parameters
    if (req.params) {
      for (const key in req.params) {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeString(req.params[key])
        }
      }
    }

    // Sanitize request body (for JSON payloads)
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body)
    }

    next()
  } catch (error) {
    logger.error(`Input sanitization error: ${error instanceof Error ? error.message : String(error)}`)
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid input data detected'
    })
  }
}


/**
 * Sanitizes a string by removing potentially dangerous content such as HTML/XML tags,
 * special characters, SQL/NoSQL injection patterns, and JavaScript injection patterns.
 * Also normalizes whitespace.
 *
 * @param input - The string to sanitize.
 * @returns The sanitized string with harmful patterns removed and whitespace normalized.
 */
function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return input

  return (
    input
      // Remove HTML/XML tags
      .replace(/<[^>]*>/g, '')
      // Remove potentially dangerous characters for injection attacks
      .replace(/[<>'"&]/g, '')
      // Remove SQL injection patterns (more comprehensive)
      .replace(/(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UPDATE|UNION|USE|BEGIN|COMMIT|ROLLBACK|OR|AND)\b)/gi, '')
      .replace(/(\b\d+\s*=\s*\d+\b)/gi, '') // Remove patterns like "1=1"
      .replace(/(--|\/\*|\*\/|;)/gi, '') // Remove SQL comment patterns
      // Remove JavaScript injection patterns
      .replace(/(javascript:|vbscript:|onload|onerror|onclick)/gi, '')
      // Remove NoSQL injection patterns
      .replace(/(\$where|\$ne|\$in|\$nin|\$gt|\$lt|\$gte|\$lte|\$regex|\$exists)/gi, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  )
}


/**
 * Recursively sanitizes all string properties within an object, including nested objects and arrays.
 *
 * - Applies `sanitizeString` to every string value found.
 * - Traverses arrays and nested objects up to a maximum depth to prevent stack overflows.
 * - Detects and warns about circular references, skipping their sanitization.
 * - Logs warnings if the maximum depth is exceeded or circular references are found.
 * - Throws an error if sanitization fails due to circular references or other issues.
 *
 * @param obj - The object to be sanitized. All string properties will be sanitized in-place.
 * @throws {Error} If the object structure is invalid or sanitization fails.
 */
function sanitizeObject(obj: Record<string, unknown>): void {
  const maxDepth = 10 // Prevent deeply nested objects
  const seen = new WeakSet() // Track visited objects to prevent circular references
  const sanitizeRecursive = (current: Record<string, unknown>, depth: number): void => {
    if (depth > maxDepth) {
      logger.warn('Object sanitization depth limit exceeded')

      return
    }

    // Check for circular references
    if (seen.has(current)) {
      logger.warn('Circular reference detected during sanitization')

      return
    }

    seen.add(current)

    try {
      for (const key in current) {
        if (typeof current[key] === 'string') {
          current[key] = sanitizeString(current[key] as string)
        } else if (Array.isArray(current[key])) {
          const arr = current[key] as unknown[]

          for (let i = 0; i < arr.length; i++) {
            if (typeof arr[i] === 'string') {
              arr[i] = sanitizeString(arr[i] as string)
            } else if (typeof arr[i] === 'object' && arr[i] !== null) {
              sanitizeRecursive(arr[i] as Record<string, unknown>, depth + 1)
            }
          }
        } else if (typeof current[key] === 'object' && current[key] !== null) {
          sanitizeRecursive(current[key] as Record<string, unknown>, depth + 1)
        }
      }
    } catch (error) {
      logger.error(`Error during object sanitization: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  try {
    sanitizeRecursive(obj, 0)
  } catch {
    logger.error('Failed to sanitize object due to circular references or other errors')
    throw new Error('Invalid object structure detected')
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

/** MongoDB injection sanitization middleware
 * Removes any keys starting with '$' or containing '.' from req.body and req.query
 */
export const mongoSanitize: RequestHandler = (req, res, next) => {
  try {
    // Remove MongoDB operators from all inputs
    const sanitizeMongoObject = (obj: Record<string, unknown>): void => {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          logger.warn(`Potential MongoDB injection attempt: ${key}`)
          delete obj[key]
        } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          sanitizeMongoObject(obj[key] as Record<string, unknown>)
        }
      }
    }

    if (req.body && typeof req.body === 'object') {
      sanitizeMongoObject(req.body)
    }

    if (req.query && typeof req.query === 'object') {
      sanitizeMongoObject(req.query as Record<string, unknown>)
    }

    next()
  } catch (error) {
    logger.error(`MongoDB sanitization error: ${error instanceof Error ? error.message : String(error)}`)
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid query detected'
    })
  }
}

/**
 * IP whitelist middleware (for admin endpoints)
 * @param allowedIPs - Array of allowed IP addresses
 * @returns Express RequestHandler that allows only requests from whitelisted IPs
 *
 * Usage:
 *   app.use('/admin', ipWhitelist(['127.0.0.1', '::1']))
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction callback
 */
export const ipWhitelist = (allowedIPs: string[]): RequestHandler => {
  return (req, res, next) => {
    const xForwardedFor = req.headers['x-forwarded-for']
    const clientIP =
      typeof xForwardedFor === 'string'
        ? xForwardedFor.split(',')[0].trim()
        : req.ip || req.socket.remoteAddress
    // Fallback to req.ip or socket/connection remote address
    const resolvedIP = clientIP || req.ip || req.connection.remoteAddress || req.socket.remoteAddress

    if (!resolvedIP || !allowedIPs.includes(resolvedIP)) {
      logger.warn(`IP ${resolvedIP} denied access to ${req.method} ${req.originalUrl}`)
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied from this IP address'
      })

      return
    }

    logger.info(`IP ${resolvedIP} granted access to ${req.method} ${req.originalUrl}`)
    next()
  }
}
