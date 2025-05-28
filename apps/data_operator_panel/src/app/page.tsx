"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { SupabaseTestComponent } from "../../../../packages/shared/supabase";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section - adding padding-top to push it down */}
      <main className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-10 sm:pt-32 sm:pb-14">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            <span className="block text-blue-600">Data Operator Portal</span>
            <span className="block mt-2">Manage and Process Data</span>
          </h1>
          
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
            Your specialized platform for data operations, processing, and quality management.
          </p>
          
          <div className="mt-6 relative flex justify-center">
            <div className="rounded-lg bg-white/80 shadow-xl ring-1 ring-gray-200 p-5 w-full max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Data Processing", description: "Efficient bulk data operations" },
                  { title: "Quality Control", description: "Ensure data accuracy and integrity" },
                  { title: "Workflow Management", description: "Streamlined data operation workflows" }
                ].map((feature, i) => (
                  <div key={i} className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supabase Test Component */}
          <SupabaseTestComponent />
        </div>
      </main>

      {/* Bottom Section with Login Button */}
      <div className="mt-4 mb-auto flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-sm px-6 pt-4 pb-5">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4">
            Ready to access your workspace?
          </h2>
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/auth/login")}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login to Portal
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer area to complete the gradient */}
      <div className="mt-auto py-8"></div>
    </div>
  );
}
