---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*.test.ts,**/*.spec.ts'
description: Comprehensive Test Coverage Standards and Requirements
---

# Test Coverage Standards - Comprehensive Requirements

This document defines the comprehensive test coverage standards and requirements for both API and UI projects in the 3D Inventory system.

## Coverage Requirements

### Minimum Coverage Thresholds

```json
{
  "coverageThreshold": {
    "global": {
      "statements": 80,
      "branches": 75,
      "functions": 85,
      "lines": 80
    },
    "src/controllers/": {
      "statements": 90,
      "branches": 80,
      "functions": 95,
      "lines": 90
    },
    "src/services/": {
      "statements": 85,
      "branches": 80,
      "functions": 90,
      "lines": 85
    },
    "src/middlewares/": {
      "statements": 95,
      "branches": 85,
      "functions": 100,
      "lines": 95
    }
  }
}
```

### Critical Path Coverage

- **Authentication/Authorization**: 100% coverage required
- **Database Operations**: 95% coverage required
- **API Endpoints**: 90% coverage required
- **Security Functions**: 100% coverage required
- **Error Handling**: 95% coverage required

## Test Categories and Standards

### 1. Unit Tests - Component/Service Isolation

```typescript
/**
 * Standard Unit Test Structure
 *
 * Requirements:
 * - Test individual functions/methods in isolation
 * - Mock all external dependencies
 * - Cover happy path, error cases, and edge cases
 * - Use descriptive test names that explain the scenario
 */

describe('UserService', () => {
  let userService: UserService
  let mockRepository: jest.Mocked<UserRepository>
  let mockLogger: jest.Mocked<Logger>

  beforeEach(() => {
    jest.clearAllMocks()

    // Create properly typed mocks
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
    } as jest.Mocked<UserRepository>

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<Logger>

    userService = new UserService(mockRepository, mockLogger)
  })

  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = 'valid-user-id'
      const expectedUser: User = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockRepository.findById.mockResolvedValue(expectedUser)

      // Act
      const result = await userService.getUserById(userId)

      // Assert
      expect(result).toEqual(expectedUser)
      expect(mockRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockRepository.findById).toHaveBeenCalledTimes(1)
      expect(mockLogger.info).toHaveBeenCalledWith(`User retrieved: ${userId}`)
    })

    it('should return null when user is not found', async () => {
      // Arrange
      const userId = 'non-existent-id'
      mockRepository.findById.mockResolvedValue(null)

      // Act
      const result = await userService.getUserById(userId)

      // Assert
      expect(result).toBeNull()
      expect(mockRepository.findById).toHaveBeenCalledWith(userId)
      expect(mockLogger.info).toHaveBeenCalledWith(`User not found: ${userId}`)
    })

    it('should throw ValidationError for invalid ID format', async () => {
      // Arrange
      const invalidId = ''

      // Act & Assert
      await expect(userService.getUserById(invalidId)).rejects.toThrow(ValidationError)

      expect(mockRepository.findById).not.toHaveBeenCalled()
      expect(mockLogger.error).toHaveBeenCalledWith('Invalid user ID provided')
    })

    it('should throw DatabaseError when repository throws error', async () => {
      // Arrange
      const userId = 'valid-id'
      const dbError = new Error('Database connection failed')
      mockRepository.findById.mockRejectedValue(dbError)

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow(DatabaseError)

      expect(mockLogger.error).toHaveBeenCalledWith('Database error retrieving user:', dbError)
    })

    it('should handle null/undefined ID gracefully', async () => {
      // Test multiple edge cases
      await expect(userService.getUserById(null as any)).rejects.toThrow(ValidationError)

      await expect(userService.getUserById(undefined as any)).rejects.toThrow(ValidationError)
    })
  })

  describe('createUser', () => {
    it('should create user with valid data and hashed password', async () => {
      // Arrange
      const userData: CreateUserRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'user',
      }

      const expectedUser: User = {
        id: 'generated-id',
        username: userData.username,
        email: userData.email,
        role: userData.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRepository.findByEmail.mockResolvedValue(null) // Email not taken
      mockRepository.create.mockResolvedValue(expectedUser)

      // Act
      const result = await userService.createUser(userData)

      // Assert
      expect(result).toEqual(expectedUser)
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(userData.email)
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: userData.username,
          email: userData.email,
          role: userData.role,
          // Password should be hashed, not plain text
          password: expect.not.stringMatching(userData.password),
        }),
      )
    })

    it('should throw ValidationError for duplicate email', async () => {
      // Arrange
      const userData: CreateUserRequest = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        role: 'user',
      }

      const existingUser: User = {
        id: 'existing-id',
        username: 'existinguser',
        email: userData.email,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRepository.findByEmail.mockResolvedValue(existingUser)

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow('Email already exists')

      expect(mockRepository.create).not.toHaveBeenCalled()
    })

    // Test validation scenarios
    const invalidUserData = [
      { userData: { username: '', email: 'test@example.com', password: 'pass', role: 'user' }, error: 'Username is required' },
      { userData: { username: 'test', email: 'invalid-email', password: 'pass', role: 'user' }, error: 'Invalid email format' },
      { userData: { username: 'test', email: 'test@example.com', password: '123', role: 'user' }, error: 'Password too short' },
      { userData: { username: 'test', email: 'test@example.com', password: 'pass', role: 'invalid' }, error: 'Invalid role' },
    ]

    test.each(invalidUserData)('should throw ValidationError for $error', async ({ userData, error }) => {
      await expect(userService.createUser(userData as CreateUserRequest)).rejects.toThrow(error)
    })
  })
})
```

### 2. Integration Tests - Multi-Component Interaction

```typescript
/**
 * Integration Test Standards
 *
 * Requirements:
 * - Test interaction between multiple components
 * - Use real implementations where possible
 * - Mock external services (database, HTTP, etc.)
 * - Test complete workflows and user scenarios
 */

