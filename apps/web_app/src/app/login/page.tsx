"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyOTP, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
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
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await login(email);

      if (result.success) {
        setShowOTPField(true);
        setSuccess("OTP sent to your email successfully!");
        setCountdown(60); // 60-second countdown
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred while sending OTP. Please try again.");
      console.error("Send OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Additional validation
    if (!email || !otp) {
      setError("Please enter both email and verification code.");
      return;
    }

    if (otp.length < 4) {
      setError("Please enter a complete verification code.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    console.log("Starting OTP verification...", {
      email,
      otp: otp.length,
      otpValue: otp,
    });

    try {
      const result = await verifyOTP(email, otp);
      console.log("OTP verification result:", result);

      if (result.success) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000); // Add a small delay to show success message
      } else {
        setError(result.message || "Verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("An error occurred during verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await login(email);

      if (result.success) {
        setSuccess("OTP sent again to your email!");
        setCountdown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
      console.error("Resend OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowOTPField(false);
    setOTP("");
    setError("");
    setSuccess("");
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="flex items-center px-6 py-4 bg-white border-b border-gray-100">
        <Link href="/">
          <div className="flex items-center cursor-pointer select-none">
            <span
              className="text-3xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent font-bold transition-transform duration-300 hover:scale-105"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              Project X
            </span>
          </div>
        </Link>
      </div>

      {/* Welcome Text with Enhanced Styling */}
      <div className="text-center mb-8 mt-12">
        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
          Welcome To Project X
        </div>
        <div className="text-gray-600 text-lg font-medium mt-3">
          Total Solution Of Admin Support
        </div>
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <form
          onSubmit={showOTPField ? handleVerifyOTP : handleSendOTP}
          className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
        >
          <div className="bg-gradient-to-b from-blue-300 to-white rounded-t-lg px-6 py-4 text-lg font-semibold text-blue-600 select-none drop-shadow-sm">
            {showOTPField ? "Verify OTP" : "Sign In"}
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 text-red-600 text-sm text-center font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 text-blue-600 text-sm text-center font-medium">
                {success}
              </div>
            )}

            {!showOTPField ? (
              <>
                <div className="mb-5 flex items-center border border-blue-200 rounded-lg px-4 py-3 bg-blue-50 focus-within:ring-2 focus-within:ring-blue-400 transition">
                  <span className="text-blue-300 mr-3 text-xl">
                    <i className="fa fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    className="w-full outline-none bg-transparent text-blue-700 placeholder-blue-400 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <div className="mb-5 text-sm text-blue-700 text-center font-medium">
                  Verification sent to: <strong>{email}</strong>
                  <br />
                  <div className="mt-3 p-4 bg-blue-100 border border-blue-300 rounded-lg text-xs text-left">
                    <strong>Check your email for:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      <li>A 6-digit verification code</li>
                    </ul>
                    <div className="mt-1 text-blue-700">
                      Enter the 6-digit code sent to your email to complete sign in.
                    </div>
                  </div>
                </div>
                <div className="mb-5 flex items-center border border-blue-200 rounded-lg px-4 py-3 bg-blue-50 focus-within:ring-2 focus-within:ring-blue-400 transition">
                  <span className="text-blue-300 mr-3 text-xl">
                    <i className="fa fa-lock"></i>
                  </span>
                  <input
                    type="text"
                    placeholder="Enter 6-digit verification code"
                    className="w-full outline-none bg-transparent text-center text-lg tracking-widest text-blue-700 font-semibold"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || otp.length < 4}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`text-sm ${
                      countdown > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:underline"
                    } font-medium`}
                    disabled={countdown > 0 || isLoading}
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-gray-500 hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Change Email
                  </button>
                </div>
              </>
            )}

            <div className="mt-6 text-center">
              <Link href="/" className="text-blue-600 hover:underline font-semibold">
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
