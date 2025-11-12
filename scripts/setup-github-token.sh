#!/bin/bash

# Setup GitHub Authentication Token for Cloud Run
# This script configures GH_AUTH_TOKEN for the 3d-inventory-api service

set -e

echo "🔐 GitHub Token Setup for Cloud Run"
echo "===================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed"
    echo "   Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud"
    echo "   Run: gcloud auth login"
    exit 1
fi

echo "✅ gcloud CLI is configured"
echo ""

# Get current project
PROJECT_ID=$(gcloud config get-value project)
echo "📦 Project ID: $PROJECT_ID"
echo ""

# Check if secret already exists
SECRET_NAME="gh-auth-token"
if gcloud secrets describe $SECRET_NAME &>/dev/null; then
    echo "ℹ️  Secret '$SECRET_NAME' already exists"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping token update"
        exit 0
    fi
fi

echo ""
echo "📋 HOW TO GET A GITHUB PERSONAL ACCESS TOKEN:"
echo "   1. Go to: https://github.com/settings/tokens"
echo "   2. Click 'Generate new token' (classic)"
echo "   3. Give it a name (e.g., '3d-inventory-api')"
echo "   4. Select scopes:"
echo "      ☑ repo (full control of private repositories)"
echo "      ☑ public_repo (access to public repositories)"
echo "   5. Generate and copy the token"
echo "   6. Paste it below (it won't be shown as you type)"
echo ""

read -sp "Enter your GitHub Personal Access Token: " GH_TOKEN
echo ""

if [ -z "$GH_TOKEN" ]; then
    echo "❌ Token cannot be empty"
    exit 1
fi

echo ""
echo "🔐 Creating/updating Cloud Run secret..."

# Create or update the secret
if gcloud secrets describe $SECRET_NAME &>/dev/null; then
    echo "$GH_TOKEN" | gcloud secrets versions add $SECRET_NAME --data-file=-
else
    echo "$GH_TOKEN" | gcloud secrets create $SECRET_NAME \
        --replication-policy="automatic" \
        --data-file=-
fi

echo "✅ Secret created/updated successfully"
echo ""

# Now update Cloud Run service
echo "🚀 Updating Cloud Run service with secret..."

gcloud run services update d-inventory-api \
    --update-secrets GH_AUTH_TOKEN=gh-auth-token:latest \
    --region europe-west1

echo "✅ Cloud Run service updated"
echo ""

# Verify
echo "🧪 Verifying configuration..."
sleep 2

RESPONSE=$(curl -s https://d-inventory-api-wzwe3odv7q-ew.a.run.app/github/issues \
    -H "Origin: https://d-inventory-ui-wzwe3odv7q-ew.a.run.app" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo ""
echo "📊 Response Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ GitHub API is working! Issues loaded successfully"
    echo "   Try the UI again - GitHub issues should now display"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ Still getting 401 - Token may be invalid"
    echo "   Verify the token has correct permissions"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "⚠️  Got 403 - Repository may be private and token doesn't have access"
    echo "   Ensure token has 'repo' scope selected"
else
    echo "⚠️  Got HTTP $HTTP_CODE"
    echo "   Response: $BODY"
fi

echo ""
echo "📚 Documentation:"
echo "   - GitHub API docs: https://docs.github.com/en/rest"
echo "   - Token scopes: https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps"
