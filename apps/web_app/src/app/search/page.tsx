"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { PropertyData } from "@/lib/dummyProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "../../../../../packages/shared/supabase";

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
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <div className="text-lg text-gray-600">Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Found {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </div>
          {properties.map((property) => (
            <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{property.name} {property.contact}</h2>
                  <p className="text-gray-600 mb-2">{property.specialnote}</p>
                  <div className="space-y-1">
                    <p className="text-green-600 font-medium">💰 Rent: {property.rent}</p>
                    <p className="text-gray-600">🏠 Type: {property.availability}</p>
                    <p className="text-gray-600">📍 Area: {property.area}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">🛋️ Condition: {property.condition}</p>
                  <p className="text-gray-600">📐 Size: {property.sqft || 'NA'} sqft</p>
                  <p className="text-gray-600">💼 Brokerage: {property.brokerage}</p>
                  <p className="text-gray-600">📊 Status: {property.status}</p>
                  {property.premium && (
                    <p className="text-gray-600">ℹ️ Details: {property.premium}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🏠</div>
          <p className="text-gray-600 text-lg">No properties found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search filters</p>
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
    premium: string[];
    budgetMin: string;
    budgetMax: string;
    sqftFrom: string;
    sqftTo: string;
    premise: string;
  }) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");

  const [filters, setFilters] = useState({
    propertyType: [] as string[],
    condition: [] as string[],
    area: [] as string[],
    availability: [] as string[],
    availabilityType: [] as string[],
    premium: [] as string[],
    budgetMin: "",
    budgetMax: "",
    sqftFrom: "",
    sqftTo: "",
    premise: "",
  });

  const propertyType = [
    "Residential Rent",
    "Commercial Rent",
    "Residential Sale",
    "Commercial Sale",
  ];

  const conditions = [
    "Fully Furnished",
    "Semi Furnished",
    "Unfurnished",
    "Fix-Furnished",
    "Kitchen-Fix",
  ];
  const areas = [
    "100 Feet Road",
    "Dholera",
    "Juhapur",
    "New CG Road",
    "Sanand",
    "Sola",
    "Adalaj",
    "Drive In Road",
    "Kalol",
    "New Ranip",
    "Sanathal",
    "South Bopal",
    "Ellisbridge",
    "Koba",
    "New Wadaj",
    "Santej",
    "Ambawadi",
    "SP Ring Road",
    "Ambli",
    "Gandinagar",
    "Koteshwaar",
    "Ninar Nagar",
    "Sargasan",
    "Subhash Bridge",
    "Other Area",
  ];
  const availabilities = [
    "1 Room",
    "1 Room & Kitchen",
    "1.5 BHK",
    "1 BHK",
    "2 Room",
    "2 Room & Kitchen",
    "2.5 BHK",
    "2 BHK",
    "3.5 BHK",
    "3BHK",
    "4BHK",
    "5BHK",
    "6BHK",
    "Above 6BKH",
    "Duplex1",
    "Independent Buliding",
    "PG",
    "Residential Plot",
    "Duplex",
  ];
  const availabilityTypes = [
    "Low Rise Apartment",
    "High Rise Apartment",
    "Bungalow",
    "Penthouse",
    "Weekend Home",
    "Rowhouse",
    "Tenement",
    "Building",
  ];
  const descriptionOptions = ["For Family", "For Executive", "For Bachelors"];

  const handleCheckboxChange = (
    section: keyof Pick<
      typeof filters,
      | "propertyType"
      | "condition"
      | "area"
      | "availability"
      | "availabilityType"
      | "premium"
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
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              {/* propertyType */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-100 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Property Type:
                </th>
                <td className="px-4 py-2">
                  <div className="relative">
                    {/* Dropdown Trigger */}
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left border border-gray-300 rounded-md"
                      onClick={() => setShowDropdown((prev) => !prev)}
                    >
                      {selectedPropertyType || "Select Property Type"}
                      <span className="float-right">&#9662;</span>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        {propertyType.map((type) => (
                          <div
                            key={type}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                            onClick={() => {
                              handleCheckboxChange("propertyType", type);
                              setSelectedPropertyType(type);
                              setShowDropdown(false);
                            }}
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
              {/* conditions */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Conditions:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  {conditions.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.condition.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("condition", type)
                        }
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </td>
              </tr>
              {/* areas */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Area:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  {areas.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.area.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("area", type)
                        }
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </td>
              </tr>
              {/* availabilities */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Availability:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  {availabilities.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.availability.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("availability", type)
                        }
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </td>
              </tr>
              {/* availabilityType */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Availability Type:
                </th>
                <td className="flex  flex-wrap items-center gap-4 px-4 py-2">
                  {availabilityTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.availabilityType.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("availabilityType", type)
                        }
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </td>
              </tr>
              {/* premium */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Premium:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  {descriptionOptions.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.premium.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("premium", type)
                        }
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </td>
              </tr>
              {/* budget */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Budget:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  <Label htmlFor="budgetMin" className="text-sm">
                    Min:
                  </Label>
                  <Input
                    type="number"
                    id="budgetMin"
                    name="budgetMin"
                    value={filters.budgetMin}
                    onChange={handleInputChange}
                    className="w-24"
                  />
                  <Label htmlFor="budgetMax" className="text-sm">
                    Max:
                  </Label>
                  <Input
                    type="number"
                    id="budgetMax"
                    name="budgetMax"
                    value={filters.budgetMax}
                    onChange={handleInputChange}
                    className="w-24"
                  />
                </td>
              </tr>
              {/* sqrt feet */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Sqft:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  <Label htmlFor="sqftFrom" className="text-sm">
                    From:
                  </Label>
                  <Input
                    type="number"
                    id="sqftFrom"
                    name="sqftFrom"
                    value={filters.sqftFrom}
                    onChange={handleInputChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <Label htmlFor="sqftTo" className="text-sm">
                    To:
                  </Label>
                  <Input
                    type="number"
                    id="sqftTo"
                    name="sqftTo"
                    value={filters.sqftTo}
                    onChange={handleInputChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </td>
              </tr>
              {/* premises */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Premises:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2 w-full">
                  <Input
                    type="text"
                    id="premise"
                    name="premise"
                    value={filters.premise}
                    onChange={handleInputChange}
                    className="w-full maxw-l px-4 py-2 border border-gray-300 rounded-md"
                  />
                </td>
              </tr>
              {/* submit button */}
              <tr className="border border-[#0b7082]-300">
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load properties on component mount and set up auto-refresh
  useEffect(() => {
    fetchProperties();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchProperties();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Initialize search results with all properties when properties load
  useEffect(() => {
    if (properties.length > 0) {
      setSearchResult(properties);
    }
  }, [properties]);
  
  const handleSearch = (filters: {
    propertyType: string[];
    condition: string[];
    area: string[];
    availability: string[];
    availabilityType: string[];
    premium: string[];
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
          (property.availability && filters.propertyType.includes(property.availability))) &&
        (filters.condition.length === 0 ||
          (property.condition && filters.condition.includes(property.condition))) &&
        (filters.area.length === 0 || 
          (property.area && filters.area.includes(property.area))) &&
        (filters.availability.length === 0 ||
          (property.availability && filters.availability.includes(property.availability))) &&
        (filters.premium.length === 0 ||
          filters.premium.some((desc) =>
            property.premium?.toLowerCase().includes(desc.toLowerCase())
          )) &&
        (!filters.budgetMin ||
          parseInt(filters.budgetMin) <= extractRent(String(property.rent))) &&
        (!filters.budgetMax ||
          parseInt(filters.budgetMax) >= extractRent(String(property.rent))) &&
        (!filters.premise ||
          property.premise?.toLowerCase().includes(filters.premise.toLowerCase()))
      );
    });
    setSearchResult(filtered);
    setShowSearch(false); // Hide search panel after search
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Search Properties
            </h1>
            
            {/* Error display */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p>Error loading properties: {error}</p>
                <Button 
                  onClick={fetchProperties}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  Retry
                </Button>
              </div>
            )}
            
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowSearch((prev) => !prev)}
                className="text-black transition duration-300 bg-white hover:bg-gray-300"
              >
                {showSearch ? "Hide Search Panel" : "Show Search Panel"}
              </Button>
            </div>
            <div className="border rounded-lg shadow-md p-6 bg-white">
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
