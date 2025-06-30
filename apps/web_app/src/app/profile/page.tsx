// Profile page with protected route authentication
// Features:
// - Protected route wrapper with authentication check
// - User metadata display from AuthContext (ID, role, email, creation date)
// - Editable profile form with placeholder data
// - Logout functionality with loading state
// - Payment history section (static data)
// - Loading and error states for better UX

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "../../lib/supabase";

function ProfilePageContent() {
  const router = useRouter();
  const { user, loading, logout, refreshSession } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Setup real-time subscription to monitor user verification status changes
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel(`user_verification_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'auth',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        () => {
          // Refresh the auth session to get latest user data
          if (refreshSession) {
            refreshSession();
          } else {
            // If refreshSession is not available, force a page reload
            window.location.reload();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, refreshSession]);



  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="float-animation absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
          <div className="float-animation absolute bottom-32 left-32 w-24 h-24 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="pulse-glow w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-spin border-4 border-transparent"></div>
          <p className="text-white/80 text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not found (shouldn't happen with ProtectedRoute, but good fallback)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="float-animation absolute top-10 left-10 w-20 h-20 bg-red-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute bottom-10 right-10 w-16 h-16 bg-pink-500/20 rounded-full blur-sm" style={{animationDelay: '0.5s'}}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="text-red-400 text-2xl mb-6">⚠️ Unable to load user profile</div>
          <button 
            onClick={() => router.push('/login')}
            className="btn-3d bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl transition-all duration-300"
          >
            🔐 Return to Login
          </button>
        </div>
      </div>
    );
  }


  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative">
      {/* Enhanced 3D Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="float-animation absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-sm"></div>
        <div className="float-animation absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
        <div className="float-animation absolute bottom-40 left-40 w-28 h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        <div className="float-animation absolute top-60 left-1/3 w-20 h-20 bg-emerald-500/20 rounded-full blur-sm" style={{animationDelay: '3s'}}></div>
        <div className="float-animation absolute bottom-20 right-20 w-36 h-36 bg-pink-500/15 rounded-full blur-sm" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-overlay opacity-10"></div>
      
      <div className="relative z-10 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <h2 className="text-5xl lg:text-6xl font-bold text-gradient-animate mb-6">
              👤 Your Profile
            </h2>
            <p className="text-white/70 text-xl">Manage your account information and settings</p>
          </div>
          
          {/* Main Profile Card */}
          <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              {/* Enhanced User Avatar and Basic Info */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 via-cyan-400 to-purple-400 rounded-full flex items-center justify-center pulse-glow">
                    <span className="text-white text-4xl font-bold">{user.email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white/20 animate-pulse"></div>
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-white mb-3">{user.email}</h3>
                  <div className="space-y-3">
                    <span className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-lg font-semibold">
                      👤 {user.role}
                    </span>
                    <div className="flex items-center justify-center lg:justify-start space-x-2 text-white/70">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>Active now</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`btn-3d bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl transition-all duration-300 ${
                  isLoggingOut ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoggingOut ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full mr-3"></div>
                    Logging out...
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🚪</span>
                    <span className="text-lg font-semibold">Logout</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-3">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <span className="text-blue-400 text-2xl">🆔</span>
                </div>
                <span className="font-semibold text-white">User ID</span>
              </div>
              <span className="text-white/90 font-mono text-sm break-all">{user.id}</span>
            </div>
            
            <div className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-3">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <span className="text-green-400 text-2xl">✉️</span>
                </div>
                <span className="font-semibold text-white">Email</span>
              </div>
              <span className="text-white/90">{user.email}</span>
            </div>
            
            <div className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-3">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <span className="text-purple-400 text-2xl">👔</span>
                </div>
                <span className="font-semibold text-white">Role</span>
              </div>
              <span className="text-white/90">{user.role}</span>
            </div>
            
            <div className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-3">
                <div className="p-3 bg-cyan-500/20 rounded-full">
                  <span className="text-cyan-400 text-2xl">📅</span>
                </div>
                <span className="font-semibold text-white">Joined</span>
              </div>
              <span className="text-white/90">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}