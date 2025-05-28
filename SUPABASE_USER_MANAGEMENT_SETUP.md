# Supabase Configuration for User Management

To make the user management system work with Supabase, you need to configure the following:

## 1. Supabase Dashboard Configuration

### Row Level Security (RLS) Policies

You need to create policies for the `auth.users` table access:

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication > Policies**
3. **Create the following policies:**

#### Policy for Super Admin Access to Users Table
```sql
-- Enable RLS on auth.users (if not already enabled)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow super admins to read all users
CREATE POLICY "Super admins can view all users" ON auth.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.raw_app_meta_data->>'is_super_admin' = 'true'
    )
  );

-- Policy to allow super admins to update all users
CREATE POLICY "Super admins can update all users" ON auth.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users admin_user 
      WHERE admin_user.id = auth.uid() 
      AND admin_user.raw_app_meta_data->>'is_super_admin' = 'true'
    )
  );
```

## 2. Environment Variables

Ensure your `.env` file has the service role key for admin operations:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Admin Client Configuration

The admin functions in `supabaseUsers.ts` use `supabase.auth.admin.*` which requires the service role key. Make sure you have proper authentication context.

## 4. Database Schema Adjustments

If you want to add custom fields like `name`, `business`, `contact`, etc., you can either:

### Option A: Use metadata fields (Current Implementation)
- Store in `raw_user_meta_data` JSON field
- No schema changes required

### Option B: Create a separate profiles table
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  business TEXT,
  contact TEXT,
  role TEXT,
  subscription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_app_meta_data->>'is_super_admin' = 'true'
    )
  );
```

## 5. Required Supabase Functions

If you choose Option B (profiles table), you might want to create a trigger to automatically create profiles:

```sql
-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 6. Testing the Setup

After configuration:

1. Create a super admin user manually in Supabase dashboard
2. Set `raw_app_meta_data` to `{"is_super_admin": true}`
3. Test the user management functions

## 7. Security Considerations

- Never expose service role key in client-side code
- Use server-side API routes for admin operations if needed
- Consider implementing audit logs for user management actions
- Regularly review and update RLS policies

## Troubleshooting

If you encounter issues:

1. Check browser console for authentication errors
2. Verify RLS policies in Supabase dashboard
3. Ensure proper environment variables are set
4. Check that the current user has super admin privileges
