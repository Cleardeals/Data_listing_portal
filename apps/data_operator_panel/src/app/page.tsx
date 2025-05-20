"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section - adding padding-top to push it down */}
      <main className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-10 sm:pt-32 sm:pb-14">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            <span className="block text-blue-600">Data Listing Portal</span>
            <span className="block mt-2">Organize, Share, and Discover Data</span>
          </h1>
          
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
            Your centralized platform for managing, accessing, and sharing valuable datasets across your organization.
          </p>
          
          <div className="mt-6 relative flex justify-center">
            <div className="rounded-lg bg-white/80 shadow-xl ring-1 ring-gray-200 p-5 w-full max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Easy Access", description: "Find all your data in one place" },
                  { title: "Secure Sharing", description: "Control who can access your data" },
                  { title: "Rich Insights", description: "Make informed decisions with analytics" }
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
        </div>
      </main>

      {/* Bottom Section with Signup Button - adjusted to have white background box but preserve gradient flow */}
      <div className="mt-4 mb-auto flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-sm px-6 pt-4 pb-5">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/auth/signup")}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign up now
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer area to complete the gradient */}
      <div className="mt-auto py-8"></div>
    </div>
  );
}
