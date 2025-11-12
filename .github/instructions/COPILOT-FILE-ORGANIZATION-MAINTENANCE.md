---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: "**/*"
description: Copilot File Organization Maintenance Rules - Enforces Consistent Project Structure
---

# 🤖 Copilot File Organization Maintenance Rules

## Overview

These rules enforce consistent file organization across the 3d-inventory-api project.
When GitHub Copilot creates or suggests creating new files, it MUST follow these rules
to maintain the organized project structure.

**Critical Rule**: Files must NEVER be created in the root directory unless they are
one of the 4 essential documentation files.

---

## 🎯 Core Principles

### 1. Root Directory is Sacred (4 Files Maximum)

**ONLY these files belong in root**:
- ✅ `README.md` - Project overview and setup
- ✅ `DEVELOPMENT.md` - Development workflow
- ✅ `AGENTS.md` - AI automation and patterns
- ✅ `SECURITY.md` - Security policies

**ALL other files** must be organized in subfolders.

### 2. File Type Determines Location

| File Type | Location | Example |
|-----------|----------|---------|
| Shell scripts (.sh) | `/scripts/` | `scripts/build.sh` |
| Database scripts (.ts/.js) | `/scripts/database/` | `scripts/database/init-users.ts` |
| Test/automation scripts (.ts/.js) | `/scripts/testing/` | `scripts/testing/test-db-auth.ts` |
| Configuration files | `/config/` | `config/jest.config.ts` |
| Documentation | `/docs/` subfolders | `docs/guides/SETUP.md` |
| Application code | `/src/` | `src/controllers/auth.ts` |

### 3. Consistent Naming Conventions

```
Directory: lowercase-with-dashes
Files: descriptive-names-with-dashes.ext
Scripts: verb-noun format (build-api.sh, test-auth.ts)
Config: feature-name.config.ext (jest.config.ts, eslint.config.ts)
Docs: descriptive-titles-with-dashes.md
```

### 4. Automation and Runner Prefixes

**TypeScript Scripts**: `npx tsx scripts/path/to/script.ts`
**JavaScript Scripts**: `node scripts/path/to/script.js`
**Shell Scripts**: `bash scripts/path/to/script.sh`
**Executables**: `./scripts/path/to/script.sh` (must be executable)

---

## 📋 Copilot File Creation Checklist

Before creating ANY file, Copilot MUST:

- [ ] **Check file type** - What kind of file is this?
- [ ] **Determine location** - Which folder should it go in?
- [ ] **Verify path** - Use absolute path from project root
- [ ] **Check naming** - Follow naming conventions for the type
- [ ] **Validate runner** - Ensure correct command runner prefix
- [ ] **Confirm target** - Make sure it doesn't belong in root
- [ ] **Update references** - Update package.json/docs if needed

---

## 🚫 Anti-Patterns (DO NOT)

### ❌ DO NOT Create Root-Level Scripts

```bash
# WRONG ❌
File: build.sh (in root)
File: deploy.sh (in root)

# CORRECT ✅
File: scripts/build.sh
File: scripts/deploy.sh
```

### ❌ DO NOT Create Root-Level Configs

```bash
# WRONG ❌
File: jest.config.ts (in root)
File: eslint.config.ts (in root)

# CORRECT ✅
File: config/jest.config.ts
File: config/eslint.config.ts
```

### ❌ DO NOT Mix Script Categories

```bash
# WRONG ❌
File: scripts/testing/init-database.ts (database script in testing folder)

# CORRECT ✅
File: scripts/database/init-database.ts
```

### ❌ DO NOT Create Root-Level Utility Docs

```bash
# WRONG ❌
File: MY-FEATURE.md (in root)
File: IMPLEMENTATION-NOTES.md (in root)

# CORRECT ✅
File: docs/guides/MY-FEATURE.md
File: docs/archive/IMPLEMENTATION-NOTES.md
```

---

## 📁 Complete Directory Reference

### `/scripts/` - General Scripts & Deployment

**When to use**: General development scripts, build tools, deployment helpers

**File patterns**:
- `build.sh` - Build automation
- `deploy.sh` - Deployment scripts
- `docker-compose.sh` - Container management
- `setup-*.sh` - Initial setup scripts
- `verify-*.sh` - Verification utilities
- `cleanup-*.sh` - Cleanup operations

**Copilot instruction**: 
> "Create a shell script in `/scripts/` directory, not in root"

---

### `/scripts/database/` - Database Operations

**When to use**: Database initialization, migrations, user management, admin operations

**File patterns**:
- `init-*.ts` - Initialization scripts
- `add-*.ts` - Add operations (add-admin-role, add-user)
- `update-*.ts` - Update operations
- `reset-*.ts` - Reset operations
- `unlock-*.ts` - Unlock operations
- `cleanup-*.ts` - Cleanup operations
- `migrate-*.ts` - Migration scripts
- `verify-*.ts` - Verification scripts
- `check-*.ts` - Check/inspect operations

**Examples**:
- `scripts/database/init-users.ts`
- `scripts/database/add-admin-role.ts`
- `scripts/database/reset-admin-password.ts`
- `scripts/database/verify-admin-access.ts`
- `scripts/database/unlock-admin.ts`
- `scripts/database/check-db-raw.ts`
- `scripts/database/cleanup-and-reinit.ts`
- `scripts/database/migrate-permissions.ts`

**Copilot instruction**:
> "Create database script in `/scripts/database/` with appropriate runner (npx tsx for .ts)"

---

### `/scripts/testing/` - Test Utilities & Automation

**When to use**: Test automation, test data generation, test setup/cleanup

**File patterns**:
- `test-*.ts` - TypeScript tests
- `test-*.cjs` - CommonJS tests
- `test-*.js` - JavaScript tests
- `setup-*.ts` - Test setup utilities
- `cleanup-*.ts` - Test cleanup utilities
- `generator-*.ts` - Test data generators

**Examples**:
- `scripts/testing/test-db-auth.ts`
- `scripts/testing/test-auth.cjs`
- `scripts/testing/test-jest-cleanup.js`
- `scripts/testing/setup-test-db.ts`
- `scripts/testing/test-generator.ts`

**Copilot instruction**:
> "Create test utility in `/scripts/testing/` with appropriate runner (npx tsx or node)"

---

### `/config/` - Configuration Files

**When to use**: Build tools, testing, linting configurations

**File patterns**:
- `jest.config.ts` - Jest configuration
- `eslint.config.ts` - ESLint configuration
- `babel.config.js` - Babel configuration
- `tsconfig.*.json` - TypeScript configurations
- `*.config.ts` - Any tool configuration

**Copilot instruction**:
> "Create configuration file in `/config/` directory"

---

### `/docs/` - Documentation

**Structure**:
```
docs/
├── guides/          # Setup, tutorial, how-to guides
├── features/        # Feature documentation
├── troubleshooting/ # Debugging, common issues
└── archive/         # Historical, deprecated docs
```

**Copilot instruction**:
> "Create documentation in appropriate `/docs/` subfolder:
> - Setup/tutorial → /docs/guides/
> - Feature info → /docs/features/
> - Problem solving → /docs/troubleshooting/
> - Deprecated → /docs/archive/"

---

### `/src/` - Application Code

**Structure**:
```
src/
├── controllers/ # Request handlers
├── services/   # Business logic
├── models/     # Data interfaces
├── utils/      # Utility functions
├── middleware/ # Express middleware
└── routes/     # Route definitions
```

**Copilot instruction**:
> "Create application code in appropriate `/src/` subfolder based on responsibility"

---

## 🔍 Decision Tree for File Placement

```
STEP 1: Is this a documentation file?
├─ YES (README, DEVELOPMENT, AGENTS, SECURITY)
│  └─ ONLY if it's one of the 4 essential files
│     ELSE → /docs/
└─ NO → Continue to Step 2

STEP 2: Is this a script or automation file?
├─ Shell script (.sh)?
│  ├─ Deployment/build related?
│  │  └─ /scripts/
│  ├─ Database related?
│  │  └─ /scripts/database/
│  └─ Testing related?
│     └─ /scripts/testing/
│
├─ TypeScript/JavaScript script?
│  ├─ Database operations?
│  │  └─ /scripts/database/
│  ├─ Testing/automation?
│  │  └─ /scripts/testing/
│  └─ Build/deployment?
│     └─ /scripts/
│
└─ NO script → Continue to Step 3

STEP 3: What is the file's purpose?
├─ Configuration? → /config/
├─ Documentation? → /docs/<subfolder>
├─ Application code? → /src/<subfolder>
└─ Other? → Create appropriate subfolder following naming conventions
```

---

## 📝 Copilot Prompt Templates

### Creating a Database Script

```
Following file organization standards (.github/instructions/file-organization.instructions.md):

Create a TypeScript database script at:
scripts/database/<descriptive-name>.ts

Purpose: [what the script does]
Use runner: npx tsx scripts/database/<descriptive-name>.ts
```

### Creating a Test Utility

```
Following file organization standards:

Create a test utility at:
scripts/testing/<descriptive-name>.ts

Purpose: [what the utility does]
File type: TypeScript (.ts)
Use runner: npx tsx scripts/testing/<descriptive-name>.ts
```

### Creating a Build Script

```
Following file organization standards:

Create a shell script at:
scripts/<descriptive-name>.sh

Purpose: [what the script does]
Use runner: bash scripts/<descriptive-name>.sh
```

### Creating Configuration

```
Following file organization standards:

Create configuration at:
config/<tool-name>.config.ts

Purpose: [tool configuration]
Examples: jest.config.ts, eslint.config.ts
```

### Creating Documentation

