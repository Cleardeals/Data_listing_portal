"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Check if user belongs to "internalusers" group - block internal users from web app
      if (user?.group === 'internalusers') {
        console.warn('Access denied: Internal users cannot access customer web app')
        router.push('/access-denied')
        return
      }

      // Only allow "customers" group to access web app
      if (user?.group && user.group !== 'customers') {
        console.warn('Access denied: Only customer group users can access web app')
        router.push('/access-denied')
        return
      }

      // Check if user is unverified and redirect to unverified page
      if (user && !user.is_verified) {
        router.push("/unverified");
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to unauthorized page or dashboard based on user role
        router.push("/dashboard");
        return;
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1793a6]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Block internalusers group from accessing web app
  if (user?.group === 'internalusers') {
    return null
  }

  // Only allow customers group
  if (user?.group && user.group !== 'customers') {
    return null
  }

  // Check if user is unverified
  if (user && !user.is_verified) {
    return null; // Will redirect to unverified page
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-[#1793a6] text-white rounded hover:bg-[#14828f]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
