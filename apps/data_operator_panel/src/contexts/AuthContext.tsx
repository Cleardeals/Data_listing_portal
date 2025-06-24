import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => Promise<void>;
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
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
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
      } catch {
        await authService.signOut();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string) => {
    try {
      const result = await authService.sendOTP(email);
      return result;
    } catch {
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setLoading(true);
      const result = await authService.verifyOTP(email, otp);
      
      if (result.success && result.session) {
        setUser(result.session.user);
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
      setUser(null);
    } catch {
      // Error during logout
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    verifyOTP,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
