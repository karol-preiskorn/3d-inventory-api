#!/bin/bash
# Git Hook Test Script
# Use this to test your pre-commit hooks without actually committing

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🧪 Testing Git Hooks Locally${NC}"
echo -e "${BLUE}This script simulates the pre-commit hook checks${NC}"
echo

# Test ESLint
echo -e "${BLUE}🔍 Running ESLint check...${NC}"
npm run lint:check
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ ESLint errors found!${NC}"
  echo -e "${BLUE}💡 Run 'npm run lint' to auto-fix issues${NC}"
  exit 1
fi
echo -e "${GREEN}✅ ESLint check passed${NC}"

# Test TypeScript compilation
echo -e "${BLUE}🔍 Running TypeScript type check...${NC}"
npm run check:type
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ TypeScript type check failed!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ TypeScript type check passed${NC}"

# Test Prettier formatting
echo -e "${BLUE}🎨 Checking code formatting...${NC}"
npm run format:check
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}⚠️  Code formatting issues found${NC}"
  echo -e "${BLUE}💡 Run 'npm run format' to fix formatting${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Code formatting check passed${NC}"

# Test security audit
echo -e "${BLUE}🔒 Running security audit...${NC}"
npm audit --audit-level=moderate
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}⚠️  Security vulnerabilities detected${NC}"
  echo -e "${BLUE}💡 Consider running 'npm audit fix'${NC}"
  # Don't fail for security issues, just warn
fi

# Test build
echo -e "${BLUE}🏗️  Testing build...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Test suite
echo -e "${BLUE}🧪 Running test suite...${NC}"
npm test
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Tests failed!${NC}"
  exit 1
fi
echo -e "${GREEN}✅ All tests passed${NC}"

echo
echo -e "${GREEN}🎉 All checks passed! Your code is ready to commit.${NC}"
echo -e "${BLUE}💡 To commit with strict checking: git commit -m \"your message\"${NC}"
echo -e "${BLUE}💡 Commit message format: type(scope): description${NC}"
echo -e "${BLUE}   Examples: feat: add user auth, fix(api): resolve CORS issue${NC}"
