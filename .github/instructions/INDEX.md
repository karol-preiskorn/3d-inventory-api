---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*'
description: GitHub Copilot Instructions Index - All Development Standards
---

# 📑 GitHub Copilot Instructions - Complete Index

> **Purpose**: Central navigation for all AI-assisted development standards and guidelines

## 🎯 Quick Navigation by Task

### 🆕 Creating New Files

**→ Primary**: [file-organization.instructions.md](./file-organization.instructions.md) - Comprehensive guide
**→ Quick Ref**: [file_organization_quick_ref.instructions.md](./file_organization_quick_ref.instructions.md) - Fast lookup

Where to place files (scripts, configs, docs, source code)

**Additional Resources**:

- [File Organization Maintenance Guide](../../docs/guides/file-organization-maintenance.md)
- [File Organization Checklist](../../docs/guides/file-organization-checklist.md)
- [File Organization Patterns](../../docs/guides/file-organization-patterns.md)
- [File Organization Overview](../../docs/guides/file-organization-overview.md)

---

### 🔒 Security & Authentication

**→ Read**: [authentication.instructions.md](./authentication.instructions.md) - JWT, RBAC, passwords
**→ Read**: [snyk_rules.instructions.md](./snyk_rules.instructions.md) - Security scanning

Authentication patterns, role-based access control, security best practices

---

### ✅ Code Quality

**→ Read**: [code_quality_standards.instructions.md](./code_quality_standards.instructions.md) - Standards
**→ Read**: [typescript_strict_mode.instructions.md](./typescript_strict_mode.instructions.md) - Type safety

TypeScript strict mode, ESLint rules, testing requirements, no `any` types

---

### 🧪 Writing Tests

**→ Read**: [test_coverage_standards.instructions.md](./test_coverage_standards.instructions.md)

Test coverage >80%, test patterns, mocking standards, comprehensive scenarios

---

### 🏗️ API Development

**→ Read**: [api_design.instructions.md](./api_design.instructions.md) - REST API standards
**→ Read**: [error_handling.instructions.md](./error_handling.instructions.md) - Error handling

RESTful API design, standardized responses, error classes, middleware patterns

**Additional Resources**:

- [OpenAPI/Swagger Guide](../../docs/guides/swagger-openapi-guide.md)

---

### 💾 Database Patterns

**→ Read**: [database_patterns.instructions.md](./database_patterns.instructions.md)

MongoDB connection pooling, type-safe repositories, transactions, schema validation

---

### 📝 Logging Standards

**→ Read**: [logging.instructions.md](./logging.instructions.md)

Winston logger, structured logging, audit logs, performance tracking, security events

---

## 📚 All Instruction Files

### Core Development Standards

| File                                                                     | Purpose                           | Applies To         |
| ------------------------------------------------------------------------ | --------------------------------- | ------------------ |
| [authentication.instructions.md](./authentication.instructions.md)       | JWT, RBAC, password security      | **/\*.ts, **/\*.js |
| [api_design.instructions.md](./api_design.instructions.md)               | REST API design standards         | **/\*.ts, **/\*.js |
| [database_patterns.instructions.md](./database_patterns.instructions.md) | MongoDB patterns & best practices | **/\*.ts, **/\*.js |
| [error_handling.instructions.md](./error_handling.instructions.md)       | Error classes & middleware        | **/\*.ts, **/\*.js |
| [logging.instructions.md](./logging.instructions.md)                     | Logging standards & patterns      | **/\*.ts, **/\*.js |

### Quality & Testing

| File                                                                                 | Purpose                     | Applies To                     |
| ------------------------------------------------------------------------------------ | --------------------------- | ------------------------------ |
| [code_quality_standards.instructions.md](./code_quality_standards.instructions.md)   | TypeScript, ESLint, testing | \*\*                           |
| [test_coverage_standards.instructions.md](./test_coverage_standards.instructions.md) | Test coverage >80%          | **/\*.test.ts, **/\*.spec.ts   |
| [typescript_strict_mode.instructions.md](./typescript_strict_mode.instructions.md)   | Type safety, strict mode    | \*_/_.ts                       |
| [snyk_rules.instructions.md](./snyk_rules.instructions.md)                           | Security scanning           | **/\*.ts, **/_.js, \*\*/_.json |

### File Organization

