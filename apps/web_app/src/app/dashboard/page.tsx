"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AreaWisePropertyChart from "@/components/AreaWisePropertyChart";

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

// PropertyStat component moved from PropertyStats.tsx
type PropertyStatProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  Link: string;
};

const PropertyStat = ({ label, value, icon, bgColor, textColor, Link: link }: PropertyStatProps) => {
  return (
    <Link href={link} className="block w-full">
      <div className={cn("flex items-center w-full h-26", bgColor)}>
        <div className="flex items-center p-2 pl-3 ">
          <div className={cn("text-white", textColor)}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col px-3 py-2">
          <span className="text-lg font-medium text-white">{label}</span>
          <span className="text-base font-bold text-white">{value}</span>
        </div>
      </div>
    </Link>
  );
};

// Inline implementation of PropertyStats component
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PropertyStats = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-between space-x-1 bg-white p-1 shadow-sm h-32", className)}>
      <div className="flex items-center justify-center px-2 w-full">
        <span className="text-xl font-medium text-gray-700">Active Property</span>
      </div>
      <PropertyStat
        label="Residential Rent"
        value="₹ 1,155+"
        icon={<HomeIcon />}
        bgColor="bg-[#1abc9c]"
        textColor="text-white"
        Link="/tableview"
      />
      
      <PropertyStat
        label="Residential Sell"
        value="₹ 16,513+"
        icon={<HomeIcon />}
        bgColor="bg-[#27ae60]"
        textColor="text-white"
        Link="/tableview"
      />
      
      <PropertyStat
        label="Commercial Rent"
        value="₹ 4,663+"
        icon={<BuildingIcon />}
        bgColor="bg-[#f39c12]"
        textColor="text-white"
        Link="/tableview"
      />
      
      <PropertyStat
        label="Commercial Sell"
        value="₹ 7,086+"
        icon={<BuildingIcon />}
        bgColor="bg-[#e74c3c]"
        textColor="text-white"
        Link="/tableview"
      />
      
      <PropertyStat
        label="Total Active"
        value="₹ 29,397+"
        icon={<GridIcon />}
        bgColor="bg-[#95a5a6]"
        textColor="text-white"
        Link="/tableview"
      />
    </div>
  );
};

