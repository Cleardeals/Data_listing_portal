"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LazyAreaChart from "@/components/LazyAreaChart";
import LazyStatsGrid from "@/components/LazyStatsGrid";
import { usePropertyStats } from "@/hooks/usePropertyStats";

// Icon components moved from PropertyStats.tsx
const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("w-7 h-7", className)}>
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z" />
  </svg>
);

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("w-7 h-7", className)}>
    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15a.75.75 0 000-1.5h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
  </svg>
);

const GridIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("w-7 h-7", className)}>
    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
  </svg>
);

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
          
          {/* Enhanced Property Stats Overview */}
          <div className="card-hover-3d backdrop-blur-3d bg-white/5 border border-white/20 rounded-2xl p-2 mb-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center justify-center px-4 py-8 rounded-xl backdrop-blur-sm bg-white/10">
                <span className="text-2xl font-bold text-gradient-animate">Active Properties</span>
              </div>
              
              <Link href="/tableview" className="group flex-1">
                <div className="btn-3d bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center space-x-3">
                  <HomeIcon className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-lg font-semibold">Residential Rent</div>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.residential_rent.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/tableview" className="group flex-1">
                <div className="btn-3d bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center space-x-3">
                  <HomeIcon className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-lg font-semibold">Residential Sell</div>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.residential_sell.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/tableview" className="group flex-1">
                <div className="btn-3d bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center space-x-3">
                  <BuildingIcon className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-lg font-semibold">Commercial Rent</div>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.commercial_rent.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/tableview" className="group flex-1">
                <div className="btn-3d bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center space-x-3">
                  <BuildingIcon className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-lg font-semibold">Commercial Sell</div>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.commercial_sell.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link href="/tableview" className="group flex-1">
                <div className="btn-3d bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center space-x-3">
                  <GridIcon className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-lg font-semibold">Total Active</div>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Enhanced KPI Summary Cards */}
          <LazyStatsGrid className="mb-8" />

          {/* Enhanced Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 max-w-none px-2">
            <div className="group">
              <Link href="/search" className="block">
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-2xl p-6 text-center group-hover:bg-blue-500/20 transition-all duration-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Advanced Search</h3>
                  <p className="text-white/70 text-sm">Find your perfect property with smart filters</p>
                </div>
              </Link>
            </div>
            
            <div className="group">
              <Link href="/tableview" className="block">
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6 text-center group-hover:bg-green-500/20 transition-all duration-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Data Explorer</h3>
                  <p className="text-white/70 text-sm">Complete property listings & analytics</p>
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
