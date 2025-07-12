'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import { 
  InternalUser, 
  ExternalUser, 
  InternalUserFormData, 
  ExternalUserFormData,
  addInternalUser,
  updateInternalUser,
  deleteInternalUser,
  updateInternalUserRole,
  addExternalUser,
  updateExternalUser,
  deleteExternalUser,
  verifyUser,
  unverifyUser,
  updateExternalUserSubscription
} from '@/lib/supabaseUsers'

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

interface UseRealTimeUsersReturn {
  internalUsers: InternalUser[]
  externalUsers: ExternalUser[]
  loading: boolean
  error: string | null
  // Internal user operations
  addInternalUser: (userData: InternalUserFormData) => Promise<InternalUser>
  updateInternalUser: (userId: string, userData: InternalUserFormData) => Promise<InternalUser>
  deleteInternalUser: (userId: string) => Promise<void>
  updateInternalUserRole: (userId: string, newRole: string) => Promise<void>
  // External user operations
  addExternalUser: (userData: ExternalUserFormData) => Promise<ExternalUser>
  updateExternalUser: (userId: string, userData: ExternalUserFormData) => Promise<ExternalUser>
  deleteExternalUser: (userId: string) => Promise<void>
  verifyUser: (userId: string) => Promise<void>
  unverifyUser: (userId: string) => Promise<void>
  updateExternalUserSubscription: (userId: string, newSubscription: string) => Promise<void>
  // Utility functions
  refreshData: () => Promise<void>
}

