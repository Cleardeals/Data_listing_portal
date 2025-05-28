"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { SupabaseTestComponent } from "../../../../packages/shared/supabase";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto mt-16 md:mt-24">
          {/* Hero Image/Header with light theme */}
          <div className="mb-8 relative h-64 w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl md:text-6xl font-bold text-indigo-800">Super Admin Portal</h1>
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-4">
            <span className="block">Administrative Control Center</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
            Manage users, oversee operations, and maintain system integrity with powerful administrative tools.
          </p>
          
          {/* Supabase Test Component */}
          <SupabaseTestComponent />
          
          <div className="mt-10 space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-1 sm:gap-5">
            <button
              onClick={() => router.push("/auth/login")}
              className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all duration-200"
            >
              Login to Admin Panel
            </button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Data Listing Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
