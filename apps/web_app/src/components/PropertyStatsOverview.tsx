"use client";

import React from 'react';

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

const PropertyStatsOverview: React.FC<PropertyStatsOverviewProps> = ({ stats, loading }) => {
  if (loading) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
      <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <span className="text-3xl">🏠</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-white mb-2">{stats.total.toLocaleString()}</div>
        <div className="text-sm text-blue-200">Total Properties</div>
      </div>

      <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="p-3 bg-green-500/20 rounded-full">
            <span className="text-3xl">🏘️</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-green-400 mb-2">{stats.residential_rent.toLocaleString()}</div>
        <div className="text-sm text-green-200">Residential Rental</div>
      </div>

      <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <span className="text-3xl">🏡</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-purple-400 mb-2">{stats.residential_sell.toLocaleString()}</div>
        <div className="text-sm text-purple-200">Residential Sale</div>
      </div>

      <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="p-3 bg-orange-500/20 rounded-full">
            <span className="text-3xl">🏢</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-orange-400 mb-2">{stats.commercial_rent.toLocaleString()}</div>
        <div className="text-sm text-orange-200">Commercial Rental</div>
      </div>

      <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <div className="p-3 bg-yellow-500/20 rounded-full">
            <span className="text-3xl">🏬</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.commercial_sell.toLocaleString()}</div>
        <div className="text-sm text-yellow-200">Commercial Sale</div>
      </div>
    </div>
  );
};

export default PropertyStatsOverview;
