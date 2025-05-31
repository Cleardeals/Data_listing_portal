'use client';

import React, { useState, useEffect } from 'react';
import { PropertyData, supabaseHelpers } from "@/lib/dummyProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "../../lib/supabase";
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const Page = () => {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Fetch properties from Supabase
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('propertydata')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load properties on component mount and setup real-time subscription
  useEffect(() => {
    fetchProperties();

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
  }, []);

  // Handle real-time changes
  const handleRealtimeChange = (payload: RealtimePostgresChangesPayload<PropertyData>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setProperties(currentData => {
      switch (eventType) {
        case 'INSERT':
          // Add new record if it doesn't exist
          if (newRecord) {
            const existingIndex = currentData.findIndex(item => item.id === newRecord.id);
            if (existingIndex === -1) {
              return [newRecord, ...currentData];
            }
          }
          return currentData;
          
        case 'UPDATE':
          // Update existing record
          if (newRecord) {
            return currentData.map(item => 
              item.id === newRecord.id ? newRecord : item
            );
          }
          return currentData;
          
        case 'DELETE':
          // Remove deleted record
          if (oldRecord) {
            return currentData.filter(item => item.id !== oldRecord.id);
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
            const existingIndex = currentFiltered.findIndex(item => item.id === newRecord.id);
            if (existingIndex === -1) {
              // Check if new record matches current filter
              return shouldIncludeInFilter(newRecord, activeTab) ? [newRecord, ...currentFiltered] : currentFiltered;
            }
          }
          return currentFiltered;
          
        case 'UPDATE':
          if (newRecord) {
            const updatedFiltered = currentFiltered.map(item => 
              item.id === newRecord.id ? newRecord : item
            );
            // Reapply filter to ensure consistency
            return updatedFiltered.filter(item => shouldIncludeInFilter(item, activeTab));
          }
          return currentFiltered;
          
        case 'DELETE':
          if (oldRecord) {
            return currentFiltered.filter(item => item.id !== oldRecord.id);
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
        return Boolean(property.important);
      case 'today':
        return parseDate(property.date) === today;
      case 'yesterday':
        return parseDate(property.date) === yesterday;
      case 'all':
      default:
        return true;
    }
  };

  const parseDate = React.useCallback((ddmmyyyy: string | null) => {
    if (!ddmmyyyy) return '';
    return supabaseHelpers.formatDateForComparison(ddmmyyyy);
  }, []);

  useEffect(() => {
    // Using a separate function to avoid dependency on filterProperties
    const applyFilters = (tab: string) => {
      let filtered = [...properties];
      
      const today = supabaseHelpers.getTodayDate();
      const yesterday = supabaseHelpers.getYesterdayDate();

      if (tab === 'imp') {
        filtered = filtered.filter((p) => Boolean(p.important));
      } else if (tab === 'today') {
        filtered = filtered.filter((p) => {
          const propdate = parseDate(p.date);
          return propdate === today;
        });
      } else if (tab === 'yesterday') {
        filtered = filtered.filter((p) => parseDate(p.date) === yesterday);
      }

      setFilteredProperties(filtered);
    };
    
    applyFilters(activeTab);
  }, [properties, activeTab, parseDate]);

  const handleImportantChange = async (id: number) => {
    try {
      const property = properties.find(p => p.id === id);
      if (!property) return;

      const newImportantValue = property.important ? 0 : 1;
      
      const { error } = await supabase
        .from('propertydata')
        .update({ important: newImportantValue })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedProperties = properties.map((property) =>
        property.id === id ? { ...property, important: newImportantValue } : property
      );
      setProperties(updatedProperties);
    } catch (err: unknown) {
      console.error('Error updating important status:', err);
      setError('Failed to update important status');
    }
  };

  const handleRentedOutChange = async (id: number) => {
    try {
      const property = properties.find(p => p.id === id);
      if (!property) return;

      const newRentedOutValue = !property.rentedout;
      
      const { error } = await supabase
        .from('propertydata')
        .update({ rentedout: newRentedOutValue })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedProperties = properties.map((property) =>
        property.id === id ? { ...property, rentedout: newRentedOutValue } : property
      );
      setProperties(updatedProperties);
    } catch (err: unknown) {
      console.error('Error updating rented out status:', err);
      setError('Failed to update rented out status');
    }
  };

  const filterProperties = (tab: string) => {
    setActiveTab(tab);
    let filtered = [...properties];

    const today = supabaseHelpers.getTodayDate();
    const yesterday = supabaseHelpers.getYesterdayDate();

    if (tab === 'imp') {
      filtered = filtered.filter((p) => Boolean(p.important));
    } else if (tab === 'today') {
      filtered = filtered.filter((p) => {
        const propdate = parseDate(p.date);
        return propdate === today;
      });
    } else if (tab === 'yesterday') {
      filtered = filtered.filter((p) => parseDate(p.date) === yesterday);
    }

    setFilteredProperties(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const searchedProperties = properties.filter((property) => {
      const nameContact = property.name + (property.contact ? `\n${property.contact}` : '');
      return nameContact.toLowerCase().includes(term) || (property.premise || '').toLowerCase().includes(term);
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
                  {filteredProperties.filter(p => p.status === 'Available').length}
                </div>
                <div className="text-green-200 text-sm">Available</div>
              </div>
              
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-white">
                  {filteredProperties.filter(p => p.important).length}
                </div>
                <div className="text-yellow-200 text-sm">Important</div>
              </div>
              
              <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-xl p-4">
                <div className="text-3xl mb-2">🔑</div>
                <div className="text-2xl font-bold text-white">
                  {filteredProperties.filter(p => p.rentedout).length}
                </div>
                <div className="text-red-200 text-sm">Rented Out</div>
              </div>
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'imp', label: '⭐ Important', color: 'from-yellow-600 to-orange-600', count: properties.filter(p => p.important).length },
                { key: 'today', label: '📅 Today', color: 'from-blue-600 to-cyan-600', count: properties.filter(p => parseDate(p.date) === supabaseHelpers.getTodayDate()).length },
                { key: 'yesterday', label: '📆 Yesterday', color: 'from-indigo-600 to-blue-600', count: properties.filter(p => parseDate(p.date) === supabaseHelpers.getYesterdayDate()).length },
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
                    placeholder="🔍 Search by name, contact, or premise..."
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
                onClick={fetchProperties} 
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
                      {['⭐', '📝 Special Note', '📅 Date', '👤 Name & Contact', '📍 Address', '🏠 Premise', '📍 Area', '💰 Rent', '🗓️ Availability', '🔧 Condition', '📏 SqFt/Sign', '🔑 Key', '💼 Brokerage', '📊 Status', '🏠 Rented Out?', '📋'].map((heading) => (
                        <th key={heading} className="px-4 py-4 text-left font-semibold border-r border-white/20 last:border-r-0">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.length === 0 ? (
                      <tr>
                        <td colSpan={16} className="text-center py-16">
                          <div className="text-white/60">
                            <div className="text-6xl mb-4">🏠</div>
                            <p className="text-xl">No properties found</p>
                            <p className="text-sm mt-2">Try adjusting your filters or search terms</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProperties.map((property, index) => (
                        <React.Fragment key={property.id}>
                          <tr className={`hover:bg-white/10 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
                            <td className="px-4 py-4 border-r border-white/10 text-center">
                              <input
                                type="checkbox"
                                checked={Boolean(property.important)}
                                onChange={() => handleImportantChange(property.id)}
                                className="w-4 h-4 text-yellow-500 bg-transparent border-2 border-white/30 rounded focus:ring-yellow-500 focus:ring-2"
                              />
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="truncate" title={property.premium || ''}>
                                {property.premium || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 whitespace-nowrap">
                              {property.date || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm">
                                <div className="font-semibold">{property.name || '-'}</div>
                                {property.contact && <div className="text-white/70">{property.contact}</div>}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm truncate" title={property.address || ''}>
                                {property.address || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.premise || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.area || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 font-semibold">
                              {property.rent || '-'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm truncate" title={property.availability || ''}>
                                {property.availability || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm truncate" title={property.condition || ''}>
                                {property.condition || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              {property.sqft || 'NA'}
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm truncate" title={property.key || ''}>
                                {property.key || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90 max-w-xs">
                              <div className="whitespace-pre-line text-sm truncate" title={property.brokerage || ''}>
                                {property.brokerage || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-white/90">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                property.status === 'Available' ? 'bg-green-500/20 text-green-300' :
                                property.status === 'Rented' ? 'bg-red-500/20 text-red-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {property.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-4 border-r border-white/10 text-center">
                              <input
                                type="checkbox"
                                checked={Boolean(property.rentedout)}
                                onChange={() => handleRentedOutChange(property.id)}
                                className="w-4 h-4 text-green-500 bg-transparent border-2 border-white/30 rounded focus:ring-green-500 focus:ring-2"
                              />
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => toggleDescription(property.id)}
                                className="text-white/70 hover:text-white transition-colors duration-200 text-lg"
                              >
                                {expandedDescriptionId === property.id ? '▲' : '▼'}
                              </button>
                            </td>
                          </tr>
                          {expandedDescriptionId === property.id && (
                            <tr>
                              <td colSpan={16} className="px-6 py-4 bg-white/10 border-t border-white/20">
                                <div className="backdrop-blur-sm bg-white/5 rounded-lg p-4 border border-white/20">
                                  {property.specialnote && (
                                    <div className="mb-3">
                                      <span className="font-bold text-sm text-blue-300">📝 Description:</span>
                                      <div className="text-sm text-white/80 mt-1 whitespace-pre-line">
                                        {property.specialnote}
                                      </div>
                                    </div>
                                  )}
                                  {property.premium && (
                                    <div>
                                      <span className="font-bold text-sm text-yellow-300">⭐ Premium Note:</span>
                                      <div className="text-sm text-white/80 mt-1 whitespace-pre-line">
                                        {property.premium}
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
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
