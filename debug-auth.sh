#!/bin/bash

# 3D Inventory API Authentication Debug Script
# This script helps diagnose login authentication issues

echo "🔍 3D Inventory API Authentication Troubleshooting Guide"
echo "======================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_URL="https://3d-inventory-api.ultimasolution.pl"
LOGIN_ENDPOINT="$API_URL/login"

echo -e "${BLUE}Step 1: API Health Check${NC}"
echo "------------------------"
echo "Testing API connectivity..."

# Test if API is reachable
if ! curl -s --connect-timeout 10 "$API_URL/health" > /dev/null; then
    echo -e "${RED}❌ API server is not reachable at $API_URL${NC}"
    echo "   Check if the server is running and accessible"
    exit 1
else
    echo -e "${GREEN}✅ API server is reachable${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Test Login Endpoint${NC}"
echo "----------------------------"

# Test credentials (using known test credentials from the codebase)
declare -a TEST_CREDENTIALS=(
    "admin:admin123!"
    "user:user123!"
    "carlo:carlo123!"
    "viewer:viewer123!"
)

echo "Testing login with known credentials..."
echo ""

for cred in "${TEST_CREDENTIALS[@]}"; do
    IFS=':' read -r username password <<< "$cred"
    
    echo -e "${YELLOW}Testing: $username${NC}"
    
    # Create JSON payload
    JSON_PAYLOAD=$(cat <<EOF
{
    "username": "$username",
    "password": "$password"
}
EOF
)
    
    # Make login request and capture response
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}\nRESPONSE_TIME:%{time_total}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "$JSON_PAYLOAD" \
        "$LOGIN_ENDPOINT" 2>/dev/null)
    
    # Extract HTTP code and response time
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    RESPONSE_TIME=$(echo "$RESPONSE" | grep "RESPONSE_TIME:" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d; /RESPONSE_TIME:/d')
    
    echo "   HTTP Status: $HTTP_CODE"
    echo "   Response Time: ${RESPONSE_TIME}s"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "   ${GREEN}✅ Login successful${NC}"
        echo "   Response: $RESPONSE_BODY" | jq '.' 2>/dev/null || echo "   Response: $RESPONSE_BODY"
    elif [ "$HTTP_CODE" = "401" ]; then
        echo -e "   ${RED}❌ Authentication failed (401)${NC}"
        echo "   Response: $RESPONSE_BODY" | jq '.' 2>/dev/null || echo "   Response: $RESPONSE_BODY"
    elif [ "$HTTP_CODE" = "429" ]; then
        echo -e "   ${YELLOW}⚠️  Rate limited (429)${NC}"
        echo "   Response: $RESPONSE_BODY"
    elif [ "$HTTP_CODE" = "500" ]; then
        echo -e "   ${RED}❌ Server error (500)${NC}"
        echo "   Response: $RESPONSE_BODY"
    else
        echo -e "   ${RED}❌ Unexpected status: $HTTP_CODE${NC}"
        echo "   Response: $RESPONSE_BODY"
    fi
    echo ""
done

echo -e "${BLUE}Step 3: Detailed Error Analysis${NC}"
echo "-------------------------------"

# Test with invalid credentials to see error format
echo "Testing with invalid credentials to check error format..."
INVALID_JSON=$(cat <<EOF
{
    "username": "nonexistent",
    "password": "wrongpassword"
}
EOF
)

INVALID_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$INVALID_JSON" \
    "$LOGIN_ENDPOINT" 2>/dev/null)

INVALID_HTTP_CODE=$(echo "$INVALID_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
INVALID_RESPONSE_BODY=$(echo "$INVALID_RESPONSE" | sed '/HTTP_CODE:/d')

echo "Invalid credentials test:"
echo "   HTTP Status: $INVALID_HTTP_CODE"
echo "   Response: $INVALID_RESPONSE_BODY" | jq '.' 2>/dev/null || echo "   Response: $INVALID_RESPONSE_BODY"
echo ""

echo -e "${BLUE}Step 4: Request Headers Analysis${NC}"
echo "--------------------------------"
echo "Testing required headers..."

# Test without Content-Type header
echo "Testing without Content-Type header:"
NO_CONTENT_TYPE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST \
    -H "Accept: application/json" \
    -d '{"username":"admin","password":"admin123!"}' \
    "$LOGIN_ENDPOINT" 2>/dev/null)

NO_CT_HTTP_CODE=$(echo "$NO_CONTENT_TYPE_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
echo "   HTTP Status: $NO_CT_HTTP_CODE"

if [ "$NO_CT_HTTP_CODE" != "200" ]; then
    echo -e "   ${YELLOW}⚠️  Missing Content-Type header may cause issues${NC}"
fi
echo ""

echo -e "${BLUE}Step 5: CORS Check${NC}"
echo "------------------"
echo "Testing CORS headers..."

CORS_RESPONSE=$(curl -s -I \
    -H "Origin: http://localhost:4200" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    "$LOGIN_ENDPOINT" 2>/dev/null)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "   ${GREEN}✅ CORS headers present${NC}"
else
    echo -e "   ${YELLOW}⚠️  CORS headers may be missing${NC}"
fi
echo ""

echo -e "${BLUE}Troubleshooting Recommendations${NC}"
echo "==============================="
echo ""

echo -e "${YELLOW}Common Issues and Solutions:${NC}"
echo ""
echo "1. 401 Unauthorized - Possible causes:"
echo "   • Wrong username/password combination"
echo "   • Database connection issues"
echo "   • User account is locked or inactive"
echo "   • JWT secret configuration problems"
echo ""
echo "2. 429 Too Many Requests:"
echo "   • Rate limiting is active"
echo "   • Wait 15 minutes before trying again"
echo "   • Check if multiple failed attempts triggered rate limiting"
echo ""
echo "3. 500 Internal Server Error:"
echo "   • Database connection problems"
echo "   • Server configuration issues"
echo "   • Check server logs for detailed error information"
echo ""
echo "4. CORS Issues:"
echo "   • Make sure your frontend origin is allowed"
echo "   • Check CORS configuration in main.ts"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo "----------"
echo "1. Check server logs: 'npm run logs' or check Google Cloud logs"
echo "2. Verify database connectivity: 'npm run test:db'"
echo "3. Test locally: 'npm run dev' and test against localhost:8080"
echo "4. Check environment variables in production deployment"
echo ""

echo -e "${GREEN}Script completed. Check the results above for diagnosis.${NC}"