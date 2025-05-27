import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: {
    id: string
    email: string
    role: string
  }
}

export class AuthService {
  private static readonly JWT_AUDIENCE = 'super-admin-panel'
  private static readonly STORAGE_KEY = 'super_admin_auth_session'

  static async signInWithOTP(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          data: {
            audience: this.JWT_AUDIENCE,
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch {
      return { error: 'An unexpected error occurred' }
    }
  }

  static async verifyOTP(email: string, token: string): Promise<{ session?: AuthSession; error?: string }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (error) {
        return { error: error.message }
      }

      if (!data.session) {
        return { error: 'No session created' }
      }

      const session: AuthSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        user: {
          id: data.session.user.id,
          email: data.session.user.email || '',
          role: 'super_admin',
        },
      }

      this.setSession(session)
      return { session }
    } catch {
      return { error: 'An unexpected error occurred' }
    }
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut()
    this.clearSession()
  }

  static getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return null

    try {
      const session: AuthSession = JSON.parse(stored)
      
      if (session.expires_at && Date.now() / 1000 > session.expires_at) {
        this.clearSession()
        return null
      }

      return session
    } catch {
      this.clearSession()
      return null
    }
  }

  static setSession(session: AuthSession): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
  }

  static clearSession(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static async refreshSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error || !data.session) {
        this.clearSession()
        return null
      }

      const session: AuthSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        user: {
          id: data.session.user.id,
          email: data.session.user.email || '',
          role: 'super_admin',
        },
      }

      this.setSession(session)
      return session
    } catch {
      this.clearSession()
      return null
    }
  }

  static isAuthenticated(): boolean {
    const session = this.getSession()
    return session !== null
  }

  static hasRole(requiredRole: string): boolean {
    const session = this.getSession()
    return session?.user.role === requiredRole
  }
}
