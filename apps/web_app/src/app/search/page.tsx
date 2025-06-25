"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDynamicOptions } from "../../lib/dynamicOptions";
import { usePropertyStats } from "@/hooks/usePropertyStats";

// FilterForm component integrated directly
function FilterForm() {
  const router = useRouter();
  
  // Use dynamic options hook WITHOUT real-time updates to prevent flickering
  const { options: dynamicOptions, loading: optionsLoading, error: optionsError } = useDynamicOptions(false);
  
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
    
    // Create URL search params for the filters
    const searchParams = new URLSearchParams();
    
    // Add non-empty filters to search params
    if (filters.propertyType.length > 0) {
      searchParams.set('propertyType', filters.propertyType.join(','));
    }
    if (filters.condition.length > 0) {
      searchParams.set('condition', filters.condition.join(','));
    }
    if (filters.area.length > 0) {
      searchParams.set('area', filters.area.join(','));
    }
    if (filters.availability.length > 0) {
      searchParams.set('availability', filters.availability.join(','));
    }
    if (filters.availabilityType.length > 0) {
      searchParams.set('availabilityType', filters.availabilityType.join(','));
    }
    if (filters.budgetMin) {
      searchParams.set('budgetMin', filters.budgetMin);
    }
    if (filters.budgetMax) {
      searchParams.set('budgetMax', filters.budgetMax);
    }
    if (filters.sqftFrom) {
      searchParams.set('sqftFrom', filters.sqftFrom);
    }
    if (filters.sqftTo) {
      searchParams.set('sqftTo', filters.sqftTo);
    }
    if (filters.premise) {
      searchParams.set('premise', filters.premise);
    }
    
    // Redirect to table view with filters
    router.push(`/tableview?${searchParams.toString()}`);
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
  
  // Use property stats hook for Enhanced Property Stats Overview
  const { stats, loading: statsLoading } = usePropertyStats();
  
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

            {/* Enhanced Control Panel */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div className="flex flex-wrap gap-3">
                <div className="card-hover-3d backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-4 py-2">
                  <span className="text-white/70 text-sm">Search Portal:</span>
                  <span className="text-cyan-400 font-bold ml-2">Configure & Filter</span>
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
                <FilterForm />
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-6 pulse-glow">🔍</div>
                  <p className="text-white/80 text-2xl mb-2">Search Panel</p>
                  <p className="text-white/60 text-lg">Configure your search filters and click search to view results in table format</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
