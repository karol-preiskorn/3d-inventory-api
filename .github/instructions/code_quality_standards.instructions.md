---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**'
description: Code Quality Standards for 3D Inventory API
---

# Code Quality Standards - 3D Inventory API

This document defines the comprehensive code quality standards that must be applied to all code in the 3D Inventory API project.

## 1. TypeScript Strict Mode Compliance

### Requirement: 100% Type Safety Compliance

#### TypeScript Configuration Standards

- **Strict Mode**: All TypeScript files must compile with strict mode enabled
- **No Any Types**: Avoid `any` type usage; use proper type definitions
- **Explicit Return Types**: All functions must have explicit return type annotations
- **Null Safety**: Handle null and undefined values explicitly

#### Implementation Guidelines

```typescript
// ✅ CORRECT - Explicit types and error handling
export const getUserById = async (id: string): Promise<User | null> => {
  if (!id || typeof id !== 'string') {
    throw new ValidationError('Invalid user ID provided')
  }

  const user = await userCollection.findOne({ _id: new ObjectId(id) })
  return user || null
}

// ❌ INCORRECT - Any types and implicit returns
export const getUserById = async (id: any) => {
  const user = await userCollection.findOne({ _id: id })
  return user
}
```

#### Type Definition Requirements

- **Interface Definitions**: Create interfaces for all data structures
- **API Request/Response Types**: Define types for all API endpoints
- **Database Schema Types**: Type all MongoDB collections and documents
- **Service Layer Types**: Explicitly type all service method parameters and returns

```typescript
// Required interface structure
export interface User {
  _id: string
  username: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  role: UserRole
}

export interface UserResponse {
  _id: string
  username: string
  email: string
  role: UserRole
  isActive: boolean
}
```

## 2. ESLint Rules - Consistent Code Style and Quality

### Core ESLint Configuration Requirements

#### Mandatory Rules

```typescript
// eslint.config.ts requirements
export default [
  {
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-return-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',

      // Code quality rules
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      complexity: ['error', { max: 10 }],

      // Import organization
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
          'newlines-between': 'always',
        },
      ],
    },
  },
]
```

#### Code Formatting Standards

- **Prettier Integration**: All code must be formatted with Prettier
- **Line Length**: Maximum 100 characters per line
- **Indentation**: 2 spaces, no tabs
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, double quotes for JSX

#### Import Organization

```typescript
// Required import order
import { Request, Response, NextFunction } from 'express' // External libraries
import { ObjectId, Collection, Db } from 'mongodb' // External libraries

import { getDatabase } from '../utils/db' // Internal utilities
import { CreateLog } from '../services/logs' // Internal services
import getLogger from '../utils/logger' // Internal utilities

import { User, CreateUserRequest } from '../models/User' // Internal models
```

#### Function and Variable Naming

- **Functions**: camelCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE
- **Classes**: PascalCase
- **Interfaces**: PascalCase with descriptive names
- **Private methods**: Prefix with underscore

```typescript
// ✅ CORRECT naming conventions
const MAX_RETRY_ATTEMPTS = 3
const getUserById = async (id: string): Promise<User | null> => { }
class DatabaseService { }
interface CreateUserRequest { }
private _validateUserData(data: any): boolean { }

// ❌ INCORRECT naming
const max_retry = 3
const GetUser = async (id) => { }
class databaseService { }
interface user_request { }
```

## 3. Test Coverage - Comprehensive Scenario Coverage

### Requirement: Minimum 80% Test Coverage

#### Coverage Standards

- **Statement Coverage**: Minimum 80%
- **Branch Coverage**: Minimum 75%
- **Function Coverage**: Minimum 85%
- **Line Coverage**: Minimum 80%

#### Test Structure Requirements

```typescript
// Required test file structure
describe('ComponentName', () => {
  let mockDependency: jest.Mocked<DependencyType>

  beforeEach(() => {
    jest.clearAllMocks()
    mockDependency = createMockDependency()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('methodName', () => {
    it('should handle successful case with valid input', async () => {
      // Arrange
      const input = createValidInput()
      mockDependency.method.mockResolvedValue(expectedResult)

      // Act
      const result = await serviceMethod(input)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(mockDependency.method).toHaveBeenCalledWith(input)
    })

    it('should throw ValidationError for invalid input', async () => {
      // Arrange
      const invalidInput = createInvalidInput()

      // Act & Assert
      await expect(serviceMethod(invalidInput)).rejects.toThrow(ValidationError)
    })
  })
})
```

#### Required Test Scenarios

1. **Happy Path Testing**: All successful execution paths
2. **Error Handling**: All error conditions and edge cases
3. **Input Validation**: Valid and invalid input scenarios
4. **Boundary Testing**: Min/max values, empty inputs, null/undefined
5. **Authentication/Authorization**: All permission levels and access scenarios
6. **Database Operations**: CRUD operations, connection failures, timeouts

#### Mock Requirements

- **Proper Isolation**: Mock all external dependencies
- **Realistic Data**: Use realistic test data that matches production scenarios
- **Error Simulation**: Mock various error conditions
- **State Management**: Proper setup and teardown of test state

```typescript
// Example comprehensive test coverage
describe('AuthenticationService', () => {
  describe('login', () => {
    it('should authenticate valid admin credentials', async () => {})
    it('should authenticate valid user credentials', async () => {})
    it('should reject invalid username', async () => {})
    it('should reject invalid password', async () => {})
    it('should handle database connection errors', async () => {})
    it('should handle password hashing errors', async () => {})
    it('should rate limit excessive attempts', async () => {})
    it('should log successful authentication', async () => {})
    it('should log failed authentication attempts', async () => {})
  })
})
```

