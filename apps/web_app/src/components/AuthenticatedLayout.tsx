"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useState } from "react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = async () => {
    await logout();
    // Don't manually redirect - let the auth state change and ProtectedRoute handle it
  };

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show navbar on login page, homepage, or unverified page
  const showNavBar = pathname !== "/login" && pathname !== "/" && pathname !== "/unverified";

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl float-animation"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl float-animation animate-delay-300"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-2xl animate-pulse"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Loading PropertyHub</h3>
          <p className="text-gray-600 max-w-md">Setting up your personalized dashboard experience...</p>
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce animate-delay-100"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce animate-delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showNavBar && isAuthenticated && user?.is_verified && (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-slate-900/95 backdrop-blur-md shadow-2xl border-b border-slate-700/50' 
            : 'bg-slate-900/80 backdrop-blur-sm shadow-lg border-b border-slate-700/30'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <Link href="/dashboard" className="flex-shrink-0 flex items-center group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-2xl">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      PropertyHub
                    </span>
                    <div className="text-sm text-gray-500 font-medium">Dashboard</div>
                  </div>
                </Link>
                
                <div className="hidden lg:ml-12 lg:flex lg:space-x-1">
                  {[
                    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
                    { href: "/tableview", label: "Properties", icon: "📋" }
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${
                        pathname === item.href
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                          : "text-gray-300 hover:text-blue-400 hover:bg-slate-800/50"
                      } px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 group relative overflow-hidden`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                      {pathname === item.href && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="hidden lg:flex lg:items-center lg:space-x-4">
                {user && (
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{user.email}</div>
                      <div className="text-xs text-gray-300 capitalize">{user.role}</div>
                    </div>
                    <Link href="/profile" className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"></div>
                      <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                )}
                
                <button
                  onClick={handleLogout}
                  className="group bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </div>
              
              <div className="lg:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-slate-800/50 p-3 rounded-xl text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors duration-200"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg className={`w-6 h-6 transform transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    {isMenuOpen ? (
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-xl">
              <div className="px-4 pt-4 pb-6 space-y-2">
                {[
                  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
                  { href: "/tableview", label: "Properties", icon: "📋" }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`${
                      pathname === item.href
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    } block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 flex items-center gap-3`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                
                <div className="border-t border-slate-700 mt-4 pt-4">
                  {user && (
                    <div className="flex items-center px-4 py-3 mb-4 bg-slate-800/50 rounded-xl">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-semibold text-white">{user.email}</div>
                        <div className="text-sm text-gray-300 capitalize">{user.role}</div>
                      </div>
                    </div>
                  )}
                  
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800/50 hover:text-blue-400 rounded-xl transition-colors duration-200 mb-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Your Profile
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
      <div className={showNavBar && isAuthenticated && user?.is_verified ? "pt-20" : ""}>
        {children}
      </div>
    </>
  );
}
