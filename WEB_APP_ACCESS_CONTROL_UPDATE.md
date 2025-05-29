# Web App Access Control Update

## Overview
Updated the web app's access control to allow internal users with admin roles (super_admin and data_operator) to access the web application alongside regular customers.

## Changes Made

### 1. Updated ProtectedRoute Component
**File**: `/apps/web_app/src/components/ProtectedRoute.tsx`

**Before**: Blocked ALL internal users from accessing the web app
**After**: Allows internal users with `super_admin` or `data_operator` roles

#### New Access Logic:
```typescript
// Allow internal users with admin roles (super_admin or data_operator) to access web app
if (user?.group === 'internalusers') {
  // Allow super_admin and data_operator roles from internalusers group
  if (user?.role !== 'super_admin' && user?.role !== 'data_operator') {
    console.warn('Access denied: Internal users must have super_admin or data_operator role to access web app')
    router.push('/access-denied')
    return
  }
  // Internal users with proper roles can continue
} else if (user?.group === 'customers') {
  // Customers can access (existing logic)
} else {
  // Block any other groups
  console.warn('Access denied: Only customer group or internal admin users can access web app')
  router.push('/access-denied')
  return
}
```

### 2. Updated Access Denied Page
**File**: `/apps/web_app/src/app/access-denied/page.tsx`

**Change**: Made the error message more generic since it now applies to both customers and internal users who don't meet the requirements.

## Access Control Matrix (Updated)

| User Group | User Role | Web App Access | Data Operator Panel | Super Admin Panel |
|------------|-----------|----------------|-------------------|------------------|
| `internalusers` | `super_admin` | ✅ **Full Access** | ✅ Full Access | ✅ Full Access |
| `internalusers` | `data_operator` | ✅ **Full Access** | ✅ Full Access | ✅ Limited Access |
| `internalusers` | `other_role` | ❌ **Access Denied** | ❌ Access Denied | ❌ Access Denied |
| `customers` | `Verified Customer` | ✅ Full Access | ❌ Blocked | ❌ Blocked |
| `customers` | `Unverified Customer` | ✅ Limited Access | ❌ Blocked | ❌ Blocked |
| `other_group` | `any_role` | ❌ Access Denied | ❌ Blocked | ❌ Blocked |

## User Experience Flow

### For Internal Admin Users (super_admin/data_operator):
1. **Login**: Can use any of the three applications
2. **Web App**: Full access to customer portal features
3. **Data Operator Panel**: Access based on role
4. **Super Admin Panel**: Access based on role
5. **Cross-Navigation**: Can seamlessly move between applications

### For Customer Users:
1. **Login**: Only through web app
2. **Web App**: Access based on verification status
3. **Admin Panels**: Blocked with phishing protection page

### For Invalid Internal Users:
1. **Login**: Can authenticate
2. **Web App**: Redirected to access denied page
3. **Admin Panels**: Redirected to access denied/phishing protection

## Benefits of This Change

1. **Unified Experience**: Admin users can now access customer-facing features
2. **Comprehensive Testing**: Admins can test the full customer experience
3. **Operational Efficiency**: Single login for all system components
4. **Maintained Security**: Still validates roles and groups appropriately
5. **Flexible Administration**: Admins can handle customer issues directly

## Security Considerations

### Maintained Security Features:
- ✅ Role-based access control still enforced
- ✅ Group validation still active
- ✅ Proper redirect logic for unauthorized access
- ✅ Console logging for access violations
- ✅ Session management unchanged

### New Security Features:
- ✅ Granular role checking for internal users
- ✅ Clear error messages for different violation types
- ✅ Prevents privilege escalation (customers can't access admin panels)

## Testing Scenarios

### Test Case 1: Super Admin User
```json
{
  "email": "admin@company.com",
  "user_metadata": {
    "group": "internalusers",
    "role": "super_admin",
    "name": "John Admin",
    "is_verified": true
  }
}
```
**Expected Result**: Can access Web App, Data Operator Panel, and Super Admin Panel

### Test Case 2: Data Operator User
```json
{
  "email": "operator@company.com", 
  "user_metadata": {
    "group": "internalusers",
    "role": "data_operator",
    "name": "Jane Operator",
    "is_verified": true
  }
}
```
**Expected Result**: Can access Web App and Data Operator Panel, limited access to Super Admin Panel

### Test Case 3: Invalid Internal User
```json
{
  "email": "internal@company.com",
  "user_metadata": {
    "group": "internalusers", 
    "role": "intern",
    "name": "Bob Intern"
  }
}
```
**Expected Result**: Access denied to all admin panels and web app

### Test Case 4: Customer User
```json
{
  "email": "customer@example.com",
  "user_metadata": {
    "group": "customers",
    "role": "Verified Customer",
    "is_verified": true
  }
}
```
**Expected Result**: Can access Web App, blocked from admin panels

## Implementation Notes

1. **Backward Compatibility**: All existing customer access patterns remain unchanged
2. **No Breaking Changes**: Existing customers will not be affected
3. **Gradual Rollout**: Can be tested with specific internal users first
4. **Monitoring**: Console logs help track access patterns and violations

This update provides a more flexible and comprehensive access control system while maintaining security boundaries between different user types and roles.
