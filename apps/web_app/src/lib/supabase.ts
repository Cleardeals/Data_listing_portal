import { createClient } from '@supabase/supabase-js';

// Supabase configuration for web_app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create and export the Supabase client with auth options
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
    },
    // Add better reconnection handling
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000),
    logger: undefined, // Disable realtime logging to reduce noise
    // Add timeout for connections
    timeout: 20000
  },
  // Add better error handling
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

// Create admin client for user management operations (server-side only)
export const supabaseAdmin = typeof window === 'undefined' && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

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
