'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const { sendOTP, login, isAuthenticated, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [loading, isAuthenticated, router])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await sendOTP(email)
      if (result.success) {
        setIsOtpSent(true)
        setSuccess('OTP sent successfully! Check your email.')
        setCountdown(60) // 60 second countdown
      } else {
        setError(result.error || 'Failed to send OTP')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await login(email, otp)
      if (result.success) {
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setError(result.error || 'Invalid OTP')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const result = await sendOTP(email)
      if (result.success) {
        setSuccess('OTP resent successfully!')
        setCountdown(60)
      } else {
        setError(result.error || 'Failed to resend OTP')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Super Admin Login
        </h2>
        <p className="text-center text-black font-semibold mb-6">
          Welcome back you&apos;ve<br />been missed!
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="w-full mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        {!isOtpSent ? (
          <form onSubmit={handleSendOTP} className="w-full">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-blue-400 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black placeholder:text-gray-600"
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="w-full">
            <input
              type="email"
              value={email}
              disabled
              className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-blue-400 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black placeholder:text-gray-600"
              disabled={isLoading}
              maxLength={6}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <div className="w-full text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                className={`text-sm ${
                  countdown > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:underline'
                }`}
                disabled={countdown > 0 || isLoading}
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setIsOtpSent(false)
                setOtp('')
                setError('')
                setSuccess('')
              }}
              className="w-full text-black text-sm mt-2 hover:underline"
            >
              Use different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
} 