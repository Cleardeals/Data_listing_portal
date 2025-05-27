import { createClient } from '@supabase/supabase-js';

// Centralized Supabase configuration for the entire monorepo
// Environment variables are loaded from the global .env file at the root level
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
    persistSession: false, // Disable automatic session persistence to prevent magic link auto-login
    detectSessionInUrl: false, // Disable automatic session detection from URL to prevent magic link issues
    flowType: 'pkce'
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

// Export components
export { default as SupabaseTestComponent } from './components/SupabaseTestComponent';

// Helper function to test connection (optional)
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('strings').select('count').single();
    if (error) throw error;
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (error) {
    return { success: false, message: `Connection failed: ${error}` };
  }
};
