import { createClient } from '@supabase/supabase-js';

// Supabase configuration for super_admin_panel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create and export the Supabase client with auth options and real-time enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true, // Enable session persistence to maintain session on refresh
    detectSessionInUrl: false, // Disable automatic session detection from URL to prevent magic link issues
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Create admin client for user management operations (server-side only)
// For server-side routes, we ensure the service role key is available
if (!supabaseServiceRoleKey && typeof window === 'undefined') {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for server-side operations');
}

export const supabaseAdmin = typeof window === 'undefined' && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper function to get admin client with error handling
export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available. This function should only be called server-side.');
  }
  return supabaseAdmin;
};

// Helper function to test connection (optional)
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('strings').select('count').single();
    if (error) throw error;
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (error) {
    return { success: false, message: `Connection failed: ${error}` };
  }
};
