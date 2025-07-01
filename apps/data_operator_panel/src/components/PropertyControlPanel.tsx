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
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
      <div className="flex flex-wrap gap-3">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
          <span className="text-gray-600 text-sm">Database Portal:</span>
          <span className="text-blue-600 font-bold ml-2">Filter & Explore</span>
        </div>
        
        {hasActiveFilters && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            <span className="text-orange-600 text-sm">Active Filters: </span>
            <span className="text-orange-700 font-bold">Applied</span>
          </div>
        )}
        
        {/* Background Loading Indicator */}
        {backgroundLoading && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-600 text-sm">Syncing...</span>
          </div>
        )}

        {/* Date Filter Buttons */}
        {onDateFilter && (
          <>
            <button
              onClick={() => onDateFilter('today')}
              className={`px-3 py-2 text-xs transition-all rounded-lg ${
                activeDateFilter === 'today'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              }`}
            >
              📅 Today
            </button>
            <button
              onClick={() => onDateFilter('yesterday')}
              className={`px-3 py-2 text-xs transition-all rounded-lg ${
                activeDateFilter === 'yesterday'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              }`}
            >
              📆 Yesterday
            </button>
            <button
              onClick={() => onDateFilter('all')}
              className={`px-3 py-2 text-xs transition-all rounded-lg ${
                activeDateFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              }`}
            >
              📊 All Properties
            </button>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleFilters}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg font-medium"
        >
          {showFilters ? "🔍 Hide Filters Panel" : "⚙️ Show Filters Panel"}
        </button>
      </div>
    </div>
  );
};

export default PropertyControlPanel;
