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
    <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8 px-3 sm:px-0">
      {/* Top Row - Status Indicators */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2">
          <span className="text-white/70 text-xs sm:text-sm">Database Portal:</span>
          <span className="text-cyan-400 font-bold ml-1 sm:ml-2 text-xs sm:text-sm">Filter & Explore</span>
        </div>
        
        {hasActiveFilters && (
          <div className="backdrop-blur-sm bg-orange-500/20 border border-orange-400/30 rounded-lg px-3 sm:px-4 py-2">
            <span className="text-orange-200 text-xs sm:text-sm">Active Filters: </span>
            <span className="text-orange-400 font-bold text-xs sm:text-sm">Applied</span>
          </div>
        )}
        
        {/* Background Loading Indicator */}
        {backgroundLoading && (
          <div className="flex items-center gap-2 backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-lg px-3 sm:px-4 py-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-white/40 border-t-white rounded-full animate-spin"></div>
            <span className="text-blue-200 text-xs sm:text-sm">Syncing...</span>
          </div>
        )}
      </div>

      {/* Second Row - Date Filters and Main Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        {/* Date Filter Buttons */}
        {onDateFilter && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onDateFilter('today')}
              className={`px-2.5 sm:px-3 py-2 text-xs sm:text-sm transition-all rounded-lg touch-manipulation ${
                activeDateFilter === 'today'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20'
              }`}
            >
              📅 Today
            </button>
            <button
              onClick={() => onDateFilter('yesterday')}
              className={`px-2.5 sm:px-3 py-2 text-xs sm:text-sm transition-all rounded-lg touch-manipulation ${
                activeDateFilter === 'yesterday'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20'
              }`}
            >
              📆 Yesterday
            </button>
            <button
              onClick={() => onDateFilter('all')}
              className={`px-2.5 sm:px-3 py-2 text-xs sm:text-sm transition-all rounded-lg touch-manipulation ${
                activeDateFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20'
              }`}
            >
              📊 All Properties
            </button>
          </div>
        )}
        
        {/* Filter Toggle Button */}
        <div className="w-full sm:w-auto">
          <Button
            onClick={onToggleFilters}
            className="btn-3d bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 px-4 sm:px-6 py-3 w-full sm:w-auto text-sm sm:text-base touch-manipulation"
          >
            {showFilters ? "🔍 Hide Filters" : "⚙️ Show Filters"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyControlPanel;
