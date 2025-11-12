#!/bin/bash

# Script to Find and Display Workload Identity Provider Information
# This script helps you locate your WIF Provider in the correct format

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Workload Identity Provider Finder ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo -e "${YELLOW}Install it from: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Get current project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)

if [ -z "$CURRENT_PROJECT" ]; then
    echo -e "${YELLOW}⚠️  No default project set${NC}"
    echo -e "${YELLOW}Please enter your GCP Project ID:${NC}"
    read -p "Project ID: " PROJECT_ID
else
    echo -e "${BLUE}Current project: ${CURRENT_PROJECT}${NC}"
    read -p "Use this project? (y/n): " USE_CURRENT
    if [[ $USE_CURRENT =~ ^[Yy]$ ]]; then
        PROJECT_ID=$CURRENT_PROJECT
    else
        read -p "Enter your GCP Project ID: " PROJECT_ID
    fi
fi

echo -e "\n${GREEN}Searching in project: ${PROJECT_ID}${NC}\n"

# Get project number
echo -e "${YELLOW}Step 1: Getting Project Number...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)" 2>/dev/null)

if [ -z "$PROJECT_NUMBER" ]; then
    echo -e "${RED}❌ Could not get project number. Check project ID: ${PROJECT_ID}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project Number: ${PROJECT_NUMBER}${NC}\n"

# List Workload Identity Pools
echo -e "${YELLOW}Step 2: Searching for Workload Identity Pools...${NC}"
POOLS=$(gcloud iam workload-identity-pools list \
    --location=global \
    --project=$PROJECT_ID \
    --format="value(name)" 2>/dev/null)

if [ -z "$POOLS" ]; then
    echo -e "${RED}❌ No Workload Identity Pools found in project ${PROJECT_ID}${NC}"
    echo -e "${YELLOW}You need to create a Workload Identity Pool first.${NC}"
    echo -e "${YELLOW}Run: gcloud iam workload-identity-pools create github-pool --location=global --project=${PROJECT_ID}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found Workload Identity Pools:${NC}"
echo "$POOLS" | nl

# Let user select pool or use first one
POOL_COUNT=$(echo "$POOLS" | wc -l)
if [ $POOL_COUNT -gt 1 ]; then
    echo -e "\n${YELLOW}Multiple pools found. Enter pool number (or press Enter for first):${NC}"
    read -p "Selection: " POOL_SELECTION
    if [ -z "$POOL_SELECTION" ]; then
        POOL_SELECTION=1
    fi
    SELECTED_POOL=$(echo "$POOLS" | sed -n "${POOL_SELECTION}p")
else
    SELECTED_POOL=$(echo "$POOLS" | head -n 1)
fi

# Extract pool name from full path
POOL_NAME=$(basename "$SELECTED_POOL")
echo -e "${GREEN}Selected Pool: ${POOL_NAME}${NC}\n"

# List Providers in the selected pool
echo -e "${YELLOW}Step 3: Searching for Providers in pool '${POOL_NAME}'...${NC}"
PROVIDERS=$(gcloud iam workload-identity-pools providers list \
    --workload-identity-pool=$POOL_NAME \
    --location=global \
    --project=$PROJECT_ID \
    --format="value(name)" 2>/dev/null)

if [ -z "$PROVIDERS" ]; then
    echo -e "${RED}❌ No Providers found in pool ${POOL_NAME}${NC}"
    echo -e "${YELLOW}You need to create a Provider first.${NC}"
    echo -e "${YELLOW}Example command:${NC}"
    echo -e "gcloud iam workload-identity-pools providers create-oidc github-provider \\"
    echo -e "  --location=global \\"
    echo -e "  --workload-identity-pool=${POOL_NAME} \\"
    echo -e "  --issuer-uri='https://token.actions.githubusercontent.com' \\"
    echo -e "  --attribute-mapping='google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository' \\"
    echo -e "  --project=${PROJECT_ID}"
    exit 1
fi

echo -e "${GREEN}✅ Found Providers:${NC}"
echo "$PROVIDERS" | nl

# Let user select provider or use first one
PROVIDER_COUNT=$(echo "$PROVIDERS" | wc -l)
if [ $PROVIDER_COUNT -gt 1 ]; then
    echo -e "\n${YELLOW}Multiple providers found. Enter provider number (or press Enter for first):${NC}"
    read -p "Selection: " PROVIDER_SELECTION
    if [ -z "$PROVIDER_SELECTION" ]; then
        PROVIDER_SELECTION=1
    fi
    SELECTED_PROVIDER=$(echo "$PROVIDERS" | sed -n "${PROVIDER_SELECTION}p")
else
    SELECTED_PROVIDER=$(echo "$PROVIDERS" | head -n 1)
fi

# Extract provider name from full path
PROVIDER_NAME=$(basename "$SELECTED_PROVIDER")
echo -e "${GREEN}Selected Provider: ${PROVIDER_NAME}${NC}\n"

# Construct the WIF_PROVIDER value
WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"

# Display results
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}         🎉 FOUND YOUR WIF_PROVIDER! 🎉${NC}"
echo -e "${GREEN}================================================${NC}\n"

echo -e "${BLUE}Copy this value for your GitHub secret:${NC}\n"
echo -e "${YELLOW}WIF_PROVIDER:${NC}"
echo -e "${GREEN}${WIF_PROVIDER}${NC}\n"

echo -e "${GREEN}================================================${NC}\n"

# Also display other useful information
echo -e "${BLUE}Additional Information:${NC}\n"
echo -e "${YELLOW}GCP_PROJECT_ID:${NC}"
echo -e "${GREEN}${PROJECT_ID}${NC}\n"

echo -e "${YELLOW}PROJECT_NUMBER:${NC}"
echo -e "${GREEN}${PROJECT_NUMBER}${NC}\n"

echo -e "${YELLOW}POOL_NAME:${NC}"
echo -e "${GREEN}${POOL_NAME}${NC}\n"

echo -e "${YELLOW}PROVIDER_NAME:${NC}"
echo -e "${GREEN}${PROVIDER_NAME}${NC}\n"

# Get provider details
echo -e "${BLUE}Provider Details:${NC}"
gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
    --workload-identity-pool=$POOL_NAME \
    --location=global \
    --project=$PROJECT_ID \
    --format="table(
        displayName,
        state,
        oidc.issuerUri,
        attributeCondition
    )"

echo -e "\n${GREEN}================================================${NC}"

# Offer to set GitHub secret
echo -e "\n${YELLOW}Would you like to set this as a GitHub secret now? (y/n)${NC}"
read -p "Answer: " SET_SECRET

if [[ $SET_SECRET =~ ^[Yy]$ ]]; then
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
        echo -e "${YELLOW}Install it from: https://cli.github.com/${NC}"
        echo -e "${YELLOW}Then run: gh secret set WIF_PROVIDER --body '${WIF_PROVIDER}' --repo karol-preiskorn/3d-inventory-api${NC}"
    else
        read -p "Enter repository (format: owner/repo, default: karol-preiskorn/3d-inventory-api): " REPO
        if [ -z "$REPO" ]; then
            REPO="karol-preiskorn/3d-inventory-api"
        fi

        gh secret set WIF_PROVIDER --body "$WIF_PROVIDER" --repo "$REPO"
        echo -e "${GREEN}✅ GitHub secret WIF_PROVIDER set successfully!${NC}"
    fi
fi

echo -e "\n${GREEN}✅ Done!${NC}"
