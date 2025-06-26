"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useDynamicOptions } from '@/lib/dynamicOptions';
import { usePropertyStats } from '@/hooks/usePropertyStats';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { PropertyData } from '@/lib/dummyProperties';

// Filter state interface
interface FilterState {
  propertyType: string[];
  condition: string[];
  area: string[];
  availability: string[];
  availabilityType: string[];
  budgetMin: string;
  budgetMax: string;
  sqftFrom: string;
  sqftTo: string;
  premise: string;
}

// Initial filter state
const initialFilters: FilterState = {
  propertyType: [],
  condition: [],
  area: [],
  availability: [],
  availabilityType: [],
  budgetMin: "",
  budgetMax: "",
  sqftFrom: "",
  sqftTo: "",
  premise: "",
};

export default function TableViewPage() {
  // Auth state
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // State management
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce and abort refs
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hooks
  const { options: dynamicOptions } = useDynamicOptions(false);
  const { stats, loading: statsLoading } = usePropertyStats();

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.propertyType.length > 0 ||
           filters.condition.length > 0 ||
           filters.area.length > 0 ||
           filters.availability.length > 0 ||
           filters.availabilityType.length > 0 ||
           filters.budgetMin ||
           filters.budgetMax ||
           filters.sqftFrom ||
           filters.sqftTo ||
           filters.premise;
  }, [filters]);

  // Main fetch function with optimizations
  const fetchProperties = useCallback(async (
    page: number,
    size: number,
    filterState: FilterState,
    signal?: AbortSignal
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error('Authentication required');
      }

      // Build query
      let query = supabase
        .from('propertydata')
        .select('*', { count: 'exact' })
        .not('rent_sold_out', 'eq', true);

      // Apply filters
      if (filterState.propertyType.length > 0) {
        query = query.in('property_type', filterState.propertyType);
      }

      if (filterState.area.length > 0) {
        if (filterState.area.length === 1) {
          query = query.ilike('area', `%${filterState.area[0]}%`);
        } else {
          const areaConditions = filterState.area.map(area => `area.ilike.%${area}%`).join(',');
          query = query.or(areaConditions);
        }
      }

      if (filterState.availability.length > 0) {
        query = query.in('availability', filterState.availability);
      }

      if (filterState.condition.length > 0) {
        query = query.in('furnishing_status', filterState.condition);
      }

      if (filterState.availabilityType.length > 0) {
        query = query.in('tenant_preference', filterState.availabilityType);
      }

      if (filterState.premise) {
        query = query.or(`address.ilike.%${filterState.premise}%,sub_property_type.ilike.%${filterState.premise}%,property_type.ilike.%${filterState.premise}%,area.ilike.%${filterState.premise}%`);
      }

      // Budget filters
      if (filterState.budgetMin || filterState.budgetMax) {
        try {
          if (filterState.budgetMin) {
            query = query.gte('rent_or_sell_price::numeric', parseFloat(filterState.budgetMin));
          }
          if (filterState.budgetMax) {
            query = query.lte('rent_or_sell_price::numeric', parseFloat(filterState.budgetMax));
          }
        } catch {
          console.warn('Budget filter failed');
        }
      }

      // Size filters
      if (filterState.sqftFrom || filterState.sqftTo) {
        try {
          if (filterState.sqftFrom) {
            query = query.gte('size::numeric', parseFloat(filterState.sqftFrom));
          }
          if (filterState.sqftTo) {
            query = query.lte('size::numeric', parseFloat(filterState.sqftTo));
          }
        } catch {
          console.warn('Size filter failed');
        }
      }

      // Apply ordering and pagination
      query = query.order('serial_number', { ascending: false });
      const from = (page - 1) * size;
      const to = from + size - 1;
      query = query.range(from, to);

      // Execute query with abort signal
      const { data, error: supabaseError, count } = signal 
        ? await query.abortSignal(signal)
        : await query;

      if (supabaseError) {
        throw supabaseError;
      }

      setProperties(data || []);
      setTotalCount(count || 0);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch for filter changes
  const debouncedFetch = useCallback((page: number, size: number, filterState: FilterState) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce with abort controller
    debounceRef.current = setTimeout(() => {
      abortControllerRef.current = new AbortController();
      fetchProperties(page, size, filterState, abortControllerRef.current.signal);
    }, 300);
  }, [fetchProperties]);

  // Filter handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: string | string[]) => {
    setFilters(prev => {
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
      
      // Reset to page 1 when filters change
      setCurrentPage(1);
      
      // Debounced fetch with new filters
      debouncedFetch(1, pageSize, newFilters);
      
      return newFilters;
    });
  }, [pageSize, debouncedFetch]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
    debouncedFetch(1, pageSize, initialFilters);
  }, [pageSize, debouncedFetch]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchProperties(page, pageSize, filters);
  }, [pageSize, filters, fetchProperties]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchProperties(1, newPageSize, filters);
  }, [filters, fetchProperties]);

  // Initial load effect
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchProperties(1, pageSize, initialFilters);
    }
  }, [isAuthenticated, authLoading, fetchProperties, pageSize]);

  // Real-time subscription with optimistic updates
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const channel = supabase
      .channel('property-realtime-optimized')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'propertydata'
        },
        (payload) => {
          if (payload.new) {
            setProperties(prev => prev.map(p => 
              p.serial_number === payload.new.serial_number ? payload.new as PropertyData : p
            ));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'propertydata'
        },
        () => {
          // Only refetch if on first page to avoid disrupting user
          if (currentPage === 1) {
            setTimeout(() => fetchProperties(1, pageSize, filters), 1000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'propertydata'
        },
        () => {
          // Refetch current page after delete
          setTimeout(() => fetchProperties(currentPage, pageSize, filters), 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, authLoading, currentPage, pageSize, filters, fetchProperties]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading properties...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="float-animation absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="float-animation absolute bottom-40 left-40 w-28 h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="grid-overlay absolute inset-0 opacity-10"></div>
        
        <div className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-4">
                Property Database
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Search and explore our comprehensive property listings
              </p>
            </div>

            {/* Stats Overview */}
            {!statsLoading && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stats.total.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Total Properties</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.residential_rent.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Residential Rental</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.residential_sell.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Residential Sale</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.commercial_rent.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Commercial Rental</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{stats.commercial_sell.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Commercial Sale</div>
                </div>
              </div>
            )}

            {/* Filter Toggle and Results Info */}
            <div className="flex justify-between items-center mb-6">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              <div className="text-white/70">
                Showing {properties.length.toLocaleString()} of {totalCount.toLocaleString()} properties
                {hasActiveFilters && ' (filtered)'}
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Property Type */}
                  <div>
                    <label className="block text-white font-medium mb-3">Property Type</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {dynamicOptions.propertyTypes.map((type) => (
                        <label key={type} className="flex items-center space-x-2 text-white/80">
                          <input
                            type="checkbox"
                            checked={filters.propertyType.includes(type)}
                            onChange={() => handleFilterChange('propertyType', type)}
                            className="rounded border-white/20"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-white font-medium mb-3">Furnishing Status</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {dynamicOptions.furnishingStatuses.map((status) => (
                        <label key={status} className="flex items-center space-x-2 text-white/80">
                          <input
                            type="checkbox"
                            checked={filters.condition.includes(status)}
                            onChange={() => handleFilterChange('condition', status)}
                            className="rounded border-white/20"
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-white font-medium mb-3">Area</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {dynamicOptions.areas.map((area) => (
                        <label key={area} className="flex items-center space-x-2 text-white/80">
                          <input
                            type="checkbox"
                            checked={filters.area.includes(area)}
                            onChange={() => handleFilterChange('area', area)}
                            className="rounded border-white/20"
                          />
                          <span>{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-white font-medium mb-3">Availability</label>
                    <div className="space-y-2">
                      {dynamicOptions.availabilities.map((availability) => (
                        <label key={availability} className="flex items-center space-x-2 text-white/80">
                          <input
                            type="checkbox"
                            checked={filters.availability.includes(availability)}
                            onChange={() => handleFilterChange('availability', availability)}
                            className="rounded border-white/20"
                          />
                          <span>{availability}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tenant Preference */}
                  <div>
                    <label className="block text-white font-medium mb-3">Tenant Preference</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {dynamicOptions.tenantPreferences.map((preference) => (
                        <label key={preference} className="flex items-center space-x-2 text-white/80">
                          <input
                            type="checkbox"
                            checked={filters.availabilityType.includes(preference)}
                            onChange={() => handleFilterChange('availabilityType', preference)}
                            className="rounded border-white/20"
                          />
                          <span>{preference}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="block text-white font-medium mb-3">Budget Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={filters.budgetMin}
                        onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                        placeholder="Min"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      />
                      <input
                        type="number"
                        value={filters.budgetMax}
                        onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                        placeholder="Max"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      />
                    </div>
                  </div>

                  {/* Square Feet Range */}
                  <div>
                    <label className="block text-white font-medium mb-3">Square Feet</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={filters.sqftFrom}
                        onChange={(e) => handleFilterChange('sqftFrom', e.target.value)}
                        placeholder="From"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      />
                      <input
                        type="number"
                        value={filters.sqftTo}
                        onChange={(e) => handleFilterChange('sqftTo', e.target.value)}
                        placeholder="To"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      />
                    </div>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-white font-medium mb-3">Search</label>
                    <input
                      type="text"
                      value={filters.premise}
                      onChange={(e) => handleFilterChange('premise', e.target.value)}
                      placeholder="Search properties..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="backdrop-blur-md bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Properties Table */}
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10 border-b border-white/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-white font-medium">Property Type</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Area</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Sub Type</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Price</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Sq Ft</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Furnishing</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Availability</th>
                      <th className="px-4 py-3 text-left text-white font-medium">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.length > 0 ? (
                      properties.map((property, index) => (
                        <tr key={property.serial_number || index} className="border-b border-white/10 hover:bg-white/5">
                          <td className="px-4 py-3 text-white/80">{property.property_type || 'N/A'}</td>
                          <td className="px-4 py-3 text-white/80">{property.area || 'N/A'}</td>
                          <td className="px-4 py-3 text-white/80">{property.sub_property_type || 'N/A'}</td>
                          <td className="px-4 py-3 text-white/80">
                            {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-white/80">{property.size || 'N/A'}</td>
                          <td className="px-4 py-3 text-white/80">{property.furnishing_status || 'N/A'}</td>
                          <td className="px-4 py-3 text-white/80">{property.availability || 'N/A'}</td>
                          <td className="px-4 py-3 text-white/80">{property.owner_contact || 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-white/60">
                          {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalCount > 0 && (
                <div className="px-6 py-4 border-t border-white/20">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalCount}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
