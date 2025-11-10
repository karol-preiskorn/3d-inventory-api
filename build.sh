#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [[ -r .env ]]; then
  source .env
else
  echo -e "${RED}❌ Exiting: .env file is missing or not readable.${NC}"
  exit 1
fi

# Simple check eslint no errors
if ! npm run lint; then
  echo -e "${RED}❌ Error: ESLint found issues.${NC}"
  exit 1
fi

# Configuration move to environment variables
# PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-d-inventory-406007}"
# SERVICE_NAME="${SERVICE_NAME}"
# REGION="${GOOGLE_CLOUD_REGION:-europe-west1}"

echo -e "${GREEN}✅ Deploying 3D Inventory API to Google Cloud Run${NC}"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo -e "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo -e "${RED}❌ Error: Not authenticated with gcloud${NC}"
    echo -e "Please run: gcloud auth login"
    exit 1
fi

# Check if project is set
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project)
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ Error: No Google Cloud project set${NC}"
        echo -e "Please run: gcloud config set project YOUR_PROJECT_ID"
        echo -e "Or set environment variable: export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Project: $PROJECT_ID${NC}"
echo -e "${GREEN}✅ Region: $REGION${NC}"
echo -e "${GREEN}✅ Service: $SERVICE_NAME${NC}"

# Enable required APIs
echo -e "${YELLOW}⏳ Enabling required Google Cloud APIs...${NC}"
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

# Deploy to Cloud Run
echo -e "${YELLOW}✅ Deploying to Cloud Run...${NC}"

# Ensure cleanup of any running or stopped containers with relevant names
trap 'docker rm -f $PROJECT_NAME test-$PROJECT_NAME 2>/dev/null' EXIT

for cname in $PROJECT_NAME test-$PROJECT_NAME; do
  docker ps -q --filter "name=^/${cname}$" | xargs -r docker stop
  docker ps -aq --filter "name=^/${cname}$" | xargs -r docker rm
done

if [[ -z "$GHCR_PAT" ]]; then
  echo -e "${RED}❌ Error: GHCR_PAT environment variable is not set.${NC}"
  exit 1
fi

if [[ -z "$GH_USERNAME" ]]; then
  echo -e "${RED}❌ Error: GH_USERNAME environment variable is not set.${NC}"
  exit 1
fi

# echo $GHCR_PAT | docker login ghcr.io -u $GH_USERNAME --password-stdin

gcloud auth configure-docker ${REGISTRY}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION=$(node -p "require('$SCRIPT_DIR/package.json').version")

docker build -t ${PROJECT_NAME} .

# docker tag $PROJECT_NAME ghcr.io/$GH_USERNAME/$PROJECT_NAME:${VERSION}
# docker push ghcr.io/$GH_USERNAME/$PROJECT_NAME:${VERSION}

# docker tag ${PROJECT_NAME} ghcr.io/$GH_USERNAME/${PROJECT_NAME}:latest
# docker push ghcr.io/$GH_USERNAME/${PROJECT_NAME}:latest

docker tag ${PROJECT_NAME} ${REGISTRY}/$PROJECT_ID/${PROJECT_NAME}:latest
docker push ${REGISTRY}/$PROJECT_ID/${PROJECT_NAME}:latest

# Test container locally first
echo -e "${GREEN}✅ Testing container locally...${NC}"
docker run --rm -d --name test-${PROJECT_NAME} -p 8080:8080 -e PORT=8080 ${PROJECT_NAME}

# Wait until the test-${PROJECT_NAME} container is healthy or times out
MAX_WAIT=$((10*1))
WAITED=0
echo -e "${YELLOW}⏳ Waiting up to $MAX_WAIT seconds for test-${PROJECT_NAME} to become healthy...${NC}"
until curl -fsSL http://localhost:8080/health > /dev/null 2>&1; do
  if (( WAITED >= MAX_WAIT )); then
    echo -e "${RED}❌ Container did not become healthy within $MAX_WAIT seconds. Exiting.${NC}"
    docker logs test-${PROJECT_NAME}
    docker stop test-${PROJECT_NAME}
    exit 1
  fi
  sleep 1
  ((WAITED++))
done

echo -e "${GREEN}✅ test-${PROJECT_NAME} container is healthy.${NC}"

# docker run --rm -d --name ${PROJECT_NAME} --network 3d-inventory-network --ip 172.20.0.3 -p ${EXPOSED_PORT}:${EXPOSED_PORT}/tcp ${PROJECT_NAME}:latest

gcloud run deploy $SERVICE_NAME \
  --image ${REGISTRY}/$PROJECT_ID/${PROJECT_NAME}:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 120 \
  --max-instances 10 \
  --cpu-throttling \
  --execution-environment gen2 \
  --set-env-vars="NODE_ENV=production,UV_THREADPOOL_SIZE=8" \
  --concurrency=80 \
  --min-instances=1

# Get and test the deployment
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}✅ Service URL: ${SERVICE_URL}${NC}"
echo -e "${GREEN}✅ Health check: ${SERVICE_URL}/health${NC}"
echo -e "${GREEN}✅ Swagger: ${SERVICE_URL}/doc${NC}"
