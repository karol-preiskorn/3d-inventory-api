#!/bin/bash

# CORS Test Script for 3D Inventory API

echo "=== CORS Test for 3D Inventory API ==="
echo ""

API_URL="https://3d-inventory-api.ultimasolution.pl"
FRONTEND_ORIGIN="https://3d-inventory-ui.ultimasolution.pl"

echo "Testing CORS preflight request to $API_URL/devices"
echo "From origin: $FRONTEND_ORIGIN"
echo ""

# Test OPTIONS preflight request
echo "1. Testing OPTIONS preflight request:"
curl -I -X OPTIONS \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  "$API_URL/devices" \
  -w "HTTP Status: %{http_code}\n" \
  -s

echo ""
echo "2. Testing actual GET request:"
curl -I -X GET \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Content-Type: application/json" \
  "$API_URL/devices" \
  -w "HTTP Status: %{http_code}\n" \
  -s

echo ""
echo "3. Testing with localhost origin (should work for development):"
curl -I -X GET \
  -H "Origin: http://localhost:4200" \
  -H "Content-Type: application/json" \
  "$API_URL/devices" \
  -w "HTTP Status: %{http_code}\n" \
  -s

echo ""
echo "=== Test Complete ==="
