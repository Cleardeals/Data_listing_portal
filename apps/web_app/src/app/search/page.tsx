"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { dummyProperties, Property } from "@/lib/dummyProperties";
import { extractRent } from "@/lib/extractRent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// SearchResults component integrated directly
function SearchResults({ properties }: { properties: Property[] }) {
  return (
    <div>
      {properties.length > 0 ? (
        properties.map((property) => (
          <div key={property.id}>
            <h2>{property.name}</h2>
            <p>{property.description}</p>
            <p>{property.rent}</p>
            <p>{property.availability}</p>
            <p>{property.condition}</p>
            <p>{property.sqft}</p>
            <p>{property.brokerage}</p>
            <p>{property.status}</p>
          </div>
        ))
      ) : (
        <p>No properties found</p>
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
    description1: string[];
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
    description1: [] as string[],
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
      | "description1"
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
              {/* description1 */}
              <tr className="border-b border-gray-300">
                <th className="border-r border-gray-300 px-4 py-2 text-left font-semibold bg-[#167f92] text-white">
                  Description1:
                </th>
                <td className="flex flex-wrap items-center gap-4 px-4 py-2">
                  {descriptionOptions.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.description1.includes(type)}
                        onCheckedChange={() =>
                          handleCheckboxChange("description1", type)
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
  const [searchResult, setSearchResult] = useState<Property[]>([]);
  
  const handleSearch = (filters: {
    propertyType: string[];
    condition: string[];
    area: string[];
    availability: string[];
    availabilityType: string[];
    description1: string[];
    budgetMin: string;
    budgetMax: string;
    sqftFrom: string;
    sqftTo: string;
    premise?: string;
  }) => {
    const filtered = dummyProperties.filter((property) => {
      return (
        (filters.propertyType.length === 0 ||
          filters.propertyType.includes(property.availability)) &&
        (filters.condition.length === 0 ||
          filters.condition.includes(property.condition)) &&
        (filters.area.length === 0 || 
          filters.area.includes(property.area)) &&
        (filters.availability.length === 0 ||
          filters.availability.includes(property.availability)) &&
        (filters.description1.length === 0 ||
          filters.description1.some((desc) =>
            property.description1.toLowerCase().includes(desc.toLowerCase())
          )) &&
        (!filters.budgetMin ||
          parseInt(filters.budgetMin) <= extractRent(property.rent)) &&
        (!filters.budgetMax ||
          parseInt(filters.budgetMax) >= extractRent(property.rent))
      );
    });
    setSearchResult(filtered);
    setShowSearch(false); // Hide search panel after search
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Search Properties
          </h1>
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
              <SearchResults properties={searchResult} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
