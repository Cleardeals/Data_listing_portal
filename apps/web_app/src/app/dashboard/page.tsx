"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LazyAreaChart from "@/components/LazyAreaChart";
import LazyStatsGrid from "@/components/LazyStatsGrid";
import PropertyStatsOverview from "@/components/PropertyStatsOverview";
import { usePropertyStats } from "@/hooks/usePropertyStats";

// Main Dashboard page component
export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading, error, clearCache } = usePropertyStats();

  // Add error display for property stats
  const ErrorDisplay = () => (
    <div className="card-hover-3d backdrop-blur-3d bg-red-500/10 border border-red-400/30 rounded-2xl p-4 mb-6 text-center">
      <div className="text-red-300 mb-2">⚠️ Error Loading Stats</div>
      <p className="text-sm text-red-200 mb-3">{error}</p>
      <button 
        onClick={() => clearCache()}
        className="btn-3d bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm"
      >
        Retry
      </button>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="float-animation absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="float-animation absolute bottom-40 left-40 w-28 h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 flex flex-col w-full gap-6 p-6">
          {/* Error Display */}
          {error && <ErrorDisplay />}
          
          {/* Welcome Message */}
          {user && (
            <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center pulse-glow">
                  <span className="text-white text-2xl font-bold">{user.email.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient-animate">
                    Welcome back, {user.email}!
                  </h1>
                  <p className="text-white/70 text-lg">Role: <span className="text-cyan-400 font-semibold">{user.role}</span></p>
                </div>
              </div>
            </div>
          )}
          
          {/* Property Stats Overview */}
          <PropertyStatsOverview stats={stats} loading={loading} />

          {/* Enhanced KPI Summary Cards */}
          <LazyStatsGrid className="mb-8" />

          {/* Enhanced Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 max-w-none px-2">
            <div className="group">
              <Link href="/tableview" className="block">
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6 text-center group-hover:bg-green-500/20 transition-all duration-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Property Database</h3>
                  <p className="text-white/70 text-sm">Complete property listings with advanced filters & search</p>
                </div>
              </Link>
            </div>
            
            <div className="group">
              <Link href="/profile" className="block">
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-6 text-center group-hover:bg-purple-500/20 transition-all duration-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Profile Hub</h3>
                  <p className="text-white/70 text-sm">Manage account & preferences</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Area-wise Property Breakdown Chart */}
          <div className="mb-4">
            <LazyAreaChart className="w-full" />
          </div>

          {/* Footer with Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-full" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.15) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
