'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole = 'super_admin' }: ProtectedRouteProps) {
  const { session, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
        return
      }

      // Check if user belongs to "internalusers" group - block all "customer" group users
      if (session?.user.group === 'customers') {
        console.warn('Access denied: Customer group users cannot access admin panel')
        router.push('/phishing-protection')
        return
      }

      // Only allow "internalusers" group to access super admin panel
      if (session?.user.group !== 'internalusers') {
        console.warn('Access denied: Only internal users can access admin panel')
        router.push('/phishing-protection')
        return
      }

      if (requiredRole && session?.user.role !== requiredRole) {
        router.push('/unauthorized')
        return
      }
    }
  }, [loading, isAuthenticated, session?.user.role, session?.user.group, router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Block customers group from accessing admin panel
  if (session?.user.group === 'customers') {
    return null
  }

  // Only allow internalusers group
  if (session?.user.group !== 'internalusers') {
    return null
  }

  if (requiredRole && session?.user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
