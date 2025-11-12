---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*'
description: File Organization Maintenance Checklist for Copilot
---

# File Organization Maintenance Checklist

## 🎯 Pre-File-Creation Checklist

**Before Copilot creates ANY file**, verify these 7 items:

- [ ] **File Type Identified**: What kind of file is this? (script, config, doc, code, etc.)
- [ ] **Location Determined**: Where should it go? (root, /scripts/, /config/, /docs/, /src/, etc.)
- [ ] **Essential File Check**: Is this one of the 4 essential root files? (Only: README.md, DEVELOPMENT.md, AGENTS.md, SECURITY.md)
- [ ] **Path Specified**: Full relative path provided? (e.g., `scripts/database/init-users.ts` NOT just `init-users.ts`)
- [ ] **Naming Convention**: Follows pattern? (lowercase, hyphens for multi-word, descriptive)
- [ ] **Runner Identified**: Correct runner for file type? (bash, npx tsx, node, or N/A)
- [ ] **Integration Points**: Will package.json, workflows, or imports need updating?

---

## 📋 File Type Decision Matrix

### Is this a Script (.sh, .ts, .js)?

| Script Type  | Location             | Runner              | Example           | npm Script                                               |
| ------------ | -------------------- | ------------------- | ----------------- | -------------------------------------------------------- |
| Build/Deploy | `/scripts/`          | `bash` or `node`    | `build.sh`        | `"gcp:build": "bash ./scripts/build.sh"`                 |
| Database Ops | `/scripts/database/` | `npx tsx`           | `init-users.ts`   | `"init:users": "npx tsx scripts/database/init-users.ts"` |
| Testing      | `/scripts/testing/`  | `npx tsx` or `node` | `test-db-auth.ts` | `"test:db": "npx tsx scripts/testing/test-db-auth.ts"`   |

### Is this a Config File?

| Config Type   | Location   | Example            |
| ------------- | ---------- | ------------------ |
| Jest Config   | `/config/` | `jest.config.ts`   |
| ESLint Config | `/config/` | `eslint.config.ts` |
| Babel Config  | `/config/` | `babel.config.js`  |
| Any Config    | `/config/` | `<tool>.config.ts` |

### Is this Documentation?

| Doc Type        | Location                 | Example             |
| --------------- | ------------------------ | ------------------- |
| Setup/How-To    | `/docs/guides/`          | `SETUP.md`          |
| Feature Info    | `/docs/features/`        | `AUTHENTICATION.md` |
| Problem Solving | `/docs/troubleshooting/` | `COMMON-ERRORS.md`  |
| Old/Deprecated  | `/docs/archive/`         | `OLD-DOCS.md`       |

### Is this Application Code?

| Code Type  | Location            | Example          |
| ---------- | ------------------- | ---------------- |
| Controller | `/src/controllers/` | `auth.ts`        |
| Service    | `/src/services/`    | `UserService.ts` |
| Model      | `/src/models/`      | `User.ts`        |
| Middleware | `/src/middlewares/` | `auth.ts`        |
| Utility    | `/src/utils/`       | `helpers.ts`     |

---

## ✅ Post-File-Creation Verification

**After file is created, verify these 7 items**:

- [ ] **Location Correct**: File is in proper subdirectory (NOT root, except 4 essential files)
- [ ] **Naming Correct**: File uses lowercase, hyphens for multi-word names
- [ ] **Runner Correct**: Correct runner specified (bash, npx tsx, node)
- [ ] **npm Script Added**: If applicable, added to package.json with correct format
- [ ] **Relative Path**: npm script uses full relative path (e.g., `./scripts/database/init.ts`)
- [ ] **Documentation**: If public API, documentation updated or created
- [ ] **Integration**: Related files updated (package.json, workflows, imports)

---

## 🚫 Anti-Pattern Detection Checklist

**Before accepting file creation, ensure NONE of these exist**:

### ❌ Anti-Pattern 1: Files in Root

```
❌ WRONG
./build.sh
./init-users.ts
./jest.config.ts
./my-doc.md

✅ CORRECT
./scripts/build.sh
./scripts/database/init-users.ts
./config/jest.config.ts
./docs/guides/my-doc.md
```

- [ ] NO shell scripts in root
- [ ] NO TypeScript scripts in root
- [ ] NO config files in root
- [ ] NO documentation files in root (except 4 essential)
- [ ] NO utility files in root

### ❌ Anti-Pattern 2: Wrong Script Category

```
❌ WRONG - Database script in testing folder
./scripts/testing/init-users.ts

❌ WRONG - Test script in database folder
./scripts/database/test-db-auth.ts

✅ CORRECT
./scripts/database/init-users.ts
./scripts/testing/test-db-auth.ts
```

- [ ] Database scripts in `/scripts/database/` only
- [ ] Test scripts in `/scripts/testing/` only
- [ ] Build scripts in `/scripts/` only
- [ ] Config files in `/config/` only
- [ ] Documentation in `/docs/` only

