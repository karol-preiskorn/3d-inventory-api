---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*'
description: Quick Reference - File Organization Rules for Copilot
---

# Quick Reference: File Organization Rules

## ⚡ 30-Second Summary

**Root = 4 Files Only**: README.md, DEVELOPMENT.md, AGENTS.md, SECURITY.md

**Everything Else**: Goes in subdirectories

| File Type        | Location             | Example                           |
| ---------------- | -------------------- | --------------------------------- |
| Scripts (.sh)    | `/scripts/`          | `scripts/build.sh`                |
| Database scripts | `/scripts/database/` | `scripts/database/init-users.ts`  |
| Test scripts     | `/scripts/testing/`  | `scripts/testing/test-db-auth.ts` |
| Config files     | `/config/`           | `config/jest.config.ts`           |
| Documentation    | `/docs/`             | `docs/guides/SETUP.md`            |
| App code         | `/src/`              | `src/controllers/auth.ts`         |

---

## 🚫 Rule #1: NO Root Scripts

```
❌ WRONG
./build.sh
./init-users.ts
./test-auth.ts
./jest.config.ts

✅ CORRECT
./scripts/build.sh
./scripts/database/init-users.ts
./scripts/testing/test-auth.ts
./config/jest.config.ts
```

---

## 🔍 Rule #2: File Type Determines Location

### Shell Scripts → `/scripts/`

```bash
scripts/build.sh
scripts/deploy.sh
scripts/docker-setup.sh
scripts/verify-cors.sh
```

### Database/Admin TypeScript → `/scripts/database/`

```bash
scripts/database/init-users.ts
scripts/database/add-admin-role.ts
scripts/database/reset-admin-password.ts
scripts/database/verify-admin-access.ts
scripts/database/unlock-admin.ts
scripts/database/cleanup-and-reinit.ts
```

### Testing/Automation TypeScript → `/scripts/testing/`

```bash
scripts/testing/test-db-auth.ts
scripts/testing/test-auth.cjs
scripts/testing/setup-test-db.ts
```

### Config Files → `/config/`

```bash
config/jest.config.ts
config/eslint.config.ts
config/babel.config.js
config/tsconfig.*.json
```

### Documentation → `/docs/`

```bash
docs/guides/SETUP.md
docs/guides/DEPLOYMENT.md
docs/features/AUTHENTICATION.md
docs/troubleshooting/COMMON-ERRORS.md
docs/archive/OLD-DOCS.md
```

### Application Code → `/src/`

```bash
src/controllers/auth.ts
src/services/UserService.ts
src/models/User.ts
src/utils/helpers.ts
```

---

## 🤖 Decision Flow

```
Creating a new file?
│
├─ One of: README.md, DEVELOPMENT.md, AGENTS.md, SECURITY.md?
│  └─ YES → Root OK (only these 4)
│  └─ NO → Continue
│
├─ Shell script (.sh)?
│  ├─ Database → /scripts/database/ ❌ (not for .sh)
│  └─ Anything else → /scripts/ ✅
│
├─ Database/Admin script (.ts/.js)?
│  └─ → /scripts/database/ ✅
│
├─ Testing/Automation script (.ts/.js)?
│  └─ → /scripts/testing/ ✅
│
├─ Config file?
│  └─ → /config/ ✅
│
├─ Documentation?
│  ├─ Setup/How-to → /docs/guides/ ✅
│  ├─ Feature info → /docs/features/ ✅
│  ├─ Problem solving → /docs/troubleshooting/ ✅
│  └─ Old/Deprecated → /docs/archive/ ✅
│
├─ Application code?
│  └─ → /src/<appropriate-folder>/ ✅
│
└─ Other?
   └─ Create appropriate subfolder (NEVER root)
```

---

## 📋 Before Creating Any File

- [ ] Check file type
- [ ] Determine correct location
- [ ] Use full path (e.g., `scripts/database/init-users.ts`)
- [ ] NOT putting in root (except the 4 essential .md files)
- [ ] Following naming conventions
- [ ] Have correct runner prefix

---

## 🔗 File Creation Templates

### Create Database Script

```
Create scripts/database/<name>.ts with:
- Purpose: [what it does]
- Runner: npx tsx scripts/database/<name>.ts
```

### Create Test Script

```
Create scripts/testing/<name>.ts with:
- Purpose: [what it does]
- Runner: npx tsx scripts/testing/<name>.ts
```

### Create Shell Script

```
Create scripts/<name>.sh with:
- Purpose: [what it does]
- Runner: bash ./scripts/<name>.sh
```

### Create Config File

```
Create config/<tool>.config.ts with:
- Purpose: [what it configures]
```

### Create Documentation

```
Create docs/<category>/<title>.md with:
- Category: guides|features|troubleshooting|archive
- Purpose: [what it documents]
```

---

## ❌ Common Mistakes

| Mistake                 | Wrong                           | Correct                                  |
| ----------------------- | ------------------------------- | ---------------------------------------- |
| Scripts in root         | `./build.sh`                    | `./scripts/build.sh`                     |
| Configs in root         | `./jest.config.ts`              | `./config/jest.config.ts`                |
| Docs in root            | `./SETUP.md`                    | `./docs/guides/SETUP.md`                 |
| DB scripts wrong folder | `scripts/testing/init-users.ts` | `scripts/database/init-users.ts`         |
| Wrong runner            | `node init-users.ts`            | `npx tsx scripts/database/init-users.ts` |

---

## 📖 Where to Find Full Rules

- Full guide: `.github/instructions/COPILOT-FILE-ORGANIZATION-MAINTENANCE.md`
- Original rules: `.github/instructions/file-organization.instructions.md`

---

## ✅ Examples - Get It Right

### ✅ Correct Example 1: Database Initialization

```
File: scripts/database/init-users.ts
Runner: npx tsx scripts/database/init-users.ts
npm script: "init:users": "npx tsx scripts/database/init-users.ts"
```

### ✅ Correct Example 2: Build Script

```
File: scripts/build.sh
Runner: bash ./scripts/build.sh
npm script: "gcp:build": "bash ./scripts/build.sh"
```

### ✅ Correct Example 3: Test Automation

```
File: scripts/testing/test-db-auth.ts
Runner: npx tsx scripts/testing/test-db-auth.ts
npm script: "test:db-auth": "npx tsx scripts/testing/test-db-auth.ts"
```

### ✅ Correct Example 4: Configuration

```
File: config/jest.config.ts
Usage: Import from jest.config.ts in root
Reference: jest expects this at root level
```

### ✅ Correct Example 5: Documentation

```
File: docs/guides/DEPLOYMENT.md
Purpose: Deployment workflow guide
Location: Guides subfolder for how-to documentation
```

---

## 🚨 Remember

1. **NO scripts in root** (except the 4 essential docs)
2. **Database scripts** → `/scripts/database/`
3. **Test scripts** → `/scripts/testing/`
4. **Shell scripts** → `/scripts/`
5. **Config files** → `/config/`
6. **Documentation** → `/docs/`
7. **App code** → `/src/`
8. **When in doubt** → Create appropriate subfolder, NEVER root

---

**Version**: 1.0
**Type**: Quick Reference
**Applies To**: All Copilot file creation
**Status**: Active
