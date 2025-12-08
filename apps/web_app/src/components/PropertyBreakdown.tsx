'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PropertyTypeCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgGradient: string;
  link?: string;
  isLoading?: boolean;
}

function PropertyTypeCard({
  label,
  value,
  icon,
  bgGradient,
  link,
  isLoading = false
}: PropertyTypeCardProps) {
  const content = (
    <div className={cn(
      "btn-3d text-white p-4 rounded-xl transition-all duration-300 text-center",
      bgGradient,
      link && "cursor-pointer hover:scale-105"
    )}>
      <div className="flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-sm lg:text-base font-medium mb-2">{label}</div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded w-16 mx-auto"></div>
        </div>
      ) : (
        <div className="text-xl lg:text-3xl font-bold">{value.toLocaleString()}</div>
      )}
    </div>
  );

  if (link) {
    return <Link href={link} className="group">{content}</Link>;
  }

  return content;
};

interface PropertyBreakdownProps {
  className?: string;
  title: string;
  data: {
    total: number;
    residential_rent: number;
    residential_sell: number;
    commercial_rent: number;
    commercial_sell: number;
  };
  isLoading?: boolean;
}

function PropertyBreakdown({ 
  className, 
  title, 
  data, 
  isLoading = false 
}: PropertyBreakdownProps) {
  const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z" />
    </svg>
  );

  const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15a.75.75 0 000-1.5h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
    </svg>
  );

  const GridIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={cn("card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6", className)}>
      <h2 className="text-2xl lg:text-3xl font-bold text-gradient-animate mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <PropertyTypeCard
          label="Residential Rent"
          value={data.residential_rent}
          icon={<HomeIcon />}
          bgGradient="bg-gradient-to-br from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          link="/tableview"
          isLoading={isLoading}
        />
        <PropertyTypeCard
          label="Residential Sell"
          value={data.residential_sell}
          icon={<HomeIcon />}
          bgGradient="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          isLoading={isLoading}
        />
        <PropertyTypeCard
          label="Commercial Rent"
          value={data.commercial_rent}
          icon={<BuildingIcon />}
          bgGradient="bg-gradient-to-br from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
          isLoading={isLoading}
        />
        <PropertyTypeCard
          label="Commercial Sell"
          value={data.commercial_sell}
          icon={<BuildingIcon />}
          bgGradient="bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
          isLoading={isLoading}
        />
        <PropertyTypeCard
          label="Total"
          value={data.total}
          icon={<GridIcon />}
          bgGradient="bg-gradient-to-br from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default PropertyBreakdown;
