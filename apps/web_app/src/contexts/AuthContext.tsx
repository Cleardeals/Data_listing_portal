import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount (with proper session persistence)
    const initializeAuth = async () => {
      try {
        // First check Supabase session (since we now have persistSession: true)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          await authService.signOut();
          return;
        }

        if (session && session.user) {
          // We have a valid Supabase session, create our user object
          const userRole = session.user.user_metadata?.role || 'Unverified Customer';
          const userGroup = session.user.user_metadata?.group || 'customers';
          const isVerified = session.user.user_metadata?.is_verified || false;
          
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            role: userRole,
            group: userGroup,
            is_verified: isVerified,
            created_at: session.user.created_at,
            email_confirmed_at: session.user.email_confirmed_at
          };

          setUser(user);
          
          // Also store in our custom auth service for consistency
          const authSession = {
            user,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at || 0
          };
          authService.storeSession(authSession);
        } else {
          // No Supabase session, make sure we clear any stored session
          authService.clearSession();
          setUser(null);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        await authService.signOut();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener to handle session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const userRole = session.user.user_metadata?.role || 'Unverified Customer';
          const userGroup = session.user.user_metadata?.group || 'customers';
          const isVerified = session.user.user_metadata?.is_verified || false;
          
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            role: userRole,
            group: userGroup,
            is_verified: isVerified,
            created_at: session.user.created_at,
            email_confirmed_at: session.user.email_confirmed_at
          };

          setUser(user);
          setLoading(false); // Set loading to false when signed in
          
          // Store in our custom auth service for consistency
          const authSession = {
            user,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at || 0
          };
          authService.storeSession(authSession);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          authService.clearSession();
          setLoading(false); // Set loading to false when signed out
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Update our stored session with the new tokens
          // Get current user from the existing session
          const storedSession = authService.getStoredSession();
          if (storedSession) {
            const authSession = {
              user: storedSession.user,
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at || 0
            };
            authService.storeSession(authSession);
          }
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string) => {
    try {
      // Don't set global loading for OTP sending - let components handle their own loading
      const result = await authService.sendOTP(email);
      return result;
    } catch {
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      // Only set loading during verification since this changes auth state
      setLoading(true);
      const result = await authService.verifyOTP(email, otp);
      
      if (result.success && result.session) {
        // Don't manually set user here - let the auth state change event handle it
        return { success: true, message: result.message, user: result.session.user };
      }
      return { success: false, message: result.message };
    } catch {
      return { success: false, message: 'Failed to verify OTP' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      // Don't manually set user to null here - let the auth state change event handle it
      // Also don't set loading to false here - let the auth state change handle the loading state
    } catch (error) {
      console.error('Error during logout:', error);
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const result = await authService.refreshSession();
      if (result.success && result.session) {
        setUser(result.session.user);
      } else {
        // Session refresh failed, logout user
        await logout();
      }
    } catch {
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    verifyOTP,
    logout,
    refreshSession,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
