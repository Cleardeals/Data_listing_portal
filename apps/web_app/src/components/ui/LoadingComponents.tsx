'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn(
      "animate-spin rounded-full border-2 border-white/20 border-t-white",
      sizeClasses[size],
      className
    )} />
  );
};

interface RefreshIndicatorProps {
  isLoading: boolean;
  lastUpdated?: Date;
  onRefresh?: () => void;
  className?: string;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  isLoading,
  lastUpdated,
  onRefresh,
  className
}) => {
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn(
      "flex items-center space-x-2 text-sm text-white/70",
      className
    )}>
      {isLoading && (
        <>
          <LoadingSpinner size="sm" />
          <span>Updating...</span>
        </>
      )}
      
      {!isLoading && lastUpdated && (
        <>
          <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
          <span>Updated {formatLastUpdated(lastUpdated)}</span>
        </>
      )}
      
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={cn(
            "p-1 hover:bg-white/10 rounded transition-colors",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          title="Refresh data"
        >
          <svg 
            className={cn(
              "w-4 h-4 text-white/70 hover:text-white transition-colors",
              isLoading && "animate-spin"
            )} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangle' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangle' 
}) => {
  const baseClasses = "animate-pulse bg-white/20 rounded";
  
  const variantClasses = {
    text: "h-4 w-full",
    rectangle: "h-20 w-full",
    circle: "h-12 w-12 rounded-full"
  };

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      className
    )} />
  );
};

interface DataCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  lastUpdated?: Date;
  onRefresh?: () => void;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  children,
  isLoading = false,
  lastUpdated,
  onRefresh,
  className
}) => {
  return (
    <div className={cn(
      "card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6",
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gradient-animate">{title}</h3>
        <RefreshIndicator
          isLoading={isLoading}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
        />
      </div>
      {children}
    </div>
  );
};

const LoadingComponents = {
  LoadingSpinner,
  RefreshIndicator,
  Skeleton,
  DataCard
};

export default LoadingComponents;
