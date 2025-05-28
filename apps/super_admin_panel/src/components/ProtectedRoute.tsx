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

      if (requiredRole && session?.user.role !== requiredRole) {
        router.push('/unauthorized')
        return
      }
    }
  }, [loading, isAuthenticated, session?.user.role, router, requiredRole])

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

  if (requiredRole && session?.user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
