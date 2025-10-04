# Swagger/OpenAPI Documentation Instructions

This document provides comprehensive instructions for working with Swagger/OpenAPI documentation in the **3D Inventory API** project.

## 📋 Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [OpenAPI Specification](#openapi-specification)
4. [Development Workflow](#development-workflow)
5. [Building and Validation](#building-and-validation)
6. [Testing and Documentation](#testing-and-documentation)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

The **3D Inventory API** uses **OpenAPI 3.0.3** specification with a modular architecture for maintainable and comprehensive API documentation. The project supports both monolithic and modular OpenAPI structures.

### Key Features

- **OpenAPI 3.0.3** specification
- **Modular documentation** structure for better maintainability
- **Swagger UI** integration for interactive API testing
- **Automated building and validation** scripts
- **Express OpenAPI Validator** for request/response validation
- **TypeScript integration** for type-safe API development

## File Structure

```
3d-inventory-api/
├── api.yaml                           # Main monolithic OpenAPI specification (3,065 lines)
├── docs/openapi/                      # Modular OpenAPI documentation
│   ├── api.yaml                       # Main modular specification file
│   ├── README.md                      # OpenAPI modular documentation guide
│   ├── components/                    # Reusable OpenAPI components
│   │   ├── schemas/                   # Data models and schemas
│   │   │   ├── base-responses.yaml    # Standard response formats
│   │   │   ├── devices.yaml          # Device entity schemas
│   │   │   ├── attributes.yaml       # Attribute schemas
│   │   │   └── position.yaml         # Position/coordinate schemas
│   │   ├── responses/                 # HTTP response definitions
│   │   │   └── standard.yaml         # Standard HTTP responses
│   │   ├── parameters/                # Reusable parameters
│   │   │   └── common.yaml           # Common parameters
│   │   └── securitySchemes.yaml      # Authentication schemes
│   └── paths/                         # API endpoint definitions
│       ├── auth.yaml                  # Authentication endpoints
│       ├── health.yaml                # Health check endpoints
│       ├── devices.yaml               # Device management endpoints
│       ├── models.yaml                # 3D model management endpoints
│       ├── connections.yaml           # Device connections endpoints
│       ├── attributes.yaml            # Attributes management endpoints
│       ├── attributes-dictionary.yaml # Attributes dictionary endpoints
│       ├── floors.yaml                # Floor management endpoints
│       ├── logs.yaml                  # Logging and audit endpoints
│       ├── github.yaml                # GitHub integration endpoints
│       └── users.yaml                 # User management endpoints
├── scripts/
│   └── build-openapi-spec.js          # OpenAPI builder and validator script
├── src/controllers/
│   └── doc.ts                         # Swagger UI controller
└── src/main.ts                        # Express server with Swagger UI integration
```

## OpenAPI Specification

### Main Specification Files

#### **Root API Specification (`api.yaml`)**

```yaml
openapi: 3.0.3
info:
  title: API for project 3d-inventory
  description: REST API for **3d-inventory**. Project is a simple solution that allows you to build a spatial and database representation of all types of warehouses and server rooms.
  contact:
    name: 3d-inventory-mongo-api
    url: https://github.com/karol-preiskorn/3d-inventory-mongo-api/
  version: 1.0.2
servers:
  - url: https://3d-inventory-api.ultimasolution.pl
    description: Production API
  - url: http://localhost:8080
    description: Local development
```

#### **Modular Specification (`docs/openapi/api.yaml`)**

- Uses `$ref` references to import modular components
- Cleaner structure for team collaboration
- Easier maintenance and updates

### Supported Endpoints

The API documentation covers the following endpoint groups:

1. **Authentication** (`/login`)
   - JWT token-based authentication
   - User login and token generation

2. **Health Check** (`/health`)
   - System status and health monitoring
   - Database connectivity checks

3. **Devices** (`/api/devices`)
   - CRUD operations for 3D inventory devices
   - Position management (x, y, h coordinates)
   - Device attributes and properties

4. **Models** (`/api/models`)
   - 3D model management
   - Model dimensions and specifications
   - Model images and assets

5. **Connections** (`/api/connections`)
   - Device-to-device connections
   - Network topology management

6. **Attributes** (`/api/attributes`)
   - Device attribute management
   - Dynamic property assignment

7. **Attributes Dictionary** (`/api/attributesDictionary`)
   - Attribute type definitions
   - Validation rules and constraints

8. **Floors** (`/api/floors`)
   - Floor plan management
   - Spatial organization

9. **Logs** (`/api/logs`)
   - Audit logging
   - System activity tracking

10. **Users** (`/api/users`)
    - User management (Admin only)
    - Role-based access control

11. **GitHub Integration** (`/api/github`)
    - GitHub API integration endpoints

### Security Schemes

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from /login endpoint
```

## Development Workflow

### 1. Local Development Setup

```bash
# Install dependencies
npm install

# Start development server with Swagger UI
npm run start

# Access Swagger UI
# Local: http://localhost:8080/doc
# Production: https://3d-inventory-api.ultimasolution.pl/doc
```

### 2. OpenAPI File Management

#### **Working with Monolithic API (`api.yaml`)**

```bash
# Edit the main API specification
vim api.yaml

# Validate the specification
npm run openapi:build
```

#### **Working with Modular API (`docs/openapi/`)**

```bash
# Edit specific endpoint group
vim docs/openapi/paths/devices.yaml

# Edit shared components
vim docs/openapi/components/schemas/devices.yaml

# Build and validate modular specification
npm run openapi:build
```

### 3. Adding New Endpoints

#### **Step 1: Define the Path**

Create or edit the appropriate path file in `docs/openapi/paths/`:

```yaml
# docs/openapi/paths/new-endpoint.yaml
'/api/new-endpoint':
  get:
    tags:
      - new-feature
    summary: Get new endpoint data
    security:
      - BearerAuth: []
    responses:
      '200':
        description: Success
        content:
          application/json:
            schema:
              $ref: '../components/schemas/new-endpoint.yaml#/NewEndpointResponse'
```

#### **Step 2: Define Schemas**

Create schema definitions in `docs/openapi/components/schemas/`:

```yaml
# docs/openapi/components/schemas/new-endpoint.yaml
NewEndpointResponse:
  type: object
  properties:
    success:
      type: boolean
    data:
      type: array
      items:
        $ref: '#/NewEndpointItem'

NewEndpointItem:
  type: object
  required:
    - id
    - name
  properties:
    id:
      type: string
    name:
      type: string
```

#### **Step 3: Update Main Specification**

Add the new path reference to `docs/openapi/api.yaml`:

```yaml
paths:
  # ... existing paths
  $ref: './paths/new-endpoint.yaml'
```

## Building and Validation

### NPM Scripts

```bash
# Build and validate OpenAPI specification
npm run openapi:build

# Format OpenAPI YAML file
npm run openapi:format

# Start server with Swagger UI
npm run start

# Development server with auto-reload
npm run dev
```

### OpenAPI Builder Script (`scripts/build-openapi-spec.js`)

The build script provides:

- **Modular resolution**: Resolves all `$ref` references
- **Validation**: Validates OpenAPI 3.0.3 compliance
- **Output generation**: Creates single consolidated specification
- **Error reporting**: Detailed validation error messages

```bash
# Build with validation
node scripts/build-openapi-spec.js build-and-validate

# Available commands:
# - build: Build specification only
# - validate: Validate specification only
# - build-and-validate: Build and validate (default)
```

### Express OpenAPI Validator Integration

The API uses `express-openapi-validator` for automatic request/response validation:

```typescript
// src/main.ts
import { OpenApiValidator } from 'express-openapi-validator'

// Middleware setup
app.use(
  OpenApiValidator.middleware({
    apiSpec: './api.yaml',
    validateRequests: true,
    validateResponses: true,
    ignorePaths: /.*\/doc(\/.*)?/,
  }),
)
```

## Testing and Documentation

### Swagger UI Features

#### **Interactive Testing**

- **Try it out**: Execute API calls directly from documentation
- **Authentication**: Set JWT Bearer tokens for protected endpoints
- **Request/Response examples**: Live examples with actual data
- **Schema validation**: Real-time validation feedback

#### **Access Points**

**Local Development:**

```
http://localhost:8080/doc
```

**Production:**

```
https://3d-inventory-api.ultimasolution.pl/doc
```

### Authentication in Swagger UI

1. **Obtain JWT Token:**

   ```bash
   curl -X POST https://3d-inventory-api.ultimasolution.pl/login \
     -H "Content-Type: application/json" \
     -d '{"username": "carlo", "password": "carlo123!"}'
   ```

2. **Set Authorization in Swagger UI:**
   - Click **"Authorize"** button in Swagger UI
   - Enter: `Bearer YOUR_JWT_TOKEN_HERE`
   - Click **"Authorize"**

3. **Test Protected Endpoints:**
   - All endpoints with 🔒 lock icon require authentication
   - JWT token will be automatically included in requests

### API Testing Examples

#### **Health Check**

```bash
curl https://3d-inventory-api.ultimasolution.pl/health
```

#### **Device CRUD Operations**

```bash
# Get all devices (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://3d-inventory-api.ultimasolution.pl/api/devices

# Create new device (requires auth)
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Server-01", "modelId": "model-123", "position": {"x": 10, "y": 20, "h": 1}}' \
  https://3d-inventory-api.ultimasolution.pl/api/devices
```

## Best Practices

### 1. **Documentation Standards**

#### **Clear Descriptions**

```yaml
paths:
  '/api/devices':
    get:
      summary: Retrieve all devices
      description: |
        Get a paginated list of all devices in the 3D inventory system.
        Supports filtering by device type, location, and status.

        **Permissions Required:** `read:devices`

        **Rate Limiting:** 100 requests per 15 minutes
```

#### **Comprehensive Examples**

```yaml
responses:
  '200':
    description: List of devices retrieved successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/DeviceListResponse'
        examples:
          success:
            summary: Successful device list response
            value:
              success: true
              data:
                - id: '507f1f77bcf86cd799439011'
                  name: 'Server-01'
                  modelId: 'model-hp-server'
                  position: { x: 10, y: 20, h: 1 }
                  attributes: []
```

### 2. **Schema Design**

#### **Consistent Response Format**

```yaml
components:
  schemas:
    ApiResponse:
      type: object
      required:
        - success
        - message
      properties:
        success:
          type: boolean
        message:
          type: string
        data:
          type: object
        meta:
          type: object
```

#### **Reusable Components**

```yaml
components:
  parameters:
    PageParam:
      name: page
      in: query
      schema:
        type: integer
        minimum: 1
        default: 1
      description: Page number for pagination

    LimitParam:
      name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 10
      description: Number of items per page
```

### 3. **Security Documentation**

#### **Authentication Requirements**

```yaml
paths:
  '/api/users':
    post:
      summary: Create new user
      description: |
        **Admin Only Endpoint**

        Creates a new user account. Requires admin role permissions.

        **Required Permissions:**
        - `admin:access`
        - `user:create`
      security:
        - BearerAuth: []
```

#### **Rate Limiting Information**

```yaml
paths:
  '/login':
    post:
      summary: User authentication
      description: |
        **Rate Limiting:** 5 attempts per 15 minutes per IP address

        Account lockout after 5 failed attempts within 15 minutes.
```

### 4. **Error Documentation**

#### **Comprehensive Error Responses**

```yaml
responses:
  '400':
    description: Bad Request - Invalid input data
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/ErrorResponse'
        examples:
          validation_error:
            summary: Validation error example
            value:
              success: false
              message: 'Validation failed'
              errors:
                - field: 'name'
                  message: 'Device name is required'
                - field: 'position.x'
                  message: 'Position X must be a number'
```

## Troubleshooting

### Common Issues

#### **1. OpenAPI Validation Errors**

**Problem:** `$ref resolution failed`

```bash
Error: Cannot resolve $ref: './components/schemas/device.yaml#/Device'
```

**Solution:**

```bash
# Check file exists and path is correct
ls -la docs/openapi/components/schemas/device.yaml

# Validate YAML syntax
npm run openapi:build
```

#### **2. Swagger UI Not Loading**

**Problem:** Swagger UI shows blank page or errors

**Solution:**

```bash
# Check if api.yaml is valid
npm run openapi:build

# Restart server
npm run dev

# Check server logs
tail -f logs/combined.log
```

#### **3. Authentication Issues in Swagger UI**

**Problem:** 401 Unauthorized errors when testing endpoints

**Solution:**

```bash
# 1. Get fresh JWT token
curl -X POST https://3d-inventory-api.ultimasolution.pl/login \
  -H "Content-Type: application/json" \
  -d '{"username": "carlo", "password": "carlo123!"}'

# 2. In Swagger UI: Click "Authorize"
# 3. Enter: Bearer YOUR_JWT_TOKEN_HERE
# 4. Click "Authorize"
```

#### **4. CORS Issues**

**Problem:** Cross-origin requests blocked in Swagger UI

**Solution:**
Check CORS configuration in `src/main.ts`:

```typescript
app.use(
  cors({
    origin: ['http://localhost:4200', 'https://3d-inventory.ultimasolution.pl'],
    credentials: true,
  }),
)
```

### Performance Optimization

#### **1. Large OpenAPI Files**

For large specifications (>3000 lines):

- Use modular structure in `docs/openapi/`
- Split endpoints into logical groups
- Use `$ref` for reusable components
- Build optimized specification with `npm run openapi:build`

#### **2. Swagger UI Loading**

To improve Swagger UI performance:

- Minimize inline examples
- Use external example references
- Enable response compression
- Cache static assets

### Debugging Commands

```bash
# Validate OpenAPI specification
npm run openapi:build

# Check syntax of specific YAML file
npx js-yaml docs/openapi/api.yaml

# Test API endpoint directly
curl -v https://3d-inventory-api.ultimasolution.pl/health

# View server logs
tail -f logs/combined.log

# Test with authentication
curl -H "Authorization: Bearer TOKEN" \
  https://3d-inventory-api.ultimasolution.pl/api/devices
```

## Quick Reference

### Essential Commands

```bash
# Start development with Swagger UI
npm run dev

# Build and validate OpenAPI spec
npm run openapi:build

# Format OpenAPI YAML
npm run openapi:format

# Test authentication
npm run test:auth
```

### Key URLs

- **Local Swagger UI:** http://localhost:8080/doc
- **Production Swagger UI:** https://3d-inventory-api.ultimasolution.pl/doc
- **Health Check:** https://3d-inventory-api.ultimasolution.pl/health
- **Login Endpoint:** https://3d-inventory-api.ultimasolution.pl/login

### Working Credentials

```bash
# Test user credentials
Username: carlo
Password: carlo123!
Role: user
```

---

**Last Updated:** October 4, 2025
**OpenAPI Version:** 3.0.3
**API Version:** 1.0.2

For additional support, refer to the [OpenAPI 3.0.3 Specification](https://swagger.io/specification/) or check the project's [GitHub repository](https://github.com/karol-preiskorn/3d-inventory-mongo-api).
