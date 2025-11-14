# 📋 Description

<!-- Provide a clear and concise description of what this PR accomplishes -->

Brief description of the changes made in this PR.

## 🔄 Type of Change

<!-- Please delete options that are not relevant -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🧹 Code cleanup/refactoring
- [ ] 🔒 Security fix
- [ ] ⚡ Performance improvement

## 💥 Breaking Changes

<!-- If this PR introduces breaking changes, describe the impact and migration path -->

**If applicable, describe:**

- What breaks?
- Why was this change necessary?
- Migration path for existing users/clients?
- Version bump required? (major/minor/patch)

## 🏗️ API Changes

<!-- For REST API modifications -->

- [ ] No API changes
- [ ] New endpoints added
- [ ] Existing endpoints modified
- [ ] Endpoints deprecated/removed
- [ ] OpenAPI/Swagger documentation updated

**If applicable, list affected endpoints:**

- `GET /api/endpoint` - Description of change

## 💾 Database Changes

<!-- For MongoDB schema or data modifications -->

- [ ] No database changes
- [ ] Database migration script included (in `scripts/database/`)
- [ ] Migration tested locally
- [ ] Rollback procedure documented
- [ ] Followed [database_patterns.instructions.md](instructions/database_patterns.instructions.md)

**Migration details:**

<!-- Describe schema changes, new collections, index updates, etc. -->

## 🧪 Testing

### Test Execution

- [ ] Unit tests pass locally (`npm test`)
- [ ] Test coverage ≥80% threshold (`npm run test:coverage`)
- [ ] Integration tests pass (if applicable)
- [ ] Manual testing completed

### Test Coverage

- [ ] New tests added for new functionality
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Followed [test_coverage_standards.instructions.md](instructions/test_coverage_standards.instructions.md)

**Coverage report:**

```bash
# Paste test coverage summary here
```

## ✅ Code Quality Standards

### Project Standards Compliance

- [ ] TypeScript strict mode compliance (`npm run type:check`)
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] No TypeScript `any` types introduced
- [ ] Followed [code_quality_standards.instructions.md](instructions/code_quality_standards.instructions.md)
- [ ] Followed [typescript_strict_mode.instructions.md](instructions/typescript_strict_mode.instructions.md)

### Code Review

- [ ] Self-review completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Complex logic has JSDoc documentation
- [ ] No unnecessary console.log statements
- [ ] No commented-out code

## 🔒 Security

- [ ] No hardcoded secrets or credentials
- [ ] Security scan passed (`npm run security:audit`)
- [ ] Snyk scan shows no new critical/high vulnerabilities
- [ ] Authentication/authorization tested (if applicable)
- [ ] Input validation implemented for user inputs
- [ ] Followed [authentication.instructions.md](instructions/authentication.instructions.md) (if auth-related)
- [ ] Followed [snyk_rules.instructions.md](instructions/snyk_rules.instructions.md)

## 📚 Instruction File Compliance

<!-- Verify compliance with project standards -->

- [ ] Followed [file-organization.instructions.md](instructions/file-organization.instructions.md) for new files
- [ ] Applied [api_design.instructions.md](instructions/api_design.instructions.md) (if API changes)
- [ ] Applied [error_handling.instructions.md](instructions/error_handling.instructions.md) (if error handling)
- [ ] Applied [logging.instructions.md](instructions/logging.instructions.md) (if logging added)

## 📝 Documentation

- [ ] README.md updated if necessary
- [ ] API documentation updated (Swagger/OpenAPI)
- [ ] Code comments added for complex logic
- [ ] CHANGELOG.md updated (if applicable)
- [ ] Migration guide created (if breaking changes)

## ✅ Pre-merge Validation

<!-- Run these commands before requesting review -->

Run the following commands to verify quality gates:

```bash
# Complete quality check (lint + type check + tests)
npm run check:quality

# Verify test coverage threshold
npm run test:coverage

# Production build verification
npm run build

# Security vulnerability scan
npm run security:audit
```

**Validation results:**

- [ ] `npm run check:quality` ✅ PASSED
- [ ] `npm run test:coverage` ✅ PASSED (≥80%)
- [ ] `npm run build` ✅ PASSED
- [ ] `npm run security:audit` ✅ PASSED (no critical/high)

## 🔗 Related Issues

<!-- Link to related issues using GitHub keywords -->

Closes #(issue number)
Relates to #(issue number)
Fixes #(issue number)

## 📸 Screenshots / Logs (if applicable)

<!-- Add screenshots, API response examples, or log outputs to help explain changes -->

## 🚀 Deployment Notes

<!-- Describe any special deployment considerations -->

**Deployment checklist:**

- [ ] Environment variables updated (document in deployment notes)
- [ ] Database migrations need to run before deployment
- [ ] Breaking changes require version bump
- [ ] Monitoring/alerting updated (if applicable)
- [ ] Documentation deployed (if applicable)

**Special considerations:**

<!-- e.g., "Run migration script before deployment", "Requires service restart", etc. -->

---

<!-- Auto-assigns: @karol-preiskorn -->

/cc @karol-preiskorn
