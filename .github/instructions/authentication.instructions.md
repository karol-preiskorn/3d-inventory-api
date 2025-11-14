---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*.ts,**/*.js'
description: Authentication & Authorization Patterns for 3D Inventory API
---

# Authentication & Authorization Instructions

This document defines authentication and authorization patterns for the 3D Inventory API.

## JWT Authentication Standards

### Token Generation

```typescript
// ✅ CORRECT - Secure JWT token generation
import jwt from 'jsonwebtoken'
import config from '../utils/config'

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN || '24h',
    issuer: '3d-inventory-api',
    audience: '3d-inventory-ui',
    algorithm: 'HS256',
  })
}

export interface JwtPayload {
  id: string
  username: string
  role: UserRole
  permissions: string[]
}
```

### Token Validation

```typescript
// ✅ CORRECT - JWT validation middleware
import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../utils/errors'

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next(new UnauthorizedError('Access token required'))
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: '3d-inventory-api',
      audience: '3d-inventory-ui',
    }) as JwtPayload

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token has expired'))
    }
    return next(new UnauthorizedError('Invalid token'))
  }
}
```

## Role-Based Access Control (RBAC)

### User Roles

```typescript
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
  MANAGE_USERS = 'manage:users',
  VIEW_LOGS = 'view:logs',
  ADMIN_ALL = '*',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [Permission.ADMIN_ALL],
  [UserRole.USER]: [Permission.READ_DEVICES, Permission.WRITE_DEVICES, Permission.READ_MODELS, Permission.WRITE_MODELS, Permission.VIEW_LOGS],
  [UserRole.VIEWER]: [Permission.READ_DEVICES, Permission.READ_MODELS],
}
```

### Permission Checking

```typescript
// ✅ CORRECT - Permission-based authorization
export const authorizePermission = (requiredPermission: Permission): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'))
    }

    const userPermissions = req.user.permissions || []

    // Admin has all permissions
    if (userPermissions.includes(Permission.ADMIN_ALL)) {
      return next()
    }

    // Check specific permission
    if (userPermissions.includes(requiredPermission)) {
      return next()
    }

    return next(new ForbiddenError('Insufficient permissions'))
  }
}

// Usage in routes
router.post('/devices', authenticateToken, authorizePermission(Permission.WRITE_DEVICES), createDevice)
```

## Password Security

### Password Hashing

```typescript
// ✅ CORRECT - bcrypt password hashing
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

export const hashPassword = async (password: string): Promise<string> => {
  // Validate password strength
  if (!validatePasswordStrength(password)) {
    throw new ValidationError('Password does not meet security requirements')
  }

  return await bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

export const validatePasswordStrength = (password: string): boolean => {
  // Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return regex.test(password)
}
```

## Login Controller Pattern

```typescript
// ✅ CORRECT - Complete login flow
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      throw new ValidationError('Username and password are required')
    }

    // Get user from database
    const userService = UserService.getInstance()
    const user = await userService.getUserByUsername(username)

    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ForbiddenError('Account is deactivated')
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      username: user.username,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role],
    })

    // Log successful login
    await CreateLog({
      level: 'info',
      message: `User logged in: ${username}`,
      meta: { userId: user._id, username: user.username },
    })

    // Return token and user info (without password)
    res.json(
      successResponse({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      }),
    )
  } catch (error) {
    next(error)
  }
}
```

## Security Best Practices

### 1. Never Store Passwords in Plain Text

```typescript
// ❌ INCORRECT - Storing plain text password
const user = {
  username: 'john',
  password: 'password123',
}

// ✅ CORRECT - Hash password before storing
const user = {
  username: 'john',
  password: await hashPassword('password123'),
}
```

### 2. Use Secure Token Storage

```typescript
// ✅ CORRECT - Client-side token handling
// Store in httpOnly cookie (preferred)
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
})

// Or return to client for localStorage (less secure)
res.json({ token })
```

### 3. Implement Rate Limiting

```typescript
// ✅ CORRECT - Rate limit login attempts
import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/login', loginLimiter, login)
```

### 4. Token Refresh Pattern

```typescript
// ✅ CORRECT - Token refresh endpoint
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body

    // Verify old token (even if expired)
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      ignoreExpiration: true,
    }) as JwtPayload

    // Check if user still exists and is active
    const userService = UserService.getInstance()
    const user = await userService.getUserById(decoded.id)

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid refresh token')
    }

    // Generate new token
    const newToken = generateToken({
      id: user._id,
      username: user.username,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role],
    })

    res.json(successResponse({ token: newToken }))
  } catch (error) {
    next(error)
  }
}
```

## Testing Authentication

```typescript
// Test authentication middleware
describe('authenticateToken', () => {
  it('should accept valid token', async () => {
    const token = generateToken({
      id: '123',
      username: 'test',
      role: UserRole.USER,
      permissions: [],
    })

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request

    const res = {} as Response
    const next = jest.fn()

    authenticateToken(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(req.user).toBeDefined()
  })

  it('should reject missing token', async () => {
    const req = { headers: {} } as Request
    const res = {} as Response
    const next = jest.fn()

    authenticateToken(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError))
  })
})
```

## Related Documentation

- [code_quality_standards.instructions.md](./code_quality_standards.instructions.md)
- [snyk_rules.instructions.md](./snyk_rules.instructions.md)
- [SECURITY.md](../../SECURITY.md)
