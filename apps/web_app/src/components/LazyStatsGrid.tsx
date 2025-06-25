'use client';

import { Suspense, lazy } from 'react';

// Lazy load the PropertyStatsGrid component
const PropertyStatsGrid = lazy(() => import('./PropertyStatsGrid'));

const LoadingFallback = () => (
  <div className="mb-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="card-hover-3d backdrop-blur-3d bg-white/5 border border-white/20 rounded-2xl p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded mb-4"></div>
            <div className="h-8 bg-white/20 rounded mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function LazyStatsGrid({ className }: { className?: string }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PropertyStatsGrid className={className} />
    </Suspense>
  );
}
