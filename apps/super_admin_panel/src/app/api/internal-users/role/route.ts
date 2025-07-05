import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';

const supabaseAdmin = getSupabaseAdmin();

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

    // Only super_admin can manage internal user roles
    if (userRole !== 'super_admin') {
      return { authorized: false, error: 'Access denied: Only super admins can update internal user roles' };
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
    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Validate role - must be super_admin or data_operator
    if (!['super_admin', 'data_operator'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "super_admin" or "data_operator"' },
        { status: 400 }
      );
    }

    // Get current user metadata
    const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError) throw fetchError;

    // Update user metadata with new role
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        role: role,
        group: 'internalusers' // Ensure group is always set
      },
      app_metadata: {
        ...userData.user.app_metadata,
        // Optional: Keep is_super_admin for backward compatibility
        is_super_admin: role === 'super_admin'
      }
    });

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
