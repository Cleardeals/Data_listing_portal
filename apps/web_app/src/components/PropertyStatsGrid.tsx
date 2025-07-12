'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePropertyStats } from '@/hooks/usePropertyStats';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgGradient: string;
  link?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  bgGradient, 
  link,
  isLoading = false 
}) => {
  const content = (
    <div className={cn(
      "card-hover-3d backdrop-blur-3d border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 transition-all duration-300",
      bgGradient,
      link && "cursor-pointer hover:scale-105 touch-manipulation"
    )}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs sm:text-sm font-medium px-2 py-1 rounded-full",
            trend.isPositive ? "text-green-400 bg-green-400/20" : "text-red-400 bg-red-400/20"
          )}>
            {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
          </span>
        )}
      </div>
      <h3 className="text-white/90 text-xs sm:text-sm font-medium mb-1">{title}</h3>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-white/20 rounded w-16 sm:w-20 mb-1"></div>
          <div className="h-2 sm:h-3 bg-white/10 rounded w-12 sm:w-16"></div>
        </div>
      ) : (
        <>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p className="text-xs text-white/60 mt-1">Active listings</p>
        </>
      )}
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
};

const PropertyStatsGrid: React.FC<{ className?: string }> = ({ className }) => {
  const { stats, loading } = usePropertyStats();

  const kpiCards = [
    {
      title: "Total Properties",
      value: stats.total,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      bgGradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30",
      trend: { value: 12.5, isPositive: true },
      link: "/tableview"
    },
    {
      title: "Total Value",
      value: `₹${(stats.totalValue / 10000000).toFixed(1)}Cr`,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      bgGradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30",
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: "Average Price",
      value: `₹${(stats.averagePrice / 100000).toFixed(1)}L`,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgGradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30",
      trend: { value: 5.7, isPositive: true }
    }
  ];

  return (
    <div className={cn("flex justify-center px-3 sm:px-4 lg:px-2", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-none">
        {kpiCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            bgGradient={card.bgGradient}
            trend={card.trend}
            link={card.link}
            isLoading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyStatsGrid;
