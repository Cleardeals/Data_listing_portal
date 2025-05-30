"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FiUser, FiLogOut } from "react-icons/fi";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
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
    if (
      !loading &&
      !isAuthenticated &&
      pathname !== "/login" &&
      pathname !== "/"
    ) {
      router.push("/login");
    }
    // Redirect unverified users to unverified page (except if already on unverified page)
    else if (
      !loading &&
      isAuthenticated &&
      user &&
      !user.is_verified &&
      pathname !== "/unverified"
    ) {
      router.push("/unverified");
    }
  }, [loading, isAuthenticated, user, pathname, router]);

  // Don't show navbar on login page, homepage, or unverified page
  const showNavBar =
    pathname !== "/login" && pathname !== "/" && pathname !== "/unverified";

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
                <Link
                  href="/dashboard"
                  className="flex-shrink-0 flex items-center"
                >
                  <span className="ml-2 text-2xl font-extrabold text-black tracking-wide drop-shadow-sm hover:scale-105 transition-transform duration-300">
                    Project X
                  </span>
                </Link>
                <div className="pt-2 pb-3 flex space-x-4 bg-white/80 backdrop-blur-md px-4 rounded-xl shadow-sm">
  {[
    { href: "/dashboard", label: "Dashboard" },
    { href: "/search", label: "Search" },
    { href: "/tableview", label: "Residential Rent" },
  ].map((item) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`relative px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 ease-in-out
          ${
            isActive
              ? "bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] text-white shadow-lg ring-2 ring-blue-200 hover:scale-105"
              : "text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm hover:scale-105"
          }`}
      >
        {item.label}
      </Link>
    );
  })}
</div>



              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="ml-3 relative flex items-center space-x-3 p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <Link href="/profile">
                   <button className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-300 to-purple-500 p-[2px] hover:scale-105 transition-transform duration-300">
                     <div className="h-full w-full bg-white rounded-full flex items-center justify-center text-blue-400">

                        <FiUser className="text-xl" />
                      </div>
                    </button>
                  </Link>

                  {user && (
                    <div className="flex flex-col justify-center">
                      <span className="text-sm font-medium text-gray-800 leading-tight">
                        {user.email}
                      </span>
                      <span className="text-xs text-gray-500">{user.role}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-5 py-2.5 flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-gray-300 to-gray-800 rounded-full shadow-sm hover:from-gray-400 hover:to-black transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                >
                  <FiLogOut className="text-base" />
                  Logout
                </button>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  <span className="sr-only">Open main menu</span>
                  <i
                    className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}
                  ></i>
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
                  Dashboard123456
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
                  Residential Rent231324435
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
