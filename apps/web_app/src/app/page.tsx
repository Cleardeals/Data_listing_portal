'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from 'ui';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data } = await supabase.from('_database_features').select('*').limit(1);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting to Supabase:', error);
        setIsConnected(false);
      }
    }
    
    checkConnection();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">web_app</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Supabase Connection Status</h2>
          {isConnected === null ? (
            <p>Checking connection...</p>
          ) : isConnected ? (
            <p className="text-green-600">✅ Connected to Supabase</p>
          ) : (
            <p className="text-red-600">❌ Failed to connect to Supabase</p>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Button>This is a shared UI Button</Button>
        </div>
      </div>
    </main>
  );
}