```
Following file organization standards:

Create documentation at:
docs/<category>/<descriptive-title>.md

Categories:
- /docs/guides/ - Setup, tutorials, how-tos
- /docs/features/ - Feature documentation
- /docs/troubleshooting/ - Debugging guides
- /docs/archive/ - Historical/deprecated
```

---

## 🔗 Integration Points

### Package.json Script References

When adding npm scripts, ALWAYS use proper format:

```json
{
  "scripts": {
    "build": "bash ./scripts/build.sh",
    "init:users": "npx tsx scripts/database/init-users.ts",
    "test:db-auth": "npx tsx scripts/testing/test-db-auth.ts",
    "test:cleanup": "node scripts/testing/test-cleanup.js"
  }
}
```

**Pattern**: `<runner> ./scripts/<category>/<name>.<ext>`

### GitHub Actions Workflow

When referencing scripts in workflows:

```yaml
- name: Build Application
  run: bash ./scripts/build.sh

- name: Initialize Test Database
  run: npx tsx scripts/database/init-test-db.ts

- name: Run Authentication Tests
  run: npx tsx scripts/testing/test-db-auth.ts
```

### TypeScript Import Paths

For application imports:

```typescript
// ✅ CORRECT - Within application
import { DatabaseService } from '../services/DatabaseService'
import { AuthMiddleware } from '../middleware/auth'

// ✅ CORRECT - Scripts as utilities
import { testUtils } from '../scripts/testing/utilities'

// ❌ AVOID - Circular imports
// Don't import application code into scripts unnecessarily
```

---

## ✅ Verification Checklist for New Files

Before creating a new file, verify:

- [ ] **Location** - Using correct subdirectory?
- [ ] **Naming** - Following naming conventions?
- [ ] **Runner** - Correct prefix for file type?
- [ ] **References** - Updated package.json if needed?
- [ ] **Documentation** - Added comments explaining purpose?
- [ ] **Not in root** - Ensuring root stays clean?
- [ ] **Path format** - Using proper relative paths?

---

## 🚀 Common Scenarios

### Scenario 1: Creating User Initialization Script

**Request**: "Create a script to initialize default users"

**Copilot Action**:
```
✅ Location: scripts/database/init-users.ts
✅ Runner: npx tsx scripts/database/init-users.ts
✅ Pattern: Type=TypeScript, Category=database
✅ Naming: init-users (verb-noun format)
```

### Scenario 2: Creating Build Helper

**Request**: "Create a build script"

**Copilot Action**:
```
✅ Location: scripts/build.sh
✅ Runner: bash ./scripts/build.sh
✅ Pattern: Type=Shell, Category=general
✅ Naming: build (descriptive)
```

### Scenario 3: Creating Test Automation

**Request**: "Create authentication test automation"

**Copilot Action**:
```
✅ Location: scripts/testing/test-db-auth.ts
✅ Runner: npx tsx scripts/testing/test-db-auth.ts
✅ Pattern: Type=TypeScript, Category=testing
✅ Naming: test-db-auth (test-<feature>)
```

### Scenario 4: Creating Configuration

**Request**: "Create Jest configuration"

**Copilot Action**:
```
✅ Location: config/jest.config.ts
✅ Pattern: Type=TypeScript, Category=config
✅ Naming: jest.config.ts (standard format)
```

### Scenario 5: Creating Documentation

**Request**: "Write setup guide for the project"

**Copilot Action**:
```
✅ Location: docs/guides/SETUP.md
✅ Pattern: Type=Markdown, Category=guides
✅ Naming: SETUP.md (descriptive title)
```

---

## 📚 Related Standards

- **Code Quality**: `.github/instructions/code_quality_standards.instructions.md`
- **Test Coverage**: `.github/instructions/test_coverage_standards.instructions.md`
- **TypeScript**: `.github/instructions/typescript_strict_mode.instructions.md`
- **Copilot Guide**: `/home/karol/GitHub/3d-inventory-api/.github/copilot-instructions.md`

---

## 🔔 Important Reminders

### For GitHub Copilot

1. **ALWAYS check file organization** before creating any file
2. **NEVER create root-level scripts** (except the 4 essential .md files)
3. **USE subdirectories** for ALL project files
4. **FOLLOW naming conventions** consistently
5. **INCLUDE proper runners** in package.json references
6. **VERIFY paths** match subdirectory locations

### For Developers Using Copilot

1. **Reference this guide** when asking for file creation
2. **Use full paths** in prompts: `scripts/database/my-script.ts`
3. **Specify file type** when unclear: "Create a TypeScript database script"
4. **Check Copilot's suggestion** against this guide
5. **Correct location** if Copilot suggests root directory

---

## 📞 Questions?

If unsure about file location:

1. Check "Decision Tree for File Placement" above
2. Look at similar files already in the project
3. Reference the "Complete Directory Reference"
4. When in doubt, place in appropriate subfolder (NEVER root)

---

**Version**: 2.0
**Last Updated**: November 2024
**Status**: Active
**Enforcement**: Automated via Copilot instructions
