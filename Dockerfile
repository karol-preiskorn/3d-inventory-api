# Dockerfile for 3D Inventory API
# This Dockerfile uses a multi-stage build to create a lightweight image for the API.

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
# ENV PORT=8080
# ENV HOST=0.0.0.0
#CMD ["ls", "./dist/main.js"]
CMD ["node", "./dist/main.js"]