// Main Dashboard page component
export default function DashboardPage() {
  const { user } = useAuth();

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
          
          {/* Enhanced Property Stats */}
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
                    <div className="text-2xl font-bold">₹ 1,155+</div>
                  </div>
                </div>
              </Link>
              
              <Link href="/tableview" className="group flex-1">
                <div className="btn-3d bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center space-x-3">
                  <HomeIcon className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-lg font-semibold">Residential Sell</div>
                    <div className="text-2xl font-bold">₹ 16,513+</div>
                  </div>
                </div>
              </Link>
              
              <Link href="/tableview" className="group flex-1">
                <div className="btn-3d bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center space-x-3">
                  <BuildingIcon className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-lg font-semibold">Commercial Rent</div>
                    <div className="text-2xl font-bold">₹ 4,663+</div>
                  </div>
                </div>
              </Link>
              
              <Link href="/tableview" className="group flex-1">
                <div className="btn-3d bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center space-x-3">
                  <BuildingIcon className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-lg font-semibold">Commercial Sell</div>
                    <div className="text-2xl font-bold">₹ 7,086+</div>
                  </div>
                </div>
              </Link>
              
              <Link href="/tableview" className="group flex-1">
                <div className="btn-3d bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white p-4 rounded-xl transition-all duration-300 flex items-center space-x-3">
                  <GridIcon className="group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-lg font-semibold">Total Active</div>
                    <div className="text-2xl font-bold">₹ 29,397+</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Enhanced KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-2xl p-6 pulse-glow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-green-400 text-sm font-medium">+12.5%</span>
              </div>
              <h3 className="text-white/90 text-sm font-medium mb-1">Total Properties</h3>
              <p className="text-2xl font-bold text-white">29,397+</p>
              <p className="text-xs text-white/60 mt-1">Active listings</p>
            </div>

            <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-green-400 text-sm font-medium">+8.2%</span>
              </div>
              <h3 className="text-white/90 text-sm font-medium mb-1">Total Value</h3>
              <p className="text-2xl font-bold text-white">₹2.4B+</p>
              <p className="text-xs text-white/60 mt-1">Market value</p>
            </div>

            <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-green-400 text-sm font-medium">+15.3%</span>
              </div>
              <h3 className="text-white/90 text-sm font-medium mb-1">Active Users</h3>
              <p className="text-2xl font-bold text-white">12,847</p>
              <p className="text-xs text-white/60 mt-1">This month</p>
            </div>

            <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-green-400 text-sm font-medium">+5.7%</span>
              </div>
              <h3 className="text-white/90 text-sm font-medium mb-1">Transactions</h3>
              <p className="text-2xl font-bold text-white">1,256</p>
              <p className="text-xs text-white/60 mt-1">This week</p>
            </div>
          </div>

          {/* Enhanced Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            
            <div className="group">
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-2xl p-6 text-center group-hover:bg-orange-500/20 transition-all duration-500 cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Market Analytics</h3>
                <p className="text-white/70 text-sm">Real-time market insights & trends</p>
              </div>
            </div>
          </div>

          {/* Market Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-gradient-animate mb-6">Market Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full pulse-glow"></div>
                    <span className="text-white font-medium">Residential Demand</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">+24%</div>
                    <div className="text-xs text-white/60">vs last month</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full pulse-glow"></div>
                    <span className="text-white font-medium">Commercial Growth</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">+18%</div>
                    <div className="text-xs text-white/60">vs last month</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-400 rounded-full pulse-glow"></div>
                    <span className="text-white font-medium">Price Appreciation</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-400">+12%</div>
                    <div className="text-xs text-white/60">vs last quarter</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gradient-animate mb-6">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="text-white text-sm font-medium">New listing in Gandhinagar</div>
                    <div className="text-white/60 text-xs">2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="text-white text-sm font-medium">Property sold in Bopal</div>
                    <div className="text-white/60 text-xs">4 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="text-white text-sm font-medium">Price update in Gota</div>
                    <div className="text-white/60 text-xs">6 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="text-white text-sm font-medium">New commercial space</div>
                    <div className="text-white/60 text-xs">8 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Area-wise Property Breakdown Chart */}
          <div className="mb-8">
            <AreaWisePropertyChart className="w-full" />
          </div>

          {/* Today's and Yesterday's Property Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Today's Property */}
            <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gradient-animate mb-6">
                Today&apos;s Properties
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Link href="/residential_rent_page" className="group">
                  <div className="btn-3d bg-gradient-to-br from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white p-4 rounded-xl transition-all duration-300 text-center group-hover:scale-105">
                    <div className="text-sm lg:text-base font-medium mb-2">Residential Rent</div>
                    <div className="text-xl lg:text-3xl font-bold">0</div>
                  </div>
                </Link>
                <div className="btn-3d bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-xl transition-all duration-300 text-center hover:scale-105 cursor-pointer">
                  <div className="text-sm lg:text-base font-medium mb-2">Residential Sell</div>
                  <div className="text-xl lg:text-3xl font-bold">0</div>
                </div>
                <div className="btn-3d bg-gradient-to-br from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white p-4 rounded-xl transition-all duration-300 text-center hover:scale-105 cursor-pointer">
                  <div className="text-sm lg:text-base font-medium mb-2">Commercial Rent</div>
                  <div className="text-xl lg:text-3xl font-bold">0</div>
                </div>
                <div className="btn-3d bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white p-4 rounded-xl transition-all duration-300 text-center hover:scale-105 cursor-pointer">
                  <div className="text-sm lg:text-base font-medium mb-2">Commercial Sell</div>
                  <div className="text-xl lg:text-3xl font-bold">0</div>
                </div>
                <div className="btn-3d bg-gradient-to-br from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white p-4 rounded-xl transition-all duration-300 text-center hover:scale-105 cursor-pointer">
                  <div className="text-sm lg:text-base font-medium mb-2">Total Property</div>
                  <div className="text-xl lg:text-3xl font-bold">0</div>
                </div>
              </div>
            </div>

            {/* Yesterday's Property */}
            <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gradient-animate mb-6">
                Yesterday&apos;s Properties
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="btn-3d bg-gradient-to-br from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white p-4 rounded-xl transition-all duration-300 text-center hover:scale-105 cursor-pointer">
                  <div className="text-sm lg:text-base font-medium mb-2">Residential Rent</div>
                  <div className="text-xl lg:text-3xl font-bold">37</div>
                </div>
                <div className="btn-3d bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-xl transition-all duration-300 text-center hover:scale-105 cursor-pointer">
                  <div className="text-sm lg:text-base font-medium mb-2">Residential Sell</div>
                  <div className="text-xl lg:text-3xl font-bold">55</div>
                </div>
                <div className="btn-3d bg-gradient-to-br from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white p-4 rounded-xl transition-all duration-300 text-center hover:scale-105 cursor-pointer">
                  <div className="text-sm lg:text-base font-medium mb-2">Commercial Rent</div>
                  <div className="text-xl lg:text-3xl font-bold">22</div>
                </div>
                <div className="btn-3d bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white p-4 rounded-xl transition-all duration-300 text-center hover:scale-105 cursor-pointer">
                  <div className="text-sm lg:text-base font-medium mb-2">Commercial Sell</div>
                  <div className="text-xl lg:text-3xl font-bold">6</div>
                </div>
                <div className="btn-3d bg-gradient-to-br from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white p-4 rounded-xl transition-all duration-300 text-center hover:scale-105 cursor-pointer">
                  <div className="text-sm lg:text-base font-medium mb-2">Total</div>
                  <div className="text-xl lg:text-3xl font-bold">120</div>
                </div>
              </div>
            </div>
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
