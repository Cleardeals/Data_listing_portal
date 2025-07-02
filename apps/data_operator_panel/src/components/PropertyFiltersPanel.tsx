"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useDynamicOptions } from '@/lib/dynamicOptions';
import { usePropertyCache } from '@/hooks/usePropertyCache';

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
    <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-lg shadow-lg p-4 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <span className="text-blue-600">🔍</span>
          Advanced Property Filters
        </h2>
        <p className="text-slate-600 text-sm">Configure your search criteria to find the perfect property</p>
      </div>

      <div className="w-full overflow-hidden">
        {/* Search/Keywords Section */}
        <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-blue-100 shadow-sm">
          <label className="block text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-blue-600">🔍</span>
            Search Keywords
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded border border-orange-200">
              Requires Apply
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={pendingFilters.premise}
              onChange={(e) => handleFilterChange('premise', e.target.value)}
              placeholder="🏠 Search across: Address • Area • Property Type • Owner Name • Property ID..."
              className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-blue-400 placeholder-slate-500 text-slate-800"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-blue-100 shadow-sm">
          <label className="block text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-blue-600">🏠</span>
            Property Type
          </label>
          <div className="flex flex-wrap gap-2">
            {dynamicOptions.propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange('propertyType', type)}
                className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all duration-200 ${
                  pendingFilters.propertyType.includes(type)
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Area Filter */}
        <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-green-100 shadow-sm">
          <label className="block text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-green-600">📍</span>
            Area
          </label>
          <div className="flex flex-wrap gap-2">
            {dynamicOptions.areas.map((area) => (
              <button
                key={area}
                onClick={() => handleFilterChange('area', area)}
                className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all duration-200 ${
                  pendingFilters.area.includes(area)
                    ? 'bg-green-500 text-white border-green-400 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50 hover:border-green-300 hover:text-green-700'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Property Type Filter */}
        <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-purple-100 shadow-sm">
          <label className="block text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-purple-600">🏢</span>
            Sub Property Type
          </label>
          <div className="flex flex-wrap gap-2">
            {dynamicOptions.subPropertyTypes.map((subType) => (
              <button
                key={subType}
                onClick={() => handleFilterChange('subPropertyType', subType)}
                className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all duration-200 ${
                  pendingFilters.subPropertyType.includes(subType)
                    ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                }`}
              >
                {subType}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-yellow-100 shadow-sm">
          <label className="block text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-yellow-600">💰</span>
            Budget Range
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="number"
                placeholder="Min Budget"
                value={pendingFilters.budgetMin}
                onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                className="w-full px-4 py-2 pl-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-blue-400 placeholder-slate-500 text-slate-800"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600">₹</span>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="Max Budget"
                value={pendingFilters.budgetMax}
                onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                className="w-full px-4 py-2 pl-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-blue-400 placeholder-slate-500 text-slate-800"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600">₹</span>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-indigo-100 shadow-sm">
          <label className="block text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-indigo-600">📊</span>
            Sort Options
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sort By</label>
              <select
                value={pendingFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-blue-400 text-slate-800"
              >
                <option value="serial_number">Serial Number</option>
                <option value="price">Price</option>
                <option value="date">Date</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sort Order</label>
              <select
                value={pendingFilters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-blue-400 text-slate-800"
              >
                <option value="asc">Ascending ↑</option>
                <option value="desc">Descending ↓</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visibility Filter */}
        <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-cyan-100 shadow-sm">
          <label className="block text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-cyan-600">👁️</span>
            Visibility Status
          </label>
          <div className="flex flex-wrap gap-2">
            {['true', 'false'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange('visibility', status)}
                className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all duration-200 ${
                  pendingFilters.visibility.includes(status)
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700'
                }`}
              >
                {status === 'true' ? '👁️ Visible' : '🙈 Hidden'}
              </button>
            ))}
          </div>
        </div>

        {/* Rent/Sold Out Filter */}
        <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-rose-100 shadow-sm">
          <label className="block text-sm font-medium text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-rose-600">🏷️</span>
            Property Status
          </label>
          <div className="flex flex-wrap gap-2">
            {['false', 'true'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange('rentSoldOut', status)}
                className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all duration-200 ${
                  pendingFilters.rentSoldOut.includes(status)
                    ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700'
                }`}
              >
                {status === 'false' ? '✅ Available' : '❌ Sold/Rented'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
          <button
            onClick={applyFilters}
            disabled={!hasUnappliedChanges || loading}
            className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 border shadow-sm ${
              hasUnappliedChanges && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Applying Filters...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🔍</span>
                Apply Filters
              </span>
            )}
          </button>
          <button
            onClick={clearAndApplyFilters}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed border border-red-400 hover:border-red-500 shadow-sm"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🗑️</span>
              Clear All Filters
            </span>
          </button>
        </div>

        {hasUnappliedChanges && (
          <div className="mt-4 p-4 text-sm text-orange-800 bg-orange-100 border border-orange-300 rounded-lg">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <div>
                <span className="font-medium block mb-1">
                  You have unapplied filter changes!
                </span>
                <span>
                  Click &quot;Apply Filters&quot; to search with the new criteria.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyFiltersPanel;
