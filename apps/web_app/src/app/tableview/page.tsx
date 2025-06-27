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

// View mode types
type ViewMode = 'pretty' | 'master' | 'compact' | 'gallery';

// Filter state interface
interface FilterState {
  propertyType: string[];
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

// Initial filter state
const initialFilters: FilterState = {
  propertyType: [],
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
           filters.premise ||
           filters.sortBy !== 'serial_number' ||
           filters.sortOrder !== 'asc' ||
           filters.viewMode !== 'compact';
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

      // Apply ordering and pagination
      console.log('Applying sorting:', { sortBy: filterState.sortBy, sortOrder: filterState.sortOrder });
      
      // Determine the sort column and order
      let sortColumn = 'serial_number';
      let ascending = true; // Default to ascending for serial numbers
      
      switch (filterState.sortBy) {
        case 'serial_number':
          sortColumn = 'serial_number';
          ascending = filterState.sortOrder === 'asc';
          break;
        case 'price':
          sortColumn = 'rent_or_sell_price';
          ascending = filterState.sortOrder === 'asc';
          break;
        case 'date':
          sortColumn = 'created_at';
          ascending = filterState.sortOrder === 'asc';
          break;
        default:
          sortColumn = 'serial_number';
          ascending = filterState.sortOrder === 'asc';
      }
      
      // Apply sorting with proper handling for numeric fields
      if (filterState.sortBy === 'price') {
        // Use raw SQL ordering for numeric price sorting
        query = query.order('rent_or_sell_price', { ascending, nullsFirst: false });
      } else {
        query = query.order(sortColumn, { ascending });
      }
      
      // Apply pagination for all view modes
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
  }, [setBackgroundLoading]);

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

  // Helper function to count pending changes
  const countPendingChanges = useCallback(() => {
    let count = 0;
    
    // Count array filters
    count += pendingFilters.propertyType.length;
    count += pendingFilters.condition.length;
    count += pendingFilters.area.length;
    count += pendingFilters.availability.length;
    count += pendingFilters.availabilityType.length;
    
    // Count string filters
    if (pendingFilters.budgetMin) count++;
    if (pendingFilters.budgetMax) count++;
    if (pendingFilters.premise) count++;
    
    // Count sorting and view mode changes from default
    if (pendingFilters.sortBy !== 'serial_number') count++;
    if (pendingFilters.sortOrder !== 'asc') count++;
    if (pendingFilters.viewMode !== 'compact') count++;
    
    return count;
  }, [pendingFilters]);

  // Apply filters manually - replaces instant filtering
  const applyFilters = useCallback(() => {
    console.log('=== APPLY FILTERS CLICKED ===');
    console.log('Current filters:', filters);
    console.log('Pending filters:', pendingFilters);
    console.log('Page size:', pageSize);
    
    // Update filters state and synchronize both states
    setFilters(pendingFilters);
    setCurrentPage(1);
    setHasUnappliedChanges(false);
    
    // Force a fresh fetch without cache using the pending filters
    console.log('Calling fetchProperties with fresh fetch using pending filters...');
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
    console.log('=== PAGE SIZE CHANGE ===');
    console.log('Old page size:', pageSize);
    console.log('New page size:', newPageSize);
    console.log('Current applied filters:', filters);
    console.log('Pending filters:', pendingFilters);
    console.log('Has active filters:', hasActiveFilters);
    console.log('Has unapplied changes:', hasUnappliedChanges);
    
    setPageSize(newPageSize);
    setCurrentPage(1);
    
    // Use the currently applied filters for page size change
    // This ensures filters remain applied when changing page size
    console.log('Using applied filters for page size change:', filters);
    fetchProperties(1, newPageSize, filters);
  }, [filters, fetchProperties, pageSize, pendingFilters, hasActiveFilters, hasUnappliedChanges]);

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

  // Debug effect to monitor filter state changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== FILTER STATE DEBUG ===');
      console.log('Applied filters:', filters);
      console.log('Pending filters:', pendingFilters);
      console.log('Has unapplied changes:', hasUnappliedChanges);
      console.log('Has active filters:', hasActiveFilters);
    }
  }, [filters, pendingFilters, hasUnappliedChanges, hasActiveFilters]);

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
            {/* Enhanced Header Section with Search Page Style */}
            <div className="text-center mb-12">
              <h1 className="text-5xl lg:text-6xl font-bold text-gradient-animate mb-6">
                🔍 Property Database Explorer
              </h1>
              <p className="text-white/70 text-xl mb-8 max-w-3xl mx-auto">
                Discover your perfect property with advanced filters and real-time data insights
              </p>
            </div>

            {/* Enhanced Stats Overview with Search Page Style */}
            {!statsLoading && (
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
            )}

            {/* Enhanced Control Panel */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div className="flex flex-wrap gap-3">
                <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-4 py-2">
                  <span className="text-white/70 text-sm">Database Portal:</span>
                  <span className="text-cyan-400 font-bold ml-2">Filter & Explore</span>
                </div>
                {hasActiveFilters && (
                  <div className="backdrop-blur-sm bg-orange-500/20 border border-orange-400/30 rounded-lg px-4 py-2">
                    <span className="text-orange-200 text-sm">Active Filters: </span>
                    <span className="text-orange-400 font-bold">
                      {Object.values(filters).flat().filter(v => v && v.length > 0).length}
                    </span>
                  </div>
                )}
                
                {/* Background Loading Indicator */}
                {backgroundLoading && (
                  <div className="flex items-center gap-2 backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-lg px-4 py-2">
                    <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span className="text-blue-200 text-sm">Syncing...</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-white/70 text-sm">
                  Showing {properties.length.toLocaleString()} of {totalCount.toLocaleString()} properties
                  {hasActiveFilters && ' (filtered)'}
                </div>
                
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-3d bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 px-6 py-3"
                >
                  {showFilters ? "🔍 Hide Filters Panel" : "⚙️ Show Filters Panel"}
                </Button>
              </div>
            </div>

            {/* Enhanced Filters Panel with Search Page UI */}
            {showFilters && (
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
                          Property Type:
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

                      {/* Furnishing Status */}
                      <tr className="border-b border-white/20">
                        <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                          Furnishing Status:
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
                          Area:
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
                          Availability:
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
                          Tenant Preference:
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
                          Budget:
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
                          Sort By:
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
                          Search Keywords:
                        </th>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={pendingFilters.premise}
                            onChange={(e) => handleFilterChange('premise', e.target.value)}
                            placeholder="Search by address, area, property type..."
                            className="w-full px-4 py-2 bg-slate-800/50 border border-white/20 text-white placeholder-white/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                      </tr>

                      {/* View Mode Selection */}
                      <tr className="border-b border-white/20">
                        <th className="border-r border-white/20 px-4 py-3 text-left font-semibold bg-[#167f92] text-white">
                          View Mode:
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
                              <option value="compact" className="bg-gray-800">� Compact View (Dense)</option>
                              <option value="pretty" className="bg-gray-800">🎨 Pretty View (Cards)</option>
                              <option value="gallery" className="bg-gray-800">🖼️ Gallery View (Visual)</option>
                              <option value="master" className="bg-gray-800">📜 Master View (All Data)</option>
                            </select>
                            <span className="text-xs text-white/60 ml-2">
                              {pendingFilters.viewMode === 'master' && '⚠️ Loads all records'}
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
                              {loading ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Applying...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  🔍 Apply Filters
                                  {hasUnappliedChanges && (
                                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                      {countPendingChanges()} changes
                                    </span>
                                  )}
                                </span>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="backdrop-blur-md bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Properties Display - Multi-View Mode */}
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
              {/* View Mode Header */}
              <div className="bg-white/10 border-b border-white/20 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-white">
                      {filters.viewMode === 'pretty' && '🎨 Pretty Cards'}
                      {filters.viewMode === 'compact' && '📊 Compact Table'}
                      {filters.viewMode === 'gallery' && '🖼️ Gallery View'}
                      {filters.viewMode === 'master' && '📜 Master View'}
                    </h3>
                    <div className="text-sm text-white/70">
                      {properties.length.toLocaleString()} of {totalCount.toLocaleString()} properties
                    </div>
                  </div>
                  {filters.viewMode === 'master' && properties.length > 100 && (
                    <div className="text-xs text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-full">
                      ⚠️ Large dataset - performance may vary
                    </div>
                  )}
                </div>
              </div>

              {/* Content based on view mode */}
              <div className="p-6">
                {filters.viewMode === 'pretty' && (
                  <PrettyCardsView properties={properties} loading={loading} />
                )}
                {filters.viewMode === 'compact' && (
                  <CompactTableView properties={properties} loading={loading} />
                )}
                {filters.viewMode === 'gallery' && (
                  <GalleryView properties={properties} loading={loading} />
                )}
                {filters.viewMode === 'master' && (
                  <MasterTableView properties={properties} loading={loading} />
                )}
              </div>

              {/* Pagination - shown for all views */}
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

// View Components

// Pretty Cards View
const PrettyCardsView: React.FC<{ properties: PropertyData[]; loading: boolean }> = ({ properties, loading }) => {
  if (loading || properties.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, index) => (
        <div key={property.serial_number || index} className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:border-blue-400/40">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <span className="text-2xl">
                  {property.property_type?.includes('Res') ? '🏠' : '🏢'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{property.property_type || 'Property'}</h3>
                <p className="text-sm text-white/70">{property.sub_property_type || 'N/A'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-400">
                {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
              </div>
              <div className="text-xs text-white/60">#{property.serial_number}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">📍</span>
              <span className="text-white/80 text-sm">{property.area || 'Location not specified'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-purple-400">📐</span>
              <span className="text-white/80 text-sm">{property.size || 'Size not specified'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-orange-400">🛋️</span>
              <span className="text-white/80 text-sm">{property.furnishing_status || 'N/A'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <span className="text-white/80 text-sm">{property.availability || 'N/A'}</span>
            </div>

            {property.owner_contact && (
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">📞</span>
                <span className="text-white/80 text-sm">{property.owner_contact}</span>
              </div>
            )}
          </div>

          {property.additional_details && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-white/60 line-clamp-2">{property.additional_details}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Compact Table View
const CompactTableView: React.FC<{ properties: PropertyData[]; loading: boolean }> = ({ properties, loading }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-white/10 border-b border-white/20">
        <tr>
          <th className="px-2 py-2 text-left text-white font-medium">#</th>
          <th className="px-2 py-2 text-left text-white font-medium">Type</th>
          <th className="px-2 py-2 text-left text-white font-medium">Owner</th>
          <th className="px-2 py-2 text-left text-white font-medium">Area</th>
          <th className="px-2 py-2 text-left text-white font-medium">Price</th>
          <th className="px-2 py-2 text-left text-white font-medium">Size</th>
          <th className="px-2 py-2 text-left text-white font-medium">Status</th>
          <th className="px-2 py-2 text-left text-white font-medium">Contact</th>
        </tr>
      </thead>
      <tbody>
        {properties.length > 0 ? (
          properties.map((property, index) => (
            <tr key={property.serial_number || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-2 py-2 text-white/60 font-mono text-xs">{property.serial_number}</td>
              <td className="px-2 py-2 text-white/80">
                <span className="text-xs">
                  {property.property_type === 'Res_rental' ? 'Residential Rent' :
                   property.property_type === 'Res_resale' ? 'Residential Resale' :
                   property.property_type === 'Com_rental' ? 'Commercial Rent' :
                   property.property_type === 'Com_resale' ? 'Commercial Resale' :
                   property.property_type || 'N/A'}
                </span>
              </td>
              <td className="px-2 py-2 text-yellow-400 text-xs">{property.owner_name || 'N/A'}</td>
              <td className="px-2 py-2 text-white/80 text-xs">{property.area || 'N/A'}</td>
              <td className="px-2 py-2 text-green-400 font-semibold text-xs">
                {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
              </td>
              <td className="px-2 py-2 text-white/80 text-xs">{property.size || 'N/A'}</td>
              <td className="px-2 py-2 text-white/80 text-xs">{property.availability || 'N/A'}</td>
              <td className="px-2 py-2 text-cyan-400 text-xs">{property.owner_contact || 'N/A'}</td>
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
);

// Gallery View
const GalleryView: React.FC<{ properties: PropertyData[]; loading: boolean }> = ({ properties, loading }) => {
  if (loading || properties.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property, index) => (
        <div key={property.serial_number || index} className="card-hover-3d backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-blue-400/40">
          {/* Dummy Image/Icon */}
          <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border-b border-white/20">
            <div className="text-center">
              <div className="text-6xl mb-2">
                {property.property_type?.includes('Res') ? '🏠' : '🏢'}
              </div>
              <div className="text-xs text-white/60">Property Image</div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-semibold text-white line-clamp-1">
                {property.sub_property_type || property.property_type || 'Property'}
              </h3>
              <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                #{property.serial_number}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-sm">📍</span>
                <span className="text-white/80 text-xs line-clamp-1">{property.area || 'Location N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-sm">📐</span>
                <span className="text-white/80 text-xs">{property.size || 'Size N/A'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-green-400 font-bold text-sm">
                {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'Price N/A'}
              </div>
              <div className="text-xs text-white/60">
                {property.availability || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Master Table View (All data)
const MasterTableView: React.FC<{ properties: PropertyData[]; loading: boolean }> = ({ properties, loading }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-white/10 border-b border-white/20 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left text-white font-medium">#</th>
          <th className="px-3 py-2 text-left text-white font-medium">ID</th>
          <th className="px-3 py-2 text-left text-white font-medium">Type</th>
          <th className="px-3 py-2 text-left text-white font-medium">Sub Type</th>
          <th className="px-3 py-2 text-left text-white font-medium">Area</th>
          <th className="px-3 py-2 text-left text-white font-medium">Address</th>
          <th className="px-3 py-2 text-left text-white font-medium">Size</th>
          <th className="px-3 py-2 text-left text-white font-medium">Price</th>
          <th className="px-3 py-2 text-left text-white font-medium">Deposit</th>
          <th className="px-3 py-2 text-left text-white font-medium">Furnishing</th>
          <th className="px-3 py-2 text-left text-white font-medium">Availability</th>
          <th className="px-3 py-2 text-left text-white font-medium">Floor</th>
          <th className="px-3 py-2 text-left text-white font-medium">Age</th>
          <th className="px-3 py-2 text-left text-white font-medium">Tenant Pref</th>
          <th className="px-3 py-2 text-left text-white font-medium">Owner</th>
          <th className="px-3 py-2 text-left text-white font-medium">Contact</th>
          <th className="px-3 py-2 text-left text-white font-medium">Special Note</th>
          <th className="px-3 py-2 text-left text-white font-medium">Additional Details</th>
        </tr>
      </thead>
      <tbody>
        {properties.length > 0 ? (
          properties.map((property, index) => (
            <tr key={property.serial_number || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-3 py-2 text-white/60 font-mono text-xs">{property.serial_number}</td>
              <td className="px-3 py-2 text-white/60 font-mono text-xs">{property.property_id}</td>
              <td className="px-3 py-2 text-white/80 text-xs">
                {property.property_type === 'Res_rental' ? 'Residential Rent' :
                 property.property_type === 'Res_resale' ? 'Residential Resale' :
                 property.property_type === 'Com_rental' ? 'Commercial Rent' :
                 property.property_type === 'Com_resale' ? 'Commercial Resale' :
                 property.property_type || 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.sub_property_type || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.area || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs max-w-32 truncate" title={property.address || 'N/A'}>
                {property.address || 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.size || 'N/A'}</td>
              <td className="px-3 py-2 text-green-400 font-semibold text-xs">
                {property.rent_or_sell_price ? `₹${parseFloat(property.rent_or_sell_price).toLocaleString()}` : 'N/A'}
              </td>
              <td className="px-3 py-2 text-yellow-400 text-xs">
                {property.deposit ? `₹${parseFloat(property.deposit).toLocaleString()}` : 'N/A'}
              </td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.furnishing_status || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.availability || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.floor || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.age || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.tenant_preference || 'N/A'}</td>
              <td className="px-3 py-2 text-white/80 text-xs">{property.owner_name || 'N/A'}</td>
              <td className="px-3 py-2 text-cyan-400 text-xs">{property.owner_contact || 'N/A'}</td>
              <td className="px-3 py-2 text-orange-400 text-xs max-w-32 truncate" title={property.special_note || 'No special note'}>
                {property.special_note || 'No special note'}
              </td>
              <td className="px-3 py-2 text-purple-400 text-xs max-w-32 truncate" title={property.additional_details || 'No additional details'}>
                {property.additional_details || 'No additional details'}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={18} className="px-4 py-8 text-center text-white/60">
              {loading ? 'Loading properties...' : 'No properties found matching your criteria'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
