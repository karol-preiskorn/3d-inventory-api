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
   5. [API documentation](#api-documentation)
      1. [🔐 **Authentication Endpoints**](#-authentication-endpoints)
      2. [👥 **User Management Endpoints** (Admin/User Access)](#-user-management-endpoints-adminuser-access)
      3. [🔑 **Role Management Endpoints** (Admin Only)](#-role-management-endpoints-admin-only)
   6. [About](#about)
      1. [MEAN stack](#mean-stack)
   7. [📚 API Endpoints](#-api-endpoints)
      1. [📦 **Inventory Management Endpoints**](#-inventory-management-endpoints)
      2. [🔧 **System Endpoints**](#-system-endpoints)
   8. [Getting Started](#getting-started)
   9. [License](#license)

[![wakatime](https://wakatime.com/badge/user/3bbeedbe-0c6a-4a01-b3cd-a85d319a03bf/project/018c29b5-69aa-44a9-823a-51170ee4eafb.svg)](https://wakatime.com/badge/user/3bbeedbe-0c6a-4a01-b3cd-a85d319a03bf/project/018c29b5-69aa-44a9-823a-51170ee4eafb)
[![GitHub latest commit](https://badgen.net/github/last-commit/karol-preiskorn/3d-inventory-mongo-api)](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/commit/)
[![GitHub issues](https://img.shields.io/github/issues/karol-preiskorn/3d-inventory-mongo-api.svg)](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/issues/)
[![made-with-javascript](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg)](https://www.javascript.com)
[![Npm package version](https://badgen.net/npm/v/express)](https://npmjs.com/package/express)
[![GitHub license](https://badgen.net/github/license/karol-preiskorn/3d-inventory-mongo-api)](https://github.com/karol-preiskorn/3d-inventory-mongo-api/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/karol-preiskorn/3d-inventory-mongo-api.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/stargazers/)

## Purposes

The 3D Inventory Mongo API is a comprehensive backend solution for managing inventory systems with spatial visualization capabilities. Main goals include:

- **Spatial Inventory Management**: Track inventory items with 3D positioning and spatial relationships
- **RESTful API Services**: Provide robust endpoints for inventory operations (devices, models, connections, logs)
- **User Management & Authentication**: Secure user authentication with role-based access control (RBAC)
- **MongoDB Integration**: Leverage NoSQL database for flexible inventory data modeling
- **Scalable Architecture**: Support enterprise-level inventory management with proper security

## Architecture

The API follows a modern Node.js/Express.js architecture with MongoDB persistence:

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

- **JWT-based Authentication**: Secure token-based authentication with 24-hour expiry
- **Role-Based Access Control (RBAC)**: Three-tier permission system (ADMIN, USER, VIEWER)
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Account Protection**: Failed login attempt tracking and account locking
- **User Management APIs**: Complete CRUD operations for user accounts

### 📦 **Inventory Management**

- **Device Management**: Track physical and virtual devices with spatial positioning
- **Model Management**: Define device types, specifications, and templates
- **Connection Management**: Map relationships between inventory items
- **Attribute System**: Flexible metadata and properties for inventory items
- **Floor Management**: Spatial organization of inventory across building floors

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

## API documentation

The API provides comprehensive documentation through [Swagger/OpenAPI](https://swagger.io/) specification:

- **Live Documentation**: Available at `https://your-api-url/doc` when server is running
- **OpenAPI Spec**: Located at `./api.yaml` with complete endpoint definitions
- **Authentication**: All protected endpoints require JWT Bearer token authorization
- **Role-Based Access**: Endpoints are protected based on user roles (ViewerAuth, UserAuth, AdminAuth)

### 🔐 **Authentication Endpoints**

| Endpoint           | Method | Description                                  | Auth Required |
| ------------------ | ------ | -------------------------------------------- | ------------- |
| `/login`           | POST   | User authentication and JWT token generation | No            |
| `/login/protected` | GET    | Verify JWT token validity                    | Bearer Token  |

### 👥 **User Management Endpoints** (Admin/User Access)

| Endpoint                | Method | Description                 | Auth Required |
| ----------------------- | ------ | --------------------------- | ------------- |
| `/user-management`      | GET    | Get all users               | Admin         |
| `/user-management`      | POST   | Create new user             | Admin         |
| `/user-management/me`   | GET    | Get current user profile    | User          |
| `/user-management/me`   | PUT    | Update current user profile | User          |
| `/user-management/{id}` | GET    | Get user by ID              | Admin/Own     |
| `/user-management/{id}` | PUT    | Update user by ID           | Admin/Own     |
| `/user-management/{id}` | DELETE | Delete user by ID           | Admin         |

### 🔑 **Role Management Endpoints** (Admin Only)

| Endpoint                    | Method | Description             | Auth Required |
| --------------------------- | ------ | ----------------------- | ------------- |
| `/roles`                    | GET    | Get all roles           | Admin         |
| `/roles`                    | POST   | Create new role         | Admin         |
| `/roles/{name}`             | GET    | Get role by name        | Admin         |
| `/roles/{name}`             | PUT    | Update role permissions | Admin         |
| `/roles/{name}`             | DELETE | Delete role             | Admin         |
| `/roles/{name}/permissions` | GET    | Get role permissions    | Admin         |
| `/roles/{name}/check`       | GET    | Check role permission   | Admin         |

## About

Backend API for the 3D-Inventory platform — a modern inventory management system
that combines spatial visualization with structured inventory data.
This Node.js-based API uses MongoDB as its primary database and serves inventory
data to a frontend interface built in
[✨3d-inventory✨](https://github.com/users/karol-preiskorn/3d-inventory-angular-ui).

🌟 Features

```
🗃️ RESTful API for managing inventory elements, racks, rooms, and objects
🌍 MongoDB schema designed for spatial and visual representation of inventory items
🧩 Modular structure using Express.js
🔐 Secure API endpoints with basic validation
🔄 Designed to support 3D spatial UI representation in real-time
```

### MEAN stack

- [MongoDB](https://www.mongodb.com/) is a `NoSQL` database that stores data in
  `JSON` format.
- [Express.js](https://expressjs.com/) is a web application framework for Node.js
  that simplifies the process of building web servers and APIs.
- [RxJs](https://rxjs.dev/) - Reactive Extensions Library for JavaScript.
- [NodeJS](https://nodejs.org/en) is a `JavaScript` runtime that allows you to
  run code on the server-side.

## 📚 API Endpoints

[Swagger](https://swagger.io/) API definition available at `/doc` endpoint.

### 📦 **Inventory Management Endpoints**

| Endpoint                     | Method | Description                       | Auth Required |
| ---------------------------- | ------ | --------------------------------- | ------------- |
| `/devices`                   | GET    | Get all devices                   | Viewer+       |
| `/devices`                   | POST   | Create a new device               | User+         |
| `/devices/{id}`              | GET    | Get device by ID                  | Viewer+       |
| `/devices/{id}`              | PUT    | Update device by ID               | User+         |
| `/devices/{id}`              | DELETE | Delete device by ID               | Admin         |
| `/models`                    | GET    | Get all models                    | Viewer+       |
| `/models`                    | POST   | Create a new model                | User+         |
| `/models/{id}`               | GET    | Get model by ID                   | Viewer+       |
| `/models/{id}`               | PUT    | Update model by ID                | User+         |
| `/models/{id}`               | DELETE | Delete model by ID                | Admin         |
| `/connections`               | GET    | Get all connections               | Viewer+       |
| `/connections`               | POST   | Create a new connection           | User+         |
| `/connections/{id}`          | GET    | Get connection by ID              | Viewer+       |
| `/connections/{id}`          | PUT    | Update connection by ID           | User+         |
| `/connections/{id}`          | DELETE | Delete connection by ID           | Admin         |
| `/logs`                      | GET    | Get all logs                      | Viewer+       |
| `/logs/{id}`                 | GET    | Get log by ID                     | Viewer+       |
| `/logs/{id}`                 | DELETE | Delete log by ID                  | Admin         |
| `/attributes`                | GET    | Get all attributes                | Viewer+       |
| `/attributes`                | POST   | Create a new attribute            | User+         |
| `/attributes/{id}`           | GET    | Get attribute by ID               | Viewer+       |
| `/attributes/{id}`           | PUT    | Update attribute by ID            | User+         |
| `/attributes/{id}`           | DELETE | Delete attribute by ID            | Admin         |
| `/attributesDictionary`      | GET    | Get all attribute dictionary      | Viewer+       |
| `/attributesDictionary`      | POST   | Create a new attribute dictionary | User+         |
| `/attributesDictionary/{id}` | GET    | Get attribute dictionary by ID    | Viewer+       |
| `/attributesDictionary/{id}` | PUT    | Update attribute dictionary by ID | User+         |
| `/attributesDictionary/{id}` | DELETE | Delete attribute dictionary by ID | Admin         |
| `/floors`                    | GET    | Get all floors                    | Viewer+       |
| `/floors`                    | POST   | Create a new floor                | User+         |
| `/floors/{id}`               | GET    | Get floor by ID                   | Viewer+       |
| `/floors/{id}`               | PUT    | Update floor by ID                | User+         |
| `/floors/{id}`               | DELETE | Delete floor by ID                | Admin         |

### 🔧 **System Endpoints**

| Endpoint  | Method | Description              | Auth Required |
| --------- | ------ | ------------------------ | ------------- |
| `/health` | GET    | API health check         | No            |
| `/doc`    | GET    | Swagger UI documentation | No            |
| `/readme` | GET    | Project documentation    | No            |

## Getting Started

To get started with the 3D Inventory Mongo API, follow the instructions below:

```bash
git clone https://github.com/karol-preiskorn/3d-inventory-mongo-api.git
cd 3d-inventory-mongo-api
npm install
npm start
```

## License

This project is licensed under the [Creative Commons Legal Code](https://github.com/karol-preiskorn/3d-inventory-mongo-api/blob/main/LICENSE).
