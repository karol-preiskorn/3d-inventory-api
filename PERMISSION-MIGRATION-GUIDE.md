# Permission Format Migration Guide

## Overview

This guide explains how to migrate user permissions from the old format to the new format in the MongoDB database, and then clean up the normalization code from the UI.

## Migration Steps

### Step 1: Run Database Migration (API)

The migration script will update all user permissions in MongoDB from old format to new format.

#### Old Format → New Format Mapping

| Old Format           | New Format          |
| -------------------- | ------------------- |
| `read:devices`       | `device:read`       |
| `write:devices`      | `device:create`     |
| `delete:devices`     | `device:delete`     |
| `read:models`        | `model:read`        |
| `write:models`       | `model:create`      |
| `delete:models`      | `model:delete`      |
| `read:connections`   | `connection:read`   |
| `write:connections`  | `connection:create` |
| `delete:connections` | `connection:delete` |
| `read:logs`          | `log:read`          |
| `delete:logs`        | `log:delete`        |
| `admin:access`       | `admin:full`        |

#### Run the Migration

```bash
cd /home/karol/GitHub/3d-inventory-api

# Compile TypeScript
npm run build

# Run migration script
npx ts-node migrate-permissions.ts
```

#### Expected Output

```
🚀 Starting permission migration...
📡 Connecting to: 3d-inventory
✅ Connected to MongoDB
📋 Found 5 users to check
🔄 Migrating user: carlo
   Old permissions: ["read:devices","write:devices","delete:devices","read:models","write:models","delete:models","read:connections","write:connections","delete:connections","read:logs","delete:logs","admin:access"]
   New permissions: ["device:read","device:create","device:delete","model:read","model:create","model:delete","connection:read","connection:create","connection:delete","log:read","log:delete","admin:full"]
✅ Successfully migrated user: carlo
⏭️  Skipping user admin - already using new format
⏭️  Skipping user user - already using new format
...
============================================================
📊 Migration Summary:
   Total users checked: 5
   ✅ Successfully migrated: 1
   ⏭️  Skipped (already new format): 4
   ❌ Errors: 0
============================================================
🎉 Migration completed successfully!
🔌 Disconnected from MongoDB
✅ Migration script completed
```

### Step 2: Remove Normalization Code from UI

Once the database migration is complete, we can remove the normalization code from the Angular UI since all permissions will be in the new format.

#### Files to Update

**File: `/home/karol/GitHub/3d-inventory-ui/src/app/components/users/user-form.component.ts`**

**Remove the `normalizePermission()` method** (lines ~169-197):

```typescript
// DELETE THIS METHOD:
private normalizePermission(oldPermission: string): string {
  const permissionMap: { [key: string]: string } = { ... };
  return permissionMap[oldPermission] || oldPermission;
}
```

**Simplify `initializePermissions()` method** (lines ~199-228):

**Before (with normalization):**

```typescript
private initializePermissions(userPermissions: string[] = []): void {
  console.error('🔍 DEBUG: initializePermissions called');
  console.error('📋 DEBUG: User permissions from API (original):', JSON.stringify(userPermissions));

  // ✅ FIX: Normalize old permissions to new format
  const normalizedPermissions = userPermissions.map(p => this.normalizePermission(p));
  console.error('📋 DEBUG: User permissions (normalized):', JSON.stringify(normalizedPermissions));
  console.error('📋 DEBUG: Available permissions:', JSON.stringify(this.availablePermissions));

  const permissionsArray = this.permissionsArray;

  // Clear existing controls
  while (permissionsArray.length) {
    permissionsArray.removeAt(0);
  }

  // Add controls for each permission using NORMALIZED permissions
  this.availablePermissions.forEach((permission, index) => {
    const isChecked = normalizedPermissions.includes(permission);
    console.error(`🔘 DEBUG: Permission ${index}: "${permission}" - Checked: ${isChecked}`);
    permissionsArray.push(this.fb.control(isChecked));
  });

  console.error('✅ DEBUG: initializePermissions completed. Total checkboxes:', permissionsArray.length);
  const checkedCount = normalizedPermissions.filter(p => this.availablePermissions.includes(p as Permission)).length;
  console.error('📊 DEBUG: Checked permissions count:', checkedCount);
}
```

**After (simplified, no normalization):**

```typescript
private initializePermissions(userPermissions: string[] = []): void {
  const permissionsArray = this.permissionsArray;

  // Clear existing controls
  while (permissionsArray.length) {
    permissionsArray.removeAt(0);
  }

  // Add controls for each permission
  this.availablePermissions.forEach((permission) => {
    const isChecked = userPermissions.includes(permission);
    permissionsArray.push(this.fb.control(isChecked));
  });
}
```

### Step 3: Rebuild and Deploy UI

```bash
cd /home/karol/GitHub/3d-inventory-ui

# Build production bundle
npm run build:prod

# Deploy to Google Cloud Run
./build.sh
```

### Step 4: Verify Everything Works

1. **Clear browser cache**:

   ```javascript
   caches
     .keys()
     .then((keys) => keys.forEach((k) => caches.delete(k)))
     .then(() => location.reload(true))
   ```

2. **Test user edit form**:
   - Go to: https://3d-inventory.ultimasolution.pl/admin/users
   - Click Edit on any user
   - Verify permission checkboxes are correctly checked
   - Save changes and verify they persist

3. **Check console** - you should NO longer see:
   - ❌ "User permissions (normalized)" messages
   - ❌ "Permission format" debug messages

   Permissions should just work without any normalization!

## Rollback Plan

If something goes wrong, you can rollback:

### Rollback Database Migration

```typescript
// Create rollback script: rollback-permissions.ts
const ROLLBACK_MAPPING = {
  'device:read': 'read:devices',
  'device:create': 'write:devices',
  'device:delete': 'delete:devices',
  'model:read': 'read:models',
  'model:create': 'write:models',
  'model:delete': 'delete:models',
  'connection:read': 'read:connections',
  'connection:create': 'write:connections',
  'connection:delete': 'delete:connections',
  'log:read': 'read:logs',
  'log:delete': 'delete:logs',
  'admin:full': 'admin:access',
}

// Run same migration logic but with ROLLBACK_MAPPING
```

### Rollback UI Code

```bash
git checkout HEAD -- src/app/components/users/user-form.component.ts
npm run build:prod
./build.sh
```

## Benefits After Migration

1. **✅ No More Normalization Code** - Cleaner, simpler codebase
2. **✅ Consistent Format** - Database and UI use same permission format
3. **✅ Better Performance** - No runtime permission mapping
4. **✅ Easier Debugging** - No format translation to track
5. **✅ Future-Proof** - All new features use consistent format

## Timeline

- **Phase 1**: Run database migration (5 minutes)
- **Phase 2**: Update UI code (10 minutes)
- **Phase 3**: Deploy and test (15 minutes)
- **Total**: ~30 minutes

## Safety Checklist

Before migration:

- [ ] Backup MongoDB database
- [ ] Test migration script on staging environment
- [ ] Have rollback plan ready
- [ ] Notify team of maintenance window

After migration:

- [ ] Verify all users can login
- [ ] Verify permission checkboxes work correctly
- [ ] Verify permission changes save correctly
- [ ] Check application logs for errors
- [ ] Monitor for 24 hours

## Support

If you encounter issues:

1. Check migration script output for errors
2. Verify MongoDB connection settings
3. Check application logs
4. Use rollback procedure if needed

---

**Status**: Ready to execute
**Created**: October 12, 2025
**Last Updated**: October 12, 2025
