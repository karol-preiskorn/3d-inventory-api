#!/bin/bash
# Script to verify Attribute Dictionary data on deployed application
# Usage: ./scripts/verify-attribute-dictionary.sh [username] [password]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default credentials (can be overridden)
USERNAME="${1:-admin}"
PASSWORD="${2:-admin123!}"
API_URL="https://3d-inventory-api.ultimasolution.pl"

echo -e "${BLUE}🔍 Verifying Attribute Dictionary Data${NC}"
echo -e "${BLUE}API URL: $API_URL${NC}"
echo -e "${BLUE}Username: $USERNAME${NC}"
echo ""

# Step 1: Login and get token
echo -e "${YELLOW}Step 1: Authenticating...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

# Check if login was successful
if echo "$LOGIN_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
  echo -e "${GREEN}✅ Authentication successful${NC}"

  # Show user info
  USER_INFO=$(echo "$LOGIN_RESPONSE" | jq -r '.user')
  echo -e "${BLUE}User: $(echo "$USER_INFO" | jq -r '.username')${NC}"
  echo -e "${BLUE}Role: $(echo "$USER_INFO" | jq -r '.role')${NC}"
  echo ""
else
  echo -e "${RED}❌ Authentication failed${NC}"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

# Step 2: Fetch Attribute Dictionary data
echo -e "${YELLOW}Step 2: Fetching Attribute Dictionary data...${NC}"
ATTR_DICT_RESPONSE=$(curl -s "$API_URL/attributesDictionary" \
  -H "Authorization: Bearer $TOKEN")

# Check if response is valid JSON
if echo "$ATTR_DICT_RESPONSE" | jq . > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Successfully retrieved Attribute Dictionary data${NC}"
  echo ""

  # Count total attributes
  TOTAL_COUNT=$(echo "$ATTR_DICT_RESPONSE" | jq 'length')
  echo -e "${BLUE}📊 Total Attributes: $TOTAL_COUNT${NC}"
  echo ""

  # Show first 5 attributes as preview
  if [ "$TOTAL_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}Preview of Attribute Dictionary (first 5 items):${NC}"
    echo "$ATTR_DICT_RESPONSE" | jq '.[0:5] | .[] | {
      id: ._id,
      name: .name,
      type: .type,
      modelId: .modelId,
      required: .required
    }'
    echo ""

    # Show attribute types distribution
    echo -e "${YELLOW}Attribute Types Distribution:${NC}"
    echo "$ATTR_DICT_RESPONSE" | jq -r '
      group_by(.type) |
      map({type: .[0].type, count: length}) |
      .[] |
      "\(.type): \(.count)"
    '
    echo ""

    # Show models with attributes
    echo -e "${YELLOW}Models with Attributes:${NC}"
    echo "$ATTR_DICT_RESPONSE" | jq -r '
      group_by(.modelId) |
      map({modelId: .[0].modelId, count: length}) |
      .[] |
      "Model \(.modelId): \(.count) attributes"
    ' | head -10
    echo ""

    # Save full data to file
    OUTPUT_FILE="attribute-dictionary-data.json"
    echo "$ATTR_DICT_RESPONSE" | jq '.' > "$OUTPUT_FILE"
    echo -e "${GREEN}✅ Full data saved to: $OUTPUT_FILE${NC}"

  else
    echo -e "${YELLOW}⚠️  No attributes found in dictionary${NC}"
  fi

else
  echo -e "${RED}❌ Failed to retrieve Attribute Dictionary data${NC}"
  echo "$ATTR_DICT_RESPONSE"
  exit 1
fi

# Step 3: Test specific endpoint - get by ID (if data exists)
if [ "$TOTAL_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}Step 3: Testing specific attribute retrieval...${NC}"
  FIRST_ID=$(echo "$ATTR_DICT_RESPONSE" | jq -r '.[0]._id')

  SINGLE_ATTR=$(curl -s "$API_URL/attributesDictionary/$FIRST_ID" \
    -H "Authorization: Bearer $TOKEN")

  if echo "$SINGLE_ATTR" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Successfully retrieved single attribute${NC}"
    echo "$SINGLE_ATTR" | jq '{
      id: ._id,
      name: .name,
      type: .type,
      description: .description,
      required: .required
    }'
  else
    echo -e "${RED}❌ Failed to retrieve single attribute${NC}"
  fi
  echo ""
fi

# Step 4: Health check
echo -e "${YELLOW}Step 4: API Health Check...${NC}"
HEALTH_RESPONSE=$(curl -s "$API_URL/health")

if echo "$HEALTH_RESPONSE" | jq -e '.status == "ok"' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ API is healthy${NC}"
  echo "$HEALTH_RESPONSE" | jq '{
    status: .status,
    timestamp: .timestamp,
    database: .database
  }'
else
  echo -e "${RED}❌ API health check failed${NC}"
  echo "$HEALTH_RESPONSE"
fi

echo ""
echo -e "${GREEN}🎉 Verification complete!${NC}"
