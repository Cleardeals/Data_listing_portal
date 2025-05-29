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

export async function PUT(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    let updateData;
    
    if (action === 'verify') {
      updateData = {
        user_metadata: {
          role: 'Verified Customer',
          group: 'customers',
          is_verified: true
        }
      };
    } else if (action === 'unverify') {
      updateData = {
        user_metadata: {
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
