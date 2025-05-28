// Example usage of centralized Supabase configuration
// This shows how to import and use the centralized Supabase client and components

// Import the Supabase client
import { supabase } from '../../../packages/shared/supabase';

// Import the test component
import { SupabaseTestComponent } from '../../../packages/shared/supabase';

// Import the test connection helper
import { testConnection } from '../../../packages/shared/supabase';

// Example function using the centralized Supabase client
export async function fetchUserData() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
    
  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
  
  return data;
}

// Example component that uses the centralized configuration
export function MyComponent() {
  return (
    <div>
      <h1>My App</h1>
      <SupabaseTestComponent />
    </div>
  );
}
