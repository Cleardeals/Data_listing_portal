// Example usage of individual project Supabase configuration
// Each project now has its own Supabase client configuration

// Import the Supabase client from within each project
import { supabase } from '../lib/supabase';

// Import the test connection helper from within each project
import { testConnection } from '../lib/supabase';

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
      {/* Component removed - using centralized Supabase client */}
    </div>
  );
}
