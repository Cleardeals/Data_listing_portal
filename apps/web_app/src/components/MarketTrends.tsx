'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { usePropertyStats } from '@/hooks/usePropertyStats';

interface TrendItemProps {
  label: string;
  change: number;
  value: string;
  trend: 'up' | 'down' | 'stable';
  isLoading?: boolean;
}

const TrendItem: React.FC<TrendItemProps> = ({ label, value, trend, isLoading = false }) => {
  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-400 bg-green-400/20';
      case 'down':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
      <div className="flex items-center space-x-3">
        <div className={cn("w-3 h-3 rounded-full pulse-glow", getTrendColor(trend).split(' ')[1])}></div>
        <span className="text-white font-medium">{label}</span>
      </div>
      <div className="text-right">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-5 bg-white/20 rounded w-12 mb-1"></div>
            <div className="h-3 bg-white/10 rounded w-16"></div>
          </div>
        ) : (
          <>
            <div className={cn("flex items-center space-x-1 text-sm font-bold", getTrendColor(trend))}>
              {getTrendIcon(trend)}
              <span>{trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{value}</span>
            </div>
            <div className="text-xs text-white/60">vs last month</div>
          </>
        )}
      </div>
    </div>
  );
};

interface RecentActivityItemProps {
  type: 'new' | 'sold' | 'update' | 'commercial';
  message: string;
  timeAgo: string;
  isLoading?: boolean;
}

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({ type, message, timeAgo, isLoading = false }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new':
        return 'bg-blue-400';
      case 'sold':
        return 'bg-green-400';
      case 'update':
        return 'bg-purple-400';
      case 'commercial':
        return 'bg-orange-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", getTypeColor(type))}></div>
      <div className="flex-1">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="text-white text-sm font-medium">{message}</div>
            <div className="text-white/60 text-xs">{timeAgo}</div>
          </>
        )}
      </div>
    </div>
  );
};

interface MarketTrendsProps {
  className?: string;
}

const MarketTrends: React.FC<MarketTrendsProps> = ({ className }) => {
  const { marketTrends, loading } = usePropertyStats();

  const recentActivities = [
    { type: 'new' as const, message: 'New listing in Gandhinagar', timeAgo: '2 hours ago' },
    { type: 'sold' as const, message: 'Property sold in Bopal', timeAgo: '4 hours ago' },
    { type: 'update' as const, message: 'Price update in Gota', timeAgo: '6 hours ago' },
    { type: 'commercial' as const, message: 'New commercial space', timeAgo: '8 hours ago' },
  ];

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      <div className="lg:col-span-2 card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-gradient-animate mb-6">Market Trends</h3>
        <div className="space-y-4">
          {loading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <TrendItem
                key={index}
                label="Loading..."
                change={0}
                value="0%"
                trend="stable"
                isLoading={true}
              />
            ))
          ) : (
            marketTrends.map((trend, index) => (
              <TrendItem
                key={index}
                label={trend.category}
                change={trend.change}
                value={trend.value}
                trend={trend.trend}
              />
            ))
          )}
        </div>
      </div>
      
      <div className="card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gradient-animate mb-6">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <RecentActivityItem
              key={index}
              type={activity.type}
              message={activity.message}
              timeAgo={activity.timeAgo}
              isLoading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;
