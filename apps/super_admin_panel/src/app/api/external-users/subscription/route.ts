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
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        subscription: subscription
      }
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update user subscription' },
      { status: 500 }
    );
  }
}
