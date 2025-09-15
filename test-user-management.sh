#!/bin/bash

# Test script for MongoDB-based user management
echo "🧪 Testing MongoDB-based User Management System"
echo "==============================================="

# Base URL
BASE_URL="https://0.0.0.0:8080"

echo
echo "1. Testing Login with Admin User..."
ADMIN_RESPONSE=$(curl -k -s -X POST ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}')

if echo "$ADMIN_RESPONSE" | grep -q "token"; then
  echo "✅ Admin login successful"
  ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.token')
  echo "   Token: ${ADMIN_TOKEN:0:50}..."
else
  echo "❌ Admin login failed"
  echo "   Response: $ADMIN_RESPONSE"
fi

echo
echo "2. Testing Login with Carlo User..."
CARLO_RESPONSE=$(curl -k -s -X POST ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -d '{"username":"carlo","password":"carlo123456"}')

if echo "$CARLO_RESPONSE" | grep -q "token"; then
  echo "✅ Carlo login successful"
  CARLO_TOKEN=$(echo "$CARLO_RESPONSE" | jq -r '.token')
  echo "   Token: ${CARLO_TOKEN:0:50}..."
else
  echo "❌ Carlo login failed"
  echo "   Response: $CARLO_RESPONSE"
fi

echo
echo "3. Testing Login with Viewer User..."
VIEWER_RESPONSE=$(curl -k -s -X POST ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -d '{"username":"viewer","password":"viewer123456"}')

if echo "$VIEWER_RESPONSE" | grep -q "token"; then
  echo "✅ Viewer login successful"
  VIEWER_TOKEN=$(echo "$VIEWER_RESPONSE" | jq -r '.token')
  echo "   Token: ${VIEWER_TOKEN:0:50}..."
else
  echo "❌ Viewer login failed"
  echo "   Response: $VIEWER_RESPONSE"
fi

echo
echo "4. Testing User Management Endpoints (Admin only)..."
if [ -n "$ADMIN_TOKEN" ]; then
  echo "   Testing: Get all users..."
  USERS_RESPONSE=$(curl -k -s -X GET ${BASE_URL}/user-management \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  if echo "$USERS_RESPONSE" | grep -q "users"; then
    echo "   ✅ Get users successful"
    USER_COUNT=$(echo "$USERS_RESPONSE" | jq -r '.count')
    echo "      Found $USER_COUNT users"
  else
    echo "   ❌ Get users failed"
    echo "      Response: $USERS_RESPONSE"
  fi
else
  echo "   ⚠️  Skipping user management tests (no admin token)"
fi

echo
echo "5. Testing Role Management Endpoints (Admin only)..."
if [ -n "$ADMIN_TOKEN" ]; then
  echo "   Testing: Get all roles..."
  ROLES_RESPONSE=$(curl -k -s -X GET ${BASE_URL}/roles \
    -H "Authorization: Bearer $ADMIN_TOKEN")

  if echo "$ROLES_RESPONSE" | grep -q "roles"; then
    echo "   ✅ Get roles successful"
    ROLE_COUNT=$(echo "$ROLES_RESPONSE" | jq -r '.count')
    echo "      Found $ROLE_COUNT roles"
  else
    echo "   ❌ Get roles failed"
    echo "      Response: $ROLES_RESPONSE"
  fi
else
  echo "   ⚠️  Skipping role management tests (no admin token)"
fi

echo
echo "6. Testing Invalid Login..."
INVALID_RESPONSE=$(curl -k -s -X POST ${BASE_URL}/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}')

if echo "$INVALID_RESPONSE" | grep -q "Invalid credentials"; then
  echo "✅ Invalid login properly rejected"
else
  echo "❌ Invalid login not properly handled"
  echo "   Response: $INVALID_RESPONSE"
fi

echo
echo "🏁 Test completed!"
