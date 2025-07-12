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
    
    // Additional validation
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
    
    try {
      const result = await verifyOTP(email, otp);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000); // Add a small delay to show success message
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 sm:opacity-30">
          <div className="float-animation absolute top-4 left-4 sm:top-10 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-20 right-8 sm:top-40 sm:right-20 w-16 h-16 sm:w-32 sm:h-32 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
          <div className="float-animation absolute bottom-16 left-8 sm:bottom-32 sm:left-32 w-14 h-14 sm:w-24 sm:h-24 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <div className="pulse-glow w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-spin border-2 sm:border-4 border-transparent"></div>
          <div className="text-white/80 text-base sm:text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="absolute inset-0 opacity-20 sm:opacity-30">
          <div className="float-animation absolute top-4 left-4 sm:top-10 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-20 right-8 sm:top-40 sm:right-20 w-16 h-16 sm:w-32 sm:h-32 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
          <div className="float-animation absolute bottom-16 left-8 sm:bottom-32 sm:left-32 w-14 h-14 sm:w-24 sm:h-24 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="float-animation absolute bottom-4 right-4 sm:bottom-10 sm:right-10 w-8 h-8 sm:w-16 sm:h-16 bg-pink-500/20 rounded-full blur-sm" style={{animationDelay: '0.5s'}}></div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-3d bg-white/10 border-b border-white/20">
        <Link href="/" className="group">
          <div className="flex items-center">
            <div className="relative">
              <Image src="/globe.svg" alt="PropertyHub" width={32} height={32} className="h-8 sm:h-10 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <span className="text-xl sm:text-2xl lg:text-3xl bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold animate-pulse" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              PropertyHub
            </span>
          </div>
        </Link>
      </div>

      {/* Centered Card */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-gradient-animate text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
            Welcome To PropertyHub
          </div>
          <div className="text-white/80 text-base sm:text-lg lg:text-xl px-2">
            LOGIN as a Customer to explore properties
          </div>
        </div>
        
        <form
          onSubmit={showOTPField ? handleVerifyOTP : handleSendOTP}
          className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/20">
            <h2 className="text-lg sm:text-xl font-bold text-white text-center">
              {showOTPField ? 'Verify OTP' : 'Sign In'}
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {error && (
              <div className="text-red-400 text-xs sm:text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-400 text-xs sm:text-sm text-center bg-green-500/10 border border-green-500/20 rounded-lg px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-sm">
                {success}
              </div>
            )}
            
            {!showOTPField ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3">
                    <span className="text-white/60 mr-2 sm:mr-3 text-sm sm:text-base">
                      📧
                    </span>
                    <input
                      type="email"
                      placeholder="Enter Email Address"
                      className="w-full outline-none bg-transparent text-white placeholder-white/50 text-sm sm:text-base"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-3d w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center text-white/80 text-xs sm:text-sm">
                  <div className="mb-2 sm:mb-3">
                    Verification sent to: <span className="text-cyan-400 font-semibold break-all">{email}</span>
                  </div>
                  <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
                    <div className="font-semibold text-blue-300 mb-1 sm:mb-2 text-xs sm:text-sm">Check your email for:</div>
                    <ul className="text-left text-white/70 space-y-1 text-xs sm:text-sm">
                      <li>• A 6-digit verification code</li>
                    </ul>
                    <div className="mt-1 sm:mt-2 text-cyan-300 text-xs">
                      Enter the 6-digit code sent to your email to complete sign in.
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3">
                    <span className="text-white/60 mr-2 sm:mr-3 text-sm sm:text-base">
                      🔒
                    </span>
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="w-full outline-none bg-transparent text-white placeholder-white/50 text-center text-base sm:text-lg tracking-widest font-mono"
                      value={otp}
                      onChange={e => {
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
                </div>
                
                <button
                  type="submit"
                  className="btn-3d w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  disabled={isLoading || otp.length < 4}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Code'
                  )}
                </button>
                
                <div className="flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`text-xs sm:text-sm transition-colors ${
                      countdown > 0 
                        ? 'text-white/40 cursor-not-allowed' 
                        : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                    disabled={countdown > 0 || isLoading}
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs sm:text-sm text-white/60 hover:text-white/80 transition-colors"
                    disabled={isLoading}
                  >
                    Change Email
                  </button>
                </div>
              </div>
            )}
            
            <div className="text-center pt-3 sm:pt-4 border-t border-white/20">
              <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors text-xs sm:text-sm">
                ← Back to Home
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-3d bg-black/30 border-t border-white/20 text-white text-xs sm:text-sm py-3 sm:py-4 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <span className="text-white/80">Terms &amp; Condition</span>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 sm:gap-4 text-white/70">
            <span className="font-medium">Customer Care</span>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-center">
              <span className="flex items-center justify-center">📞 +91-7984071224</span>
              <span className="flex items-center justify-center">📞 +91-7046327745</span>
              <span className="flex items-center justify-center">📞 079-40054959</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}