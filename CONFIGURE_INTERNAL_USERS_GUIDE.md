# 🔧 Configure Internal Users via Supabase Dashboard

##### For Data Operator (Limited Admin Access)
```json
{
  "name": "Jane Smith", 
  "group": "internalusers",
  "role": "data_operator",
  "contact": "+1-555-0456",
  "is_verified": true,
  "email_verified": true
}
``` Make User Accounts Accessible as Internal Users

Based on your current implementation, here's exactly how to configure user accounts to access the Super Admin Panel and Data Operator Panel through the Supabase dashboard.

## 🎯 Required User Metadata Configuration

Your access control system checks for these specific metadata fields:

### For Super Admin Panel Access:
- **Group**: `internalusers` (required)
- **Role**: `super_admin` (full access) OR `data_operator` (limited access)

### For Data Operator Panel Access:
- **Group**: `internalusers` (required) 
- **Role**: `data_operator` (sufficient) OR `super_admin` (also works)

## 🔐 Step-by-Step Configuration in Supabase Dashboard

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: `wcxoyoqipxrwlqcryzeo` (or your project name)

### Step 2: Navigate to Authentication
1. In the left sidebar, click **"Authentication"**
2. Click **"Users"** tab
3. Find the user you want to make an internal user

### Step 3: Edit User Metadata

#### Option A: Edit Existing User
1. Click on the user's email/row in the users table
2. Scroll down to **"Raw User Meta Data"** section
3. Click **"Edit"** button
4. Replace the existing JSON with one of the configurations below

#### Option B: Create New Internal User
1. Click **"Add user"** button
2. Fill in email and password
3. In the **"Raw User Meta Data"** field, add the JSON configuration

## 📝 JSON Configuration Templates

### For Super Admin User (Full Access)
```json
{
  "name": "John Doe",
  "group": "internalusers",
  "role": "super_admin",
  "contact": "+1-555-0123",
  "is_verified": true,
  "email_verified": true
}
}
```

### For Data Operator User (Limited Access)
```json
{
  "name": "Jane Smith", 
  "group": "internalusers",
  "role": "data_operator",
  "contact": "+1-555-0456",
  "is_verified": true,
  "email_verified": true
}
```

### For Customer User (No Admin Access)
```json
{
  "name": "Customer Name",
  "group": "customers", 
  "role": "Verified Customer",
  "business": "Acme Corp",
  "contact": "+1-555-0789",
  "subscription": "Premium",
  "is_verified": true
}
```

## 🔑 Required vs Optional Fields

### **REQUIRED** for Internal Access:
- `"group": "internalusers"` - **CRITICAL** - Must be exactly this value
- `"role": "super_admin"` OR `"role": "data_operator"` - **CRITICAL** - Determines access level

### **Optional** but Recommended:
- `"name": "Display Name"` - Shows in UI instead of email prefix
- `"contact": "Phone/Contact"` - Used for contact information
- `"is_verified": true` - General verification status

### **Not Used** for Admin Access:
- `"business"` - Only used for customer profiles
- `"subscription"` - Only relevant for customers

## 🛡️ Access Control Matrix

| Group | Role | Super Admin Panel | Data Operator Panel | Web App |
|-------|------|------------------|-------------------|---------|
| `internalusers` | `super_admin` | ✅ Full Access | ✅ Full Access | ✅ Access |
| `internalusers` | `data_operator` | ✅ Limited Access | ✅ Full Access | ✅ Access |
| `customers` | `Verified Customer` | ❌ Blocked | ❌ Blocked | ✅ Access |
| `customers` | `Unverified Customer` | ❌ Blocked | ❌ Blocked | ✅ Limited Access |

## 🔍 Verification Steps

### Step 1: Check User Configuration
After updating the metadata, verify the configuration:

1. In Supabase Dashboard → Authentication → Users
2. Click on the updated user
3. Confirm **"Raw User Meta Data"** shows:
   ```json
   {
     "group": "internalusers",
     "role": "super_admin" // or "data_operator"
   }
   ```

### Step 2: Test Access
1. Have the user log out of any existing sessions
2. User should log in again using their email/OTP
3. They should now have access to:
   - Super Admin Panel: `http://localhost:3001` (if super_admin)
   - Data Operator Panel: `http://localhost:3000` (if data_operator or super_admin)

## ⚠️ Common Issues & Solutions

### Issue 1: User Still Getting "Access Denied"
**Cause**: Old session data cached in browser
**Solution**: 
- Clear browser localStorage/cookies
- Or use incognito/private browser window
- Or log out and log back in

### Issue 2: Metadata Not Taking Effect
**Cause**: User needs to refresh their authentication session
**Solution**:
- User must log out completely
- Log back in with OTP
- New metadata will be loaded into session

### Issue 3: Typos in Metadata
**Common Mistakes**:
- `"group": "internal_users"` ❌ (should be `"internalusers"`)
- `"role": "admin"` ❌ (should be `"super_admin"`)
- `"group": "Internalusers"` ❌ (case-sensitive, should be lowercase)

## 🚀 Quick Setup Commands

If you prefer SQL commands, you can also update users directly:

### Make User Super Admin
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{group}', 
  '"internalusers"'
) || jsonb_set(
  raw_user_meta_data, 
  '{role}', 
  '"super_admin"'
)
WHERE email = 'user@example.com';
```

### Make User Data Operator
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{group}', 
  '"internalusers"'
) || jsonb_set(
  raw_user_meta_data, 
  '{role}', 
  '"data_operator"'
)
WHERE email = 'user@example.com';
```

## 📋 Complete Example Workflow

1. **Create New Internal User**:
   - Supabase Dashboard → Authentication → Users → Add user
   - Email: `admin@company.com`
   - Password: `SecurePassword123!`
   - Raw User Meta Data:
     ```json
     {
       "name": "Admin User",
       "group": "internalusers", 
       "role": "super_admin",
       "contact": "+1-555-0100",
       "is_verified": true
     }
     ```

2. **User Login Process**:
   - User goes to `http://localhost:3001` (Super Admin Panel)
   - Enters email: `admin@company.com`
   - Receives OTP email
   - Enters OTP code
   - Successfully accesses Super Admin Panel

3. **Verify Access**:
   - User can see dashboard with user management
   - User can add/edit/delete other users
   - User can access all admin features

This configuration will give the user full access to both admin panels based on their role permissions!
