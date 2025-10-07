#!/bin/bash

# Simple test to verify Jest cleanup fix
echo "🧪 Testing Jest cleanup fix..."

# Test one file to verify it exits cleanly
echo "📋 Running db.utils.test.ts without --forceExit..."
timeout 30s npm test -- src/tests/db.utils.test.ts > test_output.log 2>&1

# Check if it completed successfully
if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: Test completed and exited cleanly!"
    echo "📊 Test Results:"
    grep -E "(Tests:|Test Suites:)" test_output.log || echo "Test completed successfully"
    rm -f test_output.log
else
    echo "❌ Test failed or timed out"
    echo "📄 Output:"
    cat test_output.log
    rm -f test_output.log
    exit 1
fi

echo ""
echo "🎉 Jest cleanup fix is working correctly!"
echo "✨ Tests now exit cleanly without open handles."
