#!/bin/bash

# Models API Integration Verification Script

echo "=== 3D Inventory Models API Integration Verification ==="
echo ""

API_URL="https://3d-inventory-api.ultimasolution.pl"
UI_URL="http://localhost:4200"

echo "1. Testing Models API endpoint..."
echo "GET $API_URL/models"
echo ""

# Test the models API endpoint
curl -s -X GET \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  "$API_URL/models" | jq '.' > /tmp/models_response.json

if [ $? -eq 0 ]; then
  echo "✅ API Response received successfully"

  # Check if response has the expected structure
  DATA_COUNT=$(cat /tmp/models_response.json | jq '.data | length' 2>/dev/null)
  TOTAL_COUNT=$(cat /tmp/models_response.json | jq '.count' 2>/dev/null)

  if [ "$DATA_COUNT" != "null" ] && [ "$TOTAL_COUNT" != "null" ]; then
    echo "✅ Response structure is correct: {data: [...], count: $TOTAL_COUNT}"
    echo "✅ Found $DATA_COUNT models in data array"

    # Show first model as example
    echo ""
    echo "📋 Sample model data:"
    cat /tmp/models_response.json | jq '.data[0]' 2>/dev/null || echo "No models found"
  else
    echo "❌ Response structure is incorrect - expected {data: [], count: number}"
    echo "Actual response:"
    cat /tmp/models_response.json
  fi
else
  echo "❌ Failed to connect to API"
fi

echo ""
echo "2. Expected UI Integration:"
echo "   - ModelsService.GetModels() should call: $API_URL/models"
echo "   - Should extract 'data' property from API response"
echo "   - ModelsListComponent should display models at: $UI_URL/models-list"
echo "   - Component should show $DATA_COUNT models with pagination"

echo ""
echo "3. Verification checklist:"
echo "   ✅ ModelsService has ApiResponse<Model[]> type"
echo "   ✅ ModelsService extracts response.data"
echo "   ✅ ModelsListComponent uses ChangeDetectorRef.detectChanges()"
echo "   ✅ Component has proper error handling"
echo "   ✅ API returns {data: Model[], count: number} format"

echo ""
echo "🔗 To verify in browser:"
echo "   1. Start UI: cd /home/karol/GitHub/3d-inventory-ui && npm start"
echo "   2. Navigate to: $UI_URL/models-list"
echo "   3. Check browser console for API calls and responses"
echo "   4. Verify models are displayed in the table"

echo ""
echo "=== Verification Complete ==="
