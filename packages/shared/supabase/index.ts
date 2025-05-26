import { createClient } from '@supabase/supabase-js';

// Centralized Supabase configuration for the entire monorepo
// Environment variables are loaded from the global .env file at the root level
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
