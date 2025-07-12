"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRealTimeUserStatus } from "@/hooks/useRealTimeUserStatus";

export default function UnverifiedPage() {
  const { user, logout, loading } = useAuth();
  const { currentUser, loading: userStatusLoading } = useRealTimeUserStatus();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use real-time user data when available, fallback to auth user
  const displayUser = currentUser || user;

  useEffect(() => {
    // Redirect if not authenticated or if user is verified
    if (!loading && !userStatusLoading && (!displayUser || displayUser.is_verified)) {
      router.push("/dashboard");
    }
  }, [loading, userStatusLoading, displayUser, router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading || userStatusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center relative">
        {/* 3D Background Elements - Mobile Optimized */}
        <div className="absolute inset-0 opacity-15 sm:opacity-20">
          <div className="float-animation absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-20 sm:top-40 right-16 sm:right-32 w-12 h-12 sm:w-24 sm:h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="float-animation absolute bottom-20 sm:bottom-40 left-20 sm:left-40 w-14 h-14 sm:w-28 sm:h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-6 sm:p-8 text-center mx-4">
          <div className="animate-spin w-12 h-12 sm:w-16 sm:h-16 border-2 sm:border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-3 sm:mb-4"></div>
          <p className="text-white/80 text-base sm:text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative font-sans">
      {/* 3D Background Elements - Mobile Optimized */}
      <div className="absolute inset-0 opacity-15 sm:opacity-20">
        <div className="float-animation absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-blue-500/20 rounded-full blur-sm"></div>
        <div className="float-animation absolute top-20 sm:top-40 right-16 sm:right-32 w-12 h-12 sm:w-24 sm:h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
        <div className="float-animation absolute bottom-20 sm:bottom-40 left-20 sm:left-40 w-14 h-14 sm:w-28 sm:h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        <div className="float-animation absolute top-40 sm:top-60 left-1/2 w-10 h-10 sm:w-20 sm:h-20 bg-yellow-500/20 rounded-full blur-sm" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="max-w-sm sm:max-w-lg w-full space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="card-hover-3d mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl lg:text-4xl">⏳</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-animate mb-3 sm:mb-4 px-2">
              Account Pending Verification
            </h1>
            <p className="text-white/70 text-base sm:text-lg px-2">
              Your account is currently under review
            </p>
          </div>

          {/* Main Content Card */}
          <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4 sm:p-6 lg:p-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-3 sm:mb-4">
                  Welcome to PropertyHub
                </h2>
                <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  Thank you for registering! Your account has been created as an <strong className="text-blue-300">Unverified Customer</strong>.
                  Our administrators will review your account shortly.
                </p>
              </div>

              {/* Account Status */}
              <div className="card-hover-3d backdrop-blur-sm bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="text-2xl sm:text-3xl">ℹ️</div>
                  <div className="w-full">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-300 mb-2 sm:mb-3">
                      Account Status
                    </h3>
                    <div className="space-y-2 text-white/80 text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                        <span>Role: {displayUser?.role || 'Unverified Customer'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                        <span>Group: {displayUser?.group || 'customers'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse flex-shrink-0"></span>
                        <span>Status: <span className="text-yellow-300">Pending Administrator Approval</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="card-hover-3d backdrop-blur-sm bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="text-2xl sm:text-3xl">🕐</div>
                  <div className="w-full">
                    <h3 className="text-base sm:text-lg font-semibold text-yellow-300 mb-2 sm:mb-3">
                      What happens next?
                    </h3>
                    <div className="space-y-2 text-white/80 text-sm sm:text-base">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>An administrator will review your account</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>You will be upgraded to &ldquo;Verified Customer&rdquo; status</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>You&apos;ll gain access to all platform features</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>You&apos;ll receive an email notification when approved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support & Logout */}
              <div className="text-center pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                <p className="text-white/60 text-xs sm:text-sm px-2">
                  Need help? Contact our support team.
                </p>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="btn-3d w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 text-sm sm:text-base"
                >
                  {isLoggingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                      Signing Out...
                    </span>
                  ) : (
                    "🚪 Sign Out"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/50 text-xs sm:text-sm">
              © 2024 PropertyHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}