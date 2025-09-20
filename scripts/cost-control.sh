#!/bin/bash
# Cost Control Script for 3D Inventory API
# This script monitors and controls GCP costs

set -e

PROJECT_ID="${GCP_PROJECT_ID}"
BILLING_ACCOUNT_ID="${GCP_BILLING_ACCOUNT_ID}"
COST_THRESHOLD=50  # USD
SERVICE_NAME="3d-inventory-api"
REGION="us-central1"

echo "🔍 Checking current costs for project: $PROJECT_ID"

# Function to get current month's costs
get_current_costs() {
    gcloud billing budgets list \
        --billing-account="$BILLING_ACCOUNT_ID" \
        --format="value(amount.specifiedAmount.nanos)" 2>/dev/null || echo "0"
}

# Function to check if costs exceed threshold
check_cost_threshold() {
    local current_cost=$1
    local threshold_nanos=$((COST_THRESHOLD * 1000000000))  # Convert USD to nanos

    if [ "$current_cost" -gt "$threshold_nanos" ]; then
        echo "⚠️  WARNING: Current costs ($current_cost nanos) exceed threshold ($threshold_nanos nanos)"
        return 1
    else
        echo "✅ Costs are within threshold"
        return 0
    fi
}

# Function to scale down services
scale_down_services() {
    echo "🔽 Scaling down services to reduce costs..."

    gcloud run services update "$SERVICE_NAME" \
        --region="$REGION" \
        --min-instances=0 \
        --max-instances=2 \
        --concurrency=50 \
        --memory=512Mi \
        --cpu=0.5

    echo "✅ Services scaled down successfully"
}

# Function to suspend services (emergency)
suspend_services() {
    echo "🛑 EMERGENCY: Suspending services due to cost overrun..."

    gcloud run services update "$SERVICE_NAME" \
        --region="$REGION" \
        --no-traffic

    echo "🚨 Services suspended! Manual intervention required."

    # Send alert (you can integrate with Slack, email, etc.)
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 COST ALERT: 3D Inventory API services suspended due to budget overrun!"}' \
        "$SLACK_WEBHOOK_URL" || echo "Failed to send Slack alert"
}

# Main execution
main() {
    echo "📊 Starting cost monitoring..."

    # Get current costs
    current_cost=$(get_current_costs)
    echo "💰 Current month costs: $current_cost nanos"

    # Check threshold and take action
    if ! check_cost_threshold "$current_cost"; then
        echo "💳 Cost threshold exceeded, taking action..."

        # First try scaling down
        scale_down_services

        # If still over threshold, suspend services
        sleep 60  # Wait a minute
        current_cost=$(get_current_costs)
        if ! check_cost_threshold "$current_cost"; then
            suspend_services
            exit 1
        fi
    fi

    echo "✅ Cost monitoring completed successfully"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
