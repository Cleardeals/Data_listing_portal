'use client';

import React, { useState, useEffect } from 'react';
import { PropertyData, supabaseHelpers } from "@/lib/dummyProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "../../lib/supabase";

const Page = () => {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Load properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

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
        {/* 3D Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="float-animation absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-sm"></div>
          <div className="float-animation absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="float-animation absolute bottom-40 left-40 w-28 h-28 bg-cyan-500/20 rounded-full blur-sm" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-animate mb-4">
              🏠 Property Listings
            </h1>
            <p className="text-white/70 text-lg">Residential Rent Property Management</p>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'imp', label: '⭐ Important', color: 'from-yellow-600 to-orange-600' },
                { key: 'today', label: '📅 Today', color: 'from-blue-600 to-cyan-600' },
                { key: 'yesterday', label: '📆 Yesterday', color: 'from-indigo-600 to-blue-600' },
                { key: 'all', label: '📋 All', color: 'from-slate-600 to-gray-600' }
              ].map((tab) => (
                <Button 
                  key={tab.key}
                  className={`btn-3d bg-gradient-to-r ${tab.color} hover:scale-105 text-white border-0 transition-all duration-300 ${
                    activeTab === tab.key ? 'ring-2 ring-white/50' : ''
                  }`}
                  onClick={() => filterProperties(tab.key)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Search Box */}
            <div className="w-full lg:w-1/2">
              <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl overflow-hidden flex items-center">
                <Input
                  type="text"
                  placeholder="🔍 Search by Contact or Premise..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-3 bg-transparent text-white placeholder-white/60 border-0 focus:outline-none focus:ring-0"
                />
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
