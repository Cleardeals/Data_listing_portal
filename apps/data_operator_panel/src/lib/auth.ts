import { supabase } from '../../../../packages/shared/supabase';
import { SignJWT, jwtVerify } from 'jose';

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  group?: string;
  contact?: string;
  is_verified?: boolean;
  email_verified?: boolean;
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
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || 'SB7z88QZSbo3FNLDF2D4sbITEvbo6c4sO8KtSIwYYKqaDoLutoWrqh3RRKRJMZeNP71H0uOopu/xJc2YvkrM1Q==';
  return new TextEncoder().encode(secret);
};

const JWT_SECRET = getJWTSecret();
const JWT_ISSUER = 'data-listing-portal';
const JWT_AUDIENCE = 'data-operator-panel';

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Send OTP to email - Only for existing users, no new signups allowed
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Prevent new user creation
          data: {
            role: 'data_operator'
          }
        }
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          return { success: false, message: 'Too many requests. Please wait a moment before trying again.' };
        } else if (error.message.includes('invalid email')) {
          return { success: false, message: 'Please enter a valid email address.' };
        } else if (error.message.includes('User not found') || error.message.includes('signup')) {
          return { success: false, message: 'Access denied. Only pre-authorized data operators can login. Please contact your administrator.' };
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

  // Verify OTP and sign in
  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; session?: AuthSession; message: string }> {
    console.log('AuthService: Starting verifyOTP...', { email, otp });
    try {
      const cleanOTP = otp.replace(/\s/g, '').trim();
      console.log('AuthService: Cleaned OTP:', cleanOTP);
      
      if (cleanOTP.length < 4 || cleanOTP.length > 8 || !/^\d+$/.test(cleanOTP)) {
        console.log('AuthService: Invalid OTP format');
        return { success: false, message: 'Please enter a valid verification code (4-8 digits)' };
      }
      
      console.log('AuthService: Calling supabase.auth.verifyOtp...');
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: cleanOTP,
        type: 'email'
      });

      console.log('AuthService: Supabase response:', { data, error });

      if (error) {
        console.log('AuthService: Supabase error:', error.message);
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
        console.log('AuthService: No user or session in response');
        return { success: false, message: 'Authentication failed. Please try again.' };
      }

      console.log('AuthService: Successfully got user and session');

      // Get user metadata - ensure it matches required structure
      const userMetadata = data.session.user.user_metadata || {};
      const userRole = userMetadata.role || 'data_operator';
      const userGroup = userMetadata.group || 'internalusers';
      const userName = userMetadata.name;
      const userContact = userMetadata.contact;
      const isVerified = userMetadata.is_verified !== undefined ? userMetadata.is_verified : true;
      const emailVerified = userMetadata.email_verified !== undefined ? userMetadata.email_verified : true;

      console.log('AuthService: User metadata:', { userRole, userGroup, userName, userContact, isVerified, emailVerified });

      // Verify user has proper metadata structure for data operator panel
      if (userGroup !== 'internalusers') {
        console.warn('AuthService: User is not in internalusers group:', userGroup);
        return { success: false, message: 'Access denied. Only internal users can access the data operator panel.' };
      }

      if (userRole !== 'data_operator') {
        console.warn('AuthService: User does not have data_operator role:', userRole);
        return { success: false, message: 'Access denied. Only data operators can access this panel.' };
      }

      // Update user metadata with role if needed
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          role: userRole,
          group: userGroup,
          is_verified: isVerified,
          email_verified: emailVerified
        }
      });

      if (updateError) {
        console.warn('Failed to update user metadata:', updateError.message);
      }

      const session: AuthSession = {
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: userRole,
          name: userName,
          group: userGroup,
          contact: userContact,
          is_verified: isVerified,
          email_verified: emailVerified,
          created_at: data.user.created_at,
          email_confirmed_at: data.user.email_confirmed_at
        },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0
      };

      console.log('AuthService: Created session object');

      // Store session in localStorage
      this.storeSession(session);
      console.log('AuthService: Stored session, returning success');

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
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        return { 
          valid: true, 
          payload: {
            sub: data.user.id,
            email: data.user.email,
            role: data.user.user_metadata?.role || 'data_operator'
          }
        };
      }
      
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
      localStorage.setItem('data_operator_auth_session', JSON.stringify(session));
    }
  }

  // Get session from localStorage
  getStoredSession(): AuthSession | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('data_operator_auth_session');
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
      localStorage.removeItem('data_operator_auth_session');
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

      const userRole = data.session.user.user_metadata?.role || 'data_operator';
      const userGroup = data.session.user.user_metadata?.group || 'internalusers';
      const userName = data.session.user.user_metadata?.name;
      const userContact = data.session.user.user_metadata?.contact;
      const isVerified = data.session.user.user_metadata?.is_verified !== undefined ? data.session.user.user_metadata?.is_verified : true;
      const emailVerified = data.session.user.user_metadata?.email_verified !== undefined ? data.session.user.user_metadata?.email_verified : true;
      
      const customToken = await this.createCustomToken({
        id: data.user!.id,
        email: data.user!.email!,
        role: userRole,
        name: userName,
        group: userGroup,
        contact: userContact,
        is_verified: isVerified,
        email_verified: emailVerified,
        created_at: data.user!.created_at,
        email_confirmed_at: data.user!.email_confirmed_at
      });

      const session: AuthSession = {
        user: {
          id: data.user!.id,
          email: data.user!.email!,
          role: userRole,
          name: userName,
          group: userGroup,
          contact: userContact,
          is_verified: isVerified,
          email_verified: emailVerified,
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
