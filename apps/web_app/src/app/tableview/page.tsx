'use client';

import React, { useState, useEffect } from 'react';
import { PropertyData, supabaseHelpers } from "@/lib/dummyProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "../../../../../packages/shared/supabase";

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

  const tabColors: Record<string, string> = {
    imp: 'bg-[#f0ad4e] text-white hover:bg-[#f0ad4e]/75',
    today: 'bg-[#0b7082] text-white hover:bg-[#0b7082]/75',
    yesterday: 'bg-[#0b7082] text-white hover:bg-[#0b7082]/75',
    all: 'bg-[#fff] text-black hover:bg-[#ccc]',
    };

  return (
    <ProtectedRoute>
      <div className='font-sans'>
        <div>
          <div className='font-medium text-lg mt-[22px] ml-[22px] block box-header text-[#337ab7] h-4'>Residential Rent Property Listing</div>
          <div className='box-border block clear-both mb-[40px]'></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div className='w-full sm:w-full md:w-1/3 lg:w-1/3 text-center lg:text-left mb-4 flex space-x-2'>
            {['imp', 'today', 'yesterday', 'all'].map((tab) => (
              <Button 
                variant={'outline'}
                key={tab}
                className={tabColors[tab]}
                onClick={() => filterProperties(tab)}>
                {tab === 'imp' ? 'Imp' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>

          <div className="w-full lg:w-1/2">
            <div className="flex items-center shadow rounded overflow-hidden border border-gray-300">
              <Input
                type="text"
                placeholder="Search by Contact or Premise and press enter"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button className="bg-gray-200 px-4 py-2 border-l border-gray-300">
                🔍
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <Button 
            onClick={fetchProperties} 
            className="ml-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-gray-600">Loading properties...</div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="relative overflow-x-auto px-6 py-4">
          <table className="w-full border-collapse mt-5 border-[#024457] border-1 border-double">
            <thead>
              <tr className="bg-[#167F92] text-white">
                {['Imp', 'Special Note', 'Date', 'Name & Contact', 'Address', 'Premise', 'Area', 'Rent', 'Availability', 'Condition', 'SqFt/Sign', 'Key', 'Brokerage', 'Status', 'Rented Out?', '...'].map((heading) => (
                  <th key={heading} style={{ padding: '10px', border: '1px solid #ccc', fontWeight: 'bold', }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-8 text-gray-500">
                    No properties found
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <React.Fragment key={property.id}>
                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(property.important)}
                          onChange={() => handleImportantChange(property.id)}
                        />
                      </td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>{property.premium}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>{property.date}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc', whiteSpace: 'pre-line' }}>
                        {property.name}{property.contact ? `\n${property.contact}` : ''}
                      </td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc', whiteSpace: 'pre-line' }}>{property.address}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>{property.premise}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>{property.area}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>{property.rent}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc', whiteSpace: 'pre-line' }}>{property.availability}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc', whiteSpace: 'pre-line' }}>{property.condition}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>{property.sqft || 'NA'}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc', whiteSpace: 'pre-line' }}>{property.key}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc', whiteSpace: 'pre-line' }}>{property.brokerage}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc' }}>{property.status}</td>
                      <td style={{ padding: '10px', borderRight: '1px solid #ccc', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(property.rentedout)}
                          onChange={() => handleRentedOutChange(property.id)}
                        />
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleDescription(property.id)}>
                        {expandedDescriptionId === property.id ? '▲' : '▼'}
                      </td>
                    </tr>
                    {expandedDescriptionId === property.id && (
                      <tr>
                        <td colSpan={16} className="px-4 py-3 border-b border-gray-300 bg-gray-100 text-center whitespace-pre-line">
                          {property.specialnote && (
                            <div>
                              <span className="font-bold text-sm text-gray-800">Description:</span>{' '}
                              <span className="text-sm text-gray-700">{property.specialnote}</span>
                            </div>
                          )}
                          {property.premium && (
                            <div className="mt-1">
                              <span className="font-bold text-sm text-gray-800">Premium Note:</span>{' '}
                              <span className="text-sm text-gray-700">{property.premium}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
};

export default Page;


