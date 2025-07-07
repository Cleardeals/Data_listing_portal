'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthSession, AuthService } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  session: AuthSession | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // First check Supabase session (since we now have persistSession: true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          AuthService.clearSession()
          setLoading(false)
          return
        }

        if (session && session.user) {
          // We have a valid Supabase session, create our auth session
          const userGroup = session.user.user_metadata?.group || 'internalusers'
          const userRole = session.user.user_metadata?.role || 'super_admin'
          const isVerified = session.user.user_metadata?.is_verified || false

          const authSession: AuthSession = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at || 0,
            user: {
              id: session.user.id,
              email: session.user.email || '',
              role: userRole,
              group: userGroup,
              is_verified: isVerified,
            },
          }

          AuthService.setSession(authSession)
          setSession(authSession)
        } else {
          // No Supabase session, check our stored session as fallback
          const existingSession = AuthService.getSession()
          if (existingSession) {
            // Validate the stored session
            if (existingSession.expires_at && Date.now() / 1000 > existingSession.expires_at) {
              AuthService.clearSession()
              setSession(null)
            } else {
              setSession(existingSession)
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        AuthService.clearSession()
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state listener to handle session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        console.log('Auth state changed:', event, supabaseSession)
        
        if (event === 'SIGNED_IN' && supabaseSession) {
          const userGroup = supabaseSession.user.user_metadata?.group || 'internalusers'
          const userRole = supabaseSession.user.user_metadata?.role || 'super_admin'
          const isVerified = supabaseSession.user.user_metadata?.is_verified || false

          const authSession: AuthSession = {
            access_token: supabaseSession.access_token,
            refresh_token: supabaseSession.refresh_token,
            expires_at: supabaseSession.expires_at || 0,
            user: {
              id: supabaseSession.user.id,
              email: supabaseSession.user.email || '',
              role: userRole,
              group: userGroup,
              is_verified: isVerified,
            },
          }

          AuthService.setSession(authSession)
          setSession(authSession)
        } else if (event === 'SIGNED_OUT') {
          AuthService.clearSession()
          setSession(null)
        } else if (event === 'TOKEN_REFRESHED' && supabaseSession) {
          // Update our stored session with the new tokens
          const currentSession = AuthService.getSession()
          if (currentSession) {
            const updatedSession: AuthSession = {
              ...currentSession,
              access_token: supabaseSession.access_token,
              refresh_token: supabaseSession.refresh_token,
              expires_at: supabaseSession.expires_at || 0,
            }
            AuthService.setSession(updatedSession)
            setSession(updatedSession)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const sendOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const result = await AuthService.signInWithOTP(email)
    return {
      success: !result.error,
      error: result.error,
    }
  }

  const login = async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    const result = await AuthService.verifyOTP(email, otp)
    
    if (result.session) {
      // Session will be automatically updated by onAuthStateChange listener
      return { success: true }
    }
    
    return {
      success: false,
      error: result.error || 'Login failed',
    }
  }

  const logout = async (): Promise<void> => {
    await AuthService.signOut()
    // Session will be automatically cleared by onAuthStateChange listener
  }

  const value: AuthContextType = {
    session,
    loading,
    isAuthenticated: !!session,
    login,
    logout,
    sendOTP,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
