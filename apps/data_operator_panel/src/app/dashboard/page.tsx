import React from "react";
import { FaBell, FaUserCircle, FaPlus, FaFilter, FaImages } from "react-icons/fa";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center justify-between">
          {/* Left: Dashboard Name */}
          <div className="flex-1 text-blue-600 font-bold text-lg">PRoject X.2</div>
          {/* Center: Dashboard Name */}
          <div className="flex-1 flex justify-center">
            <span className="text-blue-600 font-bold text-lg">PRoject X.2</span>
          </div>
          {/* Right: Icons */}
          <div className="flex-1 flex items-center justify-end gap-6">
            <FaBell className="text-blue-600 text-2xl cursor-pointer" />
            <FaUserCircle className="text-blue-600 text-2xl cursor-pointer" />
          </div>
        </div>
        {/* Se
      {/* Header Section */}
      <div className="px-8 pt-8 pb-2 border-b border-blue-200">
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center border-2 border-blue-300 rounded-lg px-2 py-1 bg-blue-50" style={{ minWidth: 700 }}>
            <span className="p-2"><FaImages className="text-blue-400" /></span>
            <select className="mx-2 px-2 py-1 rounded bg-white border border-blue-200 text-black">
              <option>State</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white border border-blue-200 text-black">
              <option>Ahmedabad</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white border border-blue-200 text-black">
              <option>Area</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white border border-blue-200 text-black">
              <option>type</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white border border-blue-200 text-black">
              <option>Sub-type</option>
            </select>
            <select className="mx-2 px-2 py-1 rounded bg-white border border-blue-200 text-black">
              <option>Budget</option>
            </select>
            <span className="p-2"><FaFilter className="text-blue-400" /></span>
          </div>
          {/* Bulk and Add Buttons */}
          <div className="flex items-center gap-4 ml-4">
            <button className="flex items-center gap-2 px-6 py-2 rounded-md border border-blue-400 bg-white text-blue-600 font-semibold hover:bg-blue-50">
              Bulk <FaPlus />
            </button>
            <button className="flex items-center gap-2 px-6 py-2 rounded-md border border-blue-400 bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200">
              Add <FaPlus />
            </button>
          </div>
        </div>
        {/* Filter Buttons */}
        <div className="flex items-center justify-center mt-4 gap-2">
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black">Sort by <span className="inline-block ml-2">→</span></button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black">New Projects</button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black">1BHK</button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black">2BHK</button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black">3+BHK</button>
          <button className="px-6 py-2 rounded-full border border-blue-200 bg-white text-black">High To Low</button>
        </div>
      </div>
      {/* Main Content Placeholder */}
      <div className="flex-1 p-8">{/* Dashboard content goes here */}</div>
    </div>
  );
} 