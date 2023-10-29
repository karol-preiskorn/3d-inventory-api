# 3d-inventory-mogo-api

1. [3d-inventory-mogo-api](#3d-inventory-mogo-api)
   1. [Purposse](#purposse)
      1. [Architecture](#architecture)
   2. [Stack](#stack)
      1. [Nodejs](#nodejs)
      2. [Project API by Swagger 3+](#project-api-by-swagger-3)
      3. [MongoDB](#mongodb)
   3. [Install node stack](#install-node-stack)

## Purposse

Create API for 3d-inventory application.

### Architecture
![Architecture](assets/architecture.drawio.png)


## Stack

MEANS stack

### Nodejs

    "bcryptjs": "^2.4.3",
    "cookie-session": "^2.0.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.6.3"

### Project API by Swagger 3+

```bash
podman pull docker://swaggerapi/swagger-editor
sudo podman run -d -p 80:8080 docker://swaggerapi/swagger-editor
```

### MongoDB

We can use ModgoDB or programming Mongo Atlas API.

<https://www.mongodb.com/developer/languages/typescript/>

```bash
export MONGODB_VERSION=6.0-ubi8
podman pull mongodb/mongodb-community-server
docker run --name mongodb -d mongodb/mongodb-community-server:$MONGODB_VERSION
podman run -d -it -p 27017:27017
docker run --name mongodb -d -p 27017:27017 -v $(pwd)/data:/data/db mongodb/mongodb-community-server:$MONGODB_VERSION
```

## Install node stack

```bash
npm install --save-exact express cors express-bearer-token @okta/jwt-verifier mongoose
```

