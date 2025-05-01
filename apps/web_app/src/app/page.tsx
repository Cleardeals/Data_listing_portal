'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard'); // Redirect to the dashboard page
  }, [router]);

  return (
    <main>
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Redirecting to dashboard...</div>
      </div>
    </main>
  );
}
