"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useDynamicOptions } from '@/lib/dynamicOptions';
import { usePropertyCache } from '@/hooks/usePropertyCache';

export type ViewMode = 'master' | 'compact' | 'gallery' | 'map';

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
}

// Initial filter state moved from page.tsx
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
          (newFilters[key] as string[]) = currentArray.filter(v => v !== stringValue);
        } else {
          (newFilters[key] as string[]) = [...currentArray, stringValue];
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
    <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-2">
          🔍 Advanced Property Filters
        </h2>
        <p className="text-white/70">Configure your search criteria to find the perfect property</p>
      </div>

      <div className="w-full overflow-hidden">
        <table className="w-full border-collapse border border-white/20 rounded-lg overflow-hidden">
          <tbody>
            {/* Property Type */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white w-1/4">
                <div className="flex flex-col">
                  <span>Property Type:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    🔧 Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  {dynamicOptions.propertyTypes.map((type) => (
                    <label key={type} className="flex items-center space-x-2 text-white/80 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={pendingFilters.propertyType.includes(type)}
                        onChange={() => handleFilterChange('propertyType', type)}
                        className="rounded border-white/20 bg-slate-800/50 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        {type === 'Res_resale' ? 'Residential Resale' :
                         type === 'Res_rental' ? 'Residential Rental' :
                         type === 'Com_resale' ? 'Commercial Resale' :
                         type === 'Com_rental' ? 'Commercial Rental' : type}
                      </span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* Sub Property Type */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                <div className="flex flex-col">
                  <span>Sub Property Type:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    🔧 Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3 max-h-32 overflow-y-auto">
                  {dynamicOptions.subPropertyTypes.map((subType) => (
                    <label key={subType} className="flex items-center space-x-2 text-white/80 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={pendingFilters.subPropertyType.includes(subType)}
                        onChange={() => handleFilterChange('subPropertyType', subType)}
                        className="rounded border-white/20 bg-slate-800/50 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm">{subType}</span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* Furnishing Status */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                <div className="flex flex-col">
                  <span>Furnishing Status:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    🔧 Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  {dynamicOptions.furnishingStatuses.map((status) => (
                    <label key={status} className="flex items-center space-x-2 text-white/80 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={pendingFilters.condition.includes(status)}
                        onChange={() => handleFilterChange('condition', status)}
                        className="rounded border-white/20 bg-slate-800/50 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* Area */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                <div className="flex flex-col">
                  <span>Area:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    🔧 Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3 max-h-32 overflow-y-auto">
                  {dynamicOptions.areas.map((area) => (
                    <label key={area} className="flex items-center space-x-2 text-white/80 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={pendingFilters.area.includes(area)}
                        onChange={() => handleFilterChange('area', area)}
                        className="rounded border-white/20 bg-slate-800/50 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* Availability */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                <div className="flex flex-col">
                  <span>Availability:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    🔧 Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  {dynamicOptions.availabilities.map((availability) => (
                    <label key={availability} className="flex items-center space-x-2 text-white/80 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={pendingFilters.availability.includes(availability)}
                        onChange={() => handleFilterChange('availability', availability)}
                        className="rounded border-white/20 bg-slate-800/50 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm">{availability}</span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* Tenant Preference */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                <div className="flex flex-col">
                  <span>Tenant Preference:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    🔧 Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3 max-h-32 overflow-y-auto">
                  {dynamicOptions.tenantPreferences.map((preference) => (
                    <label key={preference} className="flex items-center space-x-2 text-white/80 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={pendingFilters.availabilityType.includes(preference)}
                        onChange={() => handleFilterChange('availabilityType', preference)}
                        className="rounded border-white/20 bg-slate-800/50 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm">{preference}</span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>

            {/* Budget Range */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                <div className="flex flex-col">
                  <span>Budget:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    🔧 Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="budgetMin" className="text-sm text-white/80">Min:</label>
                    <input
                      type="number"
                      id="budgetMin"
                      value={pendingFilters.budgetMin}
                      onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                      placeholder="Min Budget"
                      className="w-32 px-3 py-2 bg-slate-800/50 border border-white/20 text-white placeholder-white/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="budgetMax" className="text-sm text-white/80">Max:</label>
                    <input
                      type="number"
                      id="budgetMax"
                      value={pendingFilters.budgetMax}
                      onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                      placeholder="Max Budget"
                      className="w-32 px-3 py-2 bg-slate-800/50 border border-white/20 text-white placeholder-white/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </td>
            </tr>

            {/* Sort Options */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                <div className="flex flex-col">
                  <span>Sort By:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    🔧 Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="sortBy" className="text-sm text-white/80">Field:</label>
                    <select
                      id="sortBy"
                      value={pendingFilters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="px-3 py-2 bg-slate-800/50 border border-white/20 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="serial_number" className="bg-gray-800">Serial Number</option>
                      <option value="price" className="bg-gray-800">Price</option>
                      <option value="date" className="bg-gray-800">Date Added</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="sortOrder" className="text-sm text-white/80">Order:</label>
                    <select
                      id="sortOrder"
                      value={pendingFilters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                      className="px-3 py-2 bg-slate-800/50 border border-white/20 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="asc" className="bg-gray-800">Lowest to Highest</option>
                      <option value="desc" className="bg-gray-800">Highest to Lowest</option>
                    </select>
                  </div>
                </div>
              </td>
            </tr>

            {/* Search/Premises */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                <div className="flex flex-col">
                  <span>Search Keywords:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    � Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="relative">
                  <input
                    type="text"
                    value={pendingFilters.premise}
                    onChange={(e) => handleFilterChange('premise', e.target.value)}
                    placeholder="🏠 Search across: Address • Area • Property Type • Owner Name • Property ID..."
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-blue-400/50 text-white placeholder-blue-100/90 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:bg-white/15 transition-all duration-200 hover:border-blue-300/70 hover:bg-white/12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200/80">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-1 text-xs text-blue-100/90">
                  <span className="inline-flex items-center space-x-1">
                    <span>✨</span>
                    <span>Searches across multiple fields simultaneously for comprehensive results</span>
                  </span>
                </div>
              </td>
            </tr>

            {/* View Mode Selection */}
            <tr className="border-b border-white/20">
              <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                <div className="flex flex-col">
                  <span>View Mode:</span>
                  <span className="text-xs text-orange-200 font-normal mt-1">
                    🔧 Requires Apply
                  </span>
                </div>
              </th>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="viewMode" className="text-sm text-white/80">Display Style:</label>
                  <select
                    id="viewMode"
                    value={pendingFilters.viewMode}
                    onChange={(e) => handleFilterChange('viewMode', e.target.value as ViewMode)}
                    className="px-3 py-2 bg-slate-800/50 border border-white/20 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="compact" className="bg-gray-800">Compact Table</option>
                    <option value="gallery" className="bg-gray-800">Gallery View</option>
                    <option value="map" className="bg-gray-800">Map View</option>
                    <option value="master" className="bg-gray-800">Master View</option>
                  </select>
                  <span className="text-xs text-white/60 ml-2">
                    Choose how to display property data
                  </span>
                </div>
              </td>
            </tr>

            {/* Action Buttons */}
            <tr>
              <td colSpan={2} className="px-4 py-4 text-center">
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    onClick={clearAndApplyFilters}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🗑️ Clear All Filters
                  </Button>
                  
                  <Button
                    onClick={applyFilters}
                    disabled={!hasUnappliedChanges || loading}
                    className={`px-8 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg transform ${
                      hasUnappliedChanges && !loading
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:shadow-xl hover:scale-105'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {loading ? '⏳ Applying...' : '🔍 Apply Filters'}
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyFiltersPanel;
