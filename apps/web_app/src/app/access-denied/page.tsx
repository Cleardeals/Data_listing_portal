'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRealTimeUserStatus } from '@/hooks/useRealTimeUserStatus'

export default function AccessDeniedPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const { currentUser } = useRealTimeUserStatus()
  const [countdown, setCountdown] = useState(5)

  // Monitor for verification status changes - if user gets verified, redirect to dashboard
  useEffect(() => {
    if (currentUser?.is_verified) {
      router.push('/dashboard')
      return
    }
  }, [currentUser?.is_verified, router])

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    // Auto-logout and redirect to login after 5 seconds
    const timer = setTimeout(() => {
      logout()
      router.push('/login')
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(countdownInterval)
    }
  }, [logout, router])

  const handleManualLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 relative font-sans overflow-hidden">
      {/* Enhanced 3D Background Elements - Mobile Optimized */}
      <div className="absolute inset-0 opacity-20">
        <div className="float-animation absolute top-10 sm:top-20 left-4 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-red-500/20 rounded-full blur-sm"></div>
        <div className="float-animation absolute top-20 sm:top-40 right-4 sm:right-32 w-12 h-12 sm:w-24 sm:h-24 bg-orange-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
        <div className="float-animation absolute bottom-20 sm:bottom-40 left-6 sm:left-40 w-14 h-14 sm:w-28 sm:h-28 bg-yellow-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        <div className="float-animation absolute top-40 sm:top-60 left-1/2 w-10 h-10 sm:w-20 sm:h-20 bg-red-600/20 rounded-full blur-sm" style={{animationDelay: '3s'}}></div>
        <div className="float-animation absolute bottom-10 sm:bottom-20 right-1/4 sm:right-1/3 w-18 h-18 sm:w-36 sm:h-36 bg-pink-500/15 rounded-full blur-sm" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-overlay opacity-5 sm:opacity-10"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="max-w-sm sm:max-w-lg lg:max-w-2xl w-full space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Main Error Card */}
          <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-red-400/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 text-center">
            {/* Enhanced Error Icon */}
            <div className="card-hover-3d mx-auto h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-red-400/30 rounded-full flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 pulse-glow">
              <span className="text-3xl sm:text-4xl lg:text-6xl">🚫</span>
            </div>

            {/* Enhanced Error Message */}
            <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-gradient-animate mb-3 sm:mb-4 lg:mb-6">
              Access Denied
            </h1>
            <p className="text-white/80 text-base sm:text-lg lg:text-xl mb-2 sm:mb-3 lg:mb-4">
              🔒 Access to this portal is restricted
            </p>
            <p className="text-white/60 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 lg:mb-10 px-2">
              Please contact your administrator if you believe this is an error.
            </p>

            {/* Enhanced Auto-redirect Warning */}
            <div className="card-hover-3d backdrop-blur-sm bg-yellow-500/10 border border-yellow-400/30 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 lg:gap-6">
                <div className="text-3xl sm:text-4xl lg:text-5xl pulse-glow">⚠️</div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-yellow-300 mb-2 sm:mb-3">
                    Automatic Logout
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                    You will be automatically logged out and redirected to the login page in{' '}
                    <span className="text-yellow-300 font-bold text-lg sm:text-xl lg:text-2xl bg-yellow-500/20 px-2 sm:px-3 py-1 rounded-lg">{countdown}</span> seconds.
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-1.5 sm:h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1.5 sm:h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={handleManualLogout}
                className="btn-3d w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-base sm:text-lg"
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <span className="text-lg sm:text-xl lg:text-2xl">🚪</span>
                  <span>Logout Now</span>
                </div>
              </button>
              
              <button
                onClick={() => router.back()}
                className="btn-3d w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-base sm:text-lg"
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <span className="text-lg sm:text-xl lg:text-2xl">←</span>
                  <span>Go Back</span>
                </div>
              </button>
            </div>

            {/* Support Information */}
            <div className="mt-6 sm:mt-8 lg:mt-10 text-center">
              <p className="text-white/50 text-xs sm:text-sm px-2">
                If you believe this is an error, please contact customer support.
              </p>
            </div>
          </div>

          {/* Enhanced Additional Info */}
          <div className="card-hover-3d backdrop-blur-3d bg-white/5 border border-white/20 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 sm:mb-6 text-center flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <span className="text-2xl sm:text-3xl">💡</span>
              <span className="text-center sm:text-left">Common Reasons for Access Denial</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-white/70 text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 backdrop-blur-sm bg-white/5 rounded-lg">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full pulse-glow flex-shrink-0"></div>
                <span>Your account may not be verified yet</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 backdrop-blur-sm bg-white/5 rounded-lg">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full pulse-glow flex-shrink-0"></div>
                <span>You may not have the required permissions</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 backdrop-blur-sm bg-white/5 rounded-lg">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full pulse-glow flex-shrink-0"></div>
                <span>Your session may have expired</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 backdrop-blur-sm bg-white/5 rounded-lg">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full pulse-glow flex-shrink-0"></div>
                <span>System maintenance might be in progress</span>
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center">
            <div className="card-hover-3d backdrop-blur-sm bg-white/5 border border-white/20 rounded-lg p-3 sm:p-4">
              <p className="text-white/70 text-base sm:text-lg font-semibold">
                🏠 PropertyHub Data Portal
              </p>
              <p className="text-white/50 text-xs sm:text-sm mt-1 sm:mt-2">
                © 2024 PropertyHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
