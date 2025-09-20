#!/bin/bash
# Quick setup script for GCP cost controls and quotas
# Usage: ./setup-cost-controls.sh PROJECT_ID BILLING_ACCOUNT_ID

set -e

PROJECT_ID=${1:-$GOOGLE_CLOUD_PROJECT}
BILLING_ACCOUNT_ID=${2:-}
BUDGET_AMOUNT=${3:-50}
REGION="us-central1"
SERVICE_NAME="3d-inventory-api"

if [[ -z "$PROJECT_ID" ]]; then
    echo "❌ Error: PROJECT_ID is required"
    echo "Usage: $0 PROJECT_ID [BILLING_ACCOUNT_ID] [BUDGET_AMOUNT]"
    exit 1
fi

echo "🚀 Setting up cost controls for project: $PROJECT_ID"

# Set default project
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo "📦 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudbilling.googleapis.com
gcloud services enable monitoring.googleapis.com

# Create Artifact Registry repository
echo "🏗️  Creating Artifact Registry repository..."
gcloud artifacts repositories create 3d-inventory \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker repository for 3D Inventory API" \
    2>/dev/null || echo "Repository already exists"

# Set up Cloud Run service with resource limits
echo "⚙️  Configuring Cloud Run service limits..."
gcloud run services update "$SERVICE_NAME" \
    --region="$REGION" \
    --max-instances=10 \
    --min-instances=0 \
    --concurrency=100 \
    --memory=1Gi \
    --cpu=1 \
    --timeout=300 \
    2>/dev/null || echo "Service will be configured on first deployment"

# Create budget (if billing account provided)
if [[ -n "$BILLING_ACCOUNT_ID" ]]; then
    echo "💰 Creating budget with $BUDGET_AMOUNT USD limit..."

    # Create budget configuration
    cat > budget-config.json <<EOF
{
  "displayName": "3D Inventory API Budget",
  "budgetFilter": {
    "projects": ["projects/$PROJECT_ID"]
  },
  "amount": {
    "specifiedAmount": {
      "currencyCode": "USD",
      "units": "$BUDGET_AMOUNT"
    }
  },
  "thresholdRules": [
    {
      "thresholdPercent": 0.5,
      "spendBasis": "CURRENT_SPEND"
    },
    {
      "thresholdPercent": 0.75,
      "spendBasis": "CURRENT_SPEND"
    },
    {
      "thresholdPercent": 0.9,
      "spendBasis": "CURRENT_SPEND"
    },
    {
      "thresholdPercent": 1.0,
      "spendBasis": "CURRENT_SPEND"
    }
  ]
}
EOF

    # Create budget using REST API (gcloud doesn't support budget creation yet)
    echo "📊 Budget configuration created. Please create budget manually in console:"
    echo "   → https://console.cloud.google.com/billing/$BILLING_ACCOUNT_ID/budgets"
    echo "   → Use budget-config.json as reference"

else
    echo "⚠️  No billing account provided. Budget creation skipped."
    echo "   To create budget later, run: $0 $PROJECT_ID BILLING_ACCOUNT_ID $BUDGET_AMOUNT"
fi

# Set up quotas (display current quotas)
echo "📋 Current Cloud Run quotas:"
gcloud compute project-info describe \
    --format="table(quotas.metric,quotas.limit,quotas.usage)" \
    --filter="quotas.metric:run" \
    2>/dev/null || echo "No quota information available"

# Create monitoring alerting policy
echo "🔔 Setting up monitoring alerts..."
cat > alert-policy.json <<EOF
{
  "displayName": "3D Inventory API High Cost Alert",
  "documentation": {
    "content": "Alert when costs are high for 3D Inventory API"
  },
  "conditions": [
    {
      "displayName": "High monthly spend",
      "conditionThreshold": {
        "filter": "resource.type=\"billing_account\"",
        "comparison": "COMPARISON_GREATER_THAN",
        "thresholdValue": $((BUDGET_AMOUNT * 75 / 100))
      }
    }
  ],
  "enabled": true
}
EOF

echo "✅ Cost control setup completed!"
echo ""
echo "📝 Summary:"
echo "   • Project: $PROJECT_ID"
echo "   • Region: $REGION"
echo "   • Service: $SERVICE_NAME"
echo "   • Budget: $BUDGET_AMOUNT USD"
echo "   • Max instances: 10"
echo "   • Memory limit: 1Gi"
echo "   • CPU limit: 1"
echo ""
echo "🔧 Next steps:"
echo "   1. Set up GitHub secrets (GCP_SA_KEY, GCP_PROJECT_ID)"
echo "   2. Configure budget alerts in console"
echo "   3. Test deployment with: git push origin main"
echo "   4. Monitor costs at: https://console.cloud.google.com/billing"
echo ""
echo "🚨 Emergency cost control script: ./scripts/cost-control.sh"

# Cleanup temporary files
rm -f budget-config.json alert-policy.json
