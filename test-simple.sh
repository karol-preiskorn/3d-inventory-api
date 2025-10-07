#!/bin/bash
# Simple test runner using simplified Jest configuration

echo "🧪 Running tests with simplified Jest configuration..."

# Use the simplified Jest config
npx jest --config=jest.config.simple.ts --runInBand --forceExit --detectOpenHandles "$@"

echo "📊 Test run completed"
