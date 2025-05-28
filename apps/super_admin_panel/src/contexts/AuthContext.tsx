'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthSession, AuthService } from '@/lib/auth'

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

  // Use useCallback to memoize the session check function
  const checkSession = useCallback(() => {
    const existingSession = AuthService.getSession()
    setSession(existingSession)
    return existingSession
  }, [])

  useEffect(() => {
    // Check for existing session on mount
    checkSession()
    setLoading(false)

    // Set up session refresh interval (30 minutes)
    const refreshInterval = setInterval(async () => {
      const currentSession = AuthService.getSession()
      if (currentSession) {
        const refreshedSession = await AuthService.refreshSession()
        if (refreshedSession) {
          setSession(refreshedSession)
        } else {
          setSession(null)
        }
      }
    }, 30 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [checkSession])

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
      setSession(result.session)
      return { success: true }
    }
    
    return {
      success: false,
      error: result.error || 'Login failed',
    }
  }

  const logout = async (): Promise<void> => {
    await AuthService.signOut()
    setSession(null)
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
