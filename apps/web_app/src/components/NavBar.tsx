"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function NavBar() {
  return (
    <nav className="w-full bg-[#f8f9fa] border-b z-50 shadow-sm sticky top-0">
      <div className=" mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between w-full">
          {/* Logo and Brand */}
          <Link 
            href="/" 
            className="flex items-center space-x-3">
            <img
              src="/favicon.png"
              alt="TPS"
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold text-[#2c3e50]">Techno Property Solution</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-8">
            {/* Search Box */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search Property"
                  className="w-[280px] pl-12 py-2.5 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg lg:text-xl"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl lg:text-2xl"></i>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium"
              >
                <i className="fas fa-home text-lg"></i>
                <span>Home</span>
              </Link>
              <Link 
                href="/profile" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium"
              >
                <i className="fas fa-user text-lg"></i>
                <span>Profile</span>
              </Link>
              <Link 
                href="/logout" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium"
              >
                <i className="fas fa-sign-out-alt text-lg"></i>
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
