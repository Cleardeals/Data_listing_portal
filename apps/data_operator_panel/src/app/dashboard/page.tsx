"use client"
import React, { useState, useEffect, useCallback } from "react";
import { FaBell, FaUserCircle, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BulkUploadButton from "@/components/modals/BulkUploadModal"; 
import { AddEditPropertyModal } from "@/components/modals/AddEditPropertyModal";
import { MdAddCall } from "react-icons/md";
import { EditConfirmationModal } from "@/components/modals/EditConfirmationModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import Pagination from "@/components/ui/pagination";
import PropertyFiltersPanel, { FilterState, initialFilters } from "@/components/PropertyFiltersPanel";
import PropertyControlPanel from "@/components/PropertyControlPanel";
import PropertyDisplayContainer from "@/components/PropertyDisplayContainer";
import { StatsLoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { PropertyData } from "@/components/modals/AddEditPropertyModal";
import { SupabasePropertyData } from "@/lib/propertyData";
import { supabase } from "../../lib/supabase";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

function DashboardContent() {
  const router = useRouter();
  const { user, logout, refreshSession } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<PropertyData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [propertyData, setPropertyData] = useState<SupabasePropertyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backgroundLoading, setBackgroundLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Filter and view state
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeDateFilter, setActiveDateFilter] = useState<'today' | 'yesterday' | 'all'>('all');

  // Track reconnection attempts with ref instead of state to avoid re-renders
  const reconnectAttemptRef = React.useRef(false);
  const sessionMonitorRef = React.useRef<NodeJS.Timeout | null>(null);

  // Session monitoring function
  const monitorSession = React.useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('Session expired or invalid, logging out...');
        await logout();
        router.push('/auth/login');
        return;
      }
      
      // Check if session is about to expire (within 10 minutes)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const timeUntilExpiry = (expiresAt * 1000) - Date.now();
        const tenMinutesInMs = 10 * 60 * 1000;
        
        if (timeUntilExpiry <= tenMinutesInMs && timeUntilExpiry > 0) {
          console.log('Session expiring soon, attempting refresh...');
          await refreshSession();
        }
      }
    } catch (error) {
      console.error('Error monitoring session:', error);
      await logout();
      router.push('/auth/login');
    }
  }, [logout, router, refreshSession]);

  // Fetch properties from Supabase with pagination, sorting, and filtering
  const fetchPropertiesWithFilters = React.useCallback(async (
    page: number = 1, 
    size: number = 50, 
    filterState: FilterState = initialFilters, 
    dateFilter: 'today' | 'yesterday' | 'all' = 'all'
  ): Promise<void> => {
    try {
      setBackgroundLoading(true);
      setError(null);
      
      // Check if we have a session before fetching
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        return;
      }
      
      // Check if we need comprehensive dataset (for price sorting OR budget filtering OR premise search OR date filtering)
      const needsComprehensiveDataset = filterState.sortBy === 'price' || 
                                       filterState.budgetMin || 
                                       filterState.budgetMax ||
                                       filterState.premise ||
                                       dateFilter !== 'all';
      
      let allData: SupabasePropertyData[] = [];
      
      if (needsComprehensiveDataset) {
        // For price sorting OR budget filtering OR premise search OR date filtering, fetch ALL records from database
        // This ensures we can properly handle numeric vs non-numeric values across the complete dataset
        const reasons = [];
        if (filterState.sortBy === 'price') reasons.push('price sorting');
        if (filterState.budgetMin || filterState.budgetMax) reasons.push('budget filtering');
        if (filterState.premise) reasons.push('premise search');
        if (dateFilter !== 'all') reasons.push('date filtering');
        const reason = reasons.join(' + ');
        
        console.log(`${reason} requires complete dataset - fetching ALL records in chunks...`);
        
        // Use chunked fetching to bypass Supabase's 1000 record limit
        const allDataTemp: SupabasePropertyData[] = [];
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
          allDataTemp.push(...chunkData);
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
          totalDbRecords: allDataTemp.length,
          originalQueryCount: originalCount,
          reasons: reasons.join(' + '),
          filtersIgnored: true,
          isLimitedBySupabase: allDataTemp.length === 1000 ? 'WARNING: Might be limited to 1000!' : 'OK',
          possibleLimitHit: allDataTemp.length % 1000 === 0 ? 'WARNING: Round number suggests limit' : 'OK'
        });
        
        // Add warning if we suspect we're hitting a limit
        if (allDataTemp.length === 1000) {
          console.warn('🚨 POTENTIAL ISSUE: Fetched exactly 1000 records - this might indicate a Supabase limit!');
          console.warn('If your database has more than 1000 records, filtering/sorting may not work correctly.');
        }

        allData = allDataTemp;

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
          
          const beforeFilter = allData.length;
          allData = allData.filter(item => {
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
            afterFilter: allData.length,
            excludedCount: beforeFilter - allData.length,
            dateFilter,
            todayString,
            yesterdayString
          });
        }
        if (filterState.premise) {
          const searchTerm = filterState.premise.toLowerCase();
          
          allData = allData.filter(property => {
            // Search in multiple fields: address, sub_property_type, property_type, area, owner_name, property_id
            const searchFields = [
              property.address,
              property.sub_property_type,
              property.property_type,
              property.area,
              property.owner_name,
              property.property_id,
              property.special_note
            ];
            
            // Check if any field contains the search term (case-insensitive)
            return searchFields.some(field => 
              field && String(field).toLowerCase().includes(searchTerm)
            );
          });
        }

        // Apply other filters on the searched results
        if (filterState.propertyType.length > 0) {
          allData = allData.filter(property => filterState.propertyType.includes(property.property_type || ''));
        }
        
        if (filterState.area.length > 0) {
          allData = allData.filter(property => filterState.area.includes(property.area || ''));
        }
        
        if (filterState.subPropertyType.length > 0) {
          allData = allData.filter(property => filterState.subPropertyType.includes(property.sub_property_type || ''));
        }
        
        if (filterState.budgetMin) {
          const minBudget = parseFloat(filterState.budgetMin);
          allData = allData.filter(property => {
            const price = property.rent_or_sell_price;
            
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
            
            return numericPrice >= minBudget;
          });
        }
        
        if (filterState.budgetMax) {
          const maxBudget = parseFloat(filterState.budgetMax);
          allData = allData.filter(property => {
            const price = property.rent_or_sell_price;
            
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
            
            return numericPrice <= maxBudget;
          });
        }

        // Apply visibility filter
        if (filterState.visibility.length > 0) {
          allData = allData.filter(property => {
            const visibilityStr = String(property.visibility);
            return filterState.visibility.includes(visibilityStr);
          });
        }

        // Apply rent/sold out filter
        if (filterState.rentSoldOut.length > 0) {
          allData = allData.filter(property => {
            const rentSoldOutStr = String(property.rent_sold_out);
            return filterState.rentSoldOut.includes(rentSoldOutStr);
          });
        }

        // Apply sorting
        allData.sort((a, b) => {
          if (filterState.sortBy === 'serial_number') {
            const aValue = a.serial_number || 0;
            const bValue = b.serial_number || 0;
            
            if (filterState.sortOrder === 'desc') {
              return bValue - aValue;
            } else {
              return aValue - bValue;
            }
          } else if (filterState.sortBy === 'price') {
            // Use the same price sorting logic as web_app
            const priceA = a.rent_or_sell_price;
            const priceB = b.rent_or_sell_price;
            
            // Enhanced regex to handle various number formats (including commas, spaces)
            const numericRegex = /^\s*[\d,]+(\.\d+)?\s*$/;
            const isNumericA = numericRegex.test(String(priceA));
            const isNumericB = numericRegex.test(String(priceB));
            
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
              
              if (filterState.sortOrder === 'desc') {
                return numB - numA;
              } else {
                return numA - numB;
              }
            }
            
            // Both non-numeric - compare as strings
            const stringA = String(priceA || '').toLowerCase();
            const stringB = String(priceB || '').toLowerCase();
            
            if (filterState.sortOrder === 'desc') {
              return stringB.localeCompare(stringA);
            } else {
              return stringA.localeCompare(stringB);
            }
          } else if (filterState.sortBy === 'date') {
            const aValue = a.date_stamp || '';
            const bValue = b.date_stamp || '';
            
            if (filterState.sortOrder === 'desc') {
              return aValue < bValue ? 1 : -1;
            } else {
              return aValue > bValue ? 1 : -1;
            }
          } else {
            const aValue = a.serial_number || 0;
            const bValue = b.serial_number || 0;
            
            if (filterState.sortOrder === 'desc') {
              return bValue - aValue;
            } else {
              return aValue - bValue;
            }
          }
        });

        // Apply pagination to the filtered and sorted results
        const totalCount = allData.length;
        const startIndex = (page - 1) * size;
        const paginatedData = allData.slice(startIndex, startIndex + size);

        setPropertyData(paginatedData);
        setTotalCount(totalCount);
        setCurrentPage(page);
      } else {
        // Regular server-side filtering (when no search term)
        let query = supabase
          .from('propertydata')
          .select('*', { count: 'exact' });

        // Apply filters based on filterState
        if (filterState.propertyType.length > 0) {
          query = query.in('property_type', filterState.propertyType);
        }
        
        if (filterState.area.length > 0) {
          query = query.in('area', filterState.area);
        }
        
        if (filterState.subPropertyType.length > 0) {
          query = query.in('sub_property_type', filterState.subPropertyType);
        }
        
        if (filterState.budgetMin) {
          query = query.gte('rent_or_sell_price::numeric', parseFloat(filterState.budgetMin));
        }
        
        if (filterState.budgetMax) {
          query = query.lte('rent_or_sell_price::numeric', parseFloat(filterState.budgetMax));
        }
        
        // Apply visibility filter
        if (filterState.visibility.length > 0) {
          const visibilityValues = filterState.visibility.map(v => v === 'true');
          query = query.in('visibility', visibilityValues);
        }
        
        // Apply rent/sold out filter
        if (filterState.rentSoldOut.length > 0) {
          const rentSoldOutValues = filterState.rentSoldOut.map(v => v === 'true');
          query = query.in('rent_sold_out', rentSoldOutValues);
        }
        
        // Note: Date filtering is handled in comprehensive mode only
        // since dateFilter !== 'all' triggers comprehensive dataset processing

        // Apply sorting
        if (filterState.sortBy === 'serial_number') {
          query = query.order('serial_number', { ascending: filterState.sortOrder === 'asc' });
        } else if (filterState.sortBy === 'price') {
          query = query.order('rent_or_sell_price', { ascending: filterState.sortOrder === 'asc' });
        } else if (filterState.sortBy === 'date') {
          query = query.order('date_stamp', { ascending: filterState.sortOrder === 'asc' });
        } else {
          // Default sorting
          query = query.order('serial_number', { ascending: true });
        }

        // Apply pagination
        const startIndex = (page - 1) * size;
        query = query.range(startIndex, startIndex + size - 1);

        const { data, error: fetchError, count } = await query;

        if (fetchError) throw fetchError;

        setPropertyData(data || []);
        setTotalCount(count || 0);
        setCurrentPage(page);
      }
    } catch (err: unknown) {
      console.error('Fetch properties error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
    }
  }, []);

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return filters.propertyType.length > 0 ||
           filters.subPropertyType.length > 0 ||
           filters.area.length > 0 ||
           !!filters.budgetMin ||
           !!filters.budgetMax ||
           !!filters.premise ||
           filters.sortBy !== 'serial_number' ||
           filters.sortOrder !== 'asc' ||
           filters.visibility.length > 0 ||
           filters.rentSoldOut.length > 0 ||
           activeDateFilter !== 'all';
  }, [filters, activeDateFilter]);

  // Pagination handlers
  const handlePageChange = React.useCallback(async (page: number) => {
    setCurrentPage(page);
    await fetchPropertiesWithFilters(page, pageSize, filters, activeDateFilter);
  }, [fetchPropertiesWithFilters, pageSize, filters, activeDateFilter]);

  const handlePageSizeChange = React.useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchPropertiesWithFilters(1, newPageSize, filters, activeDateFilter);
  }, [fetchPropertiesWithFilters, filters, activeDateFilter]);

  // Date filter handler
  const handleDateFilter = React.useCallback((filter: 'today' | 'yesterday' | 'all') => {
    setActiveDateFilter(filter);
    setCurrentPage(1);
    fetchPropertiesWithFilters(1, pageSize, filters, filter);
  }, [fetchPropertiesWithFilters, pageSize, filters]);

  useEffect(() => {
    // Fetch property data when component mounts
    fetchPropertiesWithFilters(1, 50, initialFilters, 'all');

    // Setup real-time subscription
    const setupRealtime = () => {
      try {
        const channel = supabase
          .channel('property-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'propertydata'
            },
            (payload) => {
              handleRealtimeChange(payload as RealtimePostgresChangesPayload<SupabasePropertyData>);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setRealtimeStatus('connected');
              reconnectAttemptRef.current = false;
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              setRealtimeStatus('disconnected');
              // If we get disconnected, attempt to reconnect after a delay - only once
              if (!reconnectAttemptRef.current) {
                reconnectAttemptRef.current = true;
                setTimeout(() => {
                  setupRealtime();
                }, 5000);
              }
            } else {
              setRealtimeStatus('connecting');
            }
          });

        setRealtimeChannel(channel);
        return channel;
      } catch {
        setRealtimeStatus('disconnected');
        setError('Failed to establish real-time connection. Please refresh the page.');
        return null;
      }
    };

    const channel = setupRealtime();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // Error removing channel
        }
      }
    };
  }, [fetchPropertiesWithFilters]); // Remove the dependency on realtimeStatus

  // Setup session monitoring
  React.useEffect(() => {
    if (user) {
      // Check session immediately
      monitorSession();
      
      // Set up interval to check session every 5 minutes
      const interval = setInterval(monitorSession, 5 * 60 * 1000);
      sessionMonitorRef.current = interval;
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Clear interval if user logs out
      if (sessionMonitorRef.current) {
        clearInterval(sessionMonitorRef.current);
        sessionMonitorRef.current = null;
      }
    }
  }, [user, monitorSession]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (sessionMonitorRef.current) {
        clearInterval(sessionMonitorRef.current);
      }
    };
  }, []);

  // Handle real-time changes
  const handleRealtimeChange = (payload: RealtimePostgresChangesPayload<SupabasePropertyData>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setPropertyData(currentData => {
      switch (eventType) {
        case 'INSERT':
          // Add new record if it doesn't exist
          if (newRecord) {
            const existingIndex = currentData.findIndex(item => item.serial_number === newRecord.serial_number);
            if (existingIndex === -1) {
              return [newRecord, ...currentData];
            }
          }
          return currentData;
          
        case 'UPDATE':
          // Update existing record
          if (newRecord) {
            return currentData.map(item => 
              item.serial_number === newRecord.serial_number ? newRecord : item
            );
          }
          return currentData;
          
        case 'DELETE':
          // Remove deleted record
          if (oldRecord) {
            return currentData.filter(item => item.serial_number !== oldRecord.serial_number);
          }
          return currentData;
          
        default:
          return currentData;
      }
    });
  };

  const handleAddProperty = async (data: PropertyData) => {
    try {
      const newProperty = {
        owner_name: data.owner_name,
        owner_contact: data.owner_contact,
        area: data.area,
        address: data.address,
        property_type: data.property_type,
        sub_property_type: data.sub_property_type,
        size: data.size,
        furnishing_status: data.furnishing_status,
        availability: data.availability,
        floor: data.floor,
        tenant_preference: data.tenant_preference,
        additional_details: data.additional_details,
        age: data.age,
        rent_or_sell_price: data.rent_or_sell_price,
        deposit: data.deposit,
        special_note: data.special_note,
        visibility: data.visibility,
        rent_sold_out: false
      };

      const { error } = await supabase
        .from('propertydata')
        .insert([newProperty])
        .select();

      if (error) throw error;

      setShowAddForm(false);
      // Refresh current page to show the new property
      await fetchPropertiesWithFilters(currentPage, pageSize, filters, activeDateFilter);
      console.log('Successfully added new property');
    } catch (err: unknown) {
      console.error('Error adding property:', err);
      setError(err instanceof Error ? err.message : 'Failed to add property');
    }
  };

  const handleEditProperty = async (data: PropertyData) => {
    if (selectedRow === null) return;
    
    try {
      const updatedProperty = {
        owner_name: data.owner_name,
        owner_contact: data.owner_contact,
        area: data.area,
        address: data.address,
        property_type: data.property_type,
        sub_property_type: data.sub_property_type,
        size: data.size,
        furnishing_status: data.furnishing_status,
        availability: data.availability,
        floor: data.floor,
        tenant_preference: data.tenant_preference,
        additional_details: data.additional_details,
        age: data.age,
        rent_or_sell_price: data.rent_or_sell_price,
        deposit: data.deposit,
        special_note: data.special_note,
        visibility: data.visibility
      };

      const { error } = await supabase
        .from('propertydata')
        .update(updatedProperty)
        .eq('serial_number', selectedRow);

      if (error) throw error;

      setShowEditForm(false);
      setEditData(null);
      // Refresh current page to show the updated property
      await fetchPropertiesWithFilters(currentPage, pageSize, filters, activeDateFilter);
      console.log('Successfully updated property');
    } catch (err: unknown) {
      console.error('Error updating property:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property');
    }
  };

  const handleEditConfirm = () => {
    if (selectedRow !== null) {
      const rowData = propertyData.find(item => item.serial_number === selectedRow);
      if (rowData) {
        // Convert the fetched data to PropertyData format
        const formattedData: PropertyData = {
          owner_name: rowData.owner_name || '',
          owner_contact: rowData.owner_contact || '',
          area: rowData.area || 'N/A',
          address: rowData.address || '',
          property_type: rowData.property_type || 'N/A',
          sub_property_type: rowData.sub_property_type || 'N/A',
          size: rowData.size || '',
          furnishing_status: rowData.furnishing_status || 'N/A',
          availability: rowData.availability || '',
          floor: rowData.floor || '',
          tenant_preference: rowData.tenant_preference || 'N/A',
          additional_details: rowData.additional_details || '',
          age: rowData.age || '',
          rent_or_sell_price: rowData.rent_or_sell_price || '',
          deposit: rowData.deposit || '',
          special_note: rowData.special_note || '',
          visibility: rowData.visibility || true
        };
        setEditData(formattedData);
        setShowEditForm(true);
      }
    }
    setShowEditModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRow !== null) {
      try {
        setError(null); // Clear any previous errors
        
        const { error } = await supabase
          .from('propertydata')
          .delete()
          .eq('serial_number', selectedRow);

        if (error) {
          console.error('Supabase delete error:', error);
          throw error;
        }

        console.log(`Successfully deleted row ${selectedRow}`);
        
        // Refresh current page to reflect the deletion
        await fetchPropertiesWithFilters(currentPage, pageSize, filters, activeDateFilter);
        
        setSelectedRow(null);
      } catch (err: unknown) {
        console.error('Error deleting property:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete property');
      }
    }
    setShowDeleteModal(false);
  };

  const handleToggleRentSoldOut = async (serialNumber: number, rentSoldOut: boolean) => {
    try {
      setError(null); // Clear any previous errors
      
      // Update local state immediately for better UX (optimistic update)
      setPropertyData(currentData => 
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
        setPropertyData(currentData => 
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
  };

  const handleToggleVisibility = async (serialNumber: number, visibility: boolean) => {
    try {
      setError(null); // Clear any previous errors
      
      // Update local state immediately for better UX (optimistic update)
      setPropertyData(currentData => 
        currentData.map(item => 
          item.serial_number === serialNumber 
            ? { ...item, visibility: visibility }
            : item
        )
      );
      
      const { error } = await supabase
        .from('propertydata')
        .update({ visibility: visibility })
        .eq('serial_number', serialNumber);

      if (error) {
        console.error('Supabase update error:', error);
        // Revert the optimistic update on error
        setPropertyData(currentData => 
          currentData.map(item => 
            item.serial_number === serialNumber 
              ? { ...item, visibility: !visibility }
              : item
          )
        );
        throw error;
      }

      console.log(`Successfully updated visibility status for property ${serialNumber} to ${visibility}`);
      
    } catch (err: unknown) {
      console.error('Error updating visibility status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property visibility');
    }
  };

  // Create a wrapper function that matches the PropertyFiltersPanel interface
  const handleFetchPropertiesForFilters = useCallback((page: number, size: number, filterState: FilterState) => {
    fetchPropertiesWithFilters(page, size, filterState, activeDateFilter);
  }, [fetchPropertiesWithFilters, activeDateFilter]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header Section */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-lg sticky top-0 z-50">
        <div className="flex justify-between items-center py-4 px-8">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">DO</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Data Operator Panel</h1>
              <p className="text-sm text-slate-500">Property Management Dashboard</p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Real-time Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/50 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${
                realtimeStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                realtimeStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-700 font-medium">
                {realtimeStatus === 'connected' ? 'Live' : 
                 realtimeStatus === 'connecting' ? 'Connecting' : 'Offline'}
              </span>
            </div>

            {/* User Info */}
            {user && (
              <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-slate-700 font-medium">Welcome back</p>
                  <p className="text-slate-500 text-xs">{user.email}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                title="Add User" 
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <MdAddCall className="w-5 h-5" />
              </button>
              <button 
                title="Notifications" 
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative"
              >
                <FaBell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                title="Profile" 
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <FaUserCircle className="w-5 h-5" />
              </button>
              
              {/* Divider */}
              <div className="w-px h-6 bg-slate-300 mx-2"></div>
              
              <button 
                title="Logout" 
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" 
                onClick={handleLogout}
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Stats Section */}
      <div className="px-8 pt-6">
        {loading ? (
          <div className="mb-8">
            <StatsLoadingSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {/* Total Properties */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Properties</p>
                  <p className="text-3xl font-bold text-slate-800">{totalCount.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">↗ Active listings</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🏢</span>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Filters</p>
                  <p className="text-3xl font-bold text-slate-800">{hasActiveFilters ? 'ON' : 'OFF'}</p>
                  <p className="text-xs text-slate-500 mt-1">{hasActiveFilters ? 'Filtering applied' : 'No filters'}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  hasActiveFilters 
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600' 
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}>
                  <span className="text-white text-lg">🔍</span>
                </div>
              </div>
            </div>

            {/* Current Page */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Current Page</p>
                  <p className="text-3xl font-bold text-slate-800">{currentPage}</p>
                  <p className="text-xs text-slate-500 mt-1">of {Math.ceil(totalCount / pageSize)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📄</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">System Status</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {realtimeStatus === 'connected' ? '✅' : realtimeStatus === 'connecting' ? '🟡' : '❌'}
                  </p>
                  <p className={`text-xs mt-1 capitalize ${
                    realtimeStatus === 'connected' ? 'text-green-600' : 
                    realtimeStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {realtimeStatus}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  realtimeStatus === 'connected' 
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : realtimeStatus === 'connecting'
                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  <span className="text-white text-lg">⚡</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="px-8 pb-8">
        {/* Control Panel with Enhanced Design */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50 shadow-lg">
          <PropertyControlPanel
            hasActiveFilters={hasActiveFilters}
            backgroundLoading={backgroundLoading}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onDateFilter={handleDateFilter}
            activeDateFilter={activeDateFilter}
          />
        </div>

        {/* Enhanced Filters Panel */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50 shadow-lg">
            <PropertyFiltersPanel
              showFilters={showFilters}
              filters={filters}
              setFilters={setFilters}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              loading={loading}
              onFetchProperties={handleFetchPropertiesForFilters}
            />
          </div>
        )}
        
        {/* Enhanced Action Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Quick Actions:</span>
              </div>
              <BulkUploadButton />
              <button 
                onClick={() => setShowAddForm(true)} 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium transform hover:scale-105"
              >
                <FaPlus className="w-4 h-4" /> Add New Property
              </button>
            </div>

            {/* Enhanced Status and Info */}
            <div className="flex items-center gap-4 flex-wrap">
              {backgroundLoading && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-700 text-sm font-medium">Syncing Data...</span>
                </div>
              )}
              
              <div className="text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <span className="font-medium">Page Size:</span> {pageSize} items
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-1">Error Occurred</h3>
                  <p className="text-red-700 text-sm mb-3">{error}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setError(null);
                        fetchPropertiesWithFilters(currentPage, pageSize, filters, activeDateFilter);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Retry
                    </button>
                    <button 
                      onClick={() => setError(null)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Property Display Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Property Listings</h2>
                <p className="text-sm text-slate-600">
                  {loading ? 'Loading properties...' : `Showing ${propertyData.length} of ${totalCount.toLocaleString()} properties`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-500">
                  Rows: <span className="font-medium text-slate-700">{pageSize}</span>
                </div>
              </div>
            </div>
          </div>
          
          <PropertyDisplayContainer
            properties={propertyData}
            loading={loading}
            error={error}
            totalCount={totalCount}
            onEditProperty={(serialNumber) => {
              setSelectedRow(serialNumber);
              setShowEditModal(true);
            }}
            onDeleteProperty={(serialNumber) => {
              setSelectedRow(serialNumber);
              setShowDeleteModal(true);
            }}
            onToggleRentSoldOut={handleToggleRentSoldOut}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>

        {/* Simplified Pagination */}
        {!loading && totalCount > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}

        {/* Loading State for Empty Results */}
        {!loading && totalCount === 0 && !error && (
          <div className="mt-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-white/50 shadow-lg text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Properties Found</h3>
              <p className="text-slate-600 mb-6">
                {hasActiveFilters 
                  ? "No properties match your current filters. Try adjusting your search criteria."
                  : "No properties available. Start by adding your first property listing."
                }
              </p>
              <div className="flex gap-3 justify-center">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setFilters(initialFilters);
                      setActiveDateFilter('all');
                      fetchPropertiesWithFilters(1, pageSize, initialFilters, 'all');
                    }}
                    className="px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                >
                  Add New Property
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modals remain the same */}
        <AddEditPropertyModal
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          mode="add"
          initialData={null}
          onSubmit={handleAddProperty}
        />

        <EditConfirmationModal
          isOpen={showEditModal}
          onConfirm={handleEditConfirm}
          onClose={() => setShowEditModal(false)}
        />
        
        {editData && (
          <AddEditPropertyModal
            open={showEditForm}
            onClose={() => setShowEditForm(false)}
            mode="edit"
            initialData={editData}
            onSubmit={handleEditProperty}
          />
        )}

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onConfirm={handleDeleteConfirm}
          onClose={() => setShowDeleteModal(false)}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}