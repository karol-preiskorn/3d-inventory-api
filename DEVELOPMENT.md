# Development Workflow Guide

This document outlines the automated code quality enforcement and development workflow for the 3D Inventory API project.

## 🛠️ Automated Quality Gates

### Pre-commit Hooks

Every commit automatically triggers the following checks:

1. **ESLint Auto-fix** - Automatically fixes linting issues in TypeScript/JavaScript files
2. **Prettier Formatting** - Formats code according to project standards
3. **Import Organization** - Sorts and organizes import statements
4. **Type Checking** - Validates TypeScript types across the entire project
5. **Security Audit** - Checks for known security vulnerabilities
6. **Test Execution** - Runs tests related to changed files
7. **Package.json Sorting** - Automatically sorts package.json dependencies

### Pre-push Hooks

Before pushing to remote repository:

1. **Full Test Suite** - Runs complete test coverage
2. **Build Verification** - Ensures the project builds successfully
3. **Comprehensive Linting** - Stricter linting checks
4. **Dependency Analysis** - Checks for unused dependencies
5. **Test Coverage Report** - Generates coverage statistics

### Commit Message Validation

All commit messages must follow conventional commit format:

```
type(scope): description

Examples:
- feat: add user authentication
- fix(api): resolve CORS issue
- docs: update README installation guide
- refactor(models): improve User model structure
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

## 🎯 Quality Standards

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Not required (removed automatically)
- **Line Length**: 100 characters maximum
- **Trailing Commas**: Not allowed

### Import Organization

Imports are automatically organized in this order:

1. Built-in Node.js modules
2. External packages
3. Internal modules
4. Parent directory imports
5. Sibling imports
6. Index imports

### TypeScript Configuration

- **Strict Mode**: Enabled
- **No Implicit Any**: Enforced
- **Unused Variables**: Not allowed (except prefixed with `_`)
- **Explicit Return Types**: Optional but recommended

## 🔧 VS Code Integration

### Recommended Extensions

- TypeScript/JavaScript support
- ESLint integration
- Prettier formatter
- GitLens for Git visualization
- Jest test runner
- MongoDB support
- Docker integration

### Auto-formatting

Code is automatically formatted on:

- File save
- Paste operations
- Import organization
- ESLint fixes

## 📦 Available Scripts

### Development

```bash
npm start           # Start development server with watch mode
npm run build       # Build production version
npm run clean       # Clean build artifacts
```

### Quality Checks

```bash
npm run lint        # Run ESLint checks
npm run check:type  # TypeScript type checking
npm test            # Run test suite
npm run test:coverage # Generate coverage report
```

### Maintenance

```bash
npm run check:upgrade    # Check for dependency updates
npm run check:depcheck   # Find unused dependencies
npm audit               # Security vulnerability scan
```

## 🚀 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes with automatic quality checks
# Commits are automatically validated and formatted

# Push triggers comprehensive testing
git push origin feature/your-feature-name
```

### 2. Pull Request Process

1. All quality gates must pass
2. Code review by team members
3. Documentation updates if needed
4. Merge to main branch

### 3. Continuous Integration

GitHub Actions automatically:

- Run full test suite
- Build Docker images
- Deploy to staging/production
- Update documentation
- Perform security scans

## 🛡️ Security & Best Practices

### Automated Security

- NPM audit on every commit
- Dependency vulnerability scanning
- CORS configuration validation
- Input sanitization checks

### Code Quality Metrics

- Test coverage > 80%
- No ESLint errors
- No TypeScript errors
- All imports used
- Dependencies up to date

## 🔍 Troubleshooting

### Common Issues

**Hook Fails - TypeScript Errors**

```bash
npm run check:type
# Fix reported errors
```

**Hook Fails - Linting Issues**

```bash
npm run lint
# Review and fix linting issues
```

**Hook Fails - Test Failures**

```bash
npm test
# Fix failing tests
```

**Commit Message Format Error**
Follow conventional commit format:

```
feat(scope): add new feature
fix(api): resolve authentication issue
```

### Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit (not recommended)
git commit --no-verify -m "emergency fix"

# Skip pre-push (not recommended)
git push --no-verify
```

## 📈 Monitoring & Metrics

The workflow automatically tracks:

- Code quality trends
- Test coverage changes
- Build performance
- Security vulnerability reports
- Dependency freshness

## 🤝 Contributing

1. Follow the automated quality standards
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages
5. Ensure all hooks pass before pushing

For questions or issues with the development workflow, check the project documentation or reach out to the development team.