## 4. Documentation Standards

### Requirement: Well-documented Test Cases and Code

#### JSDoc Standards for Functions

````typescript
/**
 * Retrieves a user by their unique identifier
 *
 * @param id - The unique user identifier (MongoDB ObjectId string)
 * @returns Promise resolving to User object or null if not found
 * @throws {ValidationError} When id is invalid or missing
 * @throws {DatabaseError} When database operation fails
 *
 * @example
 * ```typescript
 * const user = await getUserById('507f1f77bcf86cd799439011')
 * if (user) {
 *   console.log(`Found user: ${user.username}`)
 * }
 * ```
 */
export const getUserById = async (id: string): Promise<User | null> => {
  // Implementation
}
````

#### Test Documentation Requirements

```typescript
/**
 * Test Suite: Authentication Service
 *
 * This test suite verifies the authentication service functionality including:
 * - User login validation and JWT token generation
 * - Password verification and security measures
 * - Role-based access control and permissions
 * - Error handling for various failure scenarios
 *
 * Dependencies Mocked:
 * - Database connection and user queries
 * - Password hashing and verification
 * - JWT token generation and validation
 * - Logging service for audit trails
 */
describe('AuthenticationService', () => {
  /**
   * Test: Valid Admin Login
   *
   * Scenario: Admin user provides correct credentials
   * Expected: Successful authentication with admin token
   * Verifies: Token contains correct user info and admin role
   */
  it('should authenticate valid admin credentials and return admin token', async () => {
    // Test implementation
  })
})
```

#### Code Comments Requirements

- **Complex Logic**: Comment complex business logic and algorithms
- **API Endpoints**: Document all route handlers with parameter descriptions
- **Error Handling**: Explain error scenarios and recovery mechanisms
- **Security Measures**: Document security implementations and validations

```typescript
// ✅ CORRECT - Comprehensive documentation
/**
 * Database connection middleware with automatic retry logic
 *
 * This middleware ensures database connectivity before processing requests.
 * Implements exponential backoff retry strategy for connection failures.
 */
export const dbConnection: RequestHandler = async (req, res, next) => {
  try {
    // Verify database connection with health check
    const isConnected = await DatabaseService.getInstance().healthCheck()

    if (!isConnected) {
      // Attempt reconnection with retry logic
      await DatabaseService.getInstance().reconnect()
    }

    next()
  } catch (error) {
    // Log connection failure for monitoring
    logger.error('Database connection failed:', error)
    next(new DatabaseError('Database unavailable'))
  }
}
```

## 5. Quality Gate Enforcement

### Pre-commit Hooks Requirements

```bash
#!/bin/sh
# .husky/pre-commit
npm run lint:check        # ESLint validation
npm run type:check        # TypeScript compilation check
npm run test:changed      # Run tests for changed files
npm run format:check      # Prettier formatting check
```

### Pre-push Requirements

```bash
#!/bin/sh
# .husky/pre-push
npm run test:coverage     # Full test coverage validation
npm run build:check       # Production build verification
npm run security:audit    # Security vulnerability scan
```

### CI/CD Quality Gates

- **TypeScript Compilation**: Must pass without errors
- **ESLint Validation**: Must pass all linting rules
- **Test Coverage**: Must meet minimum coverage thresholds
- **Build Verification**: Production build must succeed
- **Security Scan**: No high/critical security vulnerabilities

## 6. Continuous Quality Monitoring

### Metrics Tracking

- **Code Coverage Trends**: Track coverage over time
- **Technical Debt**: Monitor complexity and maintainability
- **Performance Metrics**: Track build times and test execution
- **Security Posture**: Regular vulnerability assessments

### Quality Reviews

- **Code Review Checklist**: Mandatory quality criteria
- **Architecture Reviews**: Design pattern compliance
- **Performance Reviews**: Optimization opportunities
- **Security Reviews**: Security best practice adherence

## 7. Tool Configuration Files

### Required Configuration Files

- **`tsconfig.json`**: TypeScript strict mode configuration
- **`eslint.config.ts`**: ESLint rules and plugins
- **`jest.config.ts`**: Test framework configuration
- **`.prettierrc`**: Code formatting rules
- **`.husky/`**: Git hooks for quality enforcement

### Example tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 8. Quality Metrics and Reporting

### Coverage Reporting

```bash
# Generate comprehensive coverage reports
npm run test:coverage:html    # HTML coverage report
npm run test:coverage:lcov    # LCOV format for CI tools
npm run test:coverage:json    # JSON format for analysis
```

### Quality Dashboard

- **Coverage Metrics**: Real-time coverage tracking
- **Code Quality Scores**: Maintainability and complexity metrics
- **Test Health**: Test success rates and execution times
- **Performance Benchmarks**: Build and runtime performance

---

## Implementation Checklist

- [ ] TypeScript strict mode enabled and all files compile without errors
- [ ] ESLint configuration implemented with all required rules
- [ ] Test coverage meets minimum 80% threshold across all metrics
- [ ] All functions and classes have comprehensive JSDoc documentation
- [ ] Pre-commit and pre-push hooks configured and working
- [ ] CI/CD pipeline includes all quality gates
- [ ] Quality metrics dashboard configured
- [ ] Team trained on quality standards and tools

**Compliance**: All code must meet these standards before merging to main branch.
**Enforcement**: Automated quality gates prevent non-compliant code from being merged.
**Monitoring**: Continuous monitoring ensures quality standards are maintained over time.
