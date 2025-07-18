# syntax=docker/dockerfile:1

# Dockerfile for 3D Inventory API
# This Dockerfile uses a multi-stage build to create a lightweight image for the API.
# The first stage builds the application using Node.js, and the second stage runs the built application in a smaller image.
# The final image is based on the slim version of Node.js to reduce the size and attack surface.

# Stage 1: Build
FROM node:lts-slim AS builder
# RUN apt update && \
#   apt install -y g++ make && \
#   rm -rf /var/lib/apt/lists/* && \
#   apt clean
WORKDIR /usr/src/3d-inventory-api
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:lts-slim AS runtime
# RUN apt update && \
#   apt install curl iproute2 vim -y && \
#   rm -rf /var/lib/apt/lists/* && \
#   apt clean
WORKDIR /usr/src/3d-inventory-api
COPY --from=builder /usr/src/3d-inventory-api/dist ./dist
COPY --from=builder /usr/src/3d-inventory-api/node_modules ./node_modules
COPY .env api.yaml ./

RUN mkdir -p cert
COPY cert ./cert

# Don't hardcode the port - let Cloud Run set it
ENV NODE_ENV=production
ENV HOST=0.0.0.0

CMD ["node", "dist/src/main.js"]
EXPOSE 8080
