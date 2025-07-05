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
    const { userId, action } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    // First, get the current user data to preserve existing metadata
    const { data: currentUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError) throw fetchError;

    let updateData;
    
    if (action === 'verify') {
      updateData = {
        user_metadata: {
          ...currentUser.user.user_metadata,
          role: 'Verified Customer',
          group: 'customers',
          is_verified: true
        }
      };
    } else if (action === 'unverify') {
      updateData = {
        user_metadata: {
          ...currentUser.user.user_metadata,
          role: 'Unverified Customer', 
          group: 'customers',
          is_verified: false
        }
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "verify" or "unverify"' },
        { status: 400 }
      );
    }

    // Update user verification status
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);

    if (error) throw error;

    const updatedUser = {
      id: data.user.id,
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Unknown',
      email: data.user.email || '',
      role: data.user.user_metadata?.role || 'Unverified Customer',
      group: data.user.user_metadata?.group || 'customers',
      is_verified: data.user.user_metadata?.is_verified || false,
      business: data.user.user_metadata?.business || '',
      contact: data.user.user_metadata?.contact || data.user.phone || '',
      subscription: data.user.user_metadata?.subscription || 'Free',
      created_at: data.user.created_at
    };

    return NextResponse.json({
      message: `User ${action === 'verify' ? 'verified' : 'unverified'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user verification:', error);
    return NextResponse.json(
      { error: 'Failed to update user verification status' },
      { status: 500 }
    );
  }
}
