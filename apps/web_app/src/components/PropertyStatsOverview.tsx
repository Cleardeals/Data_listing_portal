"use client";

import React from 'react';
import Link from 'next/link';

interface PropertyStats {
  total: number;
  residential_rent: number;
  residential_sell: number;
  commercial_rent: number;
  commercial_sell: number;
}

interface PropertyStatsOverviewProps {
  stats: PropertyStats;
  loading: boolean;
}

function PropertyStatsOverview({ stats, loading }: PropertyStatsOverviewProps) {
  if (loading) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8 px-4 sm:px-0">
      {/* Total Properties — not clickable */}
      <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-full">
            <span className="text-xl sm:text-2xl">🏠</span>
          </div>
        </div>
        <div className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1">{stats.total.toLocaleString()}</div>
        <div className="text-xs text-blue-200">Total Properties</div>
      </div>

      {/* Residential Rental — clickable */}
      <Link href="/tableview?type=Res_rental" className="block">
        <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-3 sm:p-4 text-center cursor-pointer hover:border-green-400/60 transition-colors">
          <div className="flex items-center justify-center mb-2">
            <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-full">
              <span className="text-xl sm:text-2xl">🏘️</span>
            </div>
          </div>
          <div className="text-base sm:text-lg lg:text-xl font-bold text-green-400 mb-1">{stats.residential_rent.toLocaleString()}</div>
          <div className="text-xs text-green-200">Residential Rental</div>
          <div className="text-xs text-green-300/60 mt-1">↗ View listings</div>
        </div>
      </Link>

      {/* Residential Sale — clickable */}
      <Link href="/tableview?type=Res_resale" className="block">
        <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-3 sm:p-4 text-center cursor-pointer hover:border-purple-400/60 transition-colors">
          <div className="flex items-center justify-center mb-2">
            <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-full">
              <span className="text-xl sm:text-2xl">🏡</span>
            </div>
          </div>
          <div className="text-base sm:text-lg lg:text-xl font-bold text-purple-400 mb-1">{stats.residential_sell.toLocaleString()}</div>
          <div className="text-xs text-purple-200">Residential Sale</div>
          <div className="text-xs text-purple-300/60 mt-1">↗ View listings</div>
        </div>
      </Link>

      {/* Commercial Rental — not clickable */}
      <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-xl p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-full">
            <span className="text-xl sm:text-2xl">🏢</span>
          </div>
        </div>
        <div className="text-base sm:text-lg lg:text-xl font-bold text-orange-400 mb-1">{stats.commercial_rent.toLocaleString()}</div>
        <div className="text-xs text-orange-200">Commercial Rental</div>
      </div>

      {/* Commercial Sale — not clickable */}
      <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-3 sm:p-4 text-center sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-center mb-2">
          <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-full">
            <span className="text-xl sm:text-2xl">🏬</span>
          </div>
        </div>
        <div className="text-base sm:text-lg lg:text-xl font-bold text-yellow-400 mb-1">{stats.commercial_sell.toLocaleString()}</div>
        <div className="text-xs text-yellow-200">Commercial Sale</div>
      </div>
    </div>
  );
};

export default PropertyStatsOverview;
