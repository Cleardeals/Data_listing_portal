"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for auth code in URL
        const hash = window.location.hash;
        const query = new URLSearchParams(window.location.search);
        const hasCode = query.has('code') || hash.includes('access_token');

        if (!hasCode) {
          console.error('No auth code found in URL');
          router.replace("/auth/login?error=no_code");
          return;
        }

        // Get the session - Supabase will automatically handle the OAuth callback
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (session) {
          console.log('Session established successfully');
          
          // Set up auth state change listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
            if (event === 'SIGNED_IN') {
              console.log('Auth state: Signed in');
            }
          });

          router.replace("/dashboard");
          
          // Cleanup subscription
          return () => {
            subscription.unsubscribe();
          };
        } else {
          console.error('No session found after OAuth callback');
          router.replace("/auth/login?error=no_session");
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace("/auth/login?error=callback_error");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-lg font-semibold">Finishing authentication...</div>
      <div className="mt-4 text-gray-600">Please wait while we complete your sign-in...</div>
    </div>
  );
}
