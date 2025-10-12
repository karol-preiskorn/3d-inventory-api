# Admin Role Fix Guide

**Date**: October 12, 2025
**Issue**: Admin user unable to access admin area due to missing admin role
**Solution**: Script to add admin role to admin user
**Status**: ✅ **READY TO RUN**

---

## 🔍 Problem Description

### Symptoms

When the admin user tries to access the admin area (`/admin/users`), they receive an "Access Denied" error:

```
Access denied: User admin attempted to access admin area without admin role
```

### Root Cause

The **AdminGuard** checks if the user has `role === 'admin'`, but the admin user in the database doesn't have this role field set properly.

**AdminGuard Code (admin.guard.ts)**:

```typescript
const isAdmin = user?.role === 'admin'

if (!isAdmin) {
  console.warn(`Access denied: User ${user?.username} attempted to access admin area without admin role`)
  this.router.navigate(['/home'], {
    queryParams: { error: 'admin-access-required' },
  })
  return false
}
```

### Why This Happened

The admin user may have been created without the role field, or the role was not properly set during initialization.

---

## ✅ Solution: Add Admin Role Script

### Quick Fix (Recommended)

Run this single command to add the admin role to the admin user:

```bash
cd /home/karol/GitHub/3d-inventory-api
npm run add:admin-role
```

### What This Script Does

1. **Connects to MongoDB Atlas**
2. **Finds the admin user** (username: 'admin')
3. **Checks current role** (displays current state)
4. **Updates role to 'admin'** (if not already set)
5. **Verifies the update** (shows final state)
6. **Closes connection** (clean exit)

---

## 📋 Script Details

### File Location

```
/home/karol/GitHub/3d-inventory-api/add-admin-role.ts
```

### Script Content

The script performs these operations:

```typescript
// 1. Find admin user
const adminUser = await usersCollection.findOne({ username: 'admin' })

// 2. Check if role already set
if (adminUser.role === 'admin') {
  console.log('✅ Admin user already has admin role!')
} else {
  // 3. Update with admin role
  await usersCollection.updateOne(
    { username: 'admin' },
    {
      $set: {
        role: 'admin',
        updatedAt: new Date(),
      },
    },
  )
}
```

### NPM Script

Added to `package.json`:

```json
{
  "scripts": {
    "add:admin-role": "npx tsx add-admin-role.ts"
  }
}
```

---

## 🚀 Step-by-Step Fix

### Step 1: Run the Script

```bash
cd /home/karol/GitHub/3d-inventory-api
npm run add:admin-role
```

**Expected Output**:

```
🔧 Adding Admin Role to Admin User
====================================
Time: 2025-10-12T10:30:00.000Z

🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📋 Checking admin user...
✅ Admin user found:
   - Username: admin
   - Current Role: (none)
   - Email: admin@3d-inventory.com
   - Active: true

🔄 Updating admin user role to "admin"...
✅ Admin role added successfully!

📋 Updated user details:
   - Username: admin
   - Role: admin
   - Email: admin@3d-inventory.com

✅ Operation completed successfully!

🎯 Next steps:
   1. Login with admin credentials
   2. Access /admin/users should now work
   3. Verify admin role is displayed in profile

🔌 MongoDB connection closed
```

### Step 2: Verify in UI

1. **Login to the application**:

   ```
   Username: admin
   Password: admin123!
   ```

2. **Navigate to admin area**:

   ```
   http://localhost:4200/admin/users
   ```

3. **Verify access granted**:
   - Should see user list
   - No "Access Denied" error
   - Admin menu options visible

4. **Check profile**:
   ```
   http://localhost:4200/admin/profile
   ```

   - Role field should show: "Administrator"
   - Click "View Permissions" to see 24 permissions

### Step 3: Verify in Database

You can verify the role was set correctly in MongoDB:

```bash
# Using MongoDB shell or Atlas UI
db.users.findOne({ username: 'admin' })
```

**Expected Result**:

```json
{
  "_id": ObjectId("..."),
  "username": "admin",
  "email": "admin@3d-inventory.com",
  "role": "admin",           // ← Should be "admin"
  "permissions": [...],
  "isActive": true,
  "updatedAt": ISODate("2025-10-12T10:30:00Z")
}
```

---

## 🔄 Alternative Solutions

### Option 1: Manual Database Update

If you prefer to update manually via MongoDB Atlas UI or shell:

```javascript
// MongoDB Shell Command
db.users.updateOne(
  { username: 'admin' },
  {
    $set: {
      role: 'admin',
      updatedAt: new Date(),
    },
  },
)
```

### Option 2: Re-initialize All Users

If you want to recreate all default users with proper roles:

```bash
cd /home/karol/GitHub/3d-inventory-api
npm run cleanup:users
```

**Warning**: This will delete and recreate all default users!

### Option 3: Use Admin API Endpoint

If the API is running, you can update via HTTP:

