// Types and API functions for Supabase user management

// Utility function to get auth headers
const getAuthHeaders = () => {
  const session = localStorage.getItem('super_admin_auth_session');
  if (!session) {
    throw new Error('No authentication session found');
  }
  
  try {
    const parsedSession = JSON.parse(session);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${parsedSession.access_token}`
    };
  } catch (error) {
    console.error('Error parsing authentication session:', error);
    throw new Error('Invalid authentication session');
  }
};

// Define types for metadata objects
export interface UserMetadata {
  name?: string;
  role?: string;
  contact?: string;
  business?: string;
  subscription?: string;
  [key: string]: unknown;
}

export interface AppMetadata {
  is_super_admin?: boolean;
  deleted_at?: string;
  [key: string]: unknown;
}

// Define types based on Supabase auth.users table structure
export interface SupabaseUser {
  id: string;
  email: string | null;
  role: string | null;
  raw_user_meta_data: UserMetadata;
  raw_app_meta_data: AppMetadata;
  is_super_admin: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  phone: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  banned_until: string | null;
  deleted_at: string | null;
}

// Types for internal users
export interface InternalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  contact: string;
  created_at: string;
  group: string;
  is_verified: boolean;
}

// Types for external users
export interface ExternalUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  group?: string;
  is_verified?: boolean;
  business: string;
  contact: string;
  subscription: string;
  created_at: string;
}

// Form data types
export interface InternalUserFormData {
  name: string;
  email: string;
  contact: string;
  role: string;
  is_verified: boolean;
  password?: string;
}

export interface ExternalUserFormData {
  name: string;
  email: string;
  business: string;
  contact: string;
  role?: string;
  is_verified?: boolean;
  password?: string;
}

// Available roles for external users
export const availableExternalUserRoles = [
  "Unverified Customer",
  "Verified Customer"
];

// Available status options for external users
export const availableStatusOptions = [
  { value: true, label: "Verified" },
  { value: false, label: "Unverified" }
];

// Available roles for internal users
export const availableRoles = [
  "super_admin",
  "data_operator"
];

// Available subscription types for external users
export enum SubscriptionType {
  FREE = 'Free',
  BASIC = 'Basic',
  PREMIUM = 'Premium',
  ENTERPRISE = 'Enterprise'
}

export const getSubscriptionTypes = (): string[] => {
  return Object.values(SubscriptionType);
};

// Internal Users API Functions
export const fetchInternalUsers = async (): Promise<InternalUser[]> => {
  try {
    const response = await fetch('/api/internal-users', {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to fetch internal users');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching internal users:', error);
    throw error;
  }
};

export const addInternalUser = async (userData: InternalUserFormData): Promise<InternalUser> => {
  try {
    const response = await fetch('/api/internal-users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to add internal user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding internal user:', error);
    throw error;
  }
};

export const updateInternalUser = async (userId: string, userData: InternalUserFormData): Promise<InternalUser> => {
  try {
    const response = await fetch('/api/internal-users', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, userData })
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to update internal user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating internal user:', error);
    throw error;
  }
};

export const deleteInternalUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/internal-users?userId=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to delete internal user');
    }
  } catch (error) {
    console.error('Error deleting internal user:', error);
    throw error;
  }
};

export const updateInternalUserRole = async (userId: string, newRole: string): Promise<void> => {
  try {
    const response = await fetch('/api/internal-users/role', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, role: newRole })
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to update user role');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// External Users API Functions
export const fetchExternalUsers = async (): Promise<ExternalUser[]> => {
  try {
    const response = await fetch('/api/external-users', {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to fetch external users');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching external users:', error);
    throw error;
  }
};

export const addExternalUser = async (userData: ExternalUserFormData): Promise<ExternalUser> => {
  try {
    const response = await fetch('/api/external-users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to add external user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding external user:', error);
    throw error;
  }
};

export const updateExternalUser = async (userId: string, userData: ExternalUserFormData): Promise<ExternalUser> => {
  try {
    const response = await fetch('/api/external-users', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, userData })
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to update external user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating external user:', error);
    throw error;
  }
};

export const deleteExternalUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/external-users?userId=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to delete external user');
    }
  } catch (error) {
    console.error('Error deleting external user:', error);
    throw error;
  }
};

export const updateExternalUserSubscription = async (userId: string, newSubscription: string): Promise<void> => {
  try {
    const response = await fetch('/api/external-users/subscription', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, subscription: newSubscription })
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to update user subscription');
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

// User verification functions
export const verifyUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch('/api/external-users/verify', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, action: 'verify' })
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to verify user');
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
};

export const unverifyUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch('/api/external-users/verify', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, action: 'unverify' })
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied: Insufficient permissions');
      }
      throw new Error('Failed to unverify user');
    }
  } catch (error) {
    console.error('Error unverifying user:', error);
    throw error;
  }
};
