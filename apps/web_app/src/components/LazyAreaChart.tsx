'use client';

import { Suspense, lazy } from 'react';

// Lazy load the AreaWisePropertyChart component
const AreaWisePropertyChart = lazy(() => import('./AreaWisePropertyChart'));

const ChartLoadingFallback = () => (
  <div className="mb-4">
    <div className="card-hover-3d backdrop-blur-3d bg-white/5 border border-white/20 rounded-2xl p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-white/20 rounded mb-4 w-48"></div>
        <div className="h-64 bg-white/20 rounded"></div>
      </div>
    </div>
  </div>
);

export default function LazyAreaChart({ className }: { className?: string }) {
  return (
    <Suspense fallback={<ChartLoadingFallback />}>
      <AreaWisePropertyChart className={className} />
    </Suspense>
  );
}