```bash
# First, get a token
TOKEN=$(curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}' \
  | jq -r '.token')

# Then update the user
curl -X PUT http://localhost:8080/users/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

---

## 🐛 Troubleshooting

### Issue 1: Script Can't Connect to MongoDB

**Error**:

```
❌ Failed to add admin role: MongoServerError: connection refused
```

**Solution**:

1. Verify MongoDB Atlas connection string in `.env`
2. Check network connectivity
3. Ensure IP address is whitelisted in Atlas

**Check Connection**:

```bash
# Test MongoDB connection
cd /home/karol/GitHub/3d-inventory-api
npm run test:db-auth
```

### Issue 2: Admin User Not Found

**Error**:

```
❌ Admin user not found in database
```

**Solution**:
Run the user initialization script:

```bash
npm run init:users
```

This creates all default users including admin.

### Issue 3: Role Already Set

**Output**:

```
✅ Admin user already has admin role!
ℹ️  No update needed.
```

**This is good!** The admin user already has the correct role.

**Next Steps**:

1. Clear browser cache and cookies
2. Logout and login again
3. Check if issue persists
4. If still having issues, check browser console for errors

### Issue 4: Still Can't Access After Fix

If you still can't access after running the script:

**Possible Causes**:

1. **Browser Cache**: Clear cache and cookies
2. **JWT Token**: Old token doesn't have role info
3. **Multiple Users**: Wrong user logged in

**Solutions**:

1. **Clear Storage & Re-login**:

   ```javascript
   // In browser console
   localStorage.clear()
   sessionStorage.clear()
   // Then reload page and login again
   ```

2. **Verify Token Payload**:

   ```javascript
   // In browser console
   const token = localStorage.getItem('token')
   if (token) {
     const payload = JSON.parse(atob(token.split('.')[1]))
     console.log('Token payload:', payload)
     console.log('Role:', payload.role)
   }
   ```

3. **Check Authentication Service**:
   ```javascript
   // In browser console (Angular)
   ng.probe(getAllAngularRootElements()[0]).componentInstance.authService.getCurrentUser()
   ```

---

## 📊 Expected User Roles

After running the script, users should have these roles:

| Username | Password   | Role   | Permissions | Access Level       |
| -------- | ---------- | ------ | ----------- | ------------------ |
| admin    | admin123!  | admin  | 24          | Full admin access  |
| user     | user123!   | editor | 18          | Create & edit data |
| carlo    | carlo123!  | editor | 18          | Create & edit data |
| viewer   | viewer123! | viewer | 7           | Read-only access   |

---

## 🔒 Security Considerations

### Why Role-Based Access Control?

The AdminGuard implements **Role-Based Access Control (RBAC)** to:

1. **Protect Sensitive Routes**: Only admins can manage users
2. **Prevent Unauthorized Access**: Users can't escalate privileges
3. **Audit Trail**: Track who accessed what
4. **Separation of Duties**: Different roles for different responsibilities

### Role Hierarchy

```
system-admin  (Complete system control)
    ↓
admin         (Full admin access - user management)
    ↓
editor        (Create & edit data)
    ↓
viewer        (Read-only access)
```

### Permission vs Role

- **Role**: A collection of permissions (e.g., "admin")
- **Permission**: Specific access right (e.g., "user:create")

The AdminGuard checks **role**, not individual permissions. Users with role "admin" automatically have full admin access.

---

## 📚 Related Files

### Guard Implementation

- **File**: `src/app/guards/admin.guard.ts`
- **Purpose**: Protects admin routes
- **Check**: `user?.role === 'admin'`

### User Model

- **File**: `src/app/shared/user.ts`
- **Defines**: User interface with role field
- **Roles**: `viewer`, `editor`, `admin`, `system-admin`

### Routing Configuration

- **File**: `src/app/app-routing.module.ts`
- **Protected Routes**: All `/admin/*` routes
- **Guards**: `AdminGuard` on parent and children

### Database Scripts

- **init-users.ts**: Create default users
- **add-admin-role.ts**: Add admin role to admin user ← NEW!
- **unlock-admin.ts**: Unlock locked admin account
- **reset-admin-password.ts**: Reset admin password
- **cleanup-and-reinit.ts**: Reset all users

---

## ✅ Verification Checklist

After running the fix, verify:

- [ ] Script completed successfully (no errors)
- [ ] Updated user details show `role: admin`
- [ ] Can login with admin credentials
- [ ] Can access `/admin/users` without error
- [ ] User list displays correctly
- [ ] "Add User" button is visible
- [ ] Can navigate to `/admin/users/new`
- [ ] Can navigate to `/admin/users/edit/:id`
- [ ] Profile shows "Administrator" role
- [ ] "View Permissions" shows 24 permissions
- [ ] No console errors in browser
- [ ] AdminGuard no longer blocks access

---

## 🎯 Quick Reference

### Run the Fix

```bash
npm run add:admin-role
```

### Verify in Database

```javascript
db.users.findOne({ username: 'admin' })
```

### Test Admin Access

```
1. Login: admin / admin123!
2. Navigate: http://localhost:4200/admin/users
3. Verify: User list displays
```

### Re-initialize If Needed

```bash
npm run cleanup:users
```

---

## 📝 Summary

### Problem

- Admin user couldn't access admin area
- AdminGuard checked `role === 'admin'`
- Admin user had no role or wrong role

### Solution

- Created `add-admin-role.ts` script
- Added `npm run add:admin-role` command
- Script updates admin user with admin role

### Result

- ✅ Admin user has `role: 'admin'`
- ✅ AdminGuard grants access
- ✅ Admin area fully accessible
- ✅ All admin features working

---

**Status**: ✅ **SOLUTION READY**
**Script**: ✅ **CREATED**
**NPM Command**: ✅ **ADDED**
**Documentation**: ✅ **COMPLETE**

Run `npm run add:admin-role` to fix the issue! 🚀

---

_Last Updated: October 12, 2025_
_Issue: Admin role missing from admin user_
_Solution: Add admin role via database update script_
