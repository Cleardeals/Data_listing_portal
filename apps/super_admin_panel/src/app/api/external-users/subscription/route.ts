import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyAccess(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    
    // Verify the Supabase JWT token and get user data
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return { authorized: false, error: 'Invalid or expired token' };
    }

    // Get user metadata from Supabase user record
    const userGroup = user.user_metadata?.group || 'customer';
    const userRole = user.user_metadata?.role || 'customer';
    
    // Check if user belongs to "internalusers" group
    if (userGroup !== 'internalusers') {
      return { authorized: false, error: 'Access denied: Only internal users can access this endpoint' };
    }

    // Check if user has appropriate role (super_admin or data_operator)
    const allowedRoles = ['super_admin', 'data_operator'];
    if (!allowedRoles.includes(userRole)) {
      return { authorized: false, error: 'Access denied: Insufficient role permissions' };
    }

    return { authorized: true, user: { id: user.id, email: user.email, role: userRole, group: userGroup } };
  } catch (error) {
    console.error('JWT verification error:', error);
    return { authorized: false, error: 'Invalid or expired token' };
  }
}

export async function PUT(request: NextRequest) {
  // Enforce DAL-based access control
  const accessCheck = await verifyAccess(request);
  if (!accessCheck.authorized) {
    return NextResponse.json(
      { error: accessCheck.error },
      { status: 403 }
    );
  }
  try {
    const { userId, subscription } = await request.json();
    
    if (!userId || !subscription) {
      return NextResponse.json(
        { error: 'User ID and subscription are required' },
        { status: 400 }
      );
    }

    // Get current user metadata
    const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError) throw fetchError;

    // Update user metadata with new subscription
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        subscription: subscription
      }
    });

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update user subscription' },
      { status: 500 }
    );
  }
}