describe('Authentication Integration Tests', () => {
  let app: Application
  let authService: AuthenticationService
  let userService: UserService
  let mockDatabase: MockDatabase

  beforeAll(async () => {
    // Setup test application with real services
    mockDatabase = new MockDatabase()
    await mockDatabase.connect()

    userService = new UserService(mockDatabase.userRepository)
    authService = new AuthenticationService(userService)
    app = createTestApp({ authService, userService })
  })

  afterAll(async () => {
    await mockDatabase.disconnect()
  })

  beforeEach(async () => {
    await mockDatabase.clear()
  })

  describe('User Registration and Login Flow', () => {
    it('should complete full user registration and login workflow', async () => {
      // 1. Register new user
      const registrationData = {
        username: 'integrationuser',
        email: 'integration@test.com',
        password: 'SecurePass123!',
      }

      const registrationResponse = await request(app).post('/api/auth/register').send(registrationData).expect(201)

      expect(registrationResponse.body).toMatchObject({
        success: true,
        user: {
          username: registrationData.username,
          email: registrationData.email,
          role: 'user',
          isActive: true,
        },
      })

      // 2. Login with registered credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: registrationData.username,
          password: registrationData.password,
        })
        .expect(200)

      expect(loginResponse.body).toMatchObject({
        success: true,
        token: expect.any(String),
        user: {
          username: registrationData.username,
          email: registrationData.email,
        },
      })

      const token = loginResponse.body.token

      // 3. Access protected route with token
      const protectedResponse = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${token}`).expect(200)

      expect(protectedResponse.body.user.username).toBe(registrationData.username)

      // 4. Verify token contains correct claims
      const decodedToken = jwt.decode(token) as any
      expect(decodedToken).toMatchObject({
        username: registrationData.username,
        role: 'user',
        exp: expect.any(Number),
        iat: expect.any(Number),
      })
    })

    it('should handle authentication errors in complete workflow', async () => {
      // 1. Attempt login with non-existent user
      await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password',
        })
        .expect(401)

      // 2. Create user and attempt login with wrong password
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'correctpassword',
      }

      await request(app).post('/api/auth/register').send(userData).expect(201)

      await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: 'wrongpassword',
        })
        .expect(401)

      // 3. Attempt to access protected route without token
      await request(app).get('/api/users/profile').expect(401)

      // 4. Attempt to access protected route with invalid token
      await request(app).get('/api/users/profile').set('Authorization', 'Bearer invalid.token.here').expect(401)
    })
  })

  describe('Role-Based Access Control Integration', () => {
    let adminToken: string
    let userToken: string

    beforeEach(async () => {
      // Create admin user
      const adminUser = await userService.createUser({
        username: 'admin',
        email: 'admin@test.com',
        password: 'AdminPass123!',
        role: 'admin',
      })

      // Create regular user
      const regularUser = await userService.createUser({
        username: 'user',
        email: 'user@test.com',
        password: 'UserPass123!',
        role: 'user',
      })

      // Get tokens
      const adminLogin = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'AdminPass123!' })

      const userLogin = await request(app).post('/api/auth/login').send({ username: 'user', password: 'UserPass123!' })

      adminToken = adminLogin.body.token
      userToken = userLogin.body.token
    })

    it('should enforce admin-only access to user management endpoints', async () => {
      // Admin should access admin endpoints
      await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`).expect(200)

      // Regular user should be denied access
      await request(app).get('/api/admin/users').set('Authorization', `Bearer ${userToken}`).expect(403)

      // Both should access general endpoints
      await request(app).get('/api/devices').set('Authorization', `Bearer ${adminToken}`).expect(200)

      await request(app).get('/api/devices').set('Authorization', `Bearer ${userToken}`).expect(200)
    })
  })
})
```

### 3. End-to-End Tests - Complete User Workflows

```typescript
/**
 * E2E Test Standards
 *
 * Requirements:
 * - Test complete user workflows from UI to database
 * - Use real HTTP requests and responses
 * - Test browser interactions when applicable
 * - Cover critical business processes
 */

