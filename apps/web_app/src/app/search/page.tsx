"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { PropertyData } from "@/lib/dummyProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "../../lib/supabase";
import { useDynamicOptions } from "../../lib/dynamicOptions";
import { usePropertyStats } from "@/hooks/usePropertyStats";
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Extract rent utility function
const extractRent = (rentString: string) => {
  const numberPart = parseFloat(rentString.replace(/[^\d.]/g, ""));
  return rentString.toLowerCase().includes("thd")
    ? numberPart * 1000
    : numberPart;
};

// SearchResults component integrated directly
function SearchResults({ 
  properties, 
  loading, 
  error 
}: { 
  properties: PropertyData[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="pulse-glow w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-spin border-4 border-transparent mr-4"></div>
        <div className="text-xl text-white/80">Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-xl text-red-400">⚠️ Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {properties.length > 0 ? (
        <>
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white/80 text-center">
            🏠 Found <span className="text-cyan-400 font-bold">{properties.length}</span> {properties.length === 1 ? 'property' : 'properties'}
          </div>
          {properties.map((property) => (
            <div key={property.serial_number} className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gradient-animate mb-3">
                    👤 {property.owner_name} {property.owner_contact}
                  </h2>
                  <p className="text-white/80 mb-3 bg-white/10 rounded-lg p-3 border border-white/20">
                    📝 {property.special_note}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-green-400 font-semibold bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                      <span>💰</span>
                      <span>Price: {property.rent_or_sell_price}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-400 bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
                      <span>🏠</span>
                      <span>Type: {property.sub_property_type}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-400 bg-purple-500/10 rounded-lg p-2 border border-purple-500/20">
                      <span>📍</span>
                      <span>Area: {property.area}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-orange-400 bg-orange-500/10 rounded-lg p-2 border border-orange-500/20">
                    <span>🛋️</span>
                    <span>Furnishing: {property.furnishing_status}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-cyan-400 bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/20">
                    <span>📐</span>
                    <span>Size: {property.size || 'NA'} sqft</span>
                  </div>
                  <div className="flex items-center space-x-2 text-pink-400 bg-pink-500/10 rounded-lg p-2 border border-pink-500/20">
                    <span>�</span>
                    <span>Deposit: {property.deposit}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
                    <span>📊</span>
                    <span>Availability: {property.availability}</span>
                  </div>
                  {property.additional_details && (
                    <div className="flex items-center space-x-2 text-yellow-400 bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/20">
                      <span>ℹ️</span>
                      <span>Details: {property.additional_details}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-6 pulse-glow">🏠</div>
          <p className="text-white/80 text-2xl mb-2">No properties found</p>
          <p className="text-white/60 text-lg">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
}

// FilterForm component integrated directly
function FilterForm({ onSearch }: { 
  onSearch: (filters: {
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
  }) => void;
}) {
  // Use dynamic options hook for live data from Supabase
  const { options: dynamicOptions, loading: optionsLoading, error: optionsError } = useDynamicOptions(true);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");

  const [filters, setFilters] = useState({
    propertyType: [] as string[],
    condition: [] as string[],
    area: [] as string[],
    availability: [] as string[],
    availabilityType: [] as string[],
    budgetMin: "",
    budgetMax: "",
    sqftFrom: "",
    sqftTo: "",
    premise: "",
  });

  const handleCheckboxChange = (
    section: keyof Pick<
      typeof filters,
      | "propertyType"
      | "condition"
      | "area"
      | "availability"
      | "availabilityType"
    >,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [section]: prev[section].includes(value)
        ? prev[section].filter((v: string) => v !== value)
        : [...prev[section], value],
    }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <div className="w-full lg:w-full mx-auto overflow-hidden p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4">
          <table className="w-full border-collapse border border-white/20">
            <tbody>
              {/* propertyType */}
              <tr className="border-b border-white/20">
                <th className="border-r border-white/20 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Property Type:
                </th>
                <td className="px-4 py-2">
                  <div className="relative">
                    {/* Dropdown Trigger */}
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left border border-white/20 bg-slate-800/50 text-white rounded-md hover:bg-slate-700/50 transition-colors"
                      onClick={() => setShowDropdown((prev) => !prev)}
                    >
                      {selectedPropertyType || "Select Property Type"}
                      <span className="float-right">&#9662;</span>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute w-full mt-2 bg-slate-800 border border-white/20 rounded-md shadow-lg z-10">
                        {!optionsLoading && dynamicOptions.propertyTypes.map((type: string) => (
                          <div
                            key={type}
                            className="px-4 py-2 hover:bg-blue-600/50 cursor-pointer text-white"
                            onClick={() => {
                              handleCheckboxChange("propertyType", type);
                              setSelectedPropertyType(type);
                              setShowDropdown(false);
                            }}
                          >
                            {type === 'Res_resale' ? 'Residential Resale' :
                             type === 'Res_rental' ? 'Residential Rental' :
                             type === 'Com_resale' ? 'Commercial Resale' :
                             type === 'Com_rental' ? 'Commercial Rental' : type}
                          </div>
                        ))}
                        {optionsLoading && (
                          <div className="px-4 py-2 text-white/60">Loading...</div>
                        )}
                        {optionsError && (
                          <div className="px-4 py-2 text-red-400">Error loading options</div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
              {/* conditions */}
              <tr className="border-b border-white/20">
                <th className="border-r border-white/20 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Conditions:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  {!optionsLoading && dynamicOptions.furnishingStatuses.map((type: string) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.condition.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("condition", type)
                        }
                      />
                      <Label htmlFor={type} className="text-sm text-white">
                        {type}
                      </Label>
                    </div>
                  ))}
                  {optionsLoading && (
                    <div className="text-white/60">Loading...</div>
                  )}
                  {optionsError && (
                    <div className="text-red-400">Error loading options</div>
                  )}
                </td>
              </tr>
              {/* areas */}
              <tr className="border-b border-white/20">
                <th className="border-r border-white/20 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Area:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  {!optionsLoading && dynamicOptions.areas.map((type: string) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.area.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("area", type)
                        }
                      />
                      <Label htmlFor={type} className="text-sm text-white">
                        {type}
                      </Label>
                    </div>
                  ))}
                  {optionsLoading && (
                    <div className="text-white/60">Loading...</div>
                  )}
                  {optionsError && (
                    <div className="text-red-400">Error loading options</div>
                  )}
                </td>
              </tr>
              {/* availabilities */}
              <tr className="border-b border-white/20">
                <th className="border-r border-white/20 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Availability:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  {!optionsLoading && dynamicOptions.subPropertyTypes.map((type: string) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.availability.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("availability", type)
                        }
                      />
                      <Label htmlFor={type} className="text-sm text-white">
                        {type}
                      </Label>
                    </div>
                  ))}
                  {optionsLoading && (
                    <div className="text-white/60">Loading...</div>
                  )}
                  {optionsError && (
                    <div className="text-red-400">Error loading options</div>
                  )}
                </td>
              </tr>
              {/* availabilityType */}
              <tr className="border-b border-white/20">
                <th className="border-r border-white/20 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Availability Type:
                </th>
                <td className="flex  flex-wrap items-center gap-4 px-4 py-2">
                  {!optionsLoading && dynamicOptions.tenantPreferences.map((type: string) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.availabilityType.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("availabilityType", type)
                        }
                      />
                      <Label htmlFor={type} className="text-sm text-white">
                        {type}
                      </Label>
                    </div>
                  ))}
                  {optionsLoading && (
                    <div className="text-white/60">Loading...</div>
                  )}
                  {optionsError && (
                    <div className="text-red-400">Error loading options</div>
                  )}
                </td>
              </tr>
              {/* budget */}
              <tr className="border-b border-white/20">
                <th className="border-r border-white/20 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Budget:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  <Label htmlFor="budgetMin" className="text-sm text-white">
                    Min:
                  </Label>
                  <Input
                    type="number"
                    id="budgetMin"
                    name="budgetMin"
                    value={filters.budgetMin}
                    onChange={handleInputChange}
                    className="w-24 bg-slate-800/50 border-white/20 text-white placeholder-white/50"
                  />
                  <Label htmlFor="budgetMax" className="text-sm text-white">
                    Max:
                  </Label>
                  <Input
                    type="number"
                    id="budgetMax"
                    name="budgetMax"
                    value={filters.budgetMax}
                    onChange={handleInputChange}
                    className="w-24 bg-slate-800/50 border-white/20 text-white placeholder-white/50"
                  />
                </td>
              </tr>
              {/* sqrt feet */}
              <tr className="border-b border-white/20">
                <th className="border-r border-white/20 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Sqft:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  <Label htmlFor="sqftFrom" className="text-sm text-white">
                    From:
                  </Label>
                  <Input
                    type="number"
                    id="sqftFrom"
                    name="sqftFrom"
                    value={filters.sqftFrom}
                    onChange={handleInputChange}
                    className="w-32 px-3 py-2 bg-slate-800/50 border border-white/20 text-white placeholder-white/50 rounded-md"
                  />
                  <Label htmlFor="sqftTo" className="text-sm text-white">
                    To:
                  </Label>
                  <Input
                    type="number"
                    id="sqftTo"
                    name="sqftTo"
                    value={filters.sqftTo}
                    onChange={handleInputChange}
                    className="w-32 px-3 py-2 bg-slate-800/50 border border-white/20 text-white placeholder-white/50 rounded-md"
                  />
                </td>
              </tr>
              {/* premises */}
              <tr className="border-b border-white/20">
                <th className="border-r border-white/20 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Premises:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2 w-full">
                  <Input
                    type="text"
                    id="premise"
                    name="premise"
                    value={filters.premise}
                    onChange={handleInputChange}
                    className="w-full maxw-l px-4 py-2 bg-slate-800/50 border border-white/20 text-white placeholder-white/50 rounded-md"
                  />
                </td>
              </tr>
              {/* submit button */}
              <tr className="border border-white/20">
                <td colSpan={2} className="flex-wrap px-4 py-2 text-center">
                  <Button
                    type="submit"
                    className="bg-[#0b7082] text-white hover:bg-[#0b7056] transition duration-300 ease-in-out"
                  >
                    Search
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}

