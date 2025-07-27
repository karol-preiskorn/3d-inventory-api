# Dockerfile for 3D Inventory API

FROM node:lts-slim AS builder

RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/3d-inventory-api
COPY package.json package-lock.json .env api.yaml ./

RUN npm install --omit=dev && npm cache clean --force
COPY . .
RUN npm run build

FROM node:lts-slim AS runtime

# Install curl for health checks and update packages to reduce vulnerabilities
RUN apt-get update && \
  apt-get upgrade -y && \
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

# Create non-root user for security
# RUN groupadd -r appuser && useradd -r -g appuser appuser
# RUN chown -R appuser:appuser /usr/src/3d-inventory-api
# USER appuser

# Health check for Cloud Run
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#   CMD curl -f --max-time 10 -k https://0.0.0.0:8080/health || exit 1

# Cloud Run will set PORT dynamically
EXPOSE 8080

CMD ["node", "./main.js"]