describe('Device Management E2E Tests', () => {
  let adminToken: string
  let userToken: string

  beforeAll(async () => {
    // Setup test data and authentication
    await setupTestDatabase()

    const adminLogin = await authenticateUser('admin', 'admin123!')
    const userLogin = await authenticateUser('user', 'user123!')

    adminToken = adminLogin.token
    userToken = userLogin.token
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  describe('Complete Device Lifecycle', () => {
    it('should handle complete device CRUD operations', async () => {
      // 1. Create device model first
      const modelData = {
        name: 'Test Server Model',
        brand: 'TestBrand',
        category: 'server',
        dimensions: { width: 100, height: 50, depth: 200 },
      }

      const modelResponse = await request(app).post('/api/models').set('Authorization', `Bearer ${adminToken}`).send(modelData).expect(201)

      const modelId = modelResponse.body.data.id

      // 2. Create device
      const deviceData = {
        name: 'Test Server 001',
        modelId: modelId,
        position: { x: 10, y: 20, h: 1 },
        attributes: [
          { key: 'serialNumber', value: 'SN123456' },
          { key: 'location', value: 'Rack A1' },
        ],
      }

      const createResponse = await request(app).post('/api/devices').set('Authorization', `Bearer ${userToken}`).send(deviceData).expect(201)

      const deviceId = createResponse.body.data.id

      expect(createResponse.body.data).toMatchObject({
        name: deviceData.name,
        modelId: modelId,
        position: deviceData.position,
        attributes: deviceData.attributes,
      })

      // 3. Read device
      const readResponse = await request(app).get(`/api/devices/${deviceId}`).set('Authorization', `Bearer ${userToken}`).expect(200)

      expect(readResponse.body.data).toMatchObject(deviceData)

      // 4. Update device
      const updateData = {
        name: 'Updated Server 001',
        position: { x: 15, y: 25, h: 1 },
        attributes: [
          { key: 'serialNumber', value: 'SN123456' },
          { key: 'location', value: 'Rack B2' },
          { key: 'status', value: 'active' },
        ],
      }

      const updateResponse = await request(app).put(`/api/devices/${deviceId}`).set('Authorization', `Bearer ${userToken}`).send(updateData).expect(200)

      expect(updateResponse.body.data).toMatchObject(updateData)

      // 5. List devices (should include updated device)
      const listResponse = await request(app).get('/api/devices').set('Authorization', `Bearer ${userToken}`).expect(200)

      const updatedDevice = listResponse.body.data.find((d: any) => d.id === deviceId)
      expect(updatedDevice).toMatchObject(updateData)

      // 6. Delete device
      await request(app).delete(`/api/devices/${deviceId}`).set('Authorization', `Bearer ${adminToken}`).expect(204)

      // 7. Verify deletion
      await request(app).get(`/api/devices/${deviceId}`).set('Authorization', `Bearer ${userToken}`).expect(404)

      // 8. Clean up model
      await request(app).delete(`/api/models/${modelId}`).set('Authorization', `Bearer ${adminToken}`).expect(204)
    })

    it('should handle device validation errors properly', async () => {
      // Test various validation scenarios
      const invalidDevices = [
        { name: '', modelId: 'valid-id', position: { x: 0, y: 0 } },
        { name: 'Valid Name', modelId: '', position: { x: 0, y: 0 } },
        { name: 'Valid Name', modelId: 'valid-id', position: { x: -1, y: 0 } },
        { name: 'Valid Name', modelId: 'valid-id' }, // Missing position
      ]

      for (const invalidDevice of invalidDevices) {
        await request(app).post('/api/devices').set('Authorization', `Bearer ${userToken}`).send(invalidDevice).expect(400)
      }
    })
  })

  describe('Permission-Based Device Operations', () => {
    it('should enforce proper permissions for device operations', async () => {
      // Create test device as admin
      const deviceData = {
        name: 'Permission Test Device',
        modelId: await createTestModel(),
        position: { x: 0, y: 0, h: 1 },
      }

      const createResponse = await request(app).post('/api/devices').set('Authorization', `Bearer ${adminToken}`).send(deviceData).expect(201)

      const deviceId = createResponse.body.data.id

      // User can read devices
      await request(app).get(`/api/devices/${deviceId}`).set('Authorization', `Bearer ${userToken}`).expect(200)

      // User can update devices they have permission for
      await request(app).put(`/api/devices/${deviceId}`).set('Authorization', `Bearer ${userToken}`).send({ name: 'Updated by User' }).expect(200)

      // Only admin can delete devices
      await request(app).delete(`/api/devices/${deviceId}`).set('Authorization', `Bearer ${userToken}`).expect(403)

      // Admin can delete devices
      await request(app).delete(`/api/devices/${deviceId}`).set('Authorization', `Bearer ${adminToken}`).expect(204)
    })
  })
})
```

## Test Data Management

### Test Data Factories

```typescript
/**
 * Test Data Factory Standards
 *
 * Requirements:
 * - Provide realistic test data
 * - Support customization for specific test scenarios
 * - Generate valid and invalid data sets
 * - Maintain data consistency across tests
 */

export class TestDataFactory {
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: faker.datatype.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  static createCreateUserRequest(overrides: Partial<CreateUserRequest> = {}): CreateUserRequest {
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: 'TestPassword123!',
      role: 'user',
      ...overrides,
    }
  }

  static createDevice(overrides: Partial<Device> = {}): Device {
    return {
      id: faker.datatype.uuid(),
      name: `${faker.company.companyName()} Server`,
      modelId: faker.datatype.uuid(),
      position: {
        x: faker.datatype.number({ min: 0, max: 100 }),
        y: faker.datatype.number({ min: 0, max: 100 }),
        h: faker.datatype.number({ min: 1, max: 10 }),
      },
      attributes: [
        { key: 'serialNumber', value: faker.random.alphaNumeric(10) },
        { key: 'location', value: `Rack ${faker.random.alphaNumeric(2)}` },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  static createInvalidUser(): Partial<CreateUserRequest> {
    const invalidScenarios = [
      { username: '', email: 'valid@email.com', password: 'ValidPass123!' },
      { username: 'validuser', email: 'invalid-email', password: 'ValidPass123!' },
      { username: 'validuser', email: 'valid@email.com', password: '123' },
      { username: 'validuser', email: 'valid@email.com', password: 'ValidPass123!', role: 'invalid-role' },
    ]

    return faker.helpers.arrayElement(invalidScenarios)
  }

  static createUserBatch(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.createUser(overrides))
  }

  static createDatabaseError(message = 'Database operation failed'): Error {
    const error = new Error(message)
    error.name = 'DatabaseError'
    return error
  }
}

// Usage in tests
describe('UserService with Test Data Factory', () => {
  it('should handle batch user creation', async () => {
    const testUsers = TestDataFactory.createUserBatch(5, { role: 'admin' })

    for (const user of testUsers) {
      mockRepository.create.mockResolvedValueOnce(user)
      const result = await userService.createUser(user)
      expect(result.role).toBe('admin')
    }
  })

  it('should validate various invalid user scenarios', async () => {
    const invalidUser = TestDataFactory.createInvalidUser()

    await expect(userService.createUser(invalidUser as CreateUserRequest)).rejects.toThrow(ValidationError)
  })
})
```

## Coverage Reporting and Analysis

### Jest Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts', '!src/**/*.spec.ts', '!src/**/*.test.ts', '!src/tests/**', '!src/**/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov', 'json', 'clover'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80,
    },
  },
}
```

### Coverage Analysis Script

```bash
#!/bin/bash
# scripts/analyze-coverage.sh

echo "🔍 Analyzing test coverage..."

# Run tests with coverage
npm run test:coverage

# Check if coverage meets thresholds
if [ $? -eq 0 ]; then
  echo "✅ Coverage thresholds met"
else
  echo "❌ Coverage thresholds not met"
  exit 1
fi

# Generate coverage badges
npx coverage-badges-cli --output coverage/badges

# Upload coverage to external service (optional)
if [ "$CI" = "true" ]; then
  npx codecov
fi

echo "📊 Coverage report available at: coverage/lcov-report/index.html"
```

## Continuous Integration Integration

### GitHub Actions Coverage Workflow

```yaml
name: Test Coverage Analysis
on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Check coverage thresholds
        run: |
          if ! npm run test:coverage -- --passWithNoTests; then
            echo "Coverage thresholds not met"
            exit 1
          fi

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Comment coverage on PR
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
```

This comprehensive test coverage standard ensures high-quality, maintainable test suites that provide confidence in code reliability and help prevent regressions.
