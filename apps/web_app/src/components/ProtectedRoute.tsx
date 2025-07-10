"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [lastRedirectTime, setLastRedirectTime] = useState(0);

  useEffect(() => {
    // Reset redirect flag when pathname changes
    setHasRedirected(false);
  }, [pathname]);

  useEffect(() => {
    // Don't redirect if we're still loading, have already redirected, or too soon since last redirect
    const now = Date.now();
    if (loading || hasRedirected || (now - lastRedirectTime < 2000)) {
      return;
    }

    // Handle unauthenticated users
    if (!isAuthenticated) {
      console.log('🔄 [ProtectedRoute] Not authenticated, redirecting to login');
      setHasRedirected(true);
      setLastRedirectTime(now);
      router.push("/login");
      return;
    }

    // Handle authenticated users
    if (user) {
      console.log('🔍 [ProtectedRoute] Checking access for user:', {
        email: user.email,
        role: user.role,
        group: user.group,
        is_verified: user.is_verified,
        pathname: pathname
      });

      // Handle internal users with admin roles
      if (user.group === 'internalusers') {
        if (user.role === 'super_admin' || user.role === 'data_operator') {
          console.log('✅ [ProtectedRoute] Internal admin user - access granted');
          return; // Allow access
        } else {
          console.warn('❌ [ProtectedRoute] Access denied: Internal users must have super_admin or data_operator role');
          setHasRedirected(true);
          setLastRedirectTime(now);
          router.push('/access-denied');
          return;
        }
      } 
      
      // Handle customer users
      if (user.group === 'customers') {
        // Check if they should be on unverified page
        if (!user.is_verified || user.role !== 'Verified Customer') {
          if (pathname !== '/unverified') {
            console.log('🔄 [ProtectedRoute] Customer user not fully verified, redirecting to unverified page');
            setHasRedirected(true);
            setLastRedirectTime(now);
            router.push("/unverified");
            return;
          }
          // Already on unverified page, allow render
          console.log('✅ [ProtectedRoute] On unverified page - allowing render');
          return;
        } 
        
        // Verified customer trying to access unverified page - redirect to dashboard
        if (user.is_verified && user.role === 'Verified Customer' && pathname === '/unverified') {
          console.log('🔄 [ProtectedRoute] Verified customer on unverified page, redirecting to dashboard');
          setHasRedirected(true);
          setLastRedirectTime(now);
          router.push("/dashboard");
          return;
        }
        
        // Verified customer accessing protected routes
        if (user.is_verified && user.role === 'Verified Customer') {
          console.log('✅ [ProtectedRoute] Verified customer - access granted');
          return;
        }
      }
      
      // Block any other groups or unknown states
      console.warn('❌ [ProtectedRoute] Access denied: Unknown user group or state:', {
        group: user.group,
        role: user.role,
        is_verified: user.is_verified
      });
      setHasRedirected(true);
      setLastRedirectTime(now);
      router.push('/access-denied');
    }
  }, [loading, isAuthenticated, user, pathname, router, hasRedirected, lastRedirectTime]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1793a6]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  // Final checks before rendering content
  if (user.group === 'internalusers') {
    if (user.role !== 'super_admin' && user.role !== 'data_operator') {
      return null; // Will redirect to access denied
    }
  } else if (user.group === 'customers') {
    // Only allow verified customers with proper role
    if (!user.is_verified || user.role !== 'Verified Customer') {
      if (pathname !== '/unverified') {
        return null; // Will redirect to unverified page
      }
    }
    // Allow verified customers on any page except unverified
    if (user.is_verified && user.role === 'Verified Customer' && pathname === '/unverified') {
      return null; // Will redirect to dashboard
    }
  } else {
    // Block any other groups
    return null;
  }

  // Check required role if specified
  if (requiredRole && user.role !== requiredRole) {
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
