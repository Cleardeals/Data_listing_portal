"use client";
import { useState } from "react";
import FilterForm from "@/components/serachForm/FilterForm";
import { dummyProperties, Property } from "@/app/data/dummyProperties";
import { extractRent } from "@/app/utlis/extractRent";
import SearchResults from "@/components/serachForm/SearchResults";
import { Button } from "@/components/ui/button";

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
  }) => {
    const filtered = dummyProperties.filter((property) => {
      return (
        (filters.propertyType.length === 0 ||
          filters.propertyType.includes(property.availability)) &&
        (filters.condition.length === 0 ||
          filters.condition.includes(property.condition)) &&
        (filters.area.length === 0 || filters.area.includes(property.area)) &&
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
    <div className="container-fuild">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setShowSearch((prev) => !prev)}
          className=" text-black transition duration-300 bg-white  hover:bg-gray-300"
        >
          {showSearch ? "Hide Search Panel" : "Show Search Panel"}{" "}
        </Button>
      </div>
      <div className="border rounded-lg shadow-md p-6 bg-white">
        {showSearch ? (
          <FilterForm onSearch={handleSearch} />
        ) : (
          <SearchResults properties={searchResult} />
        )}
      </div>
      {/* <h1 className="text-xl font-bold">Search Properties</h1>
      <FilterForm onSearch={handleSearch} />
      <SearchResults properties={searchResult} /> */}
    </div>
  );
}
