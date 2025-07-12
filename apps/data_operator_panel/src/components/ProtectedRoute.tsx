"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isValidDataOperator, userStatusLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for both auth and user status to load
    if (loading || userStatusLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Validate user has proper metadata structure
    if (!user) {
      console.warn('Access denied: No user data available');
      router.push('/auth/login');
      return;
    }

    // Use real-time validation for data operator requirements
    if (!isValidDataOperator) {
      console.warn('Access denied: User does not meet data operator requirements', {
        role: user?.role,
        group: user?.group,
        is_verified: user?.is_verified
      });
      router.push('/phishing-protection');
      return;
    }

    // Check for required role if specified
    if (requiredRole && user?.role !== requiredRole) {
      console.warn('Access denied: Required role not met. Required:', requiredRole, 'User:', user?.role);
      router.push("/dashboard");
      return;
    }
  }, [loading, userStatusLoading, isAuthenticated, user, isValidDataOperator, requiredRole, router]);

  if (loading || userStatusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Verifying access permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  // Use real-time validation for access control
  if (!isValidDataOperator) {
    return null; // Will redirect to phishing protection
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
