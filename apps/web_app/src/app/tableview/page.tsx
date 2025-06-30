"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useDynamicOptions } from '@/lib/dynamicOptions';
import { usePropertyStats } from '@/hooks/usePropertyStats';
import { useAuth } from '@/contexts/AuthContext';
import Pagination from '@/components/ui/pagination';
import { PropertyData } from '@/lib/dummyProperties';
import { usePropertyCache } from '@/hooks/usePropertyCache';

// Components
import BackgroundElements from '@/components/BackgroundElements';
import PageHeader from '@/components/PageHeader';
import PropertyStatsOverview from '@/components/PropertyStatsOverview';
import PropertyControlPanel from '@/components/PropertyControlPanel';
import PropertyFiltersPanel, { FilterState } from '@/components/PropertyFiltersPanel';
import PropertyDisplayContainer from '@/components/PropertyDisplayContainer';

// Initial filter state
const initialFilters: FilterState = {
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
    const filterCheck = filters.propertyType.length > 0 ||
           filters.subPropertyType.length > 0 ||
           filters.condition.length > 0 ||
           filters.area.length > 0 ||
           filters.availability.length > 0 ||
           filters.availabilityType.length > 0 ||
           !!filters.budgetMin ||
           !!filters.budgetMax ||
           !!filters.premise ||
           filters.sortBy !== 'serial_number' ||
           filters.sortOrder !== 'asc' ||
           filters.viewMode !== 'compact';
    return filterCheck;
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

      if (filterState.subPropertyType.length > 0) {
        console.log('Applying sub property type filter:', filterState.subPropertyType);
        query = query.in('sub_property_type', filterState.subPropertyType);
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
          sortColumn = 'date_stamp';
          ascending = filterState.sortOrder === 'asc';
          break;
        default:
          sortColumn = 'serial_number';
          ascending = filterState.sortOrder === 'asc';
      }
      
      // Apply sorting with proper handling for numeric fields
      if (filterState.sortBy === 'price') {
        // For price sorting across entire dataset, we need to fetch all data first
        console.log('Price sorting requires full dataset - fetching all records...');
        
        // Remove pagination temporarily to get all matching records
        // We'll sort client-side and then apply pagination
        
        // Execute query without pagination first
        const allDataResult = await query;
        
        if (allDataResult.error) {
          throw allDataResult.error;
        }
        
        const allData = allDataResult.data || [];
        const totalCount = allDataResult.count || 0;
        
        console.log('Fetched all data for price sorting:', allData.length, 'records');
        
        // Sort all data client-side
        const sortedAllData = [...allData].sort((a, b) => {
          const priceA = a.rent_or_sell_price;
          const priceB = b.rent_or_sell_price;
          
          // Check if values are numeric
          const isNumericA = /^[0-9]+(\.[0-9]+)?$/.test(String(priceA));
          const isNumericB = /^[0-9]+(\.[0-9]+)?$/.test(String(priceB));
          
          // Numeric values always come before non-numeric
          if (isNumericA && !isNumericB) return -1;
          if (!isNumericA && isNumericB) return 1;
          
          // Both numeric - compare as numbers
          if (isNumericA && isNumericB) {
            const numA = parseFloat(String(priceA));
            const numB = parseFloat(String(priceB));
            return ascending ? numA - numB : numB - numA;
          }
          
          // Both non-numeric - no specific order (as requested)
          return 0;
        });
        
        // Apply pagination to sorted data
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedData = sortedAllData.slice(startIndex, endIndex);
        
        console.log('Applied pagination to sorted data:', {
          totalRecords: sortedAllData.length,
          startIndex,
          endIndex,
          pageData: paginatedData.length
        });
        
        setProperties(paginatedData);
        setTotalCount(totalCount);
        
        // Early return since we've handled everything for price sorting
        return;
      } else {
        query = query.order(sortColumn, { ascending });
      }
      
      // Apply pagination for non-price sorting modes only
      // Price sorting handles pagination after client-side sorting
      if (filterState.sortBy !== 'price') {
        const from = (page - 1) * size;
        const to = from + size - 1;
        query = query.range(from, to);
      }

      // Execute query for non-price sorting
      let result;
      try {
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

      console.log('Query successful, setting properties:', { 
        resultData: resultData.length, 
        resultCount,
        sortBy: filterState.sortBy,
        sortOrder: filterState.sortOrder
      });
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
        <BackgroundElements />
        
        <div className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader />

            <PropertyStatsOverview stats={stats} loading={statsLoading} />

            <PropertyControlPanel
              hasActiveFilters={hasActiveFilters}
              backgroundLoading={backgroundLoading}
              propertiesCount={properties.length}
              totalCount={totalCount}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />

            <PropertyFiltersPanel
              showFilters={showFilters}
              pendingFilters={pendingFilters}
              hasUnappliedChanges={hasUnappliedChanges}
              loading={loading}
              dynamicOptions={dynamicOptions}
              onFilterChange={handleFilterChange}
              onApplyFilters={applyFilters}
              onClearAndApplyFilters={clearAndApplyFilters}
            />

            {/* Error Display */}
            {error && (
              <div className="backdrop-blur-md bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            <PropertyDisplayContainer
              properties={properties}
              loading={loading}
              totalCount={totalCount}
              viewMode={filters.viewMode}
            />

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="mt-8">
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
    </ProtectedRoute>
  );
}
