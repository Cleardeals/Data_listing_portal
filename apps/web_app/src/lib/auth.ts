import { supabase } from '../../../../packages/shared/supabase';
import { SignJWT, jwtVerify } from 'jose';

export interface User {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  email_confirmed_at?: string;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');
const JWT_ISSUER = 'data-listing-portal';
const JWT_AUDIENCE = 'web-app';

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Send OTP to email (OTP only, no magic links)
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Use signInWithOtp for email OTP without redirect URL
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          data: {
            role: 'Customer' // Default role for new users
          }
        }
      });

      if (error) {
        // Provide more specific error messages
        if (error.message.includes('rate limit')) {
          return { success: false, message: 'Too many requests. Please wait a moment before trying again.' };
        } else if (error.message.includes('invalid email')) {
          return { success: false, message: 'Please enter a valid email address.' };
        }
        
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        message: 'Verification code sent to your email! Check your inbox for a 6-digit code.' 
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      return { success: false, message: errorMessage };
    }
  }

  // Verify OTP and sign in (OTP only)
  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; session?: AuthSession; message: string }> {
    try {
      // Clean the OTP (remove spaces, ensure it's digits)
      const cleanOTP = otp.replace(/\s/g, '').trim();
      
      if (cleanOTP.length < 4 || cleanOTP.length > 8 || !/^\d+$/.test(cleanOTP)) {
        return { success: false, message: 'Please enter a valid verification code (4-8 digits)' };
      }
      
      // Only verify email OTP - no magic link support
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: cleanOTP,
        type: 'email'
      });

      if (error) {
        // Provide more specific error messages
        if (error.message.includes('expired')) {
          return { success: false, message: 'Verification code has expired. Please request a new one.' };
        } else if (error.message.includes('invalid')) {
          return { success: false, message: 'Invalid verification code. Please check your email and try again.' };
        } else if (error.message.includes('too many')) {
          return { success: false, message: 'Too many attempts. Please wait before trying again.' };
        }
        
        return { success: false, message: `Verification failed: ${error.message}` };
      }

      if (!data.user || !data.session) {
        return { success: false, message: 'Authentication failed. Please try again.' };
      }

      // Set user role if not exists
      const userRole = data.user.user_metadata?.role || 'Customer';

      // Create custom JWT token with user info
      const customToken = await this.createCustomToken({
        id: data.user.id,
        email: data.user.email!,
        role: userRole,
        created_at: data.user.created_at,
        email_confirmed_at: data.user.email_confirmed_at
      });

      const session: AuthSession = {
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: userRole,
          created_at: data.user.created_at,
          email_confirmed_at: data.user.email_confirmed_at
        },
        access_token: customToken,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0
      };

      // Store session in localStorage
      this.storeSession(session);

      return { success: true, session, message: 'Login successful' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify code';
      return { success: false, message: errorMessage };
    }
  }

  // Create custom JWT token
  async createCustomToken(user: User): Promise<string> {
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    return token;
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<{ valid: boolean; payload?: Record<string, unknown> }> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE
      });
      return { valid: true, payload };
    } catch {
      return { valid: false };
    }
  }

  // Store session in localStorage
  storeSession(session: AuthSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify(session));
    }
  }

  // Get session from localStorage
  getStoredSession(): AuthSession | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_session');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Clear session
  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_session');
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      this.clearSession();
    }
  }

  // Refresh session
  async refreshSession(): Promise<{ success: boolean; session?: AuthSession }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        this.clearSession();
        return { success: false };
      }

      const userRole = data.user?.user_metadata?.role || 'Customer';
      
      const customToken = await this.createCustomToken({
        id: data.user!.id,
        email: data.user!.email!,
        role: userRole,
        created_at: data.user!.created_at,
        email_confirmed_at: data.user!.email_confirmed_at
      });

      const session: AuthSession = {
        user: {
          id: data.user!.id,
          email: data.user!.email!,
          role: userRole,
          created_at: data.user!.created_at,
          email_confirmed_at: data.user!.email_confirmed_at
        },
        access_token: customToken,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0
      };

      this.storeSession(session);
      return { success: true, session };
    } catch {
      this.clearSession();
      return { success: false };
    }
  }
}

export const authService = AuthService.getInstance();
