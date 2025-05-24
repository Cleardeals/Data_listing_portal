"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if we're already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            next: '/dashboard'
          }
        }
      });
      
      if (error) throw error;
      
      // No need to set loading to false here as we're redirecting
    } catch (err) {
      setError("Google login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">Login here</h2>
        <p className="text-center text-black font-semibold mb-6">
          Welcome back you've<br />been missed!
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Google SSO Button */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-100 text-black font-semibold shadow-sm transition"
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
        >
          <FaGoogle className="text-xl text-red-500" />
          {loading ? "Processing..." : "Login with Google"}
        </button>
      </div>
    </div>
  );
}