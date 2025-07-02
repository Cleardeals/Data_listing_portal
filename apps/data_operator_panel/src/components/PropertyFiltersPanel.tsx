"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useDynamicOptions } from '@/lib/dynamicOptions';
import { usePropertyCache } from '@/hooks/usePropertyCache';

export type ViewMode = 'master' | 'compact' | 'gallery';

export interface FilterState {
  propertyType: string[];
  subPropertyType: string[];
  condition: string[];
  area: string[];
  availability: string[];
  availabilityType: string[];
  budgetMin: string;
  budgetMax: string;
  premise: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: ViewMode;
  visibility: string[];
  rentSoldOut: string[];
}

// Initial filter state
export const initialFilters: FilterState = {
  propertyType: [],
  subPropertyType: [],
  condition: [],
  area: [],
  availability: [],
  availabilityType: [],
  budgetMin: "",
  budgetMax: "",
  premise: "",
  sortBy: "serial_number",
  sortOrder: "asc",
  viewMode: "compact",
  visibility: [],
  rentSoldOut: [],
};

interface PropertyFiltersPanelProps {
  showFilters: boolean;
  // Main filter state management
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  loading: boolean;
  // Fetch function passed from parent
  onFetchProperties: (page: number, size: number, filterState: FilterState, useCache?: boolean) => void;
}

const PropertyFiltersPanel: React.FC<PropertyFiltersPanelProps> = ({
  showFilters,
  filters,
  setFilters,
  setCurrentPage,
  pageSize,
  loading,
  onFetchProperties,
}) => {
  // Internal state for pending filters
  const [pendingFilters, setPendingFilters] = useState<FilterState>(filters);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  // Hooks
  const { options: dynamicOptions } = useDynamicOptions(false);
  const cache = usePropertyCache();

  // Sync pending filters when main filters change from external sources
  useEffect(() => {
    setPendingFilters(filters);
    setHasUnappliedChanges(false);
  }, [filters]);

  // Filter handlers - All changes are staged for manual application
  const handleFilterChange = useCallback((key: keyof FilterState, value: string | string[]) => {
    console.log('Filter change:', { key, value });
    
    setPendingFilters(prev => {
      const newFilters = { ...prev };
      
      if (Array.isArray(newFilters[key])) {
        const currentArray = newFilters[key] as string[];
        const stringValue = value as string;
        if (currentArray.includes(stringValue)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (newFilters as any)[key] = currentArray.filter(item => item !== stringValue);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (newFilters as any)[key] = [...currentArray, stringValue];
        }
      } else {
        (newFilters[key] as string) = value as string;
      }
      
      console.log('New pending filters:', newFilters);
      return newFilters;
    });
    
    setHasUnappliedChanges(true);
    console.log('Filter change staged for manual application');
  }, []);

  // Apply filters manually - replaces instant filtering
  const applyFilters = useCallback(() => {
    console.log('=== APPLY FILTERS CLICKED ===');
    console.log('Current filters:', filters);
    console.log('Pending filters:', pendingFilters);
    console.log('Page size:', pageSize);
    
    // Update main filters state with all pending changes
    setFilters(pendingFilters);
    setCurrentPage(1);
    setHasUnappliedChanges(false);
    
    // Force a fresh fetch without cache using the pending filters
    console.log('Calling fetchProperties with fresh fetch using pending filters...');
    onFetchProperties(1, pageSize, pendingFilters, false);
  }, [pendingFilters, pageSize, onFetchProperties, filters, setFilters, setCurrentPage]);

  // Apply clear filters immediately
  const clearAndApplyFilters = useCallback(() => {
    console.log('Clear and apply filters clicked');
    
    setFilters(initialFilters);
    setPendingFilters(initialFilters);
    setCurrentPage(1);
    setHasUnappliedChanges(false);
    
    // Clear cache when clearing filters for fresh data
    cache.clearCache();
    
    onFetchProperties(1, pageSize, initialFilters, false);
  }, [pageSize, onFetchProperties, cache, setFilters, setCurrentPage]);

  if (!showFilters) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-200 rounded-xl shadow-lg p-6 mb-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
          🔍 Advanced Property Filters
        </h2>
        <p className="text-slate-600 font-medium">Configure your search criteria to find the perfect property</p>
      </div>

      <div className="w-full overflow-hidden">
        {/* Search/Keywords Section */}
        <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-100 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            🔍 Search Keywords
            <span className="text-xs text-orange-600 font-normal bg-orange-100 px-2 py-1 rounded">
              Requires Apply
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={pendingFilters.premise}
              onChange={(e) => handleFilterChange('premise', e.target.value)}
              placeholder="🏠 Search across: Address • Area • Property Type • Owner Name • Property ID..."
              className="w-full px-4 py-3 pl-12 pr-12 border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 shadow-md font-medium transition-all hover:border-blue-400 hover:bg-slate-100 focus:bg-white placeholder-slate-500 text-slate-800"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {pendingFilters.premise && (
              <button
                onClick={() => handleFilterChange('premise', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-600">
            <span className="inline-flex items-center space-x-1">
              <span>✨</span>
              <span>Searches across multiple fields simultaneously for comprehensive results</span>
            </span>
          </div>
        </div>

        {/* Property Type Filter */}
        <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-blue-100 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            🏠 Property Type
          </label>
          <div className="flex flex-wrap gap-2">
            {dynamicOptions.propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange('propertyType', type)}
                className={`px-4 py-2 text-sm rounded-full border-2 font-medium transition-all duration-200 transform hover:scale-105 ${
                  pendingFilters.propertyType.includes(type)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:border-blue-300 shadow-sm'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Area Filter */}
        <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-green-100 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            📍 Area
          </label>
          <div className="flex flex-wrap gap-2">
            {dynamicOptions.areas.map((area) => (
              <button
                key={area}
                onClick={() => handleFilterChange('area', area)}
                className={`px-4 py-2 text-sm rounded-full border-2 font-medium transition-all duration-200 transform hover:scale-105 ${
                  pendingFilters.area.includes(area)
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50 hover:border-green-300 shadow-sm'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Property Type Filter */}
        <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-purple-100 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            🏢 Sub Property Type
          </label>
          <div className="flex flex-wrap gap-2">
            {dynamicOptions.subPropertyTypes.map((subType) => (
              <button
                key={subType}
                onClick={() => handleFilterChange('subPropertyType', subType)}
                className={`px-4 py-2 text-sm rounded-full border-2 font-medium transition-all duration-200 transform hover:scale-105 ${
                  pendingFilters.subPropertyType.includes(subType)
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-purple-50 hover:border-purple-300 shadow-sm'
                }`}
              >
                {subType}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-yellow-100 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            💰 Budget Range
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="number"
                placeholder="Min Budget"
                value={pendingFilters.budgetMin}
                onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                className="w-full px-4 py-3 pl-10 border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 shadow-md font-medium transition-all hover:border-blue-400 hover:bg-slate-100 focus:bg-white placeholder-slate-500 text-slate-800"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">₹</span>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="Max Budget"
                value={pendingFilters.budgetMax}
                onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                className="w-full px-4 py-3 pl-10 border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 shadow-md font-medium transition-all hover:border-blue-400 hover:bg-slate-100 focus:bg-white placeholder-slate-500 text-slate-800"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">₹</span>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-indigo-100 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            📊 Sort Options
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sort By</label>
              <select
                value={pendingFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 shadow-md font-medium transition-all hover:border-blue-400 hover:bg-slate-100 focus:bg-white text-slate-800"
              >
                <option value="serial_number" className="text-slate-700 bg-white">Serial Number</option>
                <option value="price" className="text-slate-700 bg-white">Price</option>
                <option value="date" className="text-slate-700 bg-white">Date</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sort Order</label>
              <select
                value={pendingFilters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-4 py-3 border-2 border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 shadow-md font-medium transition-all hover:border-blue-400 hover:bg-slate-100 focus:bg-white text-slate-800"
              >
                <option value="asc" className="text-slate-700 bg-white">Ascending ↑</option>
                <option value="desc" className="text-slate-700 bg-white">Descending ↓</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visibility Filter */}
        <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-cyan-100 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            👁️ Visibility Status
          </label>
          <div className="flex flex-wrap gap-2">
            {['true', 'false'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange('visibility', status)}
                className={`px-4 py-2 text-sm rounded-full border-2 font-medium transition-all duration-200 transform hover:scale-105 ${
                  pendingFilters.visibility.includes(status)
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-500 shadow-lg'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-cyan-50 hover:border-cyan-300 shadow-sm'
                }`}
              >
                {status === 'true' ? '👁️ Visible' : '🙈 Hidden'}
              </button>
            ))}
          </div>
        </div>

        {/* Rent/Sold Out Filter */}
        <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-rose-100 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            🏷️ Property Status
          </label>
          <div className="flex flex-wrap gap-2">
            {['false', 'true'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange('rentSoldOut', status)}
                className={`px-4 py-2 text-sm rounded-full border-2 font-medium transition-all duration-200 transform hover:scale-105 ${
                  pendingFilters.rentSoldOut.includes(status)
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-rose-500 shadow-lg'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50 hover:border-rose-300 shadow-sm'
                }`}
              >
                {status === 'false' ? '✅ Available' : '❌ Sold/Rented'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-slate-200">
          <button
            onClick={applyFilters}
            disabled={!hasUnappliedChanges || loading}
            className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
              hasUnappliedChanges && !loading
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed shadow-sm'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Applying...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🔍 Apply Filters
              </span>
            )}
          </button>
          <button
            onClick={clearAndApplyFilters}
            disabled={loading}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center justify-center gap-2">
              🗑️ Clear All
            </span>
          </button>
        </div>

        {hasUnappliedChanges && (
          <div className="mt-4 p-4 text-sm text-orange-800 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="font-semibold">
                You have unapplied filter changes. Click &quot;Apply Filters&quot; to search with the new criteria.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyFiltersPanel;
