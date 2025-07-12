'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// Type for user profile from existing database structure
interface UserProfile {
  id: string
  instance_id?: string
  aud?: string
  role?: string
  email?: string
  encrypted_password?: string
  email_confirmed_at?: string
  invited_at?: string
  confirmation_token?: string
  confirmation_sent_at?: string
  recovery_token?: string
  recovery_sent_at?: string
  email_change_token_new?: string
  email_change?: string
  email_change_sent_at?: string
  last_sign_in_at?: string
  raw_app_meta_data?: Record<string, unknown>
  raw_user_meta_data?: {
    name?: string
    role?: string
    group?: string
    is_verified?: boolean
    contact?: string
    business?: string
    subscription?: string
  }
  is_super_admin?: boolean
  created_at?: string
  updated_at?: string
  phone?: string
  phone_confirmed_at?: string
  phone_change?: string
  phone_change_token?: string
  phone_change_sent_at?: string
  confirmed_at?: string
  email_change_token_current?: string
  email_change_confirm_status?: number
  banned_until?: string
  reauthentication_token?: string
  reauthentication_sent_at?: string
  is_sso_user?: boolean
  deleted_at?: string
}

// User type for web app
interface User {
  id: string
  email: string
  role: string
  group?: string
  is_verified?: boolean
  created_at?: string
  email_confirmed_at?: string
}

interface UseRealTimeUserStatusReturn {
  currentUser: User | null
  loading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
}

export const useRealTimeUserStatus = (): UseRealTimeUserStatusReturn => {
  const { user: authUser, refreshSession, logout } = useAuth()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transform user_profiles data to User format
  const transformToUser = useCallback((profile: UserProfile): User => ({
    id: profile.id,
    email: profile.email || '',
    role: profile.raw_user_meta_data?.role || 'Unverified Customer',
    group: profile.raw_user_meta_data?.group || 'customers',
    is_verified: profile.raw_user_meta_data?.is_verified || false,
    created_at: profile.created_at || new Date().toISOString(),
    email_confirmed_at: profile.email_confirmed_at
  }), [])

  // Fetch user profile from user_profiles table
  const fetchUserProfile = useCallback(async () => {
    if (!authUser?.id) {
      setCurrentUser(null)
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      // Fetch from user_profiles table for real-time reads
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          raw_user_meta_data,
          created_at,
          email_confirmed_at,
          deleted_at
        `)
        .eq('id', authUser.id)
        .is('deleted_at', null)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        // On user profile fetch error, end session and redirect to landing page
        setError('User profile fetch failed - session will be terminated')
        setCurrentUser(null)
        setLoading(false)
        
        // Logout user and redirect to landing page
        if (logout) {
          await logout()
        }
        
        // Redirect to landing page
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
        return
      }

      if (profile) {
        const transformedUser = transformToUser(profile)
        setCurrentUser(transformedUser)
        
        // If verification status changed, refresh auth session
        if (authUser.is_verified !== transformedUser.is_verified || 
            authUser.role !== transformedUser.role) {
          if (refreshSession) {
            await refreshSession()
          }
        }
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
      setError('Failed to fetch user data - session will be terminated')
      setCurrentUser(null)
      
      // On any fetch error, end session and redirect to landing page
      if (logout) {
        await logout()
      }
      
      // Redirect to landing page
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } finally {
      setLoading(false)
    }
  }, [authUser, transformToUser, refreshSession, logout])

  // Initial fetch when auth user changes
  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // Setup real-time subscription for user status changes
  useEffect(() => {
    if (!authUser?.id || !supabase) return

    const subscription = supabase
      .channel(`user_status_${authUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${authUser.id}`
        },
        () => {
          // Small delay to ensure database consistency
          setTimeout(async () => {
            await fetchUserProfile()
          }, 100)
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setError('Real-time connection failed')
        }
      })

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [authUser?.id, fetchUserProfile])

  return {
    currentUser,
    loading,
    error,
    refreshUserData: fetchUserProfile
  }
}
