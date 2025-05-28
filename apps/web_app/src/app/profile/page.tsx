// Profile page with protected route authentication
// Features:
// - Protected route wrapper with authentication check
// - User metadata display from AuthContext (ID, role, email, creation date)
// - Editable profile form with placeholder data
// - Logout functionality with loading state
// - Payment history section (static data)
// - Loading and error states for better UX

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";










function ProfilePageContent() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);



  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#167F92] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not found (shouldn't happen with ProtectedRoute, but good fallback)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Unable to load user profile</div>
          <button 
            onClick={() => router.push('/login')}
            className="bg-[#167F92] text-white px-6 py-2 rounded hover:bg-teal-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }


  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="mx-auto px-4 py-2.5 bg-gray-50">
  
              <h2 className="text-xl text-[#167F92] font-medium mb-4 text-center">Your Profile Detail</h2>
              
              {/* User Info Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div>
                      <span className="font-semibold text-gray-700">User ID:</span>
                      <span className="ml-2 text-gray-900">{user.id}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Role:</span>
                      <span className="ml-2 text-gray-900">{user.role}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-900">{user.email}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Account Created:</span>
                      <span className="ml-2 text-gray-900">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors ${
                      isLoggingOut ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}