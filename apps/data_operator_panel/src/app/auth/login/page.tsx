"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyOTP, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const result = await login(email);
      
      if (result.success) {
        setShowOTPField(true);
        setSuccess('OTP sent to your email successfully!');
        setCountdown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred while sending OTP. Please try again.');
      console.error('Send OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !otp) {
      setError('Please enter both email and verification code.');
      return;
    }
    
    if (otp.length < 4) {
      setError('Please enter a complete verification code.');
      return;
    }
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    console.log('Starting OTP verification...', { email, otp: otp.length, otpValue: otp });
    
    try {
      const result = await verifyOTP(email, otp);
      console.log('OTP verification result:', result);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError(result.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const result = await login(email);
      
      if (result.success) {
        setSuccess('New OTP sent to your email!');
        setCountdown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Data Operator Panel
        </h2>
        <p className="text-center text-black font-semibold mb-6">
          Welcome back you&apos;ve<br />been missed!
        </p>

        {/* Error and Success Messages */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="w-full mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {success}
          </div>
        )}

        {!showOTPField ? (
          // Email Form
          <form onSubmit={handleSendOTP} className="w-full">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full mb-4 px-4 py-3 border border-blue-400 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            />
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md font-semibold text-lg hover:bg-blue-700 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          // OTP Form
          <form onSubmit={handleVerifyOTP} className="w-full">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter 6-digit verification code"
                value={otp}
                onChange={e => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-blue-400 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black text-center text-lg tracking-widest"
              />
              <p className="text-sm text-gray-600 mt-2 text-center">
                Code sent to: {email}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 4}
              className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md font-semibold text-lg hover:bg-blue-700 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend code in {countdown} seconds
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  Resend verification code
                </button>
              )}
            </div>

            {/* Back to email */}
            <button
              type="button"
              onClick={() => {
                setShowOTPField(false);
                setOTP('');
                setError('');
                setSuccess('');
              }}
              className="w-full mt-4 text-gray-600 text-sm hover:underline"
            >
              ← Change email address
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 