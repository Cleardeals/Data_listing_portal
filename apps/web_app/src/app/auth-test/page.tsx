"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';

export default function AuthTestPage() {
  const { user, login, verifyOTP, logout, isAuthenticated, loading } = useAuth();
  const [testEmail, setTestEmail] = useState('');
  const [testOTP, setTestOTP] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testSendOTP = async () => {
    if (!testEmail) {
      addResult('❌ Please enter an email address');
      return;
    }

    setIsLoading(true);
    addResult(`🚀 Sending OTP to ${testEmail}...`);
    
    try {
      const result = await login(testEmail);
      if (result.success) {
        addResult(`✅ OTP sent successfully: ${result.message}`);
      } else {
        addResult(`❌ Failed to send OTP: ${result.message}`);
      }
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testVerifyOTP = async () => {
    if (!testEmail || !testOTP) {
      addResult('❌ Please enter both email and OTP');
      return;
    }

    setIsLoading(true);
    addResult(`🔐 Verifying OTP ${testOTP} for ${testEmail}...`);
    
    try {
      const result = await verifyOTP(testEmail, testOTP);
      if (result.success) {
        addResult(`✅ OTP verified successfully: ${result.message}`);
        if (result.user) {
          addResult(`👤 User authenticated: ${result.user.email} (Role: ${result.user.role})`);
        }
      } else {
        addResult(`❌ Failed to verify OTP: ${result.message}`);
      }
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    setIsLoading(true);
    addResult('🚪 Logging out...');
    
    try {
      await logout();
      addResult('✅ Logged out successfully');
    } catch (error) {
      addResult(`❌ Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSessionCheck = () => {
    addResult('🔍 Checking stored session...');
    const session = authService.getStoredSession();
    if (session) {
      addResult(`✅ Session found: ${session.user.email} (Expires: ${new Date(session.expires_at * 1000).toLocaleString()})`);
    } else {
      addResult('❌ No session found');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Authentication System Test</h1>
          
          {/* Current Auth Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current Authentication Status</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              {user && (
                <div>
                  <p><strong>User:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Email OTP Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Email OTP Test</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Email
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your-email@example.com"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={testSendOTP}
                disabled={isLoading || !testEmail}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>

            {/* OTP Verification Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">OTP Verification Test</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={testOTP}
                  onChange={(e) => setTestOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={testVerifyOTP}
                disabled={isLoading || !testEmail || !testOTP}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>

          {/* Session Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testSessionCheck}
              disabled={isLoading}
              className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
            >
              Check Session
            </button>
            <button
              onClick={testLogout}
              disabled={isLoading || !isAuthenticated}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Test Logout
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>

          {/* Test Results */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Test Results</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 italic">No test results yet...</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="font-mono text-sm p-2 bg-white rounded border">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Quick Navigation</h3>
            <div className="flex flex-wrap gap-2">
              <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Login Page
              </a>
              <a href="/dashboard" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Dashboard
              </a>
              <a href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
