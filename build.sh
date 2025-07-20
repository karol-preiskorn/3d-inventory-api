#!/bin/bash

if [[ -r .env ]]; then
  source .env
else
  echo "Error: .env file not found"
  exit 1
fi

# Clean up existing containers
docker rm -f 3d-inventory-api 2>/dev/null

if [[ -z "$GHCR_PAT" ]]; then
  echo "Error: GHCR_PAT environment variable is not set."
  exit 1
fi

if [[ -z "$GH_USERNAME" ]]; then
  echo "Error: GH_USERNAME environment variable is not set."
  exit 1
fi

# Authenticate with registries
if [[ -n "$GHCR_PAT" && -n "$GH_USERNAME" ]]; then
  echo $GHCR_PAT | docker login ghcr.io -u $GH_USERNAME --password-stdin
fi
gcloud auth configure-docker

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION=$(node -p "require('$SCRIPT_DIR/package.json').version")


docker build --target runtime -t 3d-inventory-api .

# docker tag 3d-inventory-api ghcr.io/$GH_USERNAME/3d-inventory-api:${VERSION}
# docker push ghcr.io/$GH_USERNAME/3d-inventory-api:${VERSION}

# docker tag 3d-inventory-api ghcr.io/$GH_USERNAME/3d-inventory-api:latest
# docker push ghcr.io/$GH_USERNAME/3d-inventory-api:latest

docker tag 3d-inventory-api gcr.io/d-inventory-406007/3d-inventory-api:latest
docker push gcr.io/d-inventory-406007/3d-inventory-api:latest

# Test container locally first
echo "Testing container locally..."
docker run --rm -d --name test-api -p 8080:8080 -e PORT=8080 3d-inventory-api
sleep 5
if curl -f http://localhost:8080/health; then
  echo "✅ Container health check passed"
  docker stop test-api
else
  echo "❌ Container health check failed"
  docker stop test-api
  exit 1
fi


# docker run --rm -d --name 3d-inventory-api --network 3d-inventory-network --ip 172.20.0.3 -p ${EXPOSED_PORT}:${EXPOSED_PORT}/tcp 3d-inventory-api:latest

gcloud run deploy d-inventory-api \
  --image gcr.io/d-inventory-406007/3d-inventory-api:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 900 \
  --max-instances 2 \
  --cpu-throttling \
  --execution-environment gen2 \
  --set-env-vars="NODE_ENV=production"

# Get and test the deployment
SERVICE_URL=$(gcloud run services describe d-inventory-api --region europe-west1 --format 'value(status.url)')

echo "🎉 Deployment completed successfully!"
echo "📍 Service URL: $SERVICE_URL"
echo "🔍 Health check: $SERVICE_URL/health"

# Test the deployed service
if curl -f "$SERVICE_URL/health"; then
  echo "✅ Deployed service health check passed"
else
  echo "❌ Deployed service health check failed"
fi
