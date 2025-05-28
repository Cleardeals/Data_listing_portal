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

export async function GET() {
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
  try {
    const userData = await request.json();
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password || 'tempPassword123!',
      user_metadata: {
        name: userData.name,
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
