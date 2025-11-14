---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*.md,**/*.sh,**/*.js,**/*.ts'
description: File Organization Standards - Creating Files in Proper Locations
---

# File Organization Instructions for GitHub Copilot

This document ensures GitHub Copilot creates new files in the appropriate subdirectories rather than cluttering the root folder.

## 🎯 Root Directory Policy (CRITICAL RULE)

**ONLY these 4 files belong in root**:

- `README.md` - Main project documentation
- `DEVELOPMENT.md` - Development workflow and setup
- `AGENTS.md` - AI automation and development patterns
- `SECURITY.md` - Security policies and guidelines

**ALL other files must be created in appropriate subfolders**.

### 📋 Pre-Creation Checklist

Before creating ANY file, verify:

- [ ] **File Type Identified**: What kind of file? (script, config, doc, code)
- [ ] **Location Determined**: Where should it go? (scripts/, config/, docs/, src/)
- [ ] **Essential File Check**: Is this one of the 4 essential root files?
- [ ] **Path Specified**: Full relative path provided?
- [ ] **Naming Convention**: Follows pattern? (lowercase, hyphens, descriptive)
- [ ] **Integration Points**: Does package.json need updating?

---

## 📁 Folder Structure and File Types

### `/scripts/` - Deployment and Development Scripts

**Purpose**: Shell scripts and deployment automation

**Files to create here**:

- Deployment scripts (\*.sh)
- Build automation scripts
- Development utilities
- GCP, Docker, or deployment-related scripts
- GitHub workflow helpers
- CORS and security verification scripts
- Database verification scripts
- Testing automation scripts

**Examples**:

- `scripts/build.sh` - Build automation
- `scripts/docker-compose.sh` - Docker compose helper
- `scripts/setup-github-secrets.sh` - GitHub secrets setup
- `scripts/verify-cors-fix.sh` - CORS verification

**Copilot Rule**: When asked to create a deployment script, shell automation, or development utility → Place in `/scripts/`

---

### `/scripts/database/` - Database Management and Admin Operations

**Purpose**: Database initialization, migrations, and admin tasks

**Files to create here**:

- User initialization scripts (init-users._, create-users._)
- Database migration scripts
- Admin role management scripts (add-admin-role.ts, etc.)
- User management utilities (update-user-permissions.ts, etc.)
- Database cleanup scripts (cleanup-_.ts, reset-_.ts, unlock-\*.ts)
- Database verification and inspection scripts

**Examples**:

- `scripts/database/init-users.ts` - Initialize default users
- `scripts/database/add-admin-role.ts` - Add admin role
- `scripts/database/migrate-permissions.ts` - Migrate user permissions
- `scripts/database/reset-admin-password.ts` - Reset admin password
- `scripts/database/update-user-permissions.ts` - Update user permissions

**Copilot Rule**: When asked to create database initialization, user management, or admin operation scripts → Place in `/scripts/database/`

---

### `/scripts/testing/` - Test Utilities and Testing Automation

**Purpose**: Test automation, test data generation, and testing utilities

**Files to create here**:

- Database authentication tests (test-db-auth.ts)
- Test cleanup utilities
- Test setup scripts
- Integration test helpers
- Test data generators
- Testing automation scripts

**Examples**:

- `scripts/testing/test-db-auth.ts` - Database authentication testing
- `scripts/testing/test-cleanup.js` - Test cleanup utility
- `scripts/testing/test-generator.ts` - Test data generation

**Copilot Rule**: When asked to create testing utilities, test data generators, or test automation → Place in `/scripts/testing/`

---

### `/config/` - Configuration Files

**Purpose**: Project configuration files and config templates

**Files to create here**:

- Jest configuration files
- ESLint configuration files
- TypeScript configuration files
- Babel configuration
- Configuration templates and examples

**Examples**:

- `config/jest.config.ts` - Jest configuration
- `config/jest.config.simple.ts` - Simple Jest config variant
- `config/eslint.config.ts` - ESLint configuration
- `config/babel.config.js` - Babel configuration

**Copilot Rule**: When asked to create or modify configuration files → Place in `/config/`

---

### `/docs/` - Documentation Files

**Purpose**: Project documentation (already organized)

**Subfolders**:

- `docs/archive/` - Historical notes and deprecated documentation
- `docs/features/` - Feature tracking and specifications
- `docs/guides/` - Setup and configuration guides
- `docs/troubleshooting/` - Troubleshooting and debugging guides

**Copilot Rule**: When asked to create documentation → Use appropriate `docs/` subfolder

---

### `/src/` - Application Source Code

**Purpose**: Main application code

**Structure**:

- `src/controllers/` - API endpoint handlers
- `src/services/` - Business logic
- `src/middlewares/` - Express middleware
- `src/models/` - Data models and interfaces
- `src/utils/` - Utility functions
- `src/routes/` - Route definitions

**Copilot Rule**: When asked to create application code → Place in appropriate `src/` subfolder

---

## 📋 Creation Instructions by File Type

### When Creating Shell Scripts (.sh files)

**Rule**: Create in `/scripts/`

**Example Prompt**:

```
Create a script at scripts/my-script.sh that does X
```

**Copilot Instruction**:

- If it's deployment/development related → `/scripts/my-script.sh`
- If it's database related → `/scripts/database/my-script.sh`
- If it's testing related → `/scripts/testing/my-script.sh`

---

### When Creating TypeScript Utilities (.ts files)

**Rule**: Determine purpose first

**Example Prompts**:

```
Create a TypeScript script at scripts/database/init-test-users.ts
Create a config file at config/jest.config.ts
Create a test utility at scripts/testing/setup-test-db.ts
Create a service at src/services/MyService.ts
```

---

### When Creating JavaScript Files (.js files)

**Rule**: Determine purpose and place accordingly

**Locations**:

- Database operations → `/scripts/database/`
- Testing utilities → `/scripts/testing/`
- Build scripts → `/scripts/`
- Application code → `/src/`
- Configuration → `/config/`

---

### When Creating Markdown Files (.md files)

**Rule**: Determine documentation type

**Locations**:

- Feature documentation → `/docs/features/`
- Guides/tutorials → `/docs/guides/`
- Troubleshooting → `/docs/troubleshooting/`
- Archive/historical → `/docs/archive/`

---

## ❌ Anti-Patterns - DO NOT Do This

1. ❌ **Don't create root-level scripts**

   ```javascript
   // ❌ WRONG: Creating script in root
   // File: my-script.ts

   // ✅ CORRECT:
   // File: scripts/database/my-script.ts
   ```

2. ❌ **Don't create root-level configs**

   ```javascript
   // ❌ WRONG: jest.config.ts in root
   // ✅ CORRECT: config/jest.config.ts
   ```

3. ❌ **Don't mix different file types in wrong locations**

   ```javascript
   // ❌ WRONG: Database script in scripts/testing/
   // ✅ CORRECT: Database script in scripts/database/
   ```

4. ❌ **Don't create non-essential markdown in root**
   ```javascript
   // ❌ WRONG: MY-FEATURE.md in root
   // ✅ CORRECT: docs/features/MY-FEATURE.md
   ```

---

## 🔍 Decision Tree - Where Should I Create This File?

```
START: New file needed
│
├─ Is it deployment/build/development related shell script?
│  └─ YES → /scripts/ ✓
│
├─ Is it database initialization, migration, or admin operation?
│  └─ YES → /scripts/database/ ✓
│
├─ Is it testing utility or test automation?
│  └─ YES → /scripts/testing/ ✓
│
├─ Is it configuration file (Jest, ESLint, Babel, etc.)?
│  └─ YES → /config/ ✓
│
├─ Is it documentation?
│  ├─ Feature documentation → /docs/features/ ✓
│  ├─ Setup guide → /docs/guides/ ✓
│  ├─ Troubleshooting → /docs/troubleshooting/ ✓
│  └─ Archive/Historical → /docs/archive/ ✓
│
├─ Is it application source code?
│  ├─ API controller → /src/controllers/ ✓
│  ├─ Business logic → /src/services/ ✓
│  ├─ Middleware → /src/middlewares/ ✓
│  ├─ Data model → /src/models/ ✓
│  └─ Utility → /src/utils/ ✓
│
└─ CRITICAL: Is it one of the 4 essential root files?
   (README.md, DEVELOPMENT.md, AGENTS.md, SECURITY.md)
   └─ YES → /ROOT ✓
```

---

## 📝 Example Commands for Copilot

### Example 1: Create Database Script

```
Create a TypeScript script at scripts/database/sync-user-roles.ts that:
- Connects to MongoDB
- Syncs user roles from configuration
- Logs updates
```

**Copilot Response**: Creates file at `scripts/database/sync-user-roles.ts` ✓

---

### Example 2: Create Testing Utility

```
Generate a test utility at scripts/testing/setup-test-db.ts that:
- Initializes test database
- Creates test users
- Cleans up after tests
```

**Copilot Response**: Creates file at `scripts/testing/setup-test-db.ts` ✓

---

### Example 3: Create Configuration

```
Create Jest configuration at config/jest.config.ts for:
- MongoDB Memory Server
- TypeScript support
- Coverage reporting
```

**Copilot Response**: Creates file at `config/jest.config.ts` ✓

---

### Example 4: Create Deployment Script

```
Create a shell script at scripts/deploy-staging.sh that:
- Builds Docker image
- Pushes to Google Cloud
- Runs tests
```

**Copilot Response**: Creates file at `scripts/deploy-staging.sh` ✓

---

## 🎓 Best Practices

1. **Always specify the full path** when asking Copilot to create files

   ```javascript
   // ✓ GOOD: Specify full path
   'Create scripts/database/my-script.ts'

   // ✗ UNCLEAR: Don't just say "create my-script.ts"
   'Create my-script.ts'
   ```

2. **Reference file organization** in Copilot prompts

   ```javascript
   // ✓ GOOD:
   'Following file organization standards, create scripts/database/init-db.ts'

   // Reference this document:
   'As per .github/instructions/file-organization.instructions.md, create...'
   ```

3. **Update package.json scripts** if needed for new scripts
   ```json
   {
     "scripts": {
       "init:db": "npx tsx scripts/database/init-users.ts",
       "test:db": "npx tsx scripts/testing/test-db-auth.ts"
     }
   }
   ```

---

## ✅ Verification Checklist

After Copilot creates files, verify:

- [ ] File is in correct subfolder
- [ ] File type matches folder purpose
- [ ] Root folder stays clean (only 4 essential .md files)
- [ ] Related npm scripts point to correct paths
- [ ] No redundant files created in root
- [ ] Folder organization matches decision tree

---

## 📞 Questions?

If unsure where a file should go:

1. Check the **Decision Tree** section above
2. Reference the **Folder Structure** section
3. Look at **Example Commands**
4. When in doubt, ask: "Should this go in `/scripts/`, `/scripts/database/`, `/scripts/testing/`, `/config/`, or `/docs/`?"

---

## Summary

| Location              | Purpose                  | File Examples                                     |
| --------------------- | ------------------------ | ------------------------------------------------- |
| **Root**              | Essential docs only      | README.md, DEVELOPMENT.md, AGENTS.md, SECURITY.md |
| **scripts/**          | Build/deployment scripts | \*.sh, build automation, verification scripts     |
| **scripts/database/** | Database & admin ops     | init-users.ts, add-admin-role.ts, migrations      |
| **scripts/testing/**  | Testing utilities        | test-db-auth.ts, test generators                  |
| **config/**           | Project configuration    | jest.config.ts, eslint.config.ts                  |
| **docs/**             | Documentation            | README files, guides, troubleshooting             |
| **src/**              | Application code         | Controllers, services, models, utilities          |

---

**Version**: 1.0
**Last Updated**: November 12, 2025
**Applies To**: All new .md, .sh, .js, .ts file creation