### ❌ Anti-Pattern 3: Wrong Runner

```
❌ WRONG - TypeScript with wrong runner
node scripts/database/init-users.ts       // Won't work
npx ts-node scripts/database/init-users.ts  // Incomplete

❌ WRONG - Shell script as TypeScript
npx tsx ./scripts/build.sh                // Wrong runner

✅ CORRECT
npx tsx scripts/database/init-users.ts    // TypeScript runner
bash ./scripts/build.sh                   // Shell runner
node scripts/cleanup.js                   // JavaScript runner
```

- [ ] TypeScript files use `npx tsx` runner
- [ ] Shell files use `bash` runner
- [ ] JavaScript files use `node` runner

### ❌ Anti-Pattern 4: Inconsistent npm Script Format

```
❌ WRONG - Missing path prefix
"init:users": "npx tsx init-users.ts"           // Where is it?
"build": "bash build.sh"                        // Where is it?

❌ WRONG - Incorrect path format
"test:db": "npx tsx scripts/testing\\test.ts"   // Wrong separator

✅ CORRECT - Full relative paths
"init:users": "npx tsx scripts/database/init-users.ts"
"build": "bash ./scripts/build.sh"
"test:db": "npx tsx scripts/testing/test-db-auth.ts"
```

- [ ] All npm scripts use full relative paths
- [ ] All paths start with `./scripts/` or `scripts/`
- [ ] All paths use forward slashes (`/` not `\`)
- [ ] All runners (bash, npx tsx, node) properly specified

---

## 📊 Common File Scenarios Checklist

### Scenario: New Database Initialization Script

Required Checks:

- [ ] **File Type**: TypeScript (.ts) ✓
- [ ] **Location**: `/scripts/database/` ✓
- [ ] **Name**: `init-<function>.ts` (e.g., `init-users.ts`) ✓
- [ ] **Runner**: `npx tsx` ✓
- [ ] **npm Script**: `"<function>:init": "npx tsx scripts/database/init-<function>.ts"` ✓
- [ ] **Full Path**: `npx tsx scripts/database/init-users.ts` ✓
- [ ] **Root**: NOT in root directory ✓

**Correct Example**:

```
File: scripts/database/init-users.ts
npm: "init:users": "npx tsx scripts/database/init-users.ts"
```

---

### Scenario: New Build Deployment Script

Required Checks:

- [ ] **File Type**: Shell (.sh) ✓
- [ ] **Location**: `/scripts/` ✓
- [ ] **Name**: `<action>.sh` (e.g., `build.sh`, `deploy.sh`) ✓
- [ ] **Runner**: `bash` ✓
- [ ] **npm Script**: `"<action>": "bash ./scripts/<action>.sh"` ✓
- [ ] **Full Path**: `bash ./scripts/build.sh` ✓
- [ ] **Root**: NOT in root directory ✓

**Correct Example**:

```
File: scripts/build.sh
npm: "build": "bash ./scripts/build.sh"
```

---

### Scenario: New Test Automation Script

Required Checks:

- [ ] **File Type**: TypeScript (.ts) ✓
- [ ] **Location**: `/scripts/testing/` ✓
- [ ] **Name**: `test-<function>.ts` (e.g., `test-db-auth.ts`) ✓
- [ ] **Runner**: `npx tsx` ✓
- [ ] **npm Script**: `"test:<function>": "npx tsx scripts/testing/test-<function>.ts"` ✓
- [ ] **Full Path**: `npx tsx scripts/testing/test-db-auth.ts` ✓
- [ ] **Root**: NOT in root directory ✓

**Correct Example**:

```
File: scripts/testing/test-db-auth.ts
npm: "test:db": "npx tsx scripts/testing/test-db-auth.ts"
```

---

### Scenario: New Configuration File

Required Checks:

- [ ] **File Type**: TypeScript or JavaScript config (.ts, .js) ✓
- [ ] **Location**: `/config/` ✓
- [ ] **Name**: `<tool>.config.ts` (e.g., `jest.config.ts`) ✓
- [ ] **Root**: NOT in root directory ✓
- [ ] **Used by**: Root-level tool/config system ✓

**Correct Example**:

```
File: config/jest.config.ts
Used: jest.config.ts imports from config/jest.config.ts
```

---

### Scenario: New Documentation

Required Checks:

- [ ] **File Type**: Markdown (.md) ✓
- [ ] **Category**: Determined (guides, features, troubleshooting, archive) ✓
- [ ] **Location**: `/docs/<category>/` ✓
- [ ] **Name**: `DESCRIPTIVE-TITLE.md` (e.g., `DEPLOYMENT.md`) ✓
- [ ] **Root**: NOT in root directory ✓

**Correct Example**:

```
File: docs/guides/DEPLOYMENT.md
File: docs/features/AUTHENTICATION.md
File: docs/troubleshooting/CORS-ISSUES.md
```

---

## 🔄 Integration Point Checklist

### When Adding Scripts, Check:

- [ ] **package.json**: Updated with new npm script
- [ ] **.github/workflows**: Updated if script runs in CI/CD
- [ ] **Other imports**: Updated any files that reference the script
- [ ] **Documentation**: Updated if this is a public/important script
- [ ] **README**: Updated if users need to know about this script

### When Adding Configs, Check:

- [ ] **Root-level reference**: Root tool/config references new file
- [ ] **package.json**: Updated if needed
- **.github/workflows**: Updated if config affects CI/CD
- [ ] **Documentation**: Updated if configuration is user-configurable
- [ ] **tsconfig.json**: Updated if TypeScript paths affected

### When Adding Documentation, Check:

- [ ] **README**: Linked from main README if important
- [ ] **Related docs**: Cross-references from related documentation
- [ ] **Sidebar/Index**: Updated if documentation has navigation
- [ ] **Search**: Ensure file is discoverable

---

## 🎓 Decision Tree for Every File

### Start Here:

```
Is this one of 4 essential root files?
(README.md, DEVELOPMENT.md, AGENTS.md, SECURITY.md)
│
├─ YES → Root OK ✓
│
└─ NO → Continue
    │
    ├─ Shell script (.sh)?
    │  └─ YES → /scripts/ (use bash) ✓
    │
    ├─ Database/Admin TypeScript (.ts)?
    │  └─ YES → /scripts/database/ (use npx tsx) ✓
    │
    ├─ Testing/Automation TypeScript (.ts)?
    │  └─ YES → /scripts/testing/ (use npx tsx) ✓
    │
    ├─ Config file (.config.ts, .config.js)?
    │  └─ YES → /config/ ✓
    │
    ├─ Documentation (.md)?
    │  ├─ How-to guide?    → /docs/guides/ ✓
    │  ├─ Feature info?    → /docs/features/ ✓
    │  ├─ Problem solving? → /docs/troubleshooting/ ✓
    │  └─ Old/deprecated?  → /docs/archive/ ✓
    │
    ├─ Application code (.ts)?
    │  ├─ Request handler?   → /src/controllers/ ✓
    │  ├─ Business logic?    → /src/services/ ✓
    │  ├─ Data model?        → /src/models/ ✓
    │  ├─ Middleware?        → /src/middlewares/ ✓
    │  └─ Helper functions?  → /src/utils/ ✓
    │
    └─ Other?
       └─ Create appropriate subfolder, NEVER root ✓
```

---

## 📝 Pre-Commit Validation Checklist

**Before committing changes, verify**:

- [ ] No files created in root (except 4 essential)
- [ ] All scripts in correct subdirectories
- [ ] All npm scripts have full paths
- [ ] All runners correct (bash, npx tsx, node)
- [ ] All naming follows conventions (lowercase, hyphens)
- [ ] All documentation updated
- [ ] All integration points updated
- [ ] No duplicate files in wrong locations
- [ ] File organization matches decision tree

---

## 🚀 Enforcement Commands

### Manual Verification

```bash
# Check for files in root
ls -la | grep -E '\.(sh|ts|js)$' | grep -v node_modules

# Check for scripts in wrong locations
find scripts -type f -name '*.ts' | grep -v database | grep -v testing

# Find config files
find . -maxdepth 1 -name '*config*'

# Check npm scripts
grep -A 20 '"scripts"' package.json
```

### Copilot Enforcement

- Copilot checks file type
- Copilot consults decision tree
- Copilot determines correct location
- Copilot creates file in proper subdirectory
- Copilot uses correct runner
- Copilot updates integration points

---

## 📞 Quick Reference

| Question                          | Answer                 | Reference |
| --------------------------------- | ---------------------- | --------- |
| Where do shell scripts go?        | `/scripts/`            | Rule 1    |
| Where do database scripts go?     | `/scripts/database/`   | Rule 2    |
| Where do test scripts go?         | `/scripts/testing/`    | Rule 3    |
| Where do configs go?              | `/config/`             | Rule 4    |
| Where do docs go?                 | `/docs/<category>/`    | Rule 5    |
| Where does app code go?           | `/src/<folder>/`       | Rule 6    |
| Can I put files in root?          | Only 4 essential files | Rule 0    |
| What's the runner for TypeScript? | `npx tsx`              | Pattern 1 |
| What's the runner for shell?      | `bash`                 | Pattern 2 |
| What's the runner for JavaScript? | `node`                 | Pattern 3 |

---

## 🎯 Summary

**Before Creating File**: Use pre-creation checklist (7 items)

**While Creating File**: Follow decision tree

**After Creating File**: Use post-creation verification (7 items)

**Before Committing**: Use pre-commit validation (8 items)

**Still Unsure?**: Ask Copilot with full path and purpose

---

**Version**: 1.0
**Type**: Checklist
**Applies To**: All file creation decisions
**Status**: Active
**Last Updated**: November 2024
