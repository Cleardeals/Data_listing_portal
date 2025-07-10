"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeVerification } from "@/hooks/useRealtimeVerification";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UnverifiedPage() {
  const { user, logout, loading } = useAuth();
  const { verificationStatus, isConnected } = useRealtimeVerification(user?.id);
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [lastRedirectTime, setLastRedirectTime] = useState(0);

  useEffect(() => {
    // Reset redirect flag when pathname changes
    setHasRedirected(false);
  }, []);

  useEffect(() => {
    // Don't do anything if still loading or already redirected recently
    const now = Date.now();
    if (loading || hasRedirected || (now - lastRedirectTime < 2000)) {
      console.log('🔄 [UnverifiedPage] Loading, already redirected, or too soon since last redirect');
      return;
    }

    // Redirect if not authenticated
    if (!user) {
      console.log('🔄 [UnverifiedPage] No user found, redirecting to login...');
      setHasRedirected(true);
      setLastRedirectTime(now);
      router.push("/login");
      return;
    }

    console.log('🔍 [UnverifiedPage] Checking user status:', {
      email: user.email,
      group: user.group,
      role: user.role,
      is_verified: user.is_verified,
      realtimeVerified: verificationStatus?.is_verified,
      realtimeRole: verificationStatus?.role
    });

    // Internal users should not be on this page
    if (user.group === 'internalusers') {
      console.log('🔄 [UnverifiedPage] Internal user found, redirecting to dashboard...');
      setHasRedirected(true);
      setLastRedirectTime(now);
      router.push("/dashboard");
      return;
    }

    // For customer users, check if they are now verified
    if (user.group === 'customers') {
      // Get the current verification status (prioritize real-time updates if available)
      const currentIsVerified = verificationStatus?.is_verified ?? user.is_verified;
      const currentRole = verificationStatus?.role ?? user.role;
      
      // Only redirect if BOTH conditions are met: is_verified=true AND role='Verified Customer'
      const isFullyVerified = currentIsVerified && currentRole === 'Verified Customer';
      
      if (isFullyVerified) {
        console.log('🎉 [UnverifiedPage] Customer fully verified! Redirecting to dashboard...', {
          userVerified: user.is_verified,
          userRole: user.role,
          realtimeVerified: verificationStatus?.is_verified,
          realtimeRole: verificationStatus?.role
        });
        setHasRedirected(true);
        setLastRedirectTime(now);
        router.push("/dashboard");
        return;
      }
      
      // If not fully verified, stay on this page
      console.log('ℹ️ [UnverifiedPage] Customer still not fully verified, staying on page', {
        is_verified: currentIsVerified,
        role: currentRole,
        needsVerified: !currentIsVerified,
        needsRole: currentRole !== 'Verified Customer'
      });
    }
  }, [loading, user, verificationStatus?.is_verified, verificationStatus?.role, router, hasRedirected, lastRedirectTime]);

  const handleLogout = async () => {
    setHasRedirected(true); // Prevent any more navigation logic
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center relative">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="float-animation absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="float-animation absolute bottom-40 left-40 w-28 h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-8 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative font-sans">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="float-animation absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-sm"></div>
        <div className="float-animation absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
        <div className="float-animation absolute bottom-40 left-40 w-28 h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        <div className="float-animation absolute top-60 left-1/2 w-20 h-20 bg-yellow-500/20 rounded-full blur-sm" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-lg w-full space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="card-hover-3d mx-auto h-24 w-24 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">⏳</span>
            </div>
            <h1 className="text-4xl font-bold text-gradient-animate mb-4">
              Account Pending Verification
            </h1>
            <p className="text-white/70 text-lg">
              Your account is currently under review
            </p>
            
            {/* Real-time Connection Status */}
            <div className="mt-4 flex justify-center items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-white/60">
                {isConnected ? 'Real-time updates active' : 'Checking for updates...'}
              </span>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Welcome to PropertyHub
                </h2>
                <p className="text-white/80 mb-6">
                  Thank you for registering! Your account has been created as an <strong className="text-blue-300">Unverified Customer</strong>.
                  Our administrators will review your account shortly.
                </p>
              </div>

              {/* Account Status */}
              <div className="card-hover-3d backdrop-blur-sm bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">ℹ️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-3">
                      Account Status
                    </h3>
                    <div className="space-y-2 text-white/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>Role: {verificationStatus?.role || user?.role || 'Unverified Customer'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>Group: {verificationStatus?.group || user?.group || 'customers'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        <span>Status: <span className="text-yellow-300">Pending Administrator Approval</span></span>
                      </div>
                      {verificationStatus && (
                        <div className="flex items-center gap-2 text-green-300">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          <span>🔄 Real-time monitoring active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="card-hover-3d backdrop-blur-sm bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🕐</div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-3">
                      What happens next?
                    </h3>
                    <div className="space-y-2 text-white/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span>An administrator will review your account</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span>You will be upgraded to &ldquo;Verified Customer&rdquo; status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span>You&apos;ll gain access to all platform features</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                        <span>You&apos;ll receive an email notification when approved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support & Logout */}
              <div className="text-center pt-4 space-y-4">
                <p className="text-white/60 text-sm">
                  Need help? Contact our support team.
                </p>
                <button
                  onClick={handleLogout}
                  className="btn-3d w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/50 text-sm">
              © 2024 PropertyHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}