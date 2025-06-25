'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyData, supabaseHelpers } from "@/lib/dummyProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/ProtectedRoute";
import Pagination from "@/components/ui/pagination";
import SortControls from "@/components/SortControls";
import { supabase } from "../../lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { usePropertyStats } from "@/hooks/usePropertyStats";
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const Page = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search filters from URL parameters
  const [urlFilters, setUrlFilters] = useState<{
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
  } | null>(null);
  
  // Use property stats hook for Enhanced Property Stats Overview
  const { stats, loading: statsLoading } = usePropertyStats();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Sort state - default to serial_number ascending
  const [sortColumn, setSortColumn] = useState<'serial_number' | 'rent_or_sell_price' | null>('serial_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Parse URL filters on component mount
  useEffect(() => {
    const propertyType = searchParams.get('propertyType')?.split(',') || [];
    const condition = searchParams.get('condition')?.split(',') || [];
    const area = searchParams.get('area')?.split(',') || [];
    const availability = searchParams.get('availability')?.split(',') || [];
    const availabilityType = searchParams.get('availabilityType')?.split(',') || [];
    const budgetMin = searchParams.get('budgetMin') || '';
    const budgetMax = searchParams.get('budgetMax') || '';
    const sqftFrom = searchParams.get('sqftFrom') || '';
    const sqftTo = searchParams.get('sqftTo') || '';
    const premise = searchParams.get('premise') || '';

    const hasFilters = propertyType.length > 0 || condition.length > 0 || area.length > 0 || 
                      availability.length > 0 || availabilityType.length > 0 || 
                      budgetMin || budgetMax || sqftFrom || sqftTo || premise;

    if (hasFilters) {
      const filters = {
        propertyType,
        condition,
        area,
        availability,
        availabilityType,
        budgetMin,
        budgetMax,
        sqftFrom,
        sqftTo,
        premise
      };
      
      setUrlFilters(filters);
      setActiveTab('search'); // Set a special tab for search results
      
      // Reset pagination to first page for search results
      setCurrentPage(1);
      
      // Set optimal sorting for search results - prioritize recent properties
      setSortColumn('serial_number');
      setSortDirection('desc'); // Show newest properties first for better relevance
    } else {
      // Reset to default sorting when no filters
      setSortColumn('serial_number');
      setSortDirection('asc');
    }
  }, [searchParams]);

  // Extract rent utility function for filtering
  const extractRent = React.useCallback((rentString: string) => {
    const numberPart = parseFloat(rentString.replace(/[^\d.]/g, ""));
    return rentString.toLowerCase().includes("thd")
      ? numberPart * 1000
      : numberPart;
  }, []);

  // Fetch properties from Supabase with pagination - modified to handle search results
  const fetchProperties = React.useCallback(async (page: number = 1, size: number = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a session before fetching
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        // We'll let the ProtectedRoute handle the redirection
        return;
      }
      
      // For search results (URL filters), apply server-side filtering
      if (urlFilters) {
        // Build the query with server-side filters
        let query = supabase
          .from('propertydata')
          .select('*', { count: 'exact' })
          .not('rent_sold_out', 'eq', true);

        // Apply property type filter
        if (urlFilters.propertyType.length > 0) {
          const hasNA = urlFilters.propertyType.includes('N/A');
          const otherTypes = urlFilters.propertyType.filter(type => type !== 'N/A');
          
          if (hasNA && otherTypes.length > 0) {
            // Include both N/A (null/empty) and specific types
            query = query.or(`property_type.in.(${otherTypes.join(',')}),property_type.is.null,property_type.eq.`);
          } else if (hasNA) {
            // Only N/A (null or empty)
            query = query.or('property_type.is.null,property_type.eq.');
          } else {
            // Only specific types
            query = query.in('property_type', otherTypes);
          }
        }

        // Apply condition filter
        if (urlFilters.condition.length > 0) {
          const hasNA = urlFilters.condition.includes('N/A');
          const otherConditions = urlFilters.condition.filter(condition => condition !== 'N/A');
          
          if (hasNA && otherConditions.length > 0) {
            query = query.or(`furnishing_status.in.(${otherConditions.join(',')}),furnishing_status.is.null,furnishing_status.eq.`);
          } else if (hasNA) {
            query = query.or('furnishing_status.is.null,furnishing_status.eq.');
          } else {
            query = query.in('furnishing_status', otherConditions);
          }
        }

        // Apply availability filter
        if (urlFilters.availability.length > 0) {
          const hasNA = urlFilters.availability.includes('N/A');
          const otherAvailability = urlFilters.availability.filter(avail => avail !== 'N/A');
          
          if (hasNA && otherAvailability.length > 0) {
            query = query.or(`sub_property_type.in.(${otherAvailability.join(',')}),sub_property_type.is.null,sub_property_type.eq.`);
          } else if (hasNA) {
            query = query.or('sub_property_type.is.null,sub_property_type.eq.');
          } else {
            query = query.in('sub_property_type', otherAvailability);
          }
        }

        // Apply area filter (text search)
        if (urlFilters.area.length > 0) {
          const hasNA = urlFilters.area.includes('N/A');
          const otherAreas = urlFilters.area.filter(area => area !== 'N/A');
          
          if (hasNA && otherAreas.length > 0) {
            // Create OR conditions for each area
            const areaConditions = otherAreas.map(area => `area.ilike.%${area}%`).join(',');
            query = query.or(`${areaConditions},area.is.null,area.eq.`);
          } else if (hasNA) {
            query = query.or('area.is.null,area.eq.');
          } else {
            // Create OR conditions for text search
            const areaConditions = otherAreas.map(area => `area.ilike.%${area}%`).join(',');
            query = query.or(areaConditions);
          }
        }

        // Apply premise filter (address search)
        if (urlFilters.premise) {
          query = query.ilike('address', `%${urlFilters.premise}%`);
        }

        // Apply budget filters
        if (urlFilters.budgetMin || urlFilters.budgetMax) {
          if (urlFilters.budgetMin && urlFilters.budgetMax) {
            // For budget range, we need to handle this client-side due to complex rent extraction logic
            // So we'll fetch all matching properties and filter client-side for budget
          } else if (urlFilters.budgetMin) {
            // Minimum budget filter - we'll handle this client-side
          } else if (urlFilters.budgetMax) {
            // Maximum budget filter - we'll handle this client-side
          }
        }

        // Apply pagination and ordering
        const from = (page - 1) * size;
        const to = from + size - 1;
        
        query = query
          .order('date_stamp', { ascending: false }) // Show newest first
          .range(from, to);

        const { data, error: supabaseError, count } = await query;

        if (supabaseError) {
          throw supabaseError;
        }

        // Apply client-side budget filtering if needed
        let filteredData = data || [];
        if (urlFilters.budgetMin || urlFilters.budgetMax) {
          filteredData = filteredData.filter(property => {
            if (!property.rent_or_sell_price) return false;
            const rent = extractRent(String(property.rent_or_sell_price));
            
            if (urlFilters.budgetMin && rent < parseInt(urlFilters.budgetMin)) {
              return false;
            }
            if (urlFilters.budgetMax && rent > parseInt(urlFilters.budgetMax)) {
              return false;
            }
            return true;
          });
        }

        setTotalCount(count || 0);
        setProperties(filteredData);
        // Don't set filteredProperties here - let the useEffect handle filtering and sorting
        
      } else {
        // For normal browsing (no URL filters), use server-side pagination and sorting
        
        // First, get the total count of active properties only (same filter as dashboard)
        const { count, error: countError } = await supabase
          .from('propertydata')
          .select('*', { count: 'exact', head: true })
          .not('rent_sold_out', 'eq', true); // Only active properties

        if (countError) {
          throw countError;
        }

        setTotalCount(count || 0);

        // Then fetch the paginated data with same filter as dashboard
        const from = (page - 1) * size;
        const to = from + size - 1;

        // Build query with sorting
        let query = supabase
          .from('propertydata')
          .select('*')
          .not('rent_sold_out', 'eq', true); // Only active properties (same filter as dashboard)

        // Apply sorting if specified
        if (sortColumn) {
          query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
        } else {
          // Default sort by serial_number ascending
          query = query.order('serial_number', { ascending: true });
        }

        const { data, error: supabaseError } = await query.range(from, to);

        if (supabaseError) {
          throw supabaseError;
        }

        setProperties(data || []);
        setFilteredProperties(data || []);
      }
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [sortColumn, sortDirection, urlFilters, extractRent]);

  // Pagination handlers - different behavior for search vs normal browsing
  const handlePageChange = React.useCallback(async (page: number) => {
    setCurrentPage(page);
    // For both search results and normal browsing, fetch new data from server
    await fetchProperties(page, pageSize);
  }, [fetchProperties, pageSize]);

  const handlePageSizeChange = React.useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    // For both search results and normal browsing, fetch new data from server
    fetchProperties(1, newPageSize);
  }, [fetchProperties]);

  // Sort handler
  const handleSort = (column: 'serial_number' | 'rent_or_sell_price') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
    fetchProperties(1, pageSize);
  };

  // Clear sort handler
  const handleClearSort = () => {
    setSortColumn(null);
    setSortDirection('asc');
    setCurrentPage(1);
    fetchProperties(1, pageSize);
  };

  // Handle real-time changes with targeted updates (no full page refresh)
  const handleRealtimeChange = React.useCallback((payload: RealtimePostgresChangesPayload<PropertyData>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Only update properties state, don't trigger full refetch
    setProperties(currentData => {
      switch (eventType) {
        case 'INSERT':
          if (newRecord && !newRecord.rent_sold_out) {
            // Only add if it doesn't exist and isn't sold out
            const existingIndex = currentData.findIndex(item => item.serial_number === newRecord.serial_number);
            if (existingIndex === -1) {
              return [newRecord, ...currentData];
            }
          }
          return currentData;
          
        case 'UPDATE':
          if (newRecord) {
            return currentData.map(item => 
              item.serial_number === newRecord.serial_number ? newRecord : item
            ).filter(item => !item.rent_sold_out); // Remove if marked as sold out
          }
          return currentData;
          
        case 'DELETE':
          if (oldRecord) {
            return currentData.filter(item => item.serial_number !== oldRecord.serial_number);
          }
          return currentData;
          
        default:
          return currentData;
      }
    });
  }, []);

  // Load properties on component mount with optimized real-time subscriptions
  useEffect(() => {
    let isMounted = true;
    
    // Wait for auth context to finish loading before fetching data
    if (authLoading) return;
    
    // Only fetch data if user is authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // Call fetchProperties only on mount or when URL filters change
    if (isMounted) {
      fetchProperties(1, 50);
    }

    // Setup optimized real-time subscription with targeted updates
    const channel = supabase
      .channel('property-changes-tableview')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'propertydata'
        },
        handleRealtimeChange
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [authLoading, isAuthenticated, urlFilters, handleRealtimeChange, fetchProperties]);

  const parseDate = React.useCallback((isoString: string | null) => {
    if (!isoString) return '';
    return supabaseHelpers.formatDateForComparison(isoString);
  }, []);

  useEffect(() => {
    // Apply tab filters and sorting to server-filtered properties
    const applyAllFilters = (tab: string) => {
      let filtered = [...properties];
      
      // For search results (URL filters), properties are already server-filtered
      // We just need to apply tab filters if any
      if (urlFilters) {
        // Properties are already filtered by server, just apply tab logic if needed
        // For search results, we typically show all matching results regardless of tab
        filtered = properties;
      } else {
        // Apply tab filters (only if not in search mode)
        const today = supabaseHelpers.getTodayDate();
        const yesterday = supabaseHelpers.getYesterdayDate();

        if (tab === 'imp') {
          filtered = filtered.filter((p) => Boolean(p.special_note && p.special_note.trim().length > 0));
        } else if (tab === 'today') {
          filtered = filtered.filter((p) => {
            const propdate = parseDate(p.date_stamp);
            return propdate === today;
          });
        } else if (tab === 'yesterday') {
          filtered = filtered.filter((p) => {
            const propdate = parseDate(p.date_stamp);
            return propdate === yesterday;
          });
        }
      }
      
      // Apply search filter if search term exists
      if (searchTerm) {
        filtered = filtered.filter((property) => {
          const nameContact = (property.owner_name || '') + (property.owner_contact ? `\n${property.owner_contact}` : '');
          return nameContact.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 (property.address || '').toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        // Smart sorting for text search results
        if (!urlFilters) {
          filtered = filtered.sort((a, b) => {
            const aNameContact = ((a.owner_name || '') + (a.owner_contact || '')).toLowerCase();
            const bNameContact = ((b.owner_name || '') + (b.owner_contact || '')).toLowerCase();
            const aAddress = (a.address || '').toLowerCase();
            const bAddress = (b.address || '').toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            // Prioritize exact matches in owner name/contact
            const aExactMatch = aNameContact.includes(searchLower);
            const bExactMatch = bNameContact.includes(searchLower);
            
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;
            
            // Then prioritize address matches
            const aAddressMatch = aAddress.includes(searchLower);
            const bAddressMatch = bAddress.includes(searchLower);
            
            if (aAddressMatch && !bAddressMatch) return -1;
            if (!aAddressMatch && bAddressMatch) return 1;
            
            // Finally sort by date (newest first)
            const aDate = new Date(a.date_stamp || 0).getTime();
            const bDate = new Date(b.date_stamp || 0).getTime();
            return bDate - aDate;
          });
        }
      }

      setFilteredProperties(filtered);
    };
    
    applyAllFilters(activeTab);
  }, [properties, activeTab, parseDate, urlFilters, searchTerm]);

  const filterProperties = (tab: string) => {
    // Don't allow tab switching if we have URL filters (search results)
    if (urlFilters && tab !== 'search') {
      return;
    }
    
    setActiveTab(tab);
    // The actual filtering is handled by the useEffect
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    // The actual filtering is handled by the useEffect
    if (!term) {
      // If search is cleared, maintain current tab unless we have URL filters
      if (!urlFilters) {
        setActiveTab('all');
      }
    }
  };

  const toggleDescription = (id: number) => {
    setExpandedDescriptionId(expandedDescriptionId === id ? null : id);
  };

  // Reset pagination when filtered results change (only for search results)
  useEffect(() => {
    // Only reset to first page when we have URL filters and the filtered results change
    if (urlFilters && filteredProperties.length >= 0) {
      setCurrentPage(1);
    }
  }, [urlFilters, filteredProperties.length]);

  // Get the properties to display based on current pagination
  const getDisplayedProperties = React.useCallback(() => {
    // For both search results and normal browsing, show filtered properties
    // Server-side pagination is handled in fetchProperties
    return filteredProperties;
  }, [filteredProperties]);

  // Get the total count for pagination display
  const getTotalCount = React.useCallback(() => {
    if (urlFilters) {
      // For search results, use the server-provided count of filtered results
      return totalCount;
    } else {
      // For normal browsing, use server count
      return totalCount;
    }
  }, [totalCount, urlFilters]);

  // Get search results count for display
  const getSearchResultsCount = React.useCallback(() => {
    if (!urlFilters) return 0;
    // For server-side filtered results, just return the total count from server
    return totalCount;
  }, [urlFilters, totalCount]);

  const displayedProperties = getDisplayedProperties();
  const displayTotalCount = getTotalCount();
  const searchResultsCount = getSearchResultsCount();

  // Refetch data when URL filters change to get all properties for client-side filtering
  useEffect(() => {
    if (urlFilters && isAuthenticated && !authLoading) {
      fetchProperties(1, pageSize);
    }
  }, [urlFilters, fetchProperties, pageSize, isAuthenticated, authLoading]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative font-sans">
        {/* Enhanced 3D Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="float-animation absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="float-animation absolute bottom-40 left-40 w-28 h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
          <div className="float-animation absolute top-60 left-1/3 w-20 h-20 bg-emerald-500/20 rounded-full blur-sm" style={{animationDelay: '3s'}}></div>
          <div className="float-animation absolute bottom-20 right-20 w-36 h-36 bg-pink-500/15 rounded-full blur-sm" style={{animationDelay: '4s'}}></div>
        </div>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 grid-overlay opacity-10"></div>
        
        <div className="relative z-10 p-6">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gradient-animate mb-6">
              🏠 Property Management Hub
            </h1>
            <p className="text-white/70 text-xl mb-8">Comprehensive property portfolio management system</p>
            
            {/* Property Statistics Dashboard with integrated property stats data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">🏠</div>
                <div className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats.total.toLocaleString()}
                </div>
                <div className="text-blue-200 text-sm">Total Active Properties</div>
              </div>
              
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">🏘️</div>
                <div className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : (stats.residential_rent + stats.residential_sell).toLocaleString()}
                </div>
                <div className="text-green-200 text-sm">Residential Properties</div>
              </div>
              
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">🏢</div>
                <div className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : (stats.commercial_rent + stats.commercial_sell).toLocaleString()}
                </div>
                <div className="text-yellow-200 text-sm">Commercial Properties</div>
              </div>
              
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : urlFilters ? searchResultsCount.toLocaleString() : displayTotalCount.toLocaleString()}
                </div>
                <div className="text-red-200 text-sm">
                  {urlFilters ? 'Matching Results' : 'Currently Displayed'}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              {/* Show search results indicator if URL filters are active */}
              {urlFilters && (
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-purple-200">
                    <span className="text-xl">🔍</span>
                    <div className="flex flex-col">
                      <span className="font-medium">Search Results</span>
                      <span className="text-xs text-purple-300">
                        {searchResultsCount} matches found • Shown first
                      </span>
                    </div>
                    <span className="bg-purple-400/20 px-2 py-1 rounded-full text-xs">
                      {searchResultsCount}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Regular filter tabs (only show if no URL filters) */}
              {!urlFilters && [
                { key: 'imp', label: '⭐ With Special Notes', color: 'from-yellow-600 to-orange-600', count: properties.filter(p => p.special_note && p.special_note.trim().length > 0).length },
                { key: 'today', label: '📅 Today', color: 'from-blue-600 to-cyan-600', count: properties.filter(p => parseDate(p.date_stamp) === supabaseHelpers.getTodayDate()).length },
                { key: 'yesterday', label: '📆 Yesterday', color: 'from-indigo-600 to-blue-600', count: properties.filter(p => parseDate(p.date_stamp) === supabaseHelpers.getYesterdayDate()).length },
                { key: 'all', label: '📋 All Properties', color: 'from-slate-600 to-gray-600', count: properties.length }
              ].map((tab) => (
                <Button 
                  key={tab.key}
                  className={`btn-3d bg-gradient-to-r ${tab.color} hover:scale-105 text-white border-0 transition-all duration-300 ${
                    activeTab === tab.key ? 'ring-2 ring-white/50 shadow-lg' : ''
                  }`}
                  onClick={() => filterProperties(tab.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{tab.label}</span>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{tab.count}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Search Box */}
            <div className="w-full lg:w-1/2 flex flex-col gap-3">
              {/* Enhanced Search Box */}
              <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl overflow-hidden flex items-center">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="🔍 Search by owner name, contact, or address..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full px-4 py-3 bg-transparent text-white placeholder-white/60 border-0 focus:outline-none focus:ring-0"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        // Reset to appropriate state based on whether we have URL filters
                        if (!urlFilters) {
                          setActiveTab('all');
                        }
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button className="bg-white/20 backdrop-blur-sm px-4 py-3 border-l border-white/20 text-white hover:bg-white/30 transition-colors">
                  🔍
                </button>
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="mb-6">
            {urlFilters ? (
              <div className="mx-auto max-w-4xl text-center">
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 text-blue-200">
                    <span className="text-lg">🎯</span>
                    <span className="font-medium">Search results are prioritized and shown first</span>
                  </div>
                  <p className="text-xs text-blue-300 mt-1">
                    Your {searchResultsCount} matching properties appear at the top, followed by other listings
                  </p>
                </div>
              </div>
            ) : (
              <SortControls
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onClearSort={handleClearSort}
                className="mx-auto max-w-4xl"
              />
            )}
          </div>

          {/* Clear Search Filters Button */}
          {urlFilters && (
            <div className="flex justify-center mb-6">
              <Button
                onClick={() => {
                  // Clear URL filters and reset to all properties view
                  setUrlFilters(null);
                  setActiveTab('all');
                  setSearchTerm('');
                  // Clear URL parameters
                  window.history.replaceState({}, '', '/tableview');
                }}
                className="btn-3d bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <span>✕</span>
                  <span>Clear Search Filters</span>
                </div>
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="card-hover-3d mx-auto max-w-md p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-300 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold">Error occurred</p>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              </div>
              <Button 
                onClick={() => fetchProperties(1, 50)} 
                className="btn-3d bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white mt-3 w-full"
              >
                🔄 Retry
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                <p className="text-white/80 text-lg">Loading properties...</p>
              </div>
            </div>
          )}

          {/* Modern Table Container */}
          {!loading && (
            <div className="card-hover-3d backdrop-blur-sm bg-white/5 border border-white/20 rounded-xl overflow-hidden">
              <div className="relative overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white">
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">
                        🔢 S.No.
                      </th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">📝 Special Note</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">📅 Date</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">👤 Owner Name</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">📞 Owner Contact</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">📍 Address</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">🏠 Property Type</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">🏡 Sub Type</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">📍 Area</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">
                        💰 Price
                      </th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">🗓️ Availability</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">📏 Size</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">� Floor</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">🪑 Furnishing</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">👥 Tenant Preference</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">�🏠 Additional Details</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">📅 Age</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">💰 Deposit</th>
                      <th className="px-4 py-4 text-left font-semibold border-r border-white/20">🏠 Sold/Rented Out?</th>
                      <th className="px-4 py-4 text-left font-semibold">📋</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProperties.length === 0 ? (
                      <tr>
                        <td colSpan={20} className="text-center py-16">
                          <div className="text-white/60">
                            <div className="text-6xl mb-4">🏠</div>
                            <p className="text-xl">No properties found</p>
                            <p className="text-sm mt-2">Try adjusting your filters or search terms</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayedProperties.map((property, index) => {
                        // Check if this is a priority property (for search results)
                        const isPriority = urlFilters && property.special_note && property.special_note.trim().length > 0;
                        const isTopResult = urlFilters && index < 3; // First 3 results get subtle highlight
                        
                        return (
                        <React.Fragment key={property.serial_number}>
                          <tr className={`hover:bg-white/10 transition-colors duration-200 ${
                            isPriority 
                              ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-2 border-yellow-400/50' 
                              : isTopResult 
                                ? 'bg-blue-500/5' 
                                : index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'
                          }`}>
                            <td className="px-4 py-4 border-r border-white/10 text-center text-white/90 font-mono">
                              <div className="flex items-center justify-center gap-1">
                                {isPriority && <span className="text-yellow-400 text-xs">⭐</span>}
                                {property.serial_number}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="truncate" title={property.special_note || ''}>
                                {property.special_note || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 whitespace-nowrap">
                              {property.date_stamp || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="truncate font-semibold" title={property.owner_name || ''}>
                                {property.owner_name || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="truncate text-white/70" title={property.owner_contact || ''}>
                                {property.owner_contact || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm truncate" title={property.address || ''}>
                                {property.address || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.property_type === 'Res_resale' ? 'Residential Resale' :
                               property.property_type === 'Res_rental' ? 'Residential Rental' :
                               property.property_type === 'Com_resale' ? 'Commercial Resale' :
                               property.property_type === 'Com_rental' ? 'Commercial Rental' :
                               property.property_type || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.sub_property_type || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.area || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 font-semibold">
                              {property.rent_or_sell_price || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm truncate" title={property.availability || ''}>
                                {property.availability || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.size || 'N/A'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.floor || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.furnishing_status || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="truncate" title={property.tenant_preference || ''}>
                                {property.tenant_preference || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm truncate" title={property.additional_details || ''}>
                                {property.additional_details || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.age || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm truncate" title={property.deposit || ''}>
                                {property.deposit || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-center">
                              <input
                                type="checkbox"
                                checked={Boolean(property.rent_sold_out)}
                                readOnly
                                className="w-4 h-4 text-green-500 bg-transparent border-2 border-white/30 rounded focus:ring-green-500 focus:ring-2"
                              />
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => toggleDescription(property.serial_number)}
                                className="text-white/70 hover:text-white transition-colors duration-200 text-lg"
                              >
                                {expandedDescriptionId === property.serial_number ? '▲' : '▼'}
                              </button>
                            </td>
                          </tr>
                          {expandedDescriptionId === property.serial_number && (
                            <tr>
                              <td colSpan={20} className="px-6 py-4 bg-white/10 border-t border-white/20">
                                <div className="backdrop-blur-sm bg-white/5 rounded-lg p-4 border border-white/20">
                                  {property.special_note && (
                                    <div className="mb-3">
                                      <span className="font-bold text-sm text-blue-300">📝 Special Note:</span>
                                      <div className="text-sm text-white/80 mt-1 whitespace-pre-line">
                                        {property.special_note}
                                      </div>
                                    </div>
                                  )}
                                  {property.additional_details && (
                                    <div>
                                      <span className="font-bold text-sm text-yellow-300">⭐ Additional Details:</span>
                                      <div className="text-sm text-white/80 mt-1 whitespace-pre-line">
                                        {property.additional_details}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <div className="mt-6">
              {/* Search Results Info */}
              {urlFilters && (
                <div className="mb-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <span className="font-semibold text-blue-300">🔍 Search Results:</span>
                      <span className="ml-2">{searchResultsCount} matching properties found</span>
                      {searchResultsCount > 0 && (
                        <span className="ml-2 text-white/70">
                          (showing {Math.min(pageSize, displayedProperties.length)} of {displayTotalCount} total)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => window.history.back()}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      ← Back to Search
                    </button>
                  </div>
                </div>
              )}
              
              {/* Pagination Component */}
              {displayTotalCount > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={displayTotalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  className="mt-4"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
