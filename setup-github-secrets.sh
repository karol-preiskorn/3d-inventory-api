#!/bin/bash

# Setup GitHub Secrets for GCP Deployment
# This script adds required secrets to your GitHub repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== GitHub Secrets Setup for GCP Deployment ===${NC}\n"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo -e "${YELLOW}Install it from: https://cli.github.com/${NC}"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo -e "${YELLOW}Running: gh auth login${NC}\n"
    gh auth login
fi

# Repository information
REPO_OWNER="karol-preiskorn"
REPO_NAME="3d-inventory-api"
REPO="${REPO_OWNER}/${REPO_NAME}"

echo -e "${GREEN}Repository: ${REPO}${NC}\n"

# ============================================
# 1. GCP_PROJECT_ID
# ============================================
echo -e "${YELLOW}1. Setting up GCP_PROJECT_ID${NC}"
read -p "Enter your GCP Project ID: " GCP_PROJECT_ID

if [ -z "$GCP_PROJECT_ID" ]; then
    echo -e "${RED}❌ GCP_PROJECT_ID cannot be empty${NC}"
    exit 1
fi

gh secret set GCP_PROJECT_ID --body "$GCP_PROJECT_ID" --repo "$REPO"
echo -e "${GREEN}✅ GCP_PROJECT_ID set successfully${NC}\n"

# ============================================
# 2. WIF_PROVIDER (Workload Identity Federation)
# ============================================
echo -e "${YELLOW}2. Setting up WIF_PROVIDER${NC}"
echo -e "${YELLOW}Format: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_NAME/providers/PROVIDER_NAME${NC}"
echo -e "${YELLOW}Example: projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider${NC}"
read -p "Enter your Workload Identity Provider: " WIF_PROVIDER

if [ -z "$WIF_PROVIDER" ]; then
    echo -e "${RED}❌ WIF_PROVIDER cannot be empty${NC}"
    exit 1
fi

gh secret set WIF_PROVIDER --body "$WIF_PROVIDER" --repo "$REPO"
echo -e "${GREEN}✅ WIF_PROVIDER set successfully${NC}\n"

# ============================================
# 3. WIF_SERVICE_ACCOUNT
# ============================================
echo -e "${YELLOW}3. Setting up WIF_SERVICE_ACCOUNT${NC}"
echo -e "${YELLOW}Format: SERVICE_ACCOUNT_NAME@PROJECT_ID.iam.gserviceaccount.com${NC}"
echo -e "${YELLOW}Example: github-actions@${GCP_PROJECT_ID}.iam.gserviceaccount.com${NC}"
read -p "Enter your Service Account email: " WIF_SERVICE_ACCOUNT

if [ -z "$WIF_SERVICE_ACCOUNT" ]; then
    echo -e "${RED}❌ WIF_SERVICE_ACCOUNT cannot be empty${NC}"
    exit 1
fi

gh secret set WIF_SERVICE_ACCOUNT --body "$WIF_SERVICE_ACCOUNT" --repo "$REPO"
echo -e "${GREEN}✅ WIF_SERVICE_ACCOUNT set successfully${NC}\n"

# ============================================
# Verify secrets were created
# ============================================
echo -e "${GREEN}=== Verifying Secrets ===${NC}"
gh secret list --repo "$REPO"

echo -e "\n${GREEN}✅ All secrets have been configured successfully!${NC}"
echo -e "${YELLOW}Note: Secret values are encrypted and cannot be viewed after creation.${NC}"
