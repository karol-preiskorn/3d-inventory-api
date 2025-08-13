#!/bin/bash

# Simple Google Cloud Run Deployment Script for 3D Inventory API
# This script builds and deploys your API to Google Cloud Run

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-d-inventory-406007}"
SERVICE_NAME="d-inventory-api"
REGION="${GOOGLE_CLOUD_REGION:-europe-west1}"

echo -e "${GREEN}🚀 Deploying 3D Inventory API to Google Cloud Run${NC}"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo -e "${RED}❌ Error: Not authenticated with gcloud${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Check if project is set
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project)
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ Error: No Google Cloud project set${NC}"
        echo "Please run: gcloud config set project YOUR_PROJECT_ID"
        echo "Or set environment variable: export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID"
        exit 1
    fi
fi

echo -e "${GREEN}📊 Project: $PROJECT_ID${NC}"
echo -e "${GREEN}🌍 Region: $REGION${NC}"
echo -e "${GREEN}🔧 Service: $SERVICE_NAME${NC}"

# Enable required APIs
echo -e "${YELLOW}🔧 Enabling required Google Cloud APIs...${NC}"
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,HOST=0.0.0.0" \
    --project $PROJECT_ID

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --format "value(status.url)")

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your API is now available at:${NC}"
echo -e "${GREEN}   $SERVICE_URL${NC}"
echo -e "${GREEN}❤️  Health check:${NC}"
echo -e "${GREEN}   $SERVICE_URL/health${NC}"

# Test the health endpoint
echo -e "${YELLOW}🔍 Testing health endpoint...${NC}"
if curl -f -s "$SERVICE_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but service is deployed${NC}"
    echo -e "${YELLOW}   The service might still be starting up${NC}"
fi

echo -e "${GREEN}🎉 Deployment completed!${NC}"
