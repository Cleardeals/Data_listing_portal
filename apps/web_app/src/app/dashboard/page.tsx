"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LazyAreaChart from "@/components/LazyAreaChart";
import LazyStatsGrid from "@/components/LazyStatsGrid";
import PropertyStatsOverview from "@/components/PropertyStatsOverview";
import { usePropertyStats } from "@/hooks/usePropertyStats";
import { useRealTimeUserStatus } from "@/hooks/useRealTimeUserStatus";
import AISalesScriptGenerator from "@/components/AISalesScriptGenerator";
import AIPropertySearch from "@/components/AIPropertySearch";
import RealEstateMentor from "@/components/RealEstateMentor";
import { useState, useEffect } from "react";
import { PropertyData } from "@/lib/dummyProperties";
import { supabase } from "@/lib/supabase";
import { SalesScriptResponse } from "@/types/aiTypes";

// Main Dashboard page component
export default function DashboardPage() {
  const { user } = useAuth();
  const { currentUser } = useRealTimeUserStatus();
  const { stats, loading, error, clearCache } = usePropertyStats();
  
  // Use real-time user data when available, fallback to auth user
  const displayUser = currentUser || user;
  
  // State for AI components
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loadingAIData, setLoadingAIData] = useState(true);

  // Load properties for AI components with full pagination support
  useEffect(() => {
    const loadAllProperties = async () => {
      if (!displayUser) return;
      
      setLoadingAIData(true);
      try {
        const allProperties: PropertyData[] = [];
        let from = 0;
        const batchSize = 1000; // Supabase default limit
        let hasMoreData = true;

        while (hasMoreData) {
          const { data, error } = await supabase
            .from('propertydata')
            .select('*')
            .order('serial_number', { ascending: false })
            .range(from, from + batchSize - 1);

          if (error) throw error;
          
          if (data && data.length > 0) {
            allProperties.push(...data);
            from += batchSize;
            
            // If we got less than batchSize, we've reached the end
            if (data.length < batchSize) {
              hasMoreData = false;
            }
          } else {
            hasMoreData = false;
          }
        }

        setProperties(allProperties);
        console.log(`Loaded ${allProperties.length} properties for AI tools`);
      } catch (error) {
        console.error('Error loading properties for AI:', error);
        // Fallback to basic fetch if pagination fails
        try {
          const { data, error: fallbackError } = await supabase
            .from('propertydata')
            .select('*')
            .order('serial_number', { ascending: false });
          
          if (fallbackError) throw fallbackError;
          setProperties(data || []);
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
      } finally {
        setLoadingAIData(false);
      }
    };

    loadAllProperties();
  }, [displayUser]);

  // Add error display for property stats
  const ErrorDisplay = () => (
    <div className="card-hover-3d backdrop-blur-3d bg-red-500/10 border border-red-400/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-center">
      <div className="text-red-300 mb-1 sm:mb-2 text-sm sm:text-base">⚠️ Error Loading Stats</div>
      <p className="text-xs sm:text-sm text-red-200 mb-2 sm:mb-3">{error}</p>
      <button 
        onClick={() => clearCache()}
        className="btn-3d bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm"
      >
        Retry
      </button>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative">
        {/* 3D Background Elements - Mobile Optimized */}
        <div className="absolute inset-0 opacity-15 sm:opacity-20">
          <div className="float-animation absolute top-10 sm:top-20 left-10 sm:left-20 w-16 h-16 sm:w-32 sm:h-32 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-20 sm:top-40 right-16 sm:right-32 w-12 h-12 sm:w-24 sm:h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="float-animation absolute bottom-20 sm:bottom-40 left-20 sm:left-40 w-14 h-14 sm:w-28 sm:h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 flex flex-col w-full gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Error Display */}
          {error && <ErrorDisplay />}
          
          {/* Welcome Message */}
          {displayUser && (
            <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center pulse-glow flex-shrink-0">
                  <span className="text-white text-lg sm:text-2xl font-bold">{(displayUser?.email || '').charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient-animate mb-1">
                    Welcome back, {(displayUser?.email || '').split('@')[0]}!
                  </h1>
                  <p className="text-white/70 text-sm sm:text-base lg:text-lg">Role: <span className="text-cyan-400 font-semibold">{displayUser?.role || 'Unknown'}</span></p>
                </div>
              </div>
            </div>
          )}
          
          {/* Property Stats Overview */}
          <PropertyStatsOverview stats={stats} loading={loading} />

          {/* Enhanced KPI Summary Cards */}
          <LazyStatsGrid className="mb-6 sm:mb-8" />

          {/* Enhanced Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 max-w-none">
            <div className="group">
              <Link href="/tableview" className="block">
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center group-hover:bg-green-500/20 transition-all duration-500">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Property Database</h3>
                  <p className="text-white/70 text-xs sm:text-sm">Complete property listings with advanced filters & search</p>
                </div>
              </Link>
            </div>
            
            <div className="group">
              <Link href="/profile" className="block">
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center group-hover:bg-purple-500/20 transition-all duration-500">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Profile Hub</h3>
                  <p className="text-white/70 text-xs sm:text-sm">Manage account & preferences</p>
                </div>
              </Link>
            </div>
          </div>

          {/* AI Tools Section */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-slate-800/70 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 shadow-2xl mx-3 sm:mx-0">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-base sm:text-lg lg:text-2xl">🤖</span>
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-center sm:text-left flex-1 sm:flex-initial">
                    <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                      AI-Powered Assistant Suite
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm lg:text-base xl:text-lg mt-1">Your intelligent real estate companion</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${loadingAIData ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                      <span className={`text-xs sm:text-sm font-medium ${loadingAIData ? 'text-yellow-400' : 'text-green-400'}`}>
                        {loadingAIData ? 'Loading AI Data...' : '3 AI Tools Active'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats - Mobile Optimized */}
                <div className="flex sm:hidden items-center gap-3 sm:gap-4 w-full justify-center">
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold text-blue-400">
                      {loadingAIData ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                        properties.length
                      )}
                    </div>
                    <div className="text-xs text-white/60">Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold text-purple-400">3</div>
                    <div className="text-xs text-white/60">AI Models</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold text-green-400">
                      {loadingAIData ? '...' : '∞'}
                    </div>
                    <div className="text-xs text-white/60">Queries</div>
                  </div>
                </div>
                
                {/* Desktop Stats */}
                <div className="hidden sm:flex lg:flex items-center gap-3 sm:gap-4 lg:gap-6">
                  <div className="text-center cursor-pointer">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">
                      {loadingAIData ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                        properties.length
                      )}
                    </div>
                    <div className="text-xs text-white/60">Properties Loaded</div>
                  </div>
                  <div className="text-center cursor-pointer">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400">3</div>
                    <div className="text-xs text-white/60">AI Models</div>
                  </div>
                  <div className="text-center cursor-pointer">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">
                      {loadingAIData ? '...' : '∞'}
                    </div>
                    <div className="text-xs text-white/60">Queries</div>
                  </div>
                  {!loadingAIData && (
                    <div className="text-center cursor-pointer">
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-400">⚡</div>
                      <div className="text-xs text-white/60">Ready</div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Tools Stack - Responsive Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
                {/* Property Search Tool */}
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-900/90 transition-all duration-200 group">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                      <span className="text-white text-sm sm:text-base lg:text-lg">🔍</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white">Smart Property Search</h3>
                      <p className="text-white/80 text-xs sm:text-sm">Natural language property discovery</p>
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full pulse-glow"></div>
                  </div>
                  <div className="w-full">
                    <AIPropertySearch />
                  </div>
                </div>

                {/* Sales Script Generator Tool */}
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-900/90 transition-all duration-200 group">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                      <span className="text-white text-sm sm:text-base lg:text-lg">📝</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white">Sales Script Generator</h3>
                      <p className="text-white/80 text-xs sm:text-sm">AI-powered sales presentations</p>
                    </div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full pulse-glow"></div>
                  </div>
                  <div className="w-full">
                    <AISalesScriptGenerator
                      properties={properties}
                      onScriptGenerated={(scripts: SalesScriptResponse[]) => {
                        console.log('Generated scripts:', scripts);
                      }}
                    />
                  </div>
                </div>

                {/* Real Estate Mentor Tool */}
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-slate-900/90 transition-all duration-200 group">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                      <span className="text-white text-sm sm:text-base lg:text-lg">🏠</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white">Expert Mentor (Kaka)</h3>
                      <p className="text-white/80 text-xs sm:text-sm">25+ years Pune real estate wisdom</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
                  </div>
                  <div className="w-full">
                    <RealEstateMentor />
                  </div>
                </div>
              </div>

              {/* Feature Highlights - Mobile Optimized */}
              <div className="mt-4 sm:mt-6 lg:mt-8 pt-3 sm:pt-4 lg:pt-6 border-t border-white/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/90 text-xs sm:text-sm">Natural Language Processing</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-white/90 text-xs sm:text-sm">Context-Aware Responses</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white/90 text-xs sm:text-sm">Local Market Expertise</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-white/90 text-xs sm:text-sm">Real-time Property Data</span>
                  </div>
                </div>
              </div>

              {/* Usage Tips - Mobile Optimized */}
              <div className="mt-3 sm:mt-4 lg:mt-6 p-3 sm:p-4 bg-slate-700/50 border border-indigo-400/40 rounded-lg">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-300 text-xs sm:text-sm">💡</span>
                  </div>
                  <div>
                    <h4 className="text-indigo-100 font-medium mb-1 text-sm sm:text-base">Pro Tips for Best Results</h4>
                    <ul className="text-indigo-200/90 text-xs sm:text-sm space-y-1">
                      <li>• Use specific locations and requirements for property search</li>
                      <li>• Select multiple properties for comprehensive sales scripts</li>
                      <li>• Ask Kaka about local regulations, market trends, and negotiation tactics</li>
                    </ul>
                  </div>
                </div>
              </div>
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
