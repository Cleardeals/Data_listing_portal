"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnverifiedPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or if user is verified
    if (!loading && (!user || user.is_verified)) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1793a6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-yellow-600 text-3xl"></i>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Account Pending Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is currently under review
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Welcome to Techno Property Solution
              </h3>
              <p className="text-gray-600 mb-6">
                Thank you for registering! Your account has been created as an <strong>Unverified Customer</strong>.
                Our administrators will review your account shortly.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-info-circle text-blue-400"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Account Status
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Role: {user?.role || 'Unverified Customer'}</li>
                      <li>Group: {user?.group || 'customers'}</li>
                      <li>Status: Pending Administrator Approval</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fas fa-clock text-yellow-400"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    What happens next?
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>An administrator will review your account</li>
                      <li>You will be upgraded to &quot;Verified Customer&quot; status</li>
                      <li>You&apos;ll gain access to all platform features</li>
                      <li>You&apos;ll receive an email notification when approved</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Need help? Contact our support team.
              </p>
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1793a6] hover:bg-[#14828f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1793a6]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}