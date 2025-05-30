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

export async function GET(request: NextRequest) {
  // Enforce DAL-based access control
  const accessCheck = await verifyAccess(request);
  if (!accessCheck.authorized) {
    return NextResponse.json(
      { error: accessCheck.error },
      { status: 403 }
    );
  }

  try {
    // Fetch external users (non-super admins)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;

    const externalUsers = data.users
      .filter(user => user.app_metadata?.is_super_admin !== true && !user.app_metadata?.deleted_at)
      .map(user => ({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
        email: user.email || '',
        role: user.user_metadata?.role || 'Unverified Customer',
        group: user.user_metadata?.group || 'customers',
        is_verified: user.user_metadata?.is_verified || false,
        business: user.user_metadata?.business || '',
        contact: user.user_metadata?.contact || user.phone || '',
        subscription: user.user_metadata?.subscription || 'Free',
        created_at: user.created_at
      }));

    return NextResponse.json(externalUsers);
  } catch (error) {
    console.error('Error fetching external users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Enforce DAL-based access control
  const accessCheck = await verifyAccess(request);
  if (!accessCheck.authorized) {
    return NextResponse.json(
      { error: accessCheck.error },
      { status: 403 }
    );
  }

  try {
    const userData = await request.json();
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password || 'tempPassword123!',
      user_metadata: {
        name: userData.name,
        role: 'Unverified Customer',
        group: 'customers',
        is_verified: false,
        business: userData.business,
        contact: userData.contact,
        subscription: userData.subscription,
      },
      app_metadata: {
        is_super_admin: false,
      }
    });

    if (authError) throw authError;

    const newUser = {
      id: authData.user.id,
      name: userData.name,
      email: userData.email,
      role: 'Unverified Customer',
      group: 'customers',
      is_verified: false,
      business: userData.business,
      contact: userData.contact,
      subscription: userData.subscription,
      created_at: authData.user.created_at
    };

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error adding external user:', error);
    return NextResponse.json(
      { error: 'Failed to add external user' },
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
    
    // Update user metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: userData.email,
      user_metadata: {
        name: userData.name,
        business: userData.business,
        contact: userData.contact,
        subscription: userData.subscription,
      }
    });

    if (error) throw error;

    const updatedUser = {
      id: data.user.id,
      name: userData.name,
      email: userData.email,
      business: userData.business,
      contact: userData.contact,
      subscription: userData.subscription,
      created_at: data.user.created_at
    };

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating external user:', error);
    return NextResponse.json(
      { error: 'Failed to update external user' },
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

    // Soft delete by setting deleted_at timestamp
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: {
        deleted_at: new Date().toISOString()
      }
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting external user:', error);
    return NextResponse.json(
      { error: 'Failed to delete external user' },
      { status: 500 }
    );
  }
}
