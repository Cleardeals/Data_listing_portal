"use client";

import Link from "next/link";


export default function NavBar() {
  return (
    <nav className="w-full bg-[#f8f9fa] border-b z-50 shadow-sm sticky top-0">
      
      <div className="mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between w-full">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <img src="/favicon.png" alt="TPS" className="h-8 w-8" />
            <span className="text-2xl font-bold text-[#2c3e50]">
              ClearDeals
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-8">
            {/* Search Box */}

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
                href="/search"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium"
              >
                <i className="fas fa-search text-lg"></i>
                <span className="whitespace-nowrap">Search Property</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium"
              >
                <i className="fas fa-user text-lg"></i>
                <span>Profile</span>
              </Link>
              <Link 
                href="/HomeContent" 
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-lg font-medium"
              >
                <i className="fas fa-sign-in-alt text-lg"></i>
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
