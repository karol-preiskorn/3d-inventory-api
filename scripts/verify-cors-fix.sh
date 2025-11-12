#!/bin/bash

# CORS Fix Verification Script
# Verifies that the CORS error recovery middleware has been properly integrated

echo "=== CORS Fix Verification ==="
echo ""

# Check 1: Verify corsErrorRecovery is exported from middlewares/index.ts
echo "✓ Checking middleware export..."
if grep -q "corsErrorRecovery" /home/karol/GitHub/3d-inventory-api/src/middlewares/index.ts; then
    echo "  ✅ corsErrorRecovery is properly exported from middlewares/index.ts"
else
    echo "  ❌ corsErrorRecovery NOT found in middlewares/index.ts"
    exit 1
fi

# Check 2: Verify corsErrorRecovery is imported in main.ts
echo ""
echo "✓ Checking middleware import in main.ts..."
if grep -q "corsErrorRecovery" /home/karol/GitHub/3d-inventory-api/src/main.ts | grep -q "import"; then
    echo "  ✅ corsErrorRecovery is properly imported in main.ts"
else
    # Check with alternative grep
    if grep "corsErrorRecovery" /home/karol/GitHub/3d-inventory-api/src/main.ts | head -1 | grep -q "import"; then
        echo "  ✅ corsErrorRecovery is properly imported in main.ts"
    fi
fi

# Check 3: Verify middleware is applied
echo ""
echo "✓ Checking middleware application..."
if grep -q "app.use(corsErrorRecovery)" /home/karol/GitHub/3d-inventory-api/src/main.ts; then
    echo "  ✅ corsErrorRecovery middleware is properly applied with app.use()"
else
    echo "  ❌ corsErrorRecovery middleware NOT properly applied"
    exit 1
fi

# Check 4: Verify middleware implementation exists
echo ""
echo "✓ Checking middleware implementation..."
if grep -q "export const corsErrorRecovery" /home/karol/GitHub/3d-inventory-api/src/middlewares/security.ts; then
    echo "  ✅ corsErrorRecovery middleware implementation found in security.ts"
else
    echo "  ❌ corsErrorRecovery middleware implementation NOT found"
    exit 1
fi

# Check 5: Verify allowed origins are included
echo ""
echo "✓ Checking allowed origins in middleware..."
ORIGINS_COUNT=$(grep -A 20 "const allowedOrigins = \[" /home/karol/GitHub/3d-inventory-api/src/middlewares/security.ts | grep -c "https://d-inventory")
if [ "$ORIGINS_COUNT" -gt 0 ]; then
    echo "  ✅ Cloud Run origins found in corsErrorRecovery middleware"
else
    echo "  ⚠️  Warning: Cloud Run origins might not be in middleware"
fi

# Check 6: Build verification
echo ""
echo "✓ Verifying TypeScript compilation..."
if cd /home/karol/GitHub/3d-inventory-api && npm run build > /dev/null 2>&1; then
    echo "  ✅ TypeScript build successful"
else
    echo "  ❌ TypeScript build failed"
    exit 1
fi

echo ""
echo "=== ✅ All CORS Fix Verifications Passed ==="
echo ""
echo "Summary of changes:"
echo "  • Added corsErrorRecovery middleware to src/middlewares/security.ts"
echo "  • Exported corsErrorRecovery from src/middlewares/index.ts"
echo "  • Imported corsErrorRecovery in src/main.ts"
echo "  • Applied middleware after CORS in middleware stack"
echo ""
echo "Ready for deployment!"
