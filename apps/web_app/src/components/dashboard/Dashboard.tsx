"use client";

import { PropertyStats } from "@/components/PropertyStats";
import { PropertyCountCard } from "./PropertyCountCard";
import { AreaChart } from "./AreaChart";
import NavBar from "../NavBar";

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full gap-4 px-2">
      <NavBar/>
      <PropertyStats/>
      

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white shadow-sm p-5 rounded-md">
          <h2 className="text-xl lg:text-2xl font-medium text-gray-700 mb-3"> Today's  Property</h2>
          <div className="grid grid-cols-5 gap-1">
            <PropertyCountCard 
              title="Residential Rent" 
              count={0} 
              bgColor="bg-[#1abc9c]" 
            />
            <PropertyCountCard 
              title="Residential Sell" 
              count={0} 
              bgColor="bg-[#27ae60]" 
            />
            <PropertyCountCard 
              title="Commercial Rent" 
              count={0} 
              bgColor="bg-[#f39c12]" 
            />
            <PropertyCountCard 
              title="Commercial Sell" 
              count={0} 
              bgColor="bg-[#e74c3c]" 
            />
            <PropertyCountCard 
              title="Total Property" 
              count={0} 
              bgColor="bg-[#95a5a6]" 
            />
          </div>
        </div>
        
        <div className="bg-white shadow-sm p-5 rounded-md">
          <h2 className="text-xl lg:text-2xl font-medium text-gray-700 mb-3">Yesterday's Property</h2>
          <div className="grid grid-cols-5 gap-1">
            <PropertyCountCard 
              title="Residential Rent" 
              count={37} 
              bgColor="bg-[#1abc9c]" 
            />
            <PropertyCountCard 
              title="Residential Sell" 
              count={55} 
              bgColor="bg-[#27ae60]" 
            />
            <PropertyCountCard 
              title="Commercial Rent" 
              count={22} 
              bgColor="bg-[#f39c12]" 
            />
            <PropertyCountCard 
              title="Commercial Sell" 
              count={6} 
              bgColor="bg-[#e74c3c]" 
            />
            <PropertyCountCard 
              title="Total" 
              count={120} 
              bgColor="bg-[#95a5a6]" 
            />
          </div>
        </div>
      </div>
      

      <div className="grid grid-cols-4 gap-8 mt-8">
        <div className="bg-white shadow-sm rounded-md">
          <h3 className="text-center py-4 text-white bg-[#1abc9c] text-lg lg:text-xl font-medium">Residential Rent Top 50 Area</h3>
          <AreaChart type="residential-rent" />
        </div>
        <div className="bg-white shadow-sm rounded-md">
          <h3 className="text-center py-4 text-white bg-[#27ae60] text-lg lg:text-xl font-medium">Residential Sell Top 50 Area</h3>
          <AreaChart type="residential-sell" />
        </div>
        <div className="bg-white shadow-sm rounded-md">
          <h3 className="text-center py-4 text-white bg-[#f39c12] text-lg lg:text-xl font-medium">Commercial Rent Top 50 Area</h3>
          <AreaChart type="commercial-rent" />
        </div>
        <div className="bg-white shadow-sm rounded-md">
          <h3 className="text-center py-4 text-white bg-[#e74c3c] text-lg lg:text-xl font-medium">Commercial Sell Top 50 Area</h3>
          <AreaChart type="commercial-sell" />
        </div>
      </div>
    </div>
  );
}