export const useRealTimeUsers = (): UseRealTimeUsersReturn => {
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>([])
  const [externalUsers, setExternalUsers] = useState<ExternalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get auth headers helper
  const getAuthHeaders = useCallback(() => {
    const session = localStorage.getItem('super_admin_auth_session')
    if (!session) {
      throw new Error('No authentication session found')
    }
    
    const parsedSession = JSON.parse(session)
    const accessToken = parsedSession.access_token
    
    if (!accessToken) {
      throw new Error('No access token found')
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  }, [])

  // Fallback API fetch function
  const fetchFromAPI = useCallback(async () => {
    try {
      setError(null)
      
      // Fetch internal users from API
      const internalResponse = await fetch('/api/internal-users', {
        headers: getAuthHeaders()
      })
      
      if (internalResponse.ok) {
        const internalData = await internalResponse.json()
        setInternalUsers(internalData)
      }

      // Fetch external users from API
      const externalResponse = await fetch('/api/external-users', {
        headers: getAuthHeaders()
      })
      
      if (externalResponse.ok) {
        const externalData = await externalResponse.json()
        setExternalUsers(externalData)
      }
    } catch (err) {
      console.error('Error in fetchFromAPI:', err)
      // Only set error if it's a critical failure that prevents data loading
      if (err instanceof Error && err.message.includes('authentication')) {
        setError('Authentication failed. Please log in again.')
      } else {
        console.warn('API fetch failed, but user data may still be available from cache')
      }
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  // Transform user_profiles data to InternalUser format
  const transformToInternalUser = useCallback((profile: UserProfile): InternalUser => ({
    id: profile.id,
    name: profile.raw_user_meta_data?.name || profile.email?.split('@')[0] || 'Unknown',
    email: profile.email || '',
    role: profile.raw_user_meta_data?.role || 'data_operator',
    group: profile.raw_user_meta_data?.group || 'internalusers',
    is_verified: profile.raw_user_meta_data?.is_verified || false,
    contact: profile.raw_user_meta_data?.contact || profile.phone || '',
    created_at: profile.created_at || new Date().toISOString()
  }), [])

  // Transform user_profiles data to ExternalUser format
  const transformToExternalUser = useCallback((profile: UserProfile): ExternalUser => ({
    id: profile.id,
    name: profile.raw_user_meta_data?.name || profile.email?.split('@')[0] || 'Unknown',
    email: profile.email || '',
    role: profile.raw_user_meta_data?.role || 'Unverified Customer',
    group: profile.raw_user_meta_data?.group || 'customers',
    is_verified: profile.raw_user_meta_data?.is_verified || false,
    business: profile.raw_user_meta_data?.business || '',
    contact: profile.raw_user_meta_data?.contact || profile.phone || '',
    subscription: profile.raw_user_meta_data?.subscription || 'Free',
    created_at: profile.created_at || new Date().toISOString()
  }), [])

  // Fetch data from user_profiles table
  const fetchUserProfiles = useCallback(async () => {
    try {
      setError(null)
      
      // Fetch from user_profiles table for real-time reads
      // Filter out deleted users and select only necessary fields
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          phone,
          created_at,
          updated_at,
          raw_user_meta_data,
          raw_app_meta_data,
          deleted_at
        `)
        .is('deleted_at', null) // Only get non-deleted users
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError)
        // Only set error if fallback to API also fails
        try {
          await fetchFromAPI()
        } catch (apiError) {
          console.error('API fallback also failed:', apiError)
          setError('Unable to load user data. Please refresh the page.')
        }
        return
      }

      if (profiles) {
        // Separate users by group
        const internal = profiles
          .filter(user => user.raw_user_meta_data?.group === 'internalusers')
          .map(transformToInternalUser)

        const external = profiles
          .filter(user => user.raw_user_meta_data?.group === 'customers' || !user.raw_user_meta_data?.group)
          .map(transformToExternalUser)

        setInternalUsers(internal)
        setExternalUsers(external)
      }
    } catch (err) {
      console.error('Error in fetchUserProfiles:', err)
      // Only set error if fallback to API also fails
      try {
        await fetchFromAPI()
      } catch (apiError) {
        console.error('API fallback also failed:', apiError)
        setError('Unable to load user data. Please refresh the page.')
      }
    } finally {
      setLoading(false)
    }
  }, [fetchFromAPI, transformToInternalUser, transformToExternalUser])

  // Setup real-time subscription
  useEffect(() => {
    let subscription: RealtimeChannel | null = null
    let isPageVisible = true

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const setupRealTimeSubscription = async () => {
      try {
        console.log('🚀 Setting up real-time subscription...')
        
        // Initial data fetch
        await fetchUserProfiles()

        // Setup real-time subscription to user_profiles table
        subscription = supabase
          .channel('user_profiles_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_profiles'
            },
            () => {
              // Only update if page is visible to avoid unnecessary updates
              if (isPageVisible) {
                // Small delay to ensure database consistency
                setTimeout(async () => {
                  await fetchUserProfiles()
                }, 100)
              }
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              console.warn('Real-time connection encountered an error, continuing with existing data')
              // Don't set user-facing error for real-time connection issues
            }
          })

      } catch (err) {
        console.error('Error setting up real-time subscription:', err)
        // Don't set user-facing error for real-time setup issues
        // The app will continue to work with manual refresh
      }
    }

    setupRealTimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [fetchUserProfiles])

  // Wrapped CRUD operations that refresh data after mutations
  const wrappedAddInternalUser = useCallback(async (userData: InternalUserFormData): Promise<InternalUser> => {
    const result = await addInternalUser(userData)
    await fetchUserProfiles() // Refresh data
    return result
  }, [fetchUserProfiles])

  const wrappedUpdateInternalUser = useCallback(async (userId: string, userData: InternalUserFormData): Promise<InternalUser> => {
    const result = await updateInternalUser(userId, userData)
    await fetchUserProfiles() // Refresh data
    return result
  }, [fetchUserProfiles])

  const wrappedDeleteInternalUser = useCallback(async (userId: string): Promise<void> => {
    await deleteInternalUser(userId)
    await fetchUserProfiles() // Refresh data
  }, [fetchUserProfiles])

  const wrappedUpdateInternalUserRole = useCallback(async (userId: string, newRole: string): Promise<void> => {
    await updateInternalUserRole(userId, newRole)
    await fetchUserProfiles() // Refresh data
  }, [fetchUserProfiles])

  const wrappedAddExternalUser = useCallback(async (userData: ExternalUserFormData): Promise<ExternalUser> => {
    const result = await addExternalUser(userData)
    await fetchUserProfiles() // Refresh data
    return result
  }, [fetchUserProfiles])

  const wrappedUpdateExternalUser = useCallback(async (userId: string, userData: ExternalUserFormData): Promise<ExternalUser> => {
    const result = await updateExternalUser(userId, userData)
    await fetchUserProfiles() // Refresh data
    return result
  }, [fetchUserProfiles])

  const wrappedDeleteExternalUser = useCallback(async (userId: string): Promise<void> => {
    await deleteExternalUser(userId)
    await fetchUserProfiles() // Refresh data
  }, [fetchUserProfiles])

  const wrappedVerifyUser = useCallback(async (userId: string): Promise<void> => {
    await verifyUser(userId)
    await fetchUserProfiles() // Refresh data
  }, [fetchUserProfiles])

  const wrappedUnverifyUser = useCallback(async (userId: string): Promise<void> => {
    await unverifyUser(userId)
    await fetchUserProfiles() // Refresh data
  }, [fetchUserProfiles])

  const wrappedUpdateExternalUserSubscription = useCallback(async (userId: string, newSubscription: string): Promise<void> => {
    await updateExternalUserSubscription(userId, newSubscription)
    await fetchUserProfiles() // Refresh data
  }, [fetchUserProfiles])

  return {
    internalUsers,
    externalUsers,
    loading,
    error,
    addInternalUser: wrappedAddInternalUser,
    updateInternalUser: wrappedUpdateInternalUser,
    deleteInternalUser: wrappedDeleteInternalUser,
    updateInternalUserRole: wrappedUpdateInternalUserRole,
    addExternalUser: wrappedAddExternalUser,
    updateExternalUser: wrappedUpdateExternalUser,
    deleteExternalUser: wrappedDeleteExternalUser,
    verifyUser: wrappedVerifyUser,
    unverifyUser: wrappedUnverifyUser,
    updateExternalUserSubscription: wrappedUpdateExternalUserSubscription,
    refreshData: fetchUserProfiles
  }
}