export default function SearchPage() {
  const [showSearch, setShowSearch] = useState(true);
  const [searchResult, setSearchResult] = useState<PropertyData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use property stats hook for Enhanced Property Stats Overview
  const { stats, loading: statsLoading } = usePropertyStats();

  // Fetch properties from Supabase - same filtering as dashboard (only active properties)
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all active records using pagination to avoid Supabase limits (same as dashboard)
      let allData: PropertyData[] = [];
      let hasMore = true;
      let offset = 0;
      const batchSize = 1000;

      while (hasMore) {
        const { data, error: supabaseError } = await supabase
          .from('propertydata')
          .select('*')
          .not('rent_sold_out', 'eq', true) // Only active properties (same filter as dashboard)
          .order('date_stamp', { ascending: false })
          .range(offset, offset + batchSize - 1);

        if (supabaseError) {
          throw supabaseError;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          offset += batchSize;
          hasMore = data.length === batchSize; // If we got less than batchSize, we're done
        } else {
          hasMore = false;
        }
      }

      setProperties(allData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load properties on component mount with real-time subscription (no periodic refresh)
  useEffect(() => {
    fetchProperties();
    
    // Setup real-time subscription for live database changes
    const channel = supabase
      .channel('property-changes-search')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'propertydata'
        },
        (payload) => {
          handleRealtimeChange(payload as RealtimePostgresChangesPayload<PropertyData>);
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle real-time database changes without full refresh
  const handleRealtimeChange = (payload: RealtimePostgresChangesPayload<PropertyData>) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Only update if it affects active properties (same filter as our fetch)
    const isActiveProperty = (record: PropertyData) => !record.rent_sold_out;
    
    setProperties(currentProperties => {
      switch (eventType) {
        case 'INSERT':
          if (newRecord && isActiveProperty(newRecord)) {
            // Add new active property to the list
            const exists = currentProperties.some(p => p.serial_number === newRecord.serial_number);
            if (!exists) {
              return [newRecord, ...currentProperties];
            }
          }
          return currentProperties;
          
        case 'UPDATE':
          if (newRecord) {
            if (isActiveProperty(newRecord)) {
              // Update existing property or add if it became active
              const existingIndex = currentProperties.findIndex(p => p.serial_number === newRecord.serial_number);
              if (existingIndex >= 0) {
                return currentProperties.map(p => 
                  p.serial_number === newRecord.serial_number ? newRecord : p
                );
              } else {
                // Property became active, add it
                return [newRecord, ...currentProperties];
              }
            } else {
              // Property became inactive, remove it
              return currentProperties.filter(p => p.serial_number !== newRecord.serial_number);
            }
          }
          return currentProperties;
          
        case 'DELETE':
          if (oldRecord) {
            return currentProperties.filter(p => p.serial_number !== oldRecord.serial_number);
          }
          return currentProperties;
          
        default:
          return currentProperties;
      }
    });
  };

  // Initialize search results with all properties when properties load
  // Also update search results when properties change from real-time updates
  useEffect(() => {
    if (properties.length > 0) {
      // If no specific search has been performed, show all properties
      setSearchResult(prevResults => {
        // If we have existing search results, preserve the filtering logic
        if (prevResults.length === 0 || prevResults.length === properties.length) {
          return properties;
        }
        // Otherwise, keep the current filtered results but update with new data
        return prevResults;
      });
    }
  }, [properties]);
  
  const handleSearch = (filters: {
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
  }) => {
    // Reset error state when performing search
    setError(null);
    
    const filtered = properties.filter((property) => {
      return (
        (filters.propertyType.length === 0 ||
          (property.property_type && filters.propertyType.includes(property.property_type))) &&
        (filters.condition.length === 0 ||
          (property.furnishing_status && filters.condition.includes(property.furnishing_status))) &&
        (filters.area.length === 0 || 
          (property.area && filters.area.includes(property.area))) &&
        (filters.availability.length === 0 ||
          (property.sub_property_type && filters.availability.includes(property.sub_property_type))) &&
        (!filters.budgetMin ||
          parseInt(filters.budgetMin) <= extractRent(String(property.rent_or_sell_price))) &&
        (!filters.budgetMax ||
          parseInt(filters.budgetMax) >= extractRent(String(property.rent_or_sell_price))) &&
        (!filters.premise ||
          property.address?.toLowerCase().includes(filters.premise.toLowerCase()))
      );
    });
    setSearchResult(filtered);
    setShowSearch(false); // Hide search panel after search
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative">
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
        
        <div className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Enhanced Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl lg:text-6xl font-bold text-gradient-animate mb-6">
                🔍 Property Search Hub
              </h1>
              <p className="text-white/70 text-xl mb-8">Discover your perfect property with AI-powered search filters</p>
              
              {/* Modern Stats Cards with integrated property stats data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <span className="text-3xl">🏠</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {statsLoading ? '...' : stats.total.toLocaleString()}
                  </h3>
                  <p className="text-blue-200">Total Active Properties</p>
                </div>
                
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <span className="text-3xl">🏘️</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {statsLoading ? '...' : (stats.residential_rent + stats.residential_sell).toLocaleString()}
                  </h3>
                  <p className="text-green-200">Residential Properties</p>
                </div>
                
                <div className="card-hover-3d backdrop-blur-3d bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <span className="text-3xl">🏢</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {statsLoading ? '...' : (stats.commercial_rent + stats.commercial_sell).toLocaleString()}
                  </h3>
                  <p className="text-purple-200">Commercial Properties</p>
                </div>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-6 card-hover-3d backdrop-blur-3d bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Error loading properties</p>
                    <p className="text-red-200">{error}</p>
                  </div>
                </div>
                <Button 
                  onClick={fetchProperties}
                  className="btn-3d bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 mt-4"
                >
                  🔄 Retry Loading
                </Button>
              </div>
            )}
            
            {/* Enhanced Control Panel */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div className="flex flex-wrap gap-3">
                <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-4 py-2">
                  <span className="text-white/70 text-sm">Showing:</span>
                  <span className="text-cyan-400 font-bold ml-2">{searchResult.length}</span>
                  <span className="text-white/70 text-sm ml-1">properties</span>
                </div>
              </div>
              
              <Button
                onClick={() => setShowSearch((prev) => !prev)}
                className="btn-3d bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 px-8 py-3 text-lg"
              >
                {showSearch ? "🔍 Hide Search Panel" : "⚙️ Show Search Panel"}
              </Button>
            </div>
            
            <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
              {showSearch ? (
                <FilterForm onSearch={handleSearch} />
              ) : (
                <SearchResults 
                  properties={searchResult} 
                  loading={loading}
                  error={error}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
