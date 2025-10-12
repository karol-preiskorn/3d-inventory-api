# README Updates - Device Change Tracking Feature

**Date**: October 12, 2025
**Deployment**:

- Backend: `d-inventory-api-00108-pr2`
- Frontend: `d-inventory-ui-00110-q8s`

## 📋 Summary of Changes

Updated both README.md files to document the new comprehensive device change tracking and activity logging features implemented in this release.

## 🔄 API README Updates (`/home/karol/GitHub/3d-inventory-api/README.md`)

### 1. Enhanced Monitoring & Logging Section

Added detailed descriptions of the new logging capabilities:

- **Activity Audit Logs**: Complete audit trail for all CRUD operations with user context
- **Login Event Tracking**: Detailed login audit logs including IP addresses, timestamps, and authentication outcomes
- **Change Tracking**: Before/after value tracking for device updates showing exactly what changed
- **User Activity Monitoring**: Track user actions across all system components with detailed metadata

### 2. New Logs Collection Schema

Added comprehensive documentation of the Logs collection data model including:

```javascript
{
  _id: ObjectId,
  date: String,
  objectId: String,
  operation: String (create|update|delete|clone|authentication),
  component: String (device|model|floor|user|connection|etc),
  message: {
    // Change tracking structure
    deviceId: String,
    deviceName: String,
    changes: {
      [fieldName]: {
        before: Any,
        after: Any
      }
    },
    updatedFields: [String],
    changeCount: Number,
    // Login event structure
    ip: String,
    userAgent: String,
    success: Boolean,
    username: String
  },
  userId: String,
  username: String,
  level: String (info|warn|error)
}
```

### 3. New API Endpoints Documentation

Added login log endpoints to the Inventory Management section:

- `GET /logs/login/username/:username` - Get login logs by username
- `GET /logs/login/user/:userId` - Get login logs by user ID

### 4. Change Tracking Features Documentation

Documented key capabilities:

- **Before/After Values**: Captures original and new values for all modified fields
- **Field-Level Tracking**: Identifies exactly which fields changed (name, modelId, position, attributes)
- **Position Tracking**: Records coordinate changes with full x, y, h values
- **Attribute Comparison**: Deep comparison of attribute arrays
- **User Context**: Tracks who made the change with userId and username
- **Login Auditing**: Complete audit trail of authentication events with IP addresses

## 🎨 UI README Updates (`/home/karol/GitHub/3d-inventory-ui/README.md`)

### 1. New Key Features Section

Added comprehensive feature documentation organized by category:

#### 🎯 Inventory Management

- 3D Visualization
- Device Management
- Model Management
- Connection Tracking
- Attribute System

#### 🔐 User Management

- Role-Based Access
- User Profiles
- Authentication
- Account Security

#### 📊 Activity Monitoring & Audit Logs

- **Activity Logs Dashboard** (Admin only):
  - Filter by component (device, model, floor, user, connection, etc.)
  - Filter by operation type (create, update, delete, clone)
  - Filter by date range
  - Search by username or object details

- **Change Tracking**:
  - Field-level change detection (name, position, attributes, etc.)
  - Visual before → after display for modified values
  - Smart formatting for different data types (coordinates, arrays, objects)

- **Login History**:
  - View login attempts with success/failure status
  - IP address and timestamp tracking
  - Color-coded status indicators (success/failed/error)
  - Available in user profile and admin user management

### 2. Deployment Information

Added current deployment details:

- Production URL: https://d-inventory-ui-wzwe3odv7q-ew.a.run.app
- Current Revision: d-inventory-ui-00110-q8s
- Backend API: https://d-inventory-api-wzwe3odv7q-ew.a.run.app
- Backend Revision: d-inventory-api-00108-pr2

### 3. Latest Features

Documented features released on October 12, 2025:

- ✅ Device change tracking with before/after values
- ✅ Activity Logs dashboard for administrators
- ✅ Login history tracking with IP addresses
- ✅ Enhanced audit trail for all CRUD operations
- ✅ Smart value formatting in activity logs

## 🎯 Key User-Facing Improvements

### For Administrators

1. **Complete Audit Trail**: New Activity Logs dashboard provides comprehensive view of all system activity
2. **Change History**: See exactly what changed in device updates with before/after values
3. **Login Monitoring**: Track authentication events with IP addresses and timestamps
4. **Advanced Filtering**: Filter logs by component, operation, date range, and username

### For All Users

1. **Personal Login History**: View your own login attempts in your profile
2. **Transparent Changes**: See detailed change information when devices are updated
3. **Enhanced Security**: IP tracking and login attempt monitoring improve account security

## 📊 Example Use Cases

### Device Change Tracking

When a device is updated, the system now logs:

```
Summary: "Router-01: Updated 3 fields: name, position, modelId"

Details:
- Name Changed: "Old Router" → "Router-01"
- Position Changed: (10, 20, 0) → (15, 25, 1)
- Model Id Changed: "abc123" → "xyz789"
```

### Login Event Tracking

Every login attempt is logged with:

```
- Username: admin
- IP Address: 192.168.1.100
- Status: Success ✅
- Timestamp: 2025-10-12 14:30:45
- User Agent: Mozilla/5.0...
```

## 🔧 Technical Implementation

### Backend Changes

- Modified `src/controllers/devices.ts`:
  - `updateDevice()`: Tracks name, modelId, position, attributes changes
  - `updateDevicePosition()`: Tracks position coordinate changes
- Both functions now capture before/after values for all modifications

### Frontend Changes

- Enhanced `src/app/components/admin/activity-logs.component.ts`:
  - `extractChangeDetails()`: Parses change objects
  - `formatChangeValue()`: Smart formatting for different value types
  - `getLogSummary()`: Enhanced summary showing field names
- Visual improvements with before → after arrows for changed values

## 📚 Documentation Quality

Both README files now provide:

- ✅ Clear feature descriptions
- ✅ Technical implementation details
- ✅ Data model documentation
- ✅ API endpoint listings
- ✅ Current deployment information
- ✅ User-facing capabilities
- ✅ Example use cases

## 🚀 Next Steps

Users and developers can now:

1. Reference comprehensive feature documentation
2. Understand the complete audit logging capabilities
3. See current deployment versions and URLs
4. Learn about change tracking implementation
5. Access detailed API endpoint documentation

---

**Files Updated**:

- `/home/karol/GitHub/3d-inventory-api/README.md`
- `/home/karol/GitHub/3d-inventory-ui/README.md`

**Related Deployments**:

- Backend API: https://d-inventory-api-wzwe3odv7q-ew.a.run.app (revision 00108-pr2)
- Frontend UI: https://d-inventory-ui-wzwe3odv7q-ew.a.run.app (revision 00110-q8s)
