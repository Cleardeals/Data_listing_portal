import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  rows = 5, 
  columns = 8,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-white/50 shadow-lg overflow-hidden ${className}`}>
      {/* Header skeleton */}
      <div className="bg-slate-100 p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-slate-300 rounded-lg w-48 animate-shimmer"></div>
          <div className="h-4 bg-slate-300 rounded-lg w-32 animate-shimmer"></div>
        </div>
      </div>
      
      {/* Table skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-4 py-3 text-left">
                  <div className="h-4 bg-slate-300 rounded animate-shimmer" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-100">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-4">
                    <div 
                      className="h-4 bg-slate-200 rounded animate-shimmer" 
                      style={{ 
                        width: `${Math.random() * 50 + 30}%`,
                        animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s`
                      }}
                    ></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const StatsLoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded animate-shimmer w-24 mb-2"></div>
              <div className="h-8 bg-slate-300 rounded animate-shimmer w-16 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded animate-shimmer w-20"></div>
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-xl animate-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const LoadingSkeletons = { TableLoadingSkeleton, StatsLoadingSkeleton };
export default LoadingSkeletons;
