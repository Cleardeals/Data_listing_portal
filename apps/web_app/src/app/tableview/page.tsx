"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { usePropertyStats } from '@/hooks/usePropertyStats';
import { useAuth } from '@/contexts/AuthContext';
import Pagination from '@/components/ui/pagination';
import { PropertyData } from '@/lib/dummyProperties';
import { usePropertyCache } from '@/hooks/usePropertyCache';
import { useContactVisibility } from '@/hooks/useContactVisibility';

// Components
import BackgroundElements from '@/components/BackgroundElements';
import PageHeader from '@/components/PageHeader';
import PropertyStatsOverview from '@/components/PropertyStatsOverview';
import PropertyControlPanel from '@/components/PropertyControlPanel';
import PropertyFiltersPanel, { FilterState, initialFilters } from '@/components/PropertyFiltersPanel';
import PropertyDisplayContainer from '@/components/PropertyDisplayContainer';
import AISalesScriptGenerator from '@/components/AISalesScriptGenerator';

export default function TableViewPage() {
  // Auth state
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // State management
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeDateFilter, setActiveDateFilter] = useState<'today' | 'yesterday' | 'all'>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Abort controller for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hooks
  const { stats, loading: statsLoading } = usePropertyStats();
  const cache = usePropertyCache();
  const { toggleContactVisibility, isContactVisible, getVisibleContactsCount } = useContactVisibility();

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
           filters.viewMode !== 'compact' ||
           activeDateFilter !== 'all';
    return filterCheck;
  }, [filters, activeDateFilter]);

  // Main fetch function - simplified for debugging
  const fetchProperties = useCallback(async (
    page: number,
    size: number,
    filterState: FilterState,
    useCache: boolean = true,
    dateFilter: 'today' | 'yesterday' | 'all' = 'all'
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
          .eq('visibility', true); // Only show visible properties
        
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

      // Apply date filter
      if (dateFilter !== 'all') {
        console.log('Applying date filter:', dateFilter);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Format dates to YYYY-MM-DD for database comparison
        const todayString = today.toISOString().split('T')[0];
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        // Format for DD/MM/YYYY comparison
        const todayDDMMYYYY = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        const yesterdayDDMMYYYY = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
        
        if (dateFilter === 'today') {
          // Filter for today's date - handle multiple date formats
          query = query.or(
            `date_stamp.eq.${todayString},date_stamp.eq.${todayDDMMYYYY},date_stamp::date.eq.${todayString}`
          );
        } else if (dateFilter === 'yesterday') {
          // Filter for yesterday's date - handle multiple date formats
          query = query.or(
            `date_stamp.eq.${yesterdayString},date_stamp.eq.${yesterdayDDMMYYYY},date_stamp::date.eq.${yesterdayString}`
          );
        }
        
        console.log('Date filter applied:', { 
          dateFilter, 
          todayString, 
          yesterdayString, 
          todayDDMMYYYY, 
          yesterdayDDMMYYYY 
        });
      }

      // Check if we need comprehensive dataset (for price sorting OR budget filtering OR premise search OR date filtering)
      const needsComprehensiveDataset = filterState.sortBy === 'price' || 
                                       filterState.budgetMin || 
                                       filterState.budgetMax ||
                                       filterState.premise ||
                                       dateFilter !== 'all';

      // Premise filtering - we'll handle this client-side when comprehensive dataset is needed
      if (filterState.premise && !needsComprehensiveDataset) {
        console.log('Applying server-side premise filter:', filterState.premise);
        query = query.or(`address.ilike.%${filterState.premise}%,sub_property_type.ilike.%${filterState.premise}%,property_type.ilike.%${filterState.premise}%,area.ilike.%${filterState.premise}%,owner_name.ilike.%${filterState.premise}%,property_id.ilike.%${filterState.premise}%`);
      } else if (filterState.premise) {
        console.log('Premise filter will be applied client-side with comprehensive dataset');
      }

      // Budget filtering note - we'll handle this client-side when comprehensive dataset is needed
      if ((filterState.budgetMin || filterState.budgetMax) && !needsComprehensiveDataset) {
        try {
          // Only apply server-side budget filters when NOT using comprehensive dataset
          if (filterState.budgetMin) {
            query = query.gte('rent_or_sell_price::numeric', parseFloat(filterState.budgetMin));
          }
          if (filterState.budgetMax) {
            query = query.lte('rent_or_sell_price::numeric', parseFloat(filterState.budgetMax));
          }
        } catch {
          console.warn('Server-side budget filter failed, will use client-side filtering');
        }
      } else if (filterState.budgetMin || filterState.budgetMax) {
        console.log('Budget filters will be applied client-side with comprehensive dataset');
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
      
      // Apply sorting with proper handling for numeric fields OR comprehensive budget filtering OR premise search
      if (needsComprehensiveDataset) {
        // For price sorting OR budget filtering OR premise search OR date filtering, fetch ALL records from database (ignore all filters)
        // This ensures we can properly handle numeric vs non-numeric values across the complete dataset
        const reasons = [];
        if (filterState.sortBy === 'price') reasons.push('price sorting');
        if (filterState.budgetMin || filterState.budgetMax) reasons.push('budget filtering');
        if (filterState.premise) reasons.push('premise search');
        if (dateFilter !== 'all') reasons.push('date filtering');
        const reason = reasons.join(' + ');
        
        console.log(`${reason} requires complete dataset - fetching ALL records from database...`);
        
        // Create a new query that fetches ALL records, ignoring all filters
        // Use chunked fetching to bypass Supabase's 1000 record limit
        console.log(`${reason} requires complete dataset - fetching ALL records in chunks...`);
        
        const allData: PropertyData[] = [];
        let offset = 0;
        const chunkSize = 1000;
        let totalFetched = 0;
        let originalCount = 0;
        
        // Fetch records in chunks until we get all of them
        while (true) {
          console.log(`Fetching chunk ${Math.floor(offset / chunkSize) + 1}, records ${offset + 1} to ${offset + chunkSize}...`);
          
          const chunkQuery = supabase
            .from('propertydata')
            .select('*', { count: 'exact' })
            .eq('visibility', true) // Only fetch visible properties
            .range(offset, offset + chunkSize - 1);
          
          const chunkResult = await chunkQuery;
          
          if (chunkResult.error) {
            throw chunkResult.error;
          }
          
          const chunkData = chunkResult.data || [];
          
          // Store the total count from the first chunk
          if (offset === 0) {
            originalCount = chunkResult.count || 0;
            console.log(`Total records in database: ${originalCount}`);
          }
          
          // Add chunk data to our collection
          allData.push(...chunkData);
          totalFetched += chunkData.length;
          
          console.log(`Fetched ${chunkData.length} records in this chunk. Total so far: ${totalFetched}`);
          
          // If we got fewer than chunkSize records, we've reached the end
          if (chunkData.length < chunkSize) {
            console.log('Reached end of data - last chunk was smaller than expected');
            break;
          }
          
          // Move to next chunk
          offset += chunkSize;
          
          // Safety check to prevent infinite loops
          if (offset > 1000000) {
            console.warn('Safety limit reached - stopping at 1 million records');
            break;
          }
        }
        
        console.log('Fetched complete dataset:', {
          totalDbRecords: allData.length,
          originalQueryCount: originalCount,
          reasons: reasons.join(' + '),
          filtersIgnored: true,
          isLimitedBySupabase: allData.length === 1000 ? 'WARNING: Might be limited to 1000!' : 'OK',
          possibleLimitHit: allData.length % 1000 === 0 ? 'WARNING: Round number suggests limit' : 'OK'
        });
        
        // Add warning if we suspect we're hitting a limit
        if (allData.length === 1000) {
          console.warn('🚨 POTENTIAL ISSUE: Fetched exactly 1000 records - this might indicate a Supabase limit!');
          console.warn('If your database has more than 1000 records, filtering/sorting may not work correctly.');
        }

        // Apply client-side filtering for ALL filter types when using comprehensive dataset
        let filteredData = allData;
        
        // Apply property type filter
        if (filterState.propertyType.length > 0) {
          console.log('Applying client-side property type filter:', filterState.propertyType);
          const beforeFilter = filteredData.length;
          filteredData = filteredData.filter(item => 
            filterState.propertyType.includes(item.property_type || '')
          );
          console.log('Property type filtering results:', {
            beforeFilter,
            afterFilter: filteredData.length,
            excludedCount: beforeFilter - filteredData.length
          });
        }

        // Apply sub property type filter
        if (filterState.subPropertyType.length > 0) {
          console.log('Applying client-side sub property type filter:', filterState.subPropertyType);
          const beforeFilter = filteredData.length;
          filteredData = filteredData.filter(item => 
            filterState.subPropertyType.includes(item.sub_property_type || '')
          );
          console.log('Sub property type filtering results:', {
            beforeFilter,
            afterFilter: filteredData.length,
            excludedCount: beforeFilter - filteredData.length
          });
        }

        // Apply area filter
        if (filterState.area.length > 0) {
          console.log('Applying client-side area filter:', filterState.area);
          const beforeFilter = filteredData.length;
          filteredData = filteredData.filter(item => {
            const itemArea = item.area || '';
            return filterState.area.some(area => 
              itemArea.toLowerCase().includes(area.toLowerCase())
            );
          });
          console.log('Area filtering results:', {
            beforeFilter,
            afterFilter: filteredData.length,
            excludedCount: beforeFilter - filteredData.length
          });
        }

        // Apply availability filter
        if (filterState.availability.length > 0) {
          console.log('Applying client-side availability filter:', filterState.availability);
          const beforeFilter = filteredData.length;
          filteredData = filteredData.filter(item => 
            filterState.availability.includes(item.availability || '')
          );
          console.log('Availability filtering results:', {
            beforeFilter,
            afterFilter: filteredData.length,
            excludedCount: beforeFilter - filteredData.length
          });
        }

        // Apply condition (furnishing status) filter
        if (filterState.condition.length > 0) {
          console.log('Applying client-side furnishing status filter:', filterState.condition);
          const beforeFilter = filteredData.length;
          filteredData = filteredData.filter(item => 
            filterState.condition.includes(item.furnishing_status || '')
          );
          console.log('Furnishing status filtering results:', {
            beforeFilter,
            afterFilter: filteredData.length,
            excludedCount: beforeFilter - filteredData.length
          });
        }

        // Apply availability type (tenant preference) filter
        if (filterState.availabilityType.length > 0) {
          console.log('Applying client-side tenant preference filter:', filterState.availabilityType);
          const beforeFilter = filteredData.length;
          filteredData = filteredData.filter(item => 
            filterState.availabilityType.includes(item.tenant_preference || '')
          );
          console.log('Tenant preference filtering results:', {
            beforeFilter,
            afterFilter: filteredData.length,
            excludedCount: beforeFilter - filteredData.length
          });
        }

        // Apply client-side date filter
        if (dateFilter !== 'all') {
          console.log('Applying client-side date filter:', dateFilter);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Format dates for comparison
          const todayString = today.toISOString().split('T')[0];
          const yesterdayString = yesterday.toISOString().split('T')[0];
          const todayDDMMYYYY = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
          const yesterdayDDMMYYYY = `${yesterday.getDate().toString().padStart(2, '0')}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getFullYear()}`;
          
          const beforeFilter = filteredData.length;
          filteredData = filteredData.filter(item => {
            if (!item.date_stamp) return false;
            
            let propertyDateString = '';
            if (item.date_stamp.includes('T')) {
              // ISO format (YYYY-MM-DDTHH:mm:ss)
              propertyDateString = item.date_stamp.split('T')[0];
            } else if (item.date_stamp.includes('/')) {
              // DD/MM/YYYY format - convert to YYYY-MM-DD
              const parts = item.date_stamp.split('/');
              if (parts.length === 3) {
                const [day, month, year] = parts;
                propertyDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              }
            } else {
              // Assume it's already in YYYY-MM-DD format
              propertyDateString = item.date_stamp;
            }
            
            if (dateFilter === 'today') {
              return propertyDateString === todayString || item.date_stamp === todayDDMMYYYY;
            } else if (dateFilter === 'yesterday') {
              return propertyDateString === yesterdayString || item.date_stamp === yesterdayDDMMYYYY;
            }
            
            return true;
          });
          
          console.log('Date filtering results:', {
            beforeFilter,
            afterFilter: filteredData.length,
            excludedCount: beforeFilter - filteredData.length,
            dateFilter,
            todayString,
            yesterdayString
          });
        }

        // Apply budget filtering if needed
        if (filterState.budgetMin || filterState.budgetMax) {
          console.log('Applying client-side budget filters:', { 
            budgetMin: filterState.budgetMin, 
            budgetMax: filterState.budgetMax 
          });
          
          const minBudget = filterState.budgetMin ? parseFloat(filterState.budgetMin) : null;
          const maxBudget = filterState.budgetMax ? parseFloat(filterState.budgetMax) : null;
          
          filteredData = allData.filter(item => {
            const price = item.rent_or_sell_price;
            
            // Enhanced regex to handle various number formats (including commas, spaces)
            const numericRegex = /^\s*[\d,]+(\.\d+)?\s*$/;
            const isNumeric = numericRegex.test(String(price));
            
            // Only filter numeric prices - non-numeric prices are excluded from budget filtering
            if (!isNumeric) {
              return false; // Exclude non-numeric prices from budget filtering
            }
            
            // Clean and parse the price
            const cleanPrice = String(price).replace(/[,\s]/g, '');
            const numericPrice = parseFloat(cleanPrice);
            
            // Check if price is valid
            if (isNaN(numericPrice)) {
              return false;
            }
            
            // Apply min/max constraints
            if (minBudget !== null && numericPrice < minBudget) {
              return false;
            }
            if (maxBudget !== null && numericPrice > maxBudget) {
              return false;
            }
            
            return true;
          });
          
          console.log('Budget filtering results:', {
            originalCount: allData.length,
            filteredCount: filteredData.length,
            excludedCount: allData.length - filteredData.length,
            minBudget,
            maxBudget
          });
        }

        // Apply client-side premise (search keyword) filtering if needed
        if (filterState.premise) {
          console.log('Applying client-side premise filter:', filterState.premise);
          
          const searchTerm = filterState.premise.toLowerCase();
          const beforePremiseFilter = filteredData.length;
          
          filteredData = filteredData.filter(item => {
            // Search in multiple fields: address, sub_property_type, property_type, area, owner_name, property_id
            const searchFields = [
              item.address,
              item.sub_property_type,
              item.property_type,
              item.area,
              item.owner_name,
              item.property_id
            ];
            
            // Check if any field contains the search term (case-insensitive)
            return searchFields.some(field => 
              field && String(field).toLowerCase().includes(searchTerm)
            );
          });
          
          console.log('Premise filtering results:', {
            beforeFilter: beforePremiseFilter,
            afterFilter: filteredData.length,
            excludedCount: beforePremiseFilter - filteredData.length,
            searchTerm: filterState.premise
          });
        }
        
        // Sort the data (after budget filtering if applicable)
        let sortedAllData = filteredData;
        if (filterState.sortBy === 'price') {
          console.log('Applying price sorting to dataset...');
          sortedAllData = [...filteredData].sort((a, b) => {
            const priceA = a.rent_or_sell_price;
            const priceB = b.rent_or_sell_price;
            
            // Enhanced regex to handle various number formats (including commas, spaces)
            const numericRegex = /^\s*[\d,]+(\.\d+)?\s*$/;
            const isNumericA = numericRegex.test(String(priceA));
            const isNumericB = numericRegex.test(String(priceB));
            
            // Debug individual comparisons
            if (process.env.NODE_ENV === 'development') {
              console.log('Comparing:', { 
                priceA, 
                priceB, 
                isNumericA, 
                isNumericB, 
                ascending 
              });
            }
            
            // Numeric values always come before non-numeric (regardless of sort direction)
            if (isNumericA && !isNumericB) return -1;
            if (!isNumericA && isNumericB) return 1;
            
            // Both numeric - compare as numbers
            if (isNumericA && isNumericB) {
              // Clean the price strings (remove commas, spaces) before parsing
              const cleanPriceA = String(priceA).replace(/[,\s]/g, '');
              const cleanPriceB = String(priceB).replace(/[,\s]/g, '');
              const numA = parseFloat(cleanPriceA);
              const numB = parseFloat(cleanPriceB);
              
              // Debug numeric comparison
              if (process.env.NODE_ENV === 'development') {
                console.log('Numeric comparison:', { 
                  cleanPriceA, 
                  cleanPriceB, 
                  numA, 
                  numB, 
                  result: ascending ? numA - numB : numB - numA 
                });
              }
              
              return ascending ? numA - numB : numB - numA;
            }
            
            // Both non-numeric - maintain stable order
            return 0;
          });
        } else {
          // For non-price sorting, apply the appropriate sort
          sortedAllData = [...filteredData].sort((a, b) => {
            let valueA: string | number | null, valueB: string | number | null;
            
            switch (filterState.sortBy) {
              case 'serial_number':
                valueA = a.serial_number;
                valueB = b.serial_number;
                break;
              case 'date':
                valueA = a.date_stamp;
                valueB = b.date_stamp;
                break;
              default:
                valueA = a.serial_number;
                valueB = b.serial_number;
            }
            
            // Handle null values
            if (valueA === null && valueB === null) return 0;
            if (valueA === null) return 1; // null values go to end
            if (valueB === null) return -1; // null values go to end
            
            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;
            return 0;
          });
        }
        
        console.log('Sample results (first 10):', sortedAllData.slice(0, 10).map((item: PropertyData) => ({
          serial: item.serial_number,
          price: item.rent_or_sell_price
        })));
        
        if (sortedAllData.length > 10) {
          console.log('Sample results (last 10):', sortedAllData.slice(-10).map((item: PropertyData) => ({
            serial: item.serial_number,
            price: item.rent_or_sell_price
          })));
        }
        
        // Apply pagination to processed data with safety checks
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const maxAvailableIndex = sortedAllData.length;
        
        // Ensure we don't go beyond available data
        const safeEndIndex = Math.min(endIndex, maxAvailableIndex);
        const paginatedData = sortedAllData.slice(startIndex, safeEndIndex);
        
        // Log detailed pagination info
        console.log('Applied pagination to processed data:', {
          totalProcessedRecords: sortedAllData.length,
          totalDbRecords: originalCount,
          currentPage: page,
          pageSize: size,
          startIndex,
          endIndex,
          safeEndIndex,
          pageData: paginatedData.length,
          maxPossiblePages: Math.ceil(sortedAllData.length / size),
          isLastPage: endIndex >= maxAvailableIndex,
          usingCompleteDataset: true,
          appliedBudgetFilter: !!(filterState.budgetMin || filterState.budgetMax),
          appliedPriceSort: filterState.sortBy === 'price',
          appliedPremiseSearch: !!filterState.premise,
          appliedDateFilter: dateFilter !== 'all'
        });
        
        setProperties(paginatedData);
        // Use the actual processed data length for total count
        setTotalCount(sortedAllData.length);
        
        // Early return since we've handled everything for comprehensive dataset processing
        return;
      } else {
        query = query.order(sortColumn, { ascending });
      }
      
      // Apply pagination for non-comprehensive dataset modes only
      // Comprehensive dataset (price sorting or budget filtering) handles pagination after client-side processing
      if (!needsComprehensiveDataset) {
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
        .eq('visibility', true)
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

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchProperties(page, pageSize, filters, true, activeDateFilter);
  }, [pageSize, filters, fetchProperties, activeDateFilter]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    console.log('=== PAGE SIZE CHANGE ===');
    console.log('Old page size:', pageSize);
    console.log('New page size:', newPageSize);
    console.log('Current applied filters:', filters);
    
    setPageSize(newPageSize);
    setCurrentPage(1);
    
    // Use the currently applied filters for page size change
    // This ensures filters remain applied when changing page size
    console.log('Using applied filters for page size change:', filters);
    fetchProperties(1, newPageSize, filters, true, activeDateFilter);
  }, [filters, fetchProperties, pageSize, activeDateFilter]);

  // Auto-adjust page size for map view
  useEffect(() => {
    if (filters.viewMode === 'map' && pageSize > 50) {
      console.log('Auto-adjusting page size from', pageSize, 'to 50 for map view');
      setPageSize(50);
      setCurrentPage(1);
      fetchProperties(1, 50, filters, true, activeDateFilter);
    }
  }, [filters.viewMode, pageSize, filters, fetchProperties, activeDateFilter]);

  // Date filter handler
  const handleDateFilter = useCallback((filter: 'today' | 'yesterday' | 'all') => {
    console.log('=== DATE FILTER CHANGE ===');
    console.log('New date filter:', filter);
    
    setActiveDateFilter(filter);
    setCurrentPage(1);
    
    // Fetch properties with the date filter applied at the database level
    fetchProperties(1, pageSize, filters, true, filter);
  }, [filters, fetchProperties, pageSize]);

  // Wrapper function for PropertyFiltersPanel to include current date filter
  const fetchPropertiesWithDateFilter = useCallback((
    page: number,
    size: number,
    filterState: FilterState,
    useCache: boolean = true
  ) => {
    return fetchProperties(page, size, filterState, useCache, activeDateFilter);
  }, [fetchProperties, activeDateFilter]);

  // Toggle rent_sold_out status function
  const handleToggleRentSoldOut = useCallback(async (serialNumber: number, rentSoldOut: boolean) => {
    try {
      setError(null); // Clear any previous errors
      
      // Update local state immediately for better UX (optimistic update)
      setProperties(currentData => 
        currentData.map(item => 
          item.serial_number === serialNumber 
            ? { ...item, rent_sold_out: rentSoldOut }
            : item
        )
      );
      
      const { error } = await supabase
        .from('propertydata')
        .update({ rent_sold_out: rentSoldOut })
        .eq('serial_number', serialNumber);

      if (error) {
        console.error('Supabase update error:', error);
        // Revert the optimistic update on error
        setProperties(currentData => 
          currentData.map(item => 
            item.serial_number === serialNumber 
              ? { ...item, rent_sold_out: !rentSoldOut }
              : item
          )
        );
        throw error;
      }

      console.log(`Successfully updated rent_sold_out status for property ${serialNumber} to ${rentSoldOut}`);
      
    } catch (err: unknown) {
      console.error('Error updating rent_sold_out status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property status');
    }
  }, []);

  // Check if user can edit rent_sold_out status (super_admin, data_operator, and customers)
  const canEditRentSoldOut = useMemo(() => {
    return user?.role === 'super_admin' || user?.role === 'data_operator' || user?.group === 'customers';
  }, [user?.role, user?.group]);

  // Initial load effect
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchProperties(1, pageSize, initialFilters, true, 'all');
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
            setTimeout(() => fetchProperties(1, pageSize, filters, true, activeDateFilter), 1000);
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
          setTimeout(() => fetchProperties(currentPage, pageSize, filters, true, activeDateFilter), 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, authLoading, currentPage, pageSize, filters, fetchProperties, cache, activeDateFilter]);

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
      console.log('Has active filters:', hasActiveFilters);
    }
  }, [filters, hasActiveFilters]);

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
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onDateFilter={handleDateFilter}
              activeDateFilter={activeDateFilter}
            />

            <PropertyFiltersPanel
              showFilters={showFilters}
              filters={filters}
              setFilters={setFilters}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              loading={loading}
              onFetchProperties={fetchPropertiesWithDateFilter}
            />

            {/* AI Sales Script Generator */}
            <AISalesScriptGenerator
              properties={properties}
              onScriptGenerated={(scripts) => {
                console.log('Generated scripts:', scripts);
                // You can add additional handling here, like storing in state or analytics
              }}
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
              toggleContactVisibility={toggleContactVisibility}
              isContactVisible={isContactVisible}
              getVisibleContactsCount={getVisibleContactsCount}
              onToggleRentSoldOut={handleToggleRentSoldOut}
              canEditRentSoldOut={canEditRentSoldOut}
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
                  viewMode={filters.viewMode}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
