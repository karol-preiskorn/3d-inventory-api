# 3d-inventory-mongo-api

1. [3d-inventory-mongo-api](#3d-inventory-mongo-api)
   1. [Purposes](#purposes)
   2. [Architecture](#architecture)
   3. [Features](#features)
      1. [MEAN stack](#mean-stack)
   4. [Data Model](#data-model)
   5. [API documentation](#api-documentation)
   6. [Getting Started](#getting-started)
   7. [License](#license)

[![wakatime](https://wakatime.com/badge/user/3bbeedbe-0c6a-4a01-b3cd-a85d319a03bf/project/018c29b5-69aa-44a9-823a-51170ee4eafb.svg)](https://wakatime.com/badge/user/3bbeedbe-0c6a-4a01-b3cd-a85d319a03bf/project/018c29b5-69aa-44a9-823a-51170ee4eafb)[![GitHub latest commit](https://badgen.net/github/last-commit/karol-preiskorn/3d-inventory-mongo-api)](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/commit/)[![GitHub issues](https://img.shields.io/github/issues/karol-preiskorn/3d-inventory-mongo-api.svg)](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/issues/)[![made-with-javascript](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg)](https://www.javascript.com)[![Npm package version](https://badgen.net/npm/v/express)](https://npmjs.com/package/express)[![GitHub license](https://badgen.net/github/license/karol-preiskorn/3d-inventory-mongo-api)](https://github.com/karol-preiskorn/3d-inventory-mongo-api/blob/master/LICENSE)[![GitHub stars](https://img.shields.io/github/stars/karol-preiskorn/3d-inventory-mongo-api.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/stargazers/)

## About

Backend API for the 3D-Inventory platform — a modern inventory management system that combines spatial visualization with structured inventory data.
This Node.js-based API uses MongoDB as its primary database and serves inventory data to a frontend interface built in [✨3d-inventory✨](https://github.com/users/karol-preiskorn/3d-inventory-angular-ui).

🌟 Features

    🗃️ RESTful API for managing inventory elements, racks, rooms, and objects
    🌍 MongoDB schema designed for spatial and visual representation of inventory items
    🧩 Modular structure using Express.js
    🔐 Secure API endpoints with basic validation
    🔄 Designed to support 3D spatial UI representation in real-time
Pozdrawiam,lub

### MEAN stack

- [MongoDB](https://www.mongodb.com/) is a `NoSQL` database that stores data in `JSON` format.
- [Express.js](https://expressjs.com/) is a web application framework for Node.js that simplifies the process of building web servers and APIs.
- [RxJs](https://rxjs.dev/) - Reactive Extensions Library for JavaScript.
- [NodeJS](https://nodejs.org/en) is a `JavaScript` runtime that allows you to run code on the server-side.

## 📚 API Endpoints

[Swagger](https://swagger.io/) API definition.

| Endpoint                        | Method | Description                                      |
|----------------------------------|--------|--------------------------------------------------|
| `/devices`                      | GET    | Get all devices                                  |
| `/devices`                      | POST   | Create a new device                              |
| `/devices/{id}`                 | GET    | Get device by ID                                 |
| `/devices/{id}`                 | PUT    | Update device by ID                              |
| `/devices/{id}`                 | DELETE | Delete device by ID                              |
| `/models`                       | GET    | Get all models                                   |
| `/models`                       | POST   | Create a new model                               |
| `/models/{id}`                  | GET    | Get model by ID                                  |
| `/models/{id}`                  | PUT    | Update model by ID                               |
| `/models/{id}`                  | DELETE | Delete model by ID                               |
| `/connections`                  | GET    | Get all connections                              |
| `/connections`                  | POST   | Create a new connection                          |
| `/connections/{id}`             | GET    | Get connection by ID                             |
| `/connections/{id}`             | PUT    | Update connection by ID                          |
| `/connections/{id}`             | DELETE | Delete connection by ID                          |
| `/logs`                         | GET    | Get all logs                                     |
| `/logs/{id}`                    | GET    | Get log by ID                                    |
| `/attributes`                   | GET    | Get all attributes                               |
| `/attributes`                   | POST   | Create a new attribute                           |
| `/attributes/{id}`              | GET    | Get attribute by ID                              |
| `/attributes/{id}`              | PUT    | Update attribute by ID                           |
| `/attributes/{id}`              | DELETE | Delete attribute by ID                           |
| `/attributesDictionary`         | GET    | Get all attribute dictionary entries             |
| `/attributesDictionary`         | POST   | Create a new attribute dictionary entry          |
| `/attributesDictionary/{id}`    | GET    | Get attribute dictionary entry by ID             |
| `/attributesDictionary/{id}`    | PUT    | Update attribute dictionary entry by ID          |
| `/attributesDictionary/{id}`    | DELETE | Delete attribute dictionary entry by ID          |
| `/floors`                       | GET    | Get all floors                                   |
| `/floors`                       | POST   | Create a new floor                               |
| `/floors/{id}`                  | GET    | Get floor by ID                                  |
| `/floors/{id}`                  | PUT    | Update floor by ID                               |
| `/floors/{id}`                  | DELETE | Delete floor by ID                               |

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
