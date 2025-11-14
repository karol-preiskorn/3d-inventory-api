---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: '**/*'
description: Quick Reference - File Organization Patterns
---

# File Organization Quick Reference

## 🎯 Quick Decision Tree

```
NEW FILE NEEDED?
│
├─ Shell script (.sh)?           → /scripts/
├─ Database script (.ts/.js)?    → /scripts/database/
├─ Testing script (.ts/.js)?     → /scripts/testing/
├─ Config file?                  → /config/
├─ Documentation?                → /docs/{guides|features|troubleshooting}
├─ Application code?             → /src/{controllers|services|models|utils}
└─ Essential root doc?           → / (ONLY: README, DEVELOPMENT, AGENTS, SECURITY)
```

## 📁 Common File Locations

| File Type               | Location                 | Example                         |
| ----------------------- | ------------------------ | ------------------------------- |
| **Deployment scripts**  | `/scripts/`              | `build.sh`, `deploy.sh`         |
| **Database operations** | `/scripts/database/`     | `init-users.ts`, `migrate.ts`   |
| **Test utilities**      | `/scripts/testing/`      | `test-db-auth.ts`               |
| **Jest config**         | `/config/`               | `jest.config.ts`                |
| **ESLint config**       | `/config/`               | `eslint.config.ts`              |
| **Setup guides**        | `/docs/guides/`          | `SETUP.md`, `GCP-DEPLOYMENT.md` |
| **Feature docs**        | `/docs/features/`        | `AUTHENTICATION.md`             |
| **Troubleshooting**     | `/docs/troubleshooting/` | `COMMON-ERRORS.md`              |
| **API controllers**     | `/src/controllers/`      | `auth.ts`, `devices.ts`         |
| **Services**            | `/src/services/`         | `UserService.ts`                |
| **Models**              | `/src/models/`           | `User.ts`, `Device.ts`          |

## 🚫 Never Create in Root

Only 4 files allowed in root:

1. `README.md`
2. `DEVELOPMENT.md`
3. `AGENTS.md`
4. `SECURITY.md`

Everything else goes in subfolders!

## 📝 Naming Conventions

- **Files**: `lowercase-with-hyphens.ext` or `PascalCase.ts` (for classes)
- **Directories**: `lowercase-with-hyphens/`
- **Scripts**: Descriptive names: `init-users.ts`, `test-db-auth.ts`
- **Configs**: `{tool}.config.{ts|js}`

## ✅ Quick Examples

```bash
# ✅ CORRECT
scripts/build.sh
scripts/database/init-users.ts
scripts/testing/test-db-auth.ts
config/jest.config.ts
docs/guides/SETUP.md
src/controllers/auth.ts

# ❌ WRONG (root clutter)
build.sh
init-users.ts
test-db-auth.ts
jest.config.ts
SETUP.md
auth.ts
```

## 🔄 Common Mistakes

| ❌ Wrong                | ✅ Correct                      |
| ----------------------- | ------------------------------- |
| `my-script.ts` (root)   | `scripts/database/my-script.ts` |
| `jest.config.ts` (root) | `config/jest.config.ts`         |
| `FEATURE.md` (root)     | `docs/features/FEATURE.md`      |
| `MyService.ts` (root)   | `src/services/MyService.ts`     |

## 📋 Integration Checklist

After creating a file:

- [ ] Add npm script if needed (for scripts)
- [ ] Update imports if application code
- [ ] Update documentation references
- [ ] Verify file is in correct location
- [ ] Check naming convention

## Related Documentation

- [file-organization.instructions.md](./file-organization.instructions.md) - Full guide
- [INDEX.md](./INDEX.md) - All instruction files
