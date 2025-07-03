"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LazyAreaChart from "@/components/LazyAreaChart";
import LazyStatsGrid from "@/components/LazyStatsGrid";
import PropertyStatsOverview from "@/components/PropertyStatsOverview";
import { usePropertyStats } from "@/hooks/usePropertyStats";
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
  const { stats, loading, error, clearCache } = usePropertyStats();
  
  // State for AI components
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loadingAIData, setLoadingAIData] = useState(true);

  // Load properties for AI components with full pagination support
  useEffect(() => {
    const loadAllProperties = async () => {
      if (!user) return;
      
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
  }, [user]);

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

          {/* AI Tools Section */}
          <div className="mb-8">
            <div className="bg-slate-800/70 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">🤖</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                      AI-Powered Assistant Suite
                    </h2>
                    <p className="text-white/90 text-lg mt-1">Your intelligent real estate companion</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${loadingAIData ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                      <span className={`text-sm font-medium ${loadingAIData ? 'text-yellow-400' : 'text-green-400'}`}>
                        {loadingAIData ? 'Loading AI Data...' : '3 AI Tools Active'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats - simplified */}
                <div className="hidden lg:flex items-center gap-6">
                  <div className="text-center cursor-pointer">
                    <div className="text-2xl font-bold text-blue-400">
                      {loadingAIData ? (
                        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                        properties.length
                      )}
                    </div>
                    <div className="text-xs text-white/60">Properties Loaded</div>
                  </div>
                  <div className="text-center cursor-pointer">
                    <div className="text-2xl font-bold text-purple-400">3</div>
                    <div className="text-xs text-white/60">AI Models</div>
                  </div>
                  <div className="text-center cursor-pointer">
                    <div className="text-2xl font-bold text-green-400">
                      {loadingAIData ? '...' : '∞'}
                    </div>
                    <div className="text-xs text-white/60">Queries</div>
                  </div>
                  {!loadingAIData && (
                    <div className="text-center cursor-pointer">
                      <div className="text-2xl font-bold text-emerald-400">⚡</div>
                      <div className="text-xs text-white/60">Ready</div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Tools Stack - Vertical Layout */}
              <div className="space-y-6">
                {/* Property Search Tool */}
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-slate-900/90 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-lg">🔍</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">Smart Property Search</h3>
                      <p className="text-white/80 text-sm">Natural language property discovery</p>
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="w-full">
                    <AIPropertySearch />
                  </div>
                </div>

                {/* Sales Script Generator Tool */}
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-slate-900/90 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-lg">📝</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">Sales Script Generator</h3>
                      <p className="text-white/80 text-sm">AI-powered sales presentations</p>
                    </div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
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
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-slate-900/90 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-lg">🏠</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">Expert Mentor (Kaka)</h3>
                      <p className="text-white/80 text-sm">25+ years Pune real estate wisdom</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="w-full">
                    <RealEstateMentor />
                  </div>
                </div>
              </div>

              {/* Simplified Feature Highlights */}
              <div className="mt-8 pt-6 border-t border-white/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/90 text-sm">Natural Language Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-white/90 text-sm">Context-Aware Responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white/90 text-sm">Local Market Expertise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-white/90 text-sm">Real-time Property Data</span>
                  </div>
                </div>
              </div>

              {/* Simplified Usage Tips */}
              <div className="mt-6 p-4 bg-slate-700/50 border border-indigo-400/40 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo-300 text-sm">💡</span>
                  </div>
                  <div>
                    <h4 className="text-indigo-100 font-medium mb-1">Pro Tips for Best Results</h4>
                    <ul className="text-indigo-200/90 text-sm space-y-1">
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
