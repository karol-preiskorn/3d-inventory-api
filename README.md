# 3d-inventory-mongo-api

1. [3d-inventory-mongo-api](#3d-inventory-mongo-api)
   1. [Purposes](#purposes)
   2. [Architecture](#architecture)
   3. [Features](#features)
      1. [🔐 **Authentication \& Authorization**](#-authentication--authorization)
      2. [📦 **Inventory Management**](#-inventory-management)
      3. [🛡️ **Security Features**](#️-security-features)
      4. [📊 **Monitoring \& Logging**](#-monitoring--logging)
   4. [Data Model](#data-model)
      1. [**Users Collection**](#users-collection)
      2. [**Roles Collection**](#roles-collection)
      3. [**Devices Collection**](#devices-collection)
      4. [**Logs Collection**](#logs-collection)
   5. [API documentation](#api-documentation)
      1. [🔐 **Authentication Endpoints**](#-authentication-endpoints)
      2. [👥 **User Management Endpoints** (Admin/User Access)](#-user-management-endpoints-adminuser-access)
      3. [🔑 **Role Management Endpoints** (Admin Only)](#-role-management-endpoints-admin-only)
      4. [📦 **Inventory Management Endpoints**](#-inventory-management-endpoints)
      5. [🔧 **System Endpoints**](#-system-endpoints)
   6. [Getting Started](#getting-started)
      1. [📋 **Prerequisites**](#-prerequisites)
      2. [🚀 **Installation**](#-installation)
      3. [🔧 **Development Setup**](#-development-setup)
      4. [🐳 **Docker Deployment**](#-docker-deployment)
      5. [🔑 **Default Users**](#-default-users)
      6. [📊 **Technology Stack**](#-technology-stack)
      7. [🔄 **Development Workflow**](#-development-workflow)
   7. [📚 Documentation](#-documentation)
   8. [License](#license)

[![Development time tracker](https://wakatime.com/badge/user/3bbeedbe-0c6a-4a01-b3cd-a85d319a03bf/project/018c29b5-69aa-44a9-823a-51170ee4eafb.svg 'Time spent on development')](https://wakatime.com/badge/user/3bbeedbe-0c6a-4a01-b3cd-a85d319a03bf/project/018c29b5-69aa-44a9-823a-51170ee4eafb)
[![Latest commit](https://badgen.net/github/last-commit/karol-preiskorn/3d-inventory-mongo-api 'Latest commit date')](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/commit/)
[![Open issues](https://img.shields.io/github/issues/karol-preiskorn/3d-inventory-mongo-api.svg 'Number of open issues')](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/issues/)
[![JavaScript Badge](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg 'Made with JavaScript')](https://www.javascript.com)
[![Express version](https://badgen.net/npm/v/express 'Express.js version')](https://npmjs.com/package/express)
[![License](https://badgen.net/github/license/karol-preiskorn/3d-inventory-mongo-api 'Project license')](https://github.com/karol-preiskorn/3d-inventory-mongo-api/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/karol-preiskorn/3d-inventory-mongo-api.svg?style=social&label=Star&maxAge=2592000 'GitHub stars')](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/stargazers/)

## Purposes

The 3D Inventory Mongo API is a comprehensive backend solution for managing
inventory systems with spatial visualization capabilities. Main goals include:

- **Spatial Inventory Management**: Track inventory items with 3D positioning

  and spatial relationships

- **RESTful API Services**: Provide robust endpoints for inventory operations

  (devices, models, connections, logs)

- **User Management & Authentication**: Secure user authentication with

  role-based access control (RBAC)

- **MongoDB Integration**: Leverage NoSQL database for flexible inventory

  data modeling

- **Scalable Architecture**: Support enterprise-level inventory management

  with proper security

## Architecture

The API follows a modern Node.js/Express.js architecture with MongoDB
persistence:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Database      │
│   (Angular)     │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Microservices  │
                       │  • UserService  │
                       │  • RoleService  │
                       │  • AuthService  │
                       └─────────────────┘
```

**Key Components:**

- **Controllers**: Handle HTTP requests and responses

- **Services**: Business logic and database operations

- **Middlewares**: Authentication, authorization, validation

- **Models**: Data structures and validation schemas

- **Routers**: API endpoint definitions

- **Utils**: Configuration, logging, database connections

## Features

### 🔐 **Authentication & Authorization**

- **JWT-based Authentication**: Secure token-based authentication with

  24-hour expiry

- **Role-Based Access Control (RBAC)**: Three-tier permission system

  (ADMIN, USER, VIEWER)

- **Password Security**: bcrypt hashing with 12 salt rounds

- **Account Protection**: Failed login attempt tracking and account locking

- **User Management APIs**: Complete CRUD operations for user accounts

### 📦 **Inventory Management**

- **Device Management**: Track physical and virtual devices with spatial

  positioning

- **Model Management**: Define device types, specifications, and templates

- **Connection Management**: Map relationships between inventory items

- **Attribute System**: Flexible metadata and properties for inventory items

- **Floor Management**: Spatial organization of inventory across building

  floors

### 🛡️ **Security Features**

- **API Rate Limiting**: Protect against abuse and DoS attacks

- **Input Validation**: Comprehensive request validation using OpenAPI

- **CORS Protection**: Configurable cross-origin resource sharing

- **Helmet Security**: Security headers and XSS protection

- **MongoDB Injection Protection**: Input sanitization against NoSQL injection

### 📊 **Monitoring & Logging**

- **Structured Logging**: Comprehensive logging with Winston

- **Health Checks**: API health monitoring endpoints

- **Error Handling**: Centralized error management with proper HTTP status codes

- **Request Tracking**: Detailed request/response logging for debugging

- **Activity Audit Logs**: Complete audit trail for all CRUD operations with user context

- **Login Event Tracking**: Detailed login audit logs including IP addresses, timestamps, and authentication outcomes

- **Change Tracking**: Before/after value tracking for device updates showing exactly what changed

- **User Activity Monitoring**: Track user actions across all system components with detailed metadata

## Data Model

The application uses MongoDB with the following key collections:

### **Users Collection**

```javascript

{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (bcrypt hashed),
  role: String (admin|user|viewer),
  permissions: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

### **Roles Collection**

```javascript

{
  _id: ObjectId,
  name: String,
  displayName: String,
  description: String,
  permissions: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Devices Collection**

```javascript

{
  _id: ObjectId,
  name: String,
  type: String,
  model: ObjectId (ref: Models),
  position: {
    x: Number,
    y: Number,
    z: Number,
    floor: ObjectId (ref: Floors)
  },
  attributes: [ObjectId (ref: Attributes)],
  connections: [ObjectId (ref: Connections)],
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Logs Collection**

```javascript

{
  _id: ObjectId,
  date: String,
  objectId: String (optional - ID of affected object),
  operation: String (create|update|delete|clone|authentication),
  component: String (device|model|floor|user|connection|etc),
  message: {
    // For device updates with change tracking:
    deviceId: String,
    deviceName: String,
    changes: {
      [fieldName]: {
        before: Any,
        after: Any
      }
    },
    updatedFields: [String],
    changeCount: Number,
    // For login events:
    ip: String,
    userAgent: String,
    success: Boolean,
    username: String
  },
  userId: String (optional - user who performed action),
  username: String (optional - username who performed action),
  level: String (info|warn|error)
}
```

**Change Tracking Features:**

- **Before/After Values**: Captures original and new values for all modified fields
- **Field-Level Tracking**: Identifies exactly which fields changed (name, modelId, position, attributes)
- **Position Tracking**: Records coordinate changes with full x, y, h values
- **Attribute Comparison**: Deep comparison of attribute arrays
- **User Context**: Tracks who made the change with userId and username
- **Login Auditing**: Complete audit trail of authentication events with IP addresses

## API documentation

The API provides comprehensive documentation through [Swagger/OpenAPI](https://swagger.io/) specification:

- **Live Documentation**: Available at `https://your-api-url/doc` when server is running

- **OpenAPI Spec**: Located at `./api.yaml` with complete endpoint definitions

- **Authentication**: All protected endpoints require JWT Bearer token

  authorization

- **Role-Based Access**: Endpoints are protected based on user roles

  (ViewerAuth, UserAuth, AdminAuth)

### 🔐 **Authentication Endpoints**

| Endpoint | Method | Description | Auth Required |

| ------------------ | ------ | -------------------------------------------- | ------------- |

| `/login` | POST | User authentication and JWT token generation | No |

| `/login/protected` | GET | Verify JWT token validity | Bearer Token |

### 👥 **User Management Endpoints** (Admin/User Access)

| Endpoint | Method | Description | Auth Required |

| ----------------------- | ------ | --------------------------- | ------------- |

| `/user-management` | GET | Get all users | Admin |

| `/user-management` | POST | Create new user | Admin |

| `/user-management/me` | GET | Get current user profile | User |

| `/user-management/me` | PUT | Update current user profile | User |

| `/user-management/{id}` | GET | Get user by ID | Admin/Own |

| `/user-management/{id}` | PUT | Update user by ID | Admin/Own |

| `/user-management/{id}` | DELETE | Delete user by ID | Admin |

### 🔑 **Role Management Endpoints** (Admin Only)

| Endpoint | Method | Description | Auth Required |

| --------------------------- | ------ | ----------------------- | ------------- |

| `/roles` | GET | Get all roles | Admin |

| `/roles` | POST | Create new role | Admin |

| `/roles/{name}` | GET | Get role by name | Admin |

| `/roles/{name}` | PUT | Update role permissions | Admin |

| `/roles/{name}` | DELETE | Delete role | Admin |

| `/roles/{name}/permissions` | GET | Get role permissions | Admin |

| `/roles/{name}/check` | GET | Check role permission | Admin |

### 📦 **Inventory Management Endpoints**

| Endpoint | Method | Description | Auth Required |

| ---------------------------- | ------ | --------------------------------- | ------------- |

| `/devices` | GET | Get all devices | Viewer+ |

| `/devices` | POST | Create a new device | User+ |

| `/devices/{id}` | GET | Get device by ID | Viewer+ |

| `/devices/{id}` | PUT | Update device by ID | User+ |

| `/devices/{id}` | DELETE | Delete device by ID | Admin |

| `/models` | GET | Get all models | Viewer+ |

| `/models` | POST | Create a new model | User+ |

| `/models/{id}` | GET | Get model by ID | Viewer+ |

| `/models/{id}` | PUT | Update model by ID | User+ |

| `/models/{id}` | DELETE | Delete model by ID | Admin |

| `/connections` | GET | Get all connections | Viewer+ |

| `/connections` | POST | Create a new connection | User+ |

| `/connections/{id}` | GET | Get connection by ID | Viewer+ |

| `/connections/{id}` | PUT | Update connection by ID | User+ |

| `/connections/{id}` | DELETE | Delete connection by ID | Admin |

| `/logs` | GET | Get all logs | Viewer+ |

| `/logs/{id}` | GET | Get log by ID | Viewer+ |

| `/logs/{id}` | DELETE | Delete log by ID | Admin |

| `/logs/login/username/:username` | GET | Get login logs by username | User+ |

| `/logs/login/user/:userId` | GET | Get login logs by user ID | User+ |

| `/attributes` | GET | Get all attributes | Viewer+ |

| `/attributes` | POST | Create a new attribute | User+ |

| `/attributes/{id}` | GET | Get attribute by ID | Viewer+ |

| `/attributes/{id}` | PUT | Update attribute by ID | User+ |

| `/attributes/{id}` | DELETE | Delete attribute by ID | Admin |

| `/attributesDictionary` | GET | Get all attribute dictionary | Viewer+ |

| `/attributesDictionary` | POST | Create a new attribute dictionary | User+ |

| `/attributesDictionary/{id}` | GET | Get attribute dictionary by ID | Viewer+ |

| `/attributesDictionary/{id}` | PUT | Update attribute dictionary by ID | User+ |

| `/attributesDictionary/{id}` | DELETE | Delete attribute dictionary by ID | Admin |

| `/floors` | GET | Get all floors | Viewer+ |

| `/floors` | POST | Create a new floor | User+ |

| `/floors/{id}` | GET | Get floor by ID | Viewer+ |

| `/floors/{id}` | PUT | Update floor by ID | User+ |

| `/floors/{id}` | DELETE | Delete floor by ID | Admin |

### 🔧 **System Endpoints**

| Endpoint | Method | Description | Auth Required |

| --------- | ------ | ------------------------ | ------------- |

| `/health` | GET | API health check | No |

| `/doc` | GET | Swagger UI documentation | No |

| `/readme` | GET | Project documentation | No |

## Getting Started

### 📋 **Prerequisites**

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 22.0.0 or higher

- **npm**: Latest version (comes with Node.js)

- **MongoDB**: Atlas connection or local MongoDB instance

- **Git**: For version control

### 🚀 **Installation**

1. **Clone the repository:**

   ```bash

   git clone https://github.com/karol-preiskorn/3d-inventory-mongo-api.git
   cd 3d-inventory-mongo-api
   ```

2. **Install dependencies:**

   ```bash

   npm install
   ```

3. **Environment configuration:**

   ```bash

   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Required environment variables:**

   ```env

   NODE_ENV=development
   HOST=0.0.0.0
   PORT=8080
   ATLAS_URI=your-mongodb-connection-string
   DBNAME=3d-inventory
   JWT_SECRET=your-secure-jwt-secret
   ```

### 🔧 **Development Setup**

1. **Start development server:**

   ```bash

   npm start
   ```

2. **Build for production:**

   ```bash

   npm run build
   npm run start:prod
   ```

3. **Run tests:**

   ```bash

   npm test
   ```

4. **API Documentation:**
   - Swagger UI: `http://localhost:8080/doc`

   - Health Check: `http://localhost:8080/health`

### 🐳 **Docker Deployment**

1. **Build and run with Docker:**

   ```bash

   npm run docker:build
   npm run docker:run
   ```

2. **Google Cloud Run deployment:**

   ```bash

   npm run gcp:build
   ```

### 🔑 **Default Users**

The system automatically creates default users on first startup:

| Username | Password | Role | Description |

| -------- | -------- | ------ | ------------------ |

| admin | admin | ADMIN | Full system access |

| user | user | USER | Standard user |

| viewer | view | VIEWER | Read-only access |

### 📊 **Technology Stack**

**Backend Framework:**

- **Node.js**: Runtime environment (v22.0.0+)

- **Express.js**: Web application framework (v5.1.0)

- **TypeScript**: Type-safe JavaScript development

**Database & Authentication:**

- **MongoDB**: NoSQL database with Atlas cloud support

- **JWT**: JSON Web Tokens for authentication

- **bcrypt**: Password hashing and security

**Development Tools:**

- **Jest**: Testing framework with coverage reporting

- **ESLint**: Code linting and formatting

- **TypeDoc**: API documentation generation

- **Husky**: Git hooks for code quality

- **Docker**: Containerization support

**Security & Monitoring:**

- **Helmet**: Security headers and XSS protection

- **Rate Limiting**: API request throttling

- **CORS**: Cross-origin resource sharing

- **Winston**: Structured logging system

### 🔄 **Development Workflow**

**Available Scripts:**

```bash

npm start          # Start development server with hot reload
npm run build      # Build for production
npm run test       # Run test suite
npm run lint       # Lint and format code
npm run doc        # Generate API documentation
npm run clean      # Clean build artifacts
```

**Git Hooks:**

- Pre-commit: Automatic linting, formatting, and version bump

- Husky integration for code quality enforcement

## 📚 Documentation

- **[Development Guide](DEVELOPMENT.md)** - Setup and development workflow
- **[AI Agents Guide](AGENTS.md)** - AI-assisted development patterns
- **[Testing Guide](JEST-TESTING.md)** - Comprehensive testing documentation
- **[Troubleshooting Index](docs/TROUBLESHOOTING-INDEX.md)** - Problem fixes and solutions
- **[Security Policies](SECURITY.md)** - Security guidelines

## License

This project is licensed under the [Creative Commons Legal Code](https://github.com/karol-preiskorn/3d-inventory-mongo-api/blob/main/LICENSE).
