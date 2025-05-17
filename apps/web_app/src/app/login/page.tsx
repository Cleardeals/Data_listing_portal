"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Simulated authentication delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (mobile === '7417767067' && password === 'admin123') {
        // You could set a cookie or localStorage item here to remember the login
        router.push('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ededed]">
      {/* Header */}
      <div className="flex items-center px-6 py-3 shadow bg-white">
        <Link href="/">
          <div className="flex items-center">
            <Image src="/favicon.png" alt="Techno Property Solution" width={40} height={40} className="h-10 mr-3" />
            <span className="text-3xl text-[#1793a6] font-semibold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Techno Property Solution
            </span>
          </div>
        </Link>
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-6">
          <div className="text-[#1793a6] text-xl font-semibold">Welcome To Clear Deals Solution</div>
          <div className="text-[#1793a6] text-lg">Total Solution Of Admin Support</div>
        </div>
        <form
          onSubmit={handleLogin}
          className="bg-white rounded shadow-lg w-full max-w-md"
        >
          <div className="bg-gradient-to-b from-[#b6e0ef] to-white rounded-t px-6 py-3 text-lg font-semibold text-[#1793a6]">
            Sign In
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            <div className="mb-4 flex items-center border rounded px-3 py-2 bg-[#f7f7f7]">
              <span className="text-gray-400 mr-2">
                <i className="fa fa-user"></i>
              </span>
              <input
                type="text"
                placeholder="Enter Mobile Number"
                className="w-full outline-none bg-transparent"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-6 flex items-center border rounded px-3 py-2 bg-[#f7f7f7]">
              <span className="text-gray-400 mr-2">
                <i className="fa fa-lock"></i>
              </span>
              <input
                type="password"
                placeholder="Enter Password"
                className="w-full outline-none bg-transparent"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#1793a6] text-white py-2 rounded font-semibold hover:bg-[#12788a] transition"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div className="mt-4 text-center">
              <Link href="/" className="text-[#1793a6] hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="bg-[#555] text-white text-sm py-3 px-4 flex flex-col md:flex-row justify-between items-center">
        <span className="mb-2 md:mb-0">Terms &amp; Condition</span>
        <div className="flex items-center space-x-4">
          <span>Customer Care</span>
          <span>📞 +91-7984071224</span>
          <span>📞 +91-7046327745</span>
          <span>📞 079-40054959</span>
        </div>
      </footer>
    </div>
  );
}