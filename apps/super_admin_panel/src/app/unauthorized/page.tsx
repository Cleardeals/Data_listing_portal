'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function UnauthorizedPage() {
  const { logout } = useAuth()

  const handleGoToLogin = async () => {
    try {
      await logout()
      // Don't manually redirect - let auth state change handle it
    } catch (error) {
      console.error('Error during logout:', error)
      // If logout fails, still let the auth system handle the redirect
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
        <div className="text-6xl text-red-500 mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-center text-red-600 mb-2">Access Denied</h1>
        <p className="text-center text-gray-600 mb-6">
          You don&apos;t have permission to access this page.
        </p>
        <button
          onClick={handleGoToLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md font-semibold text-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}
