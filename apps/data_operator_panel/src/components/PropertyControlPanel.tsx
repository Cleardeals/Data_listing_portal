"use client";

import React from 'react';

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
    <div className="bg-gradient-to-br from-white/80 to-slate-50/60 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left Section - Status and Info */}
        <div className="flex flex-wrap gap-4">
          {/* Main Status */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm">📊</span>
            </div>
            <div>
              <span className="text-slate-800 text-sm font-semibold">Database Portal</span>
              <div className="text-blue-600 font-medium text-xs bg-blue-50 px-2 py-1 rounded">Filter & Explore</div>
            </div>
          </div>
          
          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-lg px-4 py-3 shadow-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-700 text-sm font-medium">Filters Active</span>
            </div>
          )}
          
          {/* Background Loading Indicator */}
          {backgroundLoading && (
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg px-4 py-3 shadow-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-700 text-sm font-medium">Syncing Data...</span>
            </div>
          )}
        </div>

        {/* Right Section - Date Filters and Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Filter Buttons */}
          {onDateFilter && (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-slate-200 shadow-sm">
              <button
                onClick={() => onDateFilter('today')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                  activeDateFilter === 'today'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                📅 Today
              </button>
              <button
                onClick={() => onDateFilter('yesterday')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                  activeDateFilter === 'yesterday'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                📆 Yesterday
              </button>
              <button
                onClick={() => onDateFilter('all')}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                  activeDateFilter === 'all'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                📊 All
              </button>
            </div>
          )}
          
          {/* Toggle Filters Button */}
          <button
            onClick={onToggleFilters}
            className={`px-6 py-3 font-medium text-sm transition-all duration-200 rounded-lg shadow-sm hover:shadow-md border ${
              showFilters
                ? 'bg-slate-600 text-white border-slate-500 hover:bg-slate-700'
                : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
            }`}
          >
            {showFilters ? (
              <>
                <span className="mr-2">🔍</span>
                Hide Filters
              </>
            ) : (
              <>
                <span className="mr-2">⚙️</span>
                Show Filters
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyControlPanel;
