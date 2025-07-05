import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';

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

    // Only super_admin can manage internal users
    if (userRole !== 'super_admin') {
      return { authorized: false, error: 'Access denied: Only super admins can manage internal users' };
    }

    return { authorized: true, user: { id: user.id, email: user.email, role: userRole, group: userGroup } };
  } catch (error) {
    console.error('JWT verification error:', error);
    return { authorized: false, error: 'Invalid or expired token' };
  }
}

export async function GET(request: NextRequest) {
  // Enforce DAL-based access control - only super_admin can view internal users
  const accessCheck = await verifyAccess(request);
  if (!accessCheck.authorized) {
    return NextResponse.json(
      { error: accessCheck.error },
      { status: 403 }
    );
  }

  try {
    // Fetch internal users (users with group "internalusers")
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;

    const internalUsers = data.users
      .filter(user => {
        const userGroup = user.user_metadata?.group;
        
        // Filter for ALL internal users (group: "internalusers") regardless of role or deleted status
        // Include users with no group set if they have internal roles
        const isInternalGroup = userGroup === 'internalusers';
        const hasInternalRole = ['super_admin', 'data_operator'].includes(user.user_metadata?.role);
        
        return isInternalGroup || hasInternalRole;
      })
      .map(user => ({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
        email: user.email || '',
        role: user.user_metadata?.role || 'data_operator',
        contact: user.user_metadata?.contact || user.phone || '',
        created_at: user.created_at,
        group: user.user_metadata?.group || 'internalusers',
        is_verified: user.user_metadata?.is_verified ?? true
        // Note: Ignoring deleted_at field - treating previously soft-deleted users as normal users
      }));

    return NextResponse.json(internalUsers);
  } catch (error) {
    console.error('Error fetching internal users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internal users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Enforce DAL-based access control - only super_admin can create internal users
  const accessCheck = await verifyAccess(request);
  if (!accessCheck.authorized) {
    return NextResponse.json(
      { error: accessCheck.error },
      { status: 403 }
    );
  }

  try {
    const userData = await request.json();
    
    // Validate role - must be super_admin or data_operator
    if (!userData.role || !['super_admin', 'data_operator'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Role must be either "super_admin" or "data_operator"' },
        { status: 400 }
      );
    }
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password || 'tempPassword123!',
      user_metadata: {
        name: userData.name,
        role: userData.role,
        contact: userData.contact,
        group: 'internalusers',
        is_verified: userData.is_verified ?? true,
        email_verified: userData.is_verified ?? true
      },
      app_metadata: {
        // Optional: Keep is_super_admin for backward compatibility
        is_super_admin: userData.role === 'super_admin'
      }
    });

    if (authError) throw authError;

    const newUser = {
      id: authData.user.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      contact: userData.contact,
      created_at: authData.user.created_at,
      group: 'internalusers',
      is_verified: userData.is_verified ?? true
    };

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error adding internal user:', error);
    return NextResponse.json(
      { error: 'Failed to add internal user' },
      { status: 500 }
    );
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
    const { userId, userData } = await request.json();
    
    // Validate role - must be super_admin or data_operator
    if (!userData.role || !['super_admin', 'data_operator'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Role must be either "super_admin" or "data_operator"' },
        { status: 400 }
      );
    }
    
    // Get current user metadata
    const { data: currentUserData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError) throw fetchError;
    
    // Update user metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: userData.email,
      user_metadata: {
        ...currentUserData.user.user_metadata,
        name: userData.name,
        role: userData.role,
        contact: userData.contact,
        group: 'internalusers',
        is_verified: userData.is_verified ?? true,
        email_verified: userData.is_verified ?? true
      },
      app_metadata: {
        ...currentUserData.user.app_metadata,
        // Optional: Keep is_super_admin for backward compatibility
        is_super_admin: userData.role === 'super_admin'
      }
    });

    if (error) throw error;

    const updatedUser = {
      id: data.user.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      contact: userData.contact,
      created_at: data.user.created_at,
      group: 'internalusers',
      is_verified: userData.is_verified ?? true
    };

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating internal user:', error);
    return NextResponse.json(
      { error: 'Failed to update internal user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Enforce DAL-based access control
  const accessCheck = await verifyAccess(request);
  if (!accessCheck.authorized) {
    return NextResponse.json(
      { error: accessCheck.error },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Permanently delete the user from Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting internal user:', error);
    return NextResponse.json(
      { error: 'Failed to delete internal user' },
      { status: 500 }
    );
  }
}
