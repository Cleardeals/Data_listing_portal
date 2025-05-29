"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AccessDeniedPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleOk = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-xs p-6 bg-white rounded-lg shadow-md flex flex-col items-center">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-red-100 rounded-full p-3 mb-2">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center text-black mb-1">Access Denied</h2>
        </div>
        <p className="text-center text-black mb-6">Invalid User, Please Contact To Admin</p>
        <button 
          onClick={handleOk}
          className="w-full bg-blue-600 text-white py-2 rounded-md shadow-md font-semibold text-base hover:bg-blue-700 transition"
        >
          Ok
        </button>
      </div>
    </div>
  );
} 