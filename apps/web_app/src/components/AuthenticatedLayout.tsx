"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== "/login" && pathname !== "/") {
      router.push("/login");
    }
    // Redirect unverified users to unverified page (except if already on unverified page)
    else if (!loading && isAuthenticated && user && !user.is_verified && pathname !== "/unverified") {
      router.push("/unverified");
    }
  }, [loading, isAuthenticated, user, pathname, router]);

  // Don't show navbar on login page, homepage, or unverified page
  const showNavBar = pathname !== "/login" && pathname !== "/" && pathname !== "/unverified";

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1793a6]"></div>
      </div>
    );
  }

  return (
    <>
      {showNavBar && isAuthenticated && user?.is_verified && (
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                  <Image
                    src="/favicon.png"
                    alt="Logo"
                    width={40}
                    height={40}
                  />
                  <span className="ml-2 text-xl font-bold text-[#1793a6]">
                    Techno Property Solution
                  </span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/dashboard"
                    className={`${pathname === "/dashboard" ? "border-[#1793a6] text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/search"
                    className={`${pathname === "/search" ? "border-[#1793a6] text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Search
                  </Link>
                  <Link
                    href="/tableview"
                    className={`${pathname === "/tableview" ? "border-[#1793a6] text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Residential Rent
                  </Link>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="ml-3 relative">
                  <div>
                    <Link href="/profile">
                      <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1793a6]">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-[#1793a6] text-white flex items-center justify-center">
                          <i className="fas fa-user"></i>
                        </div>
                      </button>
                    </Link>
                  </div>
                  {user && (
                    <div className="ml-2">
                      <span className="text-sm text-gray-700">{user.email}</span>
                      <span className="text-xs text-gray-500 block">{user.role}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1793a6] hover:bg-[#14828f] focus:outline-none"
                >
                  Logout
                </button>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  <span className="sr-only">Open main menu</span>
                  <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                <Link
                  href="/dashboard"
                  className={`${pathname === "/dashboard" ? "bg-gray-50 border-[#1793a6] text-[#1793a6]" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/search"
                  className={`${pathname === "/search" ? "bg-gray-50 border-[#1793a6] text-[#1793a6]" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Search
                </Link>
                <Link
                  href="/tableview"
                  className={`${pathname === "/tableview" ? "bg-gray-50 border-[#1793a6] text-[#1793a6]" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Residential Rent
                </Link>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[#1793a6] text-white flex items-center justify-center">
                      <i className="fas fa-user"></i>
                    </div>
                  </div>
                  {user && (
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.email}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {user.role}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      )}
      {children}
    </>
  );
}
