"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface PropertyControlPanelProps {
  hasActiveFilters: boolean;
  backgroundLoading: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
  onDateFilter?: (filter: 'today' | 'yesterday' | 'all') => void;
  activeDateFilter?: 'today' | 'yesterday' | 'all';
}

const PropertyControlPanel: React.FC<PropertyControlPanelProps> = ({
  hasActiveFilters,
  backgroundLoading,
  showFilters,
  onToggleFilters,
  onDateFilter,
  activeDateFilter = 'all',
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
      <div className="flex flex-wrap gap-3">
        <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-4 py-2">
          <span className="text-white/70 text-sm">Database Portal:</span>
          <span className="text-cyan-400 font-bold ml-2">Filter & Explore</span>
        </div>
        
        {hasActiveFilters && (
          <div className="backdrop-blur-sm bg-orange-500/20 border border-orange-400/30 rounded-lg px-4 py-2">
            <span className="text-orange-200 text-sm">Active Filters: </span>
            <span className="text-orange-400 font-bold">Applied</span>
          </div>
        )}
        
        {/* Background Loading Indicator */}
        {backgroundLoading && (
          <div className="flex items-center gap-2 backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-lg px-4 py-2">
            <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin"></div>
            <span className="text-blue-200 text-sm">Syncing...</span>
          </div>
        )}

        {/* Date Filter Buttons */}
        {onDateFilter && (
          <>
            <button
              onClick={() => onDateFilter('today')}
              className={`px-3 py-2 text-xs transition-all rounded-lg ${
                activeDateFilter === 'today'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20'
              }`}
            >
              📅 Today
            </button>
            <button
              onClick={() => onDateFilter('yesterday')}
              className={`px-3 py-2 text-xs transition-all rounded-lg ${
                activeDateFilter === 'yesterday'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20'
              }`}
            >
              📆 Yesterday
            </button>
            <button
              onClick={() => onDateFilter('all')}
              className={`px-3 py-2 text-xs transition-all rounded-lg ${
                activeDateFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20'
              }`}
            >
              📊 All Properties
            </button>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-4">

        
        <Button
          onClick={onToggleFilters}
          className="btn-3d bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 px-6 py-3"
        >
          {showFilters ? "🔍 Hide Filters Panel" : "⚙️ Show Filters Panel"}
        </Button>
      </div>
    </div>
  );
};

export default PropertyControlPanel;
