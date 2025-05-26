"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        setCountdown(60); // 60-second countdown
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
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const result = await verifyOTP(email, otp);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        router.push('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
      console.error('Verify OTP error:', err);
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
        setSuccess('OTP sent again to your email!');
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

  const resetForm = () => {
    setShowOTPField(false);
    setOTP('');
    setError('');
    setSuccess('');
    setCountdown(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ededed]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1793a6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ededed]">
      {/* Header */}
      <div className="flex items-center px-6 py-3 shadow bg-white">
        <Link href="/">
          <div className="flex items-center">
            <Image src="/favicon.png" alt="Techno Property Solution" width={40} height={40} className="h-10 mr-3" />
            <span className="text-3xl text-[#1793a6] font-semibold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Techno Property Solution
            </span>
          </div>
        </Link>
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-6">
          <div className="text-[#1793a6] text-xl font-semibold">Welcome To Clear Deals Solution</div>
          <div className="text-[#1793a6] text-lg">Total Solution Of Admin Support</div>
        </div>
        <form
          onSubmit={showOTPField ? handleVerifyOTP : handleSendOTP}
          className="bg-white rounded shadow-lg w-full max-w-md"
        >
          <div className="bg-gradient-to-b from-[#b6e0ef] to-white rounded-t px-6 py-3 text-lg font-semibold text-[#1793a6]">
            {showOTPField ? 'Verify OTP' : 'Sign In'}
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 text-green-500 text-sm text-center">
                {success}
              </div>
            )}
            
            {!showOTPField ? (
              <>
                <div className="mb-4 flex items-center border rounded px-3 py-2 bg-[#f7f7f7]">
                  <span className="text-gray-400 mr-2">
                    <i className="fa fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    className="w-full outline-none bg-transparent"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1793a6] text-white py-2 rounded font-semibold hover:bg-[#12788a] transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600 text-center">
                  Verification sent to: <strong>{email}</strong>
                  <br />
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                    <strong>Check your email for:</strong>
                    <ul className="mt-1 text-left">
                      <li>• A 6-digit verification code</li>
                    </ul>
                    <div className="mt-1 text-blue-600">
                      Enter the 6-digit code sent to your email to complete sign in.
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex items-center border rounded px-3 py-2 bg-[#f7f7f7]">
                  <span className="text-gray-400 mr-2">
                    <i className="fa fa-lock"></i>
                  </span>
                  <input
                    type="text"
                    placeholder="Enter 6-digit verification code"
                    className="w-full outline-none bg-transparent text-center text-lg tracking-widest"
                    value={otp}
                    onChange={e => {
                      // Only allow digits and limit to 6 characters
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOTP(value);
                    }}
                    maxLength={6}
                    disabled={isLoading}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1793a6] text-white py-2 rounded font-semibold hover:bg-[#12788a] transition disabled:opacity-50"
                  disabled={isLoading || otp.length < 4}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`text-sm ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#1793a6] hover:underline'}`}
                    disabled={countdown > 0 || isLoading}
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
                
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-gray-500 hover:underline"
                    disabled={isLoading}
                  >
                    Change Email
                  </button>
                </div>
              </>
            )}
            
            <div className="mt-4 text-center">
              <Link href="/" className="text-[#1793a6] hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="bg-[#555] text-white text-sm py-3 px-4 flex flex-col md:flex-row justify-between items-center">
        <span className="mb-2 md:mb-0">Terms &amp; Condition</span>
        <div className="flex items-center space-x-4">
          <span>Customer Care</span>
          <span>📞 +91-7984071224</span>
          <span>📞 +91-7046327745</span>
          <span>📞 079-40054959</span>
        </div>
      </footer>
    </div>
  );
}