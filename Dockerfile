# Dockerfile for 3D Inventory API
# This Dockerfile uses a multi-stage build to create a lightweight image for the API.

# Stage 1: Build
FROM node:lts-slim AS builder
WORKDIR /usr/src/3d-inventory-api
COPY package.json package-lock.json .env api.yaml ./
# RUN npm install
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:lts-slim AS runtime

# Install curl for health checks
RUN apt-get update && \
  apt-get install -y curl && \
  rm -rf /var/lib/apt/lists/* && \
  apt-get clean

WORKDIR /usr/src/3d-inventory-api

COPY --from=builder /usr/src/3d-inventory-api/dist ./
COPY --from=builder /usr/src/3d-inventory-api/node_modules ./node_modules

# Copy configuration files (don't copy .env for production)
COPY --from=builder /usr/src/3d-inventory-api/.env ./
COPY --from=builder /usr/src/3d-inventory-api/api.yaml ./

# Create cert directory if needed
RUN mkdir -p cert
COPY cert ./cert

# Cloud Run environment variables
# ENV NODE_ENV=production
# ENV HOST=0.0.0.0
# # Accept secret username and password as environment variables (to be set at runtime)
# ENV ATLAS_URI="mongodb+srv://user:50731BTLjF2wTKMA@cluster0.htgjako.mongodb.net/test?retryWrites=true&w=majority&ssl=true"
# ENV DBNAME="3d-inventory"
# ENV PORT=8080

# Create non-root user for security
# RUN groupadd -r appuser && useradd -r -g appuser appuser
# RUN chown -R appuser:appuser /usr/src/3d-inventory-api
# USER appuser

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f --max-time 10 -k https://0.0.0.0:8080/health || exit 1

# Cloud Run will set PORT dynamically
EXPOSE 8080

# CMD ["node", "./main.js"]
CMD ["node", "./main.js"]
