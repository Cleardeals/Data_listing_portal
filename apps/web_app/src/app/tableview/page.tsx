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
import { usePropertyCache } from '@/hooks/usePropertyCache';

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
  
  // Apply Filters functionality - Pending filters for manual application
  const [pendingFilters, setPendingFilters] = useState<FilterState>(initialFilters);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Abort controller for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hooks
  const { options: dynamicOptions } = useDynamicOptions(false);
  const { stats, loading: statsLoading } = usePropertyStats();
  const cache = usePropertyCache();

  // Cache-aware loading and error states
  const [backgroundLoading, setBackgroundLoading] = useState(false);

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

  // Main fetch function - simplified for debugging
  const fetchProperties = useCallback(async (
    page: number,
    size: number,
    filterState: FilterState,
    useCache: boolean = true
  ) => {
    console.log('=== FETCH PROPERTIES START ===');
    console.log('Parameters:', { page, size, filterState, useCache });
    
    try {
      setLoading(true);
      setError(null);

      // Validate supabase client
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      if (!session) {
        console.error('No session found');
        throw new Error('Authentication required - no session');
      }

      console.log('Authentication OK, building query...');

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for potential future use
      abortControllerRef.current = new AbortController();

      // Build query
      let query;
      try {
        query = supabase
          .from('propertydata')
          .select('*', { count: 'exact' })
          .not('rent_sold_out', 'eq', true);
        
        if (!query) {
          throw new Error('Query builder returned null');
        }
      } catch (queryError) {
        console.error('Failed to build initial query:', queryError);
        throw new Error(`Query building failed: ${queryError instanceof Error ? queryError.message : 'Unknown query error'}`);
      }

      // Apply filters
      console.log('Applying filters to query:', filterState);
      
      if (filterState.propertyType.length > 0) {
        console.log('Applying property type filter:', filterState.propertyType);
        query = query.in('property_type', filterState.propertyType);
      }

      if (filterState.area.length > 0) {
        console.log('Applying area filter:', filterState.area);
        if (filterState.area.length === 1) {
          query = query.ilike('area', `%${filterState.area[0]}%`);
        } else {
          const areaConditions = filterState.area.map(area => `area.ilike.%${area}%`).join(',');
          query = query.or(areaConditions);
        }
      }

      if (filterState.availability.length > 0) {
        console.log('Applying availability filter:', filterState.availability);
        query = query.in('availability', filterState.availability);
      }

      if (filterState.condition.length > 0) {
        console.log('Applying condition filter:', filterState.condition);
        query = query.in('furnishing_status', filterState.condition);
      }

      if (filterState.availabilityType.length > 0) {
        console.log('Applying availability type filter:', filterState.availabilityType);
        query = query.in('tenant_preference', filterState.availabilityType);
      }

      if (filterState.premise) {
        console.log('Applying premise filter:', filterState.premise);
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

      // Validate query before execution
      if (!query) {
        throw new Error('Failed to construct database query');
      }

      // Execute query
      let result;
      try {
        // Note: abortSignal might not be supported in all Supabase versions
        // Use regular query execution instead
        result = await query;
      } catch (queryError) {
        console.error('Query execution failed:', queryError);
        throw queryError;
      }

      const { data, error: supabaseError, count } = result;

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      // Validate result structure
      if (result && typeof result !== 'object') {
        throw new Error('Invalid query result format');
      }

      const resultData = data || [];
      const resultCount = count || 0;

      console.log('Query successful, setting properties:', { resultData: resultData.length, resultCount });
      setProperties(resultData);
      setTotalCount(resultCount);

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      // Enhanced error logging
      console.error('Error fetching properties:', {
        error: err,
        errorType: typeof err,
        errorConstructor: err?.constructor?.name,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        errorStack: err instanceof Error ? err.stack : undefined,
        filters: filterState,
        page,
        pageSize: size,
        useCache
      });
      
      // Set user-friendly error message
      let errorMessage = 'Failed to fetch properties';
      if (err instanceof Error) {
        errorMessage = err.message || 'Unknown database error';
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        // Handle Supabase error objects
        if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if ('details' in err && typeof err.details === 'string') {
          errorMessage = err.details;
        } else if ('hint' in err && typeof err.hint === 'string') {
          errorMessage = err.hint;
        } else {
          errorMessage = 'Database connection error';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
    }
  }, []);

  // Debug function to test basic connectivity
  const testSupabaseConnection = useCallback(async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test 1: Basic client check
      if (!supabase) {
        console.error('Supabase client is null/undefined');
        return;
      }
      
      // Test 2: Auth check
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log('Auth test:', { session: !!session, authError });
      
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }
      
      if (!session) {
        console.error('No session found');
        return;
      }
      
      // Test 3: Simple query
      const { data, error } = await supabase
        .from('propertydata')
        .select('serial_number')
        .limit(1);
        
      console.log('Simple query test:', { data, error });
      
    } catch (err) {
      console.error('Connection test failed:', err);
    }
  }, []);

  // Run connection test on mount (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isAuthenticated && !authLoading) {
      testSupabaseConnection();
    }
  }, [isAuthenticated, authLoading, testSupabaseConnection]);

  // Filter handlers - Modified to stage filters instead of applying instantly
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
    console.log('Has unapplied changes set to true');
  }, []);

  // Apply filters manually - replaces instant filtering
  const applyFilters = useCallback(() => {
    console.log('=== APPLY FILTERS CLICKED ===');
    console.log('Current filters:', filters);
    console.log('Pending filters:', pendingFilters);
    console.log('Page size:', pageSize);
    
    // Update filters state
    setFilters(pendingFilters);
    setCurrentPage(1);
    setHasUnappliedChanges(false);
    
    // Force a fresh fetch without cache
    console.log('Calling fetchProperties with fresh fetch...');
    fetchProperties(1, pageSize, pendingFilters, false);
  }, [pendingFilters, pageSize, fetchProperties, filters]);

  // Apply clear filters immediately
  const clearAndApplyFilters = useCallback(() => {
    console.log('Clear and apply filters clicked');
    
    setFilters(initialFilters);
    setPendingFilters(initialFilters);
    setCurrentPage(1);
    setHasUnappliedChanges(false);
    
    // Clear cache when clearing filters for fresh data
    cache.clearCache();
    
    fetchProperties(1, pageSize, initialFilters, false);
  }, [pageSize, fetchProperties, cache]);

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

  // Real-time subscription with cache invalidation and optimistic updates
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
            // Update current properties optimistically
            setProperties(prev => prev.map(p => 
              p.serial_number === payload.new.serial_number ? payload.new as PropertyData : p
            ));
            
            // Mark cache as stale for background refresh
            cache.markStale();
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
          // Invalidate cache since new data might affect pagination
          cache.invalidateCache();
          
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
          // Invalidate cache since deletion affects pagination
          cache.invalidateCache();
          
          // Refetch current page after delete
          setTimeout(() => fetchProperties(currentPage, pageSize, filters), 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, authLoading, currentPage, pageSize, filters, fetchProperties, cache]);

  // Cleanup on unmount
  useEffect(() => {
    const currentAbortController = abortControllerRef.current;
    return () => {
      if (currentAbortController) {
        currentAbortController.abort();
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
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                
                {/* Background Loading Indicator */}
                {backgroundLoading && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span>Syncing...</span>
                  </div>
                )}
                
                {/* Cache Statistics (Development) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-white/50">
                    Cache: {cache.getCacheStats().hitRate.toFixed(2)}% hit rate, {cache.getCacheStats().entries} entries
                    | Has changes: {hasUnappliedChanges ? 'YES' : 'NO'} | Loading: {loading ? 'YES' : 'NO'}
                  </div>
                )}
              </div>
              
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
                            checked={pendingFilters.propertyType.includes(type)}
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
                            checked={pendingFilters.condition.includes(status)}
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
                            checked={pendingFilters.area.includes(area)}
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
                            checked={pendingFilters.availability.includes(availability)}
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
                            checked={pendingFilters.availabilityType.includes(preference)}
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
                        value={pendingFilters.budgetMin}
                        onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                        placeholder="Min"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      />
                      <input
                        type="number"
                        value={pendingFilters.budgetMax}
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
                        value={pendingFilters.sqftFrom}
                        onChange={(e) => handleFilterChange('sqftFrom', e.target.value)}
                        placeholder="From"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      />
                      <input
                        type="number"
                        value={pendingFilters.sqftTo}
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
                      value={pendingFilters.premise}
                      onChange={(e) => handleFilterChange('premise', e.target.value)}
                      placeholder="Search properties..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button
                    onClick={clearAndApplyFilters}
                    className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                  >
                    Clear All Filters
                  </Button>
                  
                  <Button
                    onClick={applyFilters}
                    disabled={!hasUnappliedChanges || loading}
                    className={`${
                      hasUnappliedChanges && !loading
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    } px-6 py-2 rounded-lg font-medium transition-colors`}
                  >
                    {loading ? 'Applying...' : 'Apply Filters'}
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