| File                                                                                         | Purpose                      | Applies To                             |
| -------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------- |
| [file-organization.instructions.md](./file-organization.instructions.md)                     | Primary file placement guide | **/\*.md, **/_.sh, \*\*/_.js, \*_/_.ts |
| [file_organization_quick_ref.instructions.md](./file_organization_quick_ref.instructions.md) | Quick reference table        | \*_/_                                  |

---

## 📖 Additional Documentation (in docs/)

### Guides (docs/guides/)

- **[Swagger/OpenAPI Guide](../../docs/guides/swagger-openapi-guide.md)** - API documentation standards
- **[File Organization Maintenance](../../docs/guides/file-organization-maintenance.md)** - Comprehensive guide
- **[File Organization Checklist](../../docs/guides/file-organization-checklist.md)** - Pre/post-creation checks
- **[File Organization Patterns](../../docs/guides/file-organization-patterns.md)** - Quick patterns
- **[File Organization Overview](../../docs/guides/file-organization-overview.md)** - Complete overview

### Deployment (docs/deployment/)

- **[Device Fix Deployment](../../docs/deployment/device-fix-deployment.md)** - Deployment procedures

---

## 🎯 Quick Decision Guide

### Creating a New File?

1. **Check**: [file_organization_quick_ref.instructions.md](./file_organization_quick_ref.instructions.md) (30 seconds)
2. **Verify**: Use decision tree to find correct location
3. **Create**: With full path (e.g., `scripts/database/my-script.ts`)
4. **Confirm**: File is not in root (unless README, DEVELOPMENT, AGENTS, or SECURITY)

### Writing Code?

1. **Authentication**: Read [authentication.instructions.md](./authentication.instructions.md)
2. **API Endpoints**: Read [api_design.instructions.md](./api_design.instructions.md)
3. **Database**: Read [database_patterns.instructions.md](./database_patterns.instructions.md)
4. **Error Handling**: Read [error_handling.instructions.md](./error_handling.instructions.md)
5. **Logging**: Read [logging.instructions.md](./logging.instructions.md)

### Writing Tests?

1. **Coverage**: Read [test_coverage_standards.instructions.md](./test_coverage_standards.instructions.md)
2. **Quality**: Read [code_quality_standards.instructions.md](./code_quality_standards.instructions.md)
3. **TypeScript**: Read [typescript_strict_mode.instructions.md](./typescript_strict_mode.instructions.md)

### Security Concerns?

1. **Authentication**: Read [authentication.instructions.md](./authentication.instructions.md)
2. **Scanning**: Read [snyk_rules.instructions.md](./snyk_rules.instructions.md)
3. **Error Handling**: Read [error_handling.instructions.md](./error_handling.instructions.md)

---

## 📊 Coverage Summary

| Area                          | Instruction Files | Status      |
| ----------------------------- | ----------------- | ----------- |
| **File Organization**         | 2 core + 4 guides | ✅ Complete |
| **Authentication & Security** | 2 files           | ✅ Complete |
| **API Development**           | 2 files           | ✅ Complete |
| **Database**                  | 1 file            | ✅ Complete |
| **Logging**                   | 1 file            | ✅ Complete |
| **Code Quality**              | 3 files           | ✅ Complete |

**Total Instruction Files**: 11
**Total Guide Files**: 6

---

## 🚀 Getting Started

### For New Developers

1. Read this INDEX (5 minutes)
2. Read [file_organization_quick_ref.instructions.md](./file_organization_quick_ref.instructions.md) (5 minutes)
3. Review [code_quality_standards.instructions.md](./code_quality_standards.instructions.md) (10 minutes)
4. Bookmark relevant domain files for your work

**Total Time**: ~20 minutes

### For Copilot AI

All instruction files have:

- ✅ YAML frontmatter (`alwaysApply: true`)
- ✅ `always_on: true` trigger
- ✅ Clear `applyTo` patterns
- ✅ Comprehensive code examples
- ✅ Testing guidance

---

## ✅ Compliance Checklist

Before committing code, verify:

- [ ] File created in correct location (not root unless essential)
- [ ] TypeScript strict mode compliance
- [ ] Test coverage >80%
- [ ] Authentication properly implemented (if applicable)
- [ ] Error handling with proper error classes
- [ ] Logging included for important operations
- [ ] Security scanning passed (Snyk)
- [ ] ESLint rules satisfied
- [ ] Code quality standards met

---

**Version**: 2.0
**Last Updated**: November 2025
**Status**: ✅ Active & Complete
**Instruction Files**: 11 active
**Guide Files**: 6 supporting documents
