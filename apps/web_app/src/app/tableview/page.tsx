'use client';

import React, { useState, useEffect } from 'react';
import { PropertyData, supabaseHelpers } from "@/lib/dummyProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/ProtectedRoute";
import Pagination from "@/components/ui/pagination";
import SortControls from "@/components/SortControls";
import { supabase } from "../../lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const Page = () => {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalCount, setTotalCount] = useState<number>(0);
  
  // Sort state - default to serial_number ascending
  const [sortColumn, setSortColumn] = useState<'serial_number' | 'rent_or_sell_price' | null>('serial_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch properties from Supabase with pagination
  const fetchProperties = React.useCallback(async (page: number = 1, size: number = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a session before fetching
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        console.log('No active session found during fetch properties');
        // We'll let the ProtectedRoute handle the redirection
        return;
      }
      
      // First, get the total count
      const { count, error: countError } = await supabase
        .from('propertydata')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      setTotalCount(count || 0);

      // Then fetch the paginated data
      const from = (page - 1) * size;
      const to = from + size - 1;

      // Build query with sorting
      let query = supabase
        .from('propertydata')
        .select('*');

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

      if (page === 1) {
        setProperties(data || []);
        setFilteredProperties(data || []);
      } else {
        // For real-time updates, we might want to merge data
        setProperties(data || []);
        setFilteredProperties(data || []);
      }
      
      console.log(`Fetched ${data?.length || 0} properties for page ${page} (total: ${count})`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [sortColumn, sortDirection]);

  // Pagination handlers
  const handlePageChange = React.useCallback(async (page: number) => {
    setCurrentPage(page);
    await fetchProperties(page, pageSize);
  }, [fetchProperties, pageSize]);

  const handlePageSizeChange = React.useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
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

  // Load properties on component mount and setup real-time subscription
  useEffect(() => {
    // Wait for auth context to finish loading before fetching data
    if (authLoading) return;
    
    // Only fetch data if user is authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping data fetch');
      setLoading(false);
      return;
    }

    fetchProperties(1, 50);

    // Setup real-time subscription
    const setupRealtime = () => {
      const channel = supabase
        .channel('property-changes-tableview')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'propertydata'
          },
          (payload) => {
            console.log('Real-time change received in tableview:', payload);
            handleRealtimeChange(payload as RealtimePostgresChangesPayload<PropertyData>);
          }
        )
        .subscribe((status) => {
          console.log('Tableview realtime subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setRealtimeStatus('disconnected');
          } else {
            setRealtimeStatus('connecting');
          }
        });

      return channel;
    };

    const channel = setupRealtime();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProperties, authLoading, isAuthenticated]);

  // Handle real-time changes
  const handleRealtimeChange = (payload: RealtimePostgresChangesPayload<PropertyData>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setProperties(currentData => {
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

    // Also update filtered properties based on current active tab
    setFilteredProperties(currentFiltered => {
      switch (eventType) {
        case 'INSERT':
          if (newRecord) {
            const existingIndex = currentFiltered.findIndex(item => item.serial_number === newRecord.serial_number);
            if (existingIndex === -1) {
              // Check if new record matches current filter
              return shouldIncludeInFilter(newRecord, activeTab) ? [newRecord, ...currentFiltered] : currentFiltered;
            }
          }
          return currentFiltered;
          
        case 'UPDATE':
          if (newRecord) {
            const updatedFiltered = currentFiltered.map(item => 
              item.serial_number === newRecord.serial_number ? newRecord : item
            );
            // Reapply filter to ensure consistency
            return updatedFiltered.filter(item => shouldIncludeInFilter(item, activeTab));
          }
          return currentFiltered;
          
        case 'DELETE':
          if (oldRecord) {
            return currentFiltered.filter(item => item.serial_number !== oldRecord.serial_number);
          }
          return currentFiltered;
          
        default:
          return currentFiltered;
      }
    });
  };

  // Helper function to check if a property should be included in current filter
  const shouldIncludeInFilter = (property: PropertyData, tab: string): boolean => {
    const today = supabaseHelpers.getTodayDate();
    const yesterday = supabaseHelpers.getYesterdayDate();

    switch (tab) {
      case 'imp':
        return Boolean(property.special_note && property.special_note.trim().length > 0);
      case 'today':
        return parseDate(property.date_stamp) === today;
      case 'yesterday':
        return parseDate(property.date_stamp) === yesterday;
      case 'all':
      default:
        return true;
    }
  };

  const parseDate = React.useCallback((isoString: string | null) => {
    if (!isoString) return '';
    return supabaseHelpers.formatDateForComparison(isoString);
  }, []);

  useEffect(() => {
    // Using a separate function to avoid dependency on filterProperties
    const applyFilters = (tab: string) => {
      let filtered = [...properties];
      
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
        filtered = filtered.filter((p) => parseDate(p.date_stamp) === yesterday);
      }

      setFilteredProperties(filtered);
    };
    
    applyFilters(activeTab);
  }, [properties, activeTab, parseDate]);

  const filterProperties = (tab: string) => {
    setActiveTab(tab);
    let filtered = [...properties];

    const today = supabaseHelpers.getTodayDate();
    const yesterday = supabaseHelpers.getYesterdayDate();

    if (tab === 'imp') {
      // Filter properties with special notes (treating them as important)
      filtered = filtered.filter((p) => Boolean(p.special_note && p.special_note.trim().length > 0));
    } else if (tab === 'today') {
      filtered = filtered.filter((p) => {
        const propdate = parseDate(p.date_stamp);
        return propdate === today;
      });
    } else if (tab === 'yesterday') {
      filtered = filtered.filter((p) => parseDate(p.date_stamp) === yesterday);
    }

    setFilteredProperties(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const searchedProperties = properties.filter((property) => {
      const nameContact = (property.owner_name || '') + (property.owner_contact ? `\n${property.owner_contact}` : '');
      return nameContact.toLowerCase().includes(term) || (property.address || '').toLowerCase().includes(term);
    });
    setFilteredProperties(searchedProperties);
    setActiveTab('all');
  };

  const toggleDescription = (id: number) => {
    setExpandedDescriptionId(expandedDescriptionId === id ? null : id);
  };

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
            
            {/* Property Statistics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">🏠</div>
                <div className="text-2xl font-bold text-white">{filteredProperties.length}</div>
                <div className="text-blue-200 text-sm">Total Properties</div>
              </div>
              
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-white">
                  {filteredProperties.filter(p => p.availability === 'Available').length}
                </div>
                <div className="text-green-200 text-sm">Available</div>
              </div>
              
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-white">
                  {filteredProperties.filter(p => p.special_note && p.special_note.trim().length > 0).length}
                </div>
                <div className="text-yellow-200 text-sm">With Special Notes</div>
              </div>
              
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">🔑</div>
                <div className="text-2xl font-bold text-white">
                  {filteredProperties.filter(p => p.rent_sold_out).length}
                </div>
                <div className="text-red-200 text-sm">Sold/Rented Out</div>
              </div>
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              {[
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

            {/* Real-time Status & Search Box */}
            <div className="w-full lg:w-1/2 flex flex-col gap-3">
              {/* Real-time Status Indicator */}
              <div className="flex items-center justify-end gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  realtimeStatus === 'connected' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : realtimeStatus === 'disconnected'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    realtimeStatus === 'connected' 
                      ? 'bg-green-400 animate-pulse' 
                      : realtimeStatus === 'disconnected'
                      ? 'bg-red-400'
                      : 'bg-yellow-400 animate-pulse'
                  }`}></div>
                  <span>
                    {realtimeStatus === 'connected' ? 'Live Sync Active' : 
                     realtimeStatus === 'disconnected' ? 'Sync Disconnected' : 'Connecting...'}
                  </span>
                </div>
              </div>
              
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
                        setFilteredProperties(properties);
                        setActiveTab('all');
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
            <SortControls
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onClearSort={handleClearSort}
              className="mx-auto max-w-4xl"
            />
          </div>

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
                    {filteredProperties.length === 0 ? (
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
                      filteredProperties.map((property, index) => (
                        <React.Fragment key={property.serial_number}>
                          <tr className={`hover:bg-white/10 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
                            <td className="px-4 py-4 border-r border-white/10 text-center text-white/90 font-mono">
                              {property.serial_number}
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalCount > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              className="mt-6"
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
