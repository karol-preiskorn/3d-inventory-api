#!/bin/bash

source .env

# Ensure any existing container is removed on exit or error
trap 'docker rm -f 3d-inventory-api 2>/dev/null' EXIT

if [[ -z "$GHCR_PAT" ]]; then
  echo "Error: GHCR_PAT environment variable is not set."
  exit 1
fi

if [[ -z "$GH_USERNAME" ]]; then
  echo "Error: GH_USERNAME environment variable is not set."
  exit 1
fi

echo $GHCR_PAT | docker login ghcr.io -u $GH_USERNAME --password-stdin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION=$(node -p "require('$SCRIPT_DIR/package.json').version")

docker rm -f 3d-inventory-api 2>/dev/null

docker build -t 3d-inventory-api .

# docker tag 3d-inventory-api ghcr.io/$GH_USERNAME/3d-inventory-api:${VERSION}
# docker push ghcr.io/$GH_USERNAME/3d-inventory-api:${VERSION}

docker tag 3d-inventory-api ghcr.io/$GH_USERNAME/3d-inventory-api:latest
docker push ghcr.io/$GH_USERNAME/3d-inventory-api:latest

docker tag 3d-inventory-api gcr.io/d-inventory-406007/3d-inventory-api:latest
docker push gcr.io/d-inventory-406007/3d-inventory-api:latest

EXPOSED_PORT=${EXPOSED_PORT:-3001}

docker run --rm -d --name 3d-inventory-api --network 3d-inventory-network --ip 172.20.0.3 -p ${EXPOSED_PORT}:${EXPOSED_PORT}/tcp 3d-inventory-api:latest

gcloud run deploy d-inventory-api \
  --image gcr.io/d-inventory-406007/3d-inventory-api:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port ${EXPOSED_PORT} \
  --memory 512Mi \
  --cpu 1 \
  --timeout 600 \
  --set-env-vars="NODE_ENV=production"

echo "Deployment completed successfully!"
echo "Service URL: $(gcloud run services describe d-inventory-api --region europe-west1 --format 'value(status.url)')"
