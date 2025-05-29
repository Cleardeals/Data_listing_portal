import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '@/lib/auth';

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
    // Check for existing session on mount (no magic link support)
    const initializeAuth = async () => {
      try {
        // Only check for stored session - no magic link detection
        const session = authService.getStoredSession();
        if (session) {
          const tokenResult = await authService.verifyToken(session.access_token);
          if (tokenResult.valid) {
            setUser(session.user);
          } else {
            // Token is invalid, clear it
            await authService.signOut();
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        await authService.signOut();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string) => {
    try {
      // Don't set global loading for OTP sending - let components handle their own loading
      const result = await authService.sendOTP(email);
      return result;
    } catch (error) {
      console.error('AuthContext: login error:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    console.log('AuthContext: Starting verifyOTP...', { email, otpLength: otp.length });
    try {
      // Only set loading during verification since this changes auth state
      setLoading(true);
      const result = await authService.verifyOTP(email, otp);
      console.log('AuthContext: AuthService result:', result);
      
      if (result.success && result.session) {
        console.log('AuthContext: Setting user...', result.session.user);
        setUser(result.session.user);
        return { success: true, message: result.message, user: result.session.user };
      }
      console.log('AuthContext: Verification failed:', result.message);
      return { success: false, message: result.message };
    } catch (error) {
      console.error('AuthContext: verifyOTP error:', error);
      return { success: false, message: 'Failed to verify OTP' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
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
    } catch (error) {
      console.error('Error refreshing session:', error);
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
