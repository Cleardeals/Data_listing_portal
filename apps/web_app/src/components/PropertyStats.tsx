"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("w-7 h-7", className)}>
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z" />
  </svg>
);

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("w-7 h-7", className)}>
    <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15a.75.75 0 000-1.5h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
  </svg>
);

const GridIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("w-7 h-7", className)}>
    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
  </svg>
);

type PropertyStatProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  Link :string;
};

const PropertyStat = ({ label, value, icon, bgColor, textColor,Link:link }: PropertyStatProps) => {
  return (
    <Link href={link} className="block w-full">
    <div className={cn("flex items-center w-full h-26", bgColor)}>
      <div className="flex items-center p-2 pl-3 ">
        <div className={cn("text-white", textColor)}>
          {icon}
        </div>
      </div>
      <div className="flex flex-col px-3 py-2">
        <span className="text-lg font-medium text-white">{label}</span>
        <span className="text-base font-bold text-white">{value}</span>
      </div>
    </div>
    </Link>
  );
};


export const PropertyStats = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-between space-x-1 bg-white p-1 shadow-sm h-32", className)}>
      <div className="flex items-center justify-center px-2 w-full">
        <span className="text-xl font-medium text-gray-700">Active Property</span>
      </div>
      <PropertyStat
        label="Residential Rent"
        value="₹ 1,155+"
        icon={<HomeIcon />}
        bgColor="bg-[#1abc9c]"
        textColor="text-white"
        Link = "/residential_rent_page"
        
      />
      
      <PropertyStat
        label="Residential Sell"
        value="₹ 16,513+"
        icon={<HomeIcon />}
        bgColor="bg-[#27ae60]"
        textColor="text-white"
        Link = "/residential_rent_page"
      />
      
      <PropertyStat
        label="Commercial Rent"
        value="₹ 4,663+"
        icon={<BuildingIcon />}
        bgColor="bg-[#f39c12]"
        textColor="text-white"
         Link = "/residential_rent_page"
      />
      
      <PropertyStat
        label="Commercial Sell"
        value="₹ 7,086+"
        icon={<BuildingIcon />}
        bgColor="bg-[#e74c3c]"
        textColor="text-white"
         Link = "/residential_rent_page"
      />
      
      <PropertyStat
        label="Total Active"
        value="₹ 29,397+"
        icon={<GridIcon />}
        bgColor="bg-[#95a5a6]"
        textColor="text-white"
         Link = "/residential_rent_page"
      />
    </div>
  );
};

export default PropertyStats;
