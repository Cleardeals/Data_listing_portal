"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ChartData, ChartOptions } from "chart.js";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Icon components moved from PropertyStats.tsx
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

// PropertyStat component moved from PropertyStats.tsx
type PropertyStatProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  Link: string;
};

const PropertyStat = ({ label, value, icon, bgColor, textColor, Link: link }: PropertyStatProps) => {
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

// Inline implementation of PropertyStats component
const PropertyStats = ({ className }: { className?: string }) => {
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
        Link="/tableview"
      />
      
      <PropertyStat
        label="Residential Sell"
        value="₹ 16,513+"
        icon={<HomeIcon />}
        bgColor="bg-[#27ae60]"
        textColor="text-white"
        Link="/tableview"
      />
      
      <PropertyStat
        label="Commercial Rent"
        value="₹ 4,663+"
        icon={<BuildingIcon />}
        bgColor="bg-[#f39c12]"
        textColor="text-white"
        Link="/tableview"
      />
      
      <PropertyStat
        label="Commercial Sell"
        value="₹ 7,086+"
        icon={<BuildingIcon />}
        bgColor="bg-[#e74c3c]"
        textColor="text-white"
        Link="/tableview"
      />
      
      <PropertyStat
        label="Total Active"
        value="₹ 29,397+"
        icon={<GridIcon />}
        bgColor="bg-[#95a5a6]"
        textColor="text-white"
        Link="/tableview"
      />
    </div>
  );
};

// Dynamic import to avoid SSR issues with Chart.js
const Chart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Bar),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[300px]">
        Loading chart...
      </div>
    ),
  }
);

// We'll register Chart.js components on the client side only
let chartRegistered = false;

// Register Chart.js function
const registerChart = async () => {
  if (typeof window !== "undefined" && !chartRegistered) {
    const {
      Chart,
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend,
    } = await import("chart.js");

    Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

    chartRegistered = true;
  }
};

// PropertyCountCard component
type PropertyCountCardProps = {
  title: string;
  count: number;
  bgColor: string;
};

const PropertyCountCard = ({ title, count, bgColor }: PropertyCountCardProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-4 text-white", bgColor)}>
      <span className="text-base lg:text-lg font-medium">{title}</span>
      <span className="text-xl lg:text-3xl font-bold">{count}</span>
    </div>
  );
};

// AreaChart component
type AreaChartProps = {
  type: "residential-rent" | "residential-sell" | "commercial-rent" | "commercial-sell";
  className?: string;
};

type AreaData = {
  area: string;
  count: number;
};

type MockDataType = {
  [key in AreaChartProps["type"]]: AreaData[];
};

const mockData: MockDataType = {
  "residential-rent": [
    { area: "Gandhinagar", count: 145 },
    { area: "Vaishno Devi", count: 132 },
    { area: "SG Highway", count: 128 },
    { area: "Chandkheda", count: 115 },
    { area: "Sargasan", count: 112 },
    { area: "Ranip", count: 108 },
    { area: "Gota", count: 105 },
    { area: "Jagatpur", count: 102 },
    { area: "Bopal", count: 98 },
    { area: "South Bopal", count: 95 },
    { area: "Sanand", count: 92 },
    { area: "Zundal", count: 88 },
    { area: "Kudasan", count: 85 },
    { area: "Raysan", count: 82 },
    { area: "Adalaj", count: 78 },
    { area: "Koba", count: 75 },
    { area: "Tragad", count: 72 },
    { area: "Vaishnodevi Circle", count: 68 },
    { area: "Infocity", count: 65 },
    { area: "GIFT City", count: 62 },
  ],
  "residential-sell": [
    { area: "Chandkheda", count: 152 },
    { area: "Sargasan", count: 148 },
    { area: "Gandhinagar", count: 145 },
    { area: "Gota", count: 142 },
    { area: "Jagatpur", count: 138 },
    { area: "Bopal", count: 135 },
    { area: "South Bopal", count: 132 },
    { area: "Ranip", count: 128 },
    { area: "Vaishno Devi", count: 125 },
    { area: "Chandlodia", count: 122 },
    { area: "Kudasan", count: 118 },
    { area: "Raysan", count: 115 },
    { area: "Adalaj", count: 112 },
    { area: "Koba", count: 108 },
    { area: "Tragad", count: 105 },
    { area: "Vaishnodevi Circle", count: 102 },
    { area: "Infocity", count: 98 },
    { area: "GIFT City", count: 95 },
    { area: "Shela", count: 92 },
    { area: "Santej", count: 88 },
  ],
  "commercial-rent": [
    { area: "Gandhinagar", count: 140 },
    { area: "Navrangpura", count: 138 },
    { area: "SG Highway", count: 135 },
    { area: "Chandkheda", count: 130 },
    { area: "Sargasan", count: 128 },
    { area: "Ranip", count: 125 },
    { area: "Gota", count: 122 },
    { area: "Jagatpur", count: 120 },
    { area: "Bopal", count: 118 },
    { area: "South Bopal", count: 115 },
    { area: "Sanand", count: 112 },
    { area: "Zundal", count: 110 },
    { area: "Kudasan", count: 108 },
    { area: "Raysan", count: 105 },
    { area: "Adalaj", count: 102 },
    { area: "Koba", count: 100 },
    { area: "Tragad", count: 95 },
    { area: "Vaishnodevi Circle", count: 92 },
    { area: "Infocity", count: 90 },
    { area: "GIFT City", count: 85 },
  ],
  "commercial-sell": [
    { area: "Navrangpura", count: 148 },
    { area: "CG Road", count: 145 },
    { area: "Gandhinagar", count: 142 },
    { area: "Gota", count: 140 },
    { area: "Jagatpur", count: 138 },
    { area: "Bopal", count: 135 },
    { area: "South Bopal", count: 132 },
    { area: "Ranip", count: 130 },
    { area: "Vaishno Devi", count: 128 },
    { area: "Chandlodia", count: 125 },
    { area: "Kudasan", count: 120 },
    { area: "Raysan", count: 115 },
    { area: "Adalaj", count: 110 },
    { area: "Koba", count: 105 },
    { area: "Tragad", count: 102 },
    { area: "Vaishnodevi Circle", count: 100 },
    { area: "Infocity", count: 95 },
    { area: "GIFT City", count: 92 },
    { area: "Shela", count: 88 },
  ],
};

const getChartColor = (type: AreaChartProps["type"]) => {
  switch (type) {
    case "residential-rent":
      return { bg: "rgba(26, 188, 156, 0.8)", border: "rgb(26, 188, 156)" };
    case "residential-sell":
      return { bg: "rgba(39, 174, 96, 0.8)", border: "rgb(39, 174, 96)" };
    case "commercial-rent":
      return { bg: "rgba(243, 156, 18, 0.8)", border: "rgb(243, 156, 18)" };
    case "commercial-sell":
      return { bg: "rgba(231, 76, 60, 0.8)", border: "rgb(231, 76, 60)" };
    default:
      return { bg: "rgba(149, 165, 166, 0.8)", border: "rgb(149, 165, 166)" };
  }
};

const AreaChart = ({ type, className }: AreaChartProps) => {
  const [chartData, setChartData] = useState<ChartData<"bar"> | null>(null);
  const [chartOptions, setChartOptions] = useState<ChartOptions<"bar"> | null>(null);
  const colors = useMemo(() => getChartColor(type), [type]);

  useEffect(() => {
    registerChart();
  }, []);

  const chartOptionsConfig = useMemo<ChartOptions<"bar">>(
    () => ({
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            font: {
              size: 16,
            },
            color: "#4a5568",
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleFont: {
            size: 16,
          },
          bodyFont: {
            size: 16,
          },
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              return tooltipItems[0]?.label || "";
            },
            label: (tooltipItem) => {
              return `Property Count: ${tooltipItem.raw as number}`;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            font: {
              size: 16,
            },
            color: "#4a5568",
          },
          grid: {
            display: false,
          },
        },
        x: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 16,
            },
            color: "#4a5568",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
    }),
    []
  );

  useEffect(() => {
    const data = mockData[type];

    const sortedData = [...data].sort((a, b) => b.count - a.count);
    const topAreas = sortedData.slice(0, 12);

    setChartData({
      labels: topAreas.map((item) => item.area),
      datasets: [
        {
          label: "Property Count",
          data: topAreas.map((item) => item.count),
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 1,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
      ],
    });

    setChartOptions(chartOptionsConfig);
  }, [type, colors, chartOptionsConfig]);

  return (
    <div className={cn("p-4 h-[350px]", className)}>
      {chartData && chartOptions && <Chart data={chartData} options={chartOptions} />}
    </div>
  );
};

// Main Dashboard page component
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex flex-col w-full gap-4 px-2">
        {/* Welcome Message */}
        {user && (
          <div className="bg-white shadow-sm p-4 rounded-md mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user.email}!
            </h1>
            <p className="text-gray-600">Role: {user.role}</p>
          </div>
        )}
        
        <PropertyStats />

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white shadow-sm p-5 rounded-md">
          <h2 className="text-xl lg:text-2xl font-medium text-gray-700 mb-3">
            Today&apos;s Property
          </h2>
          <div className="grid grid-cols-5 gap-1">
            <Link href="/residential_rent_page">
              <PropertyCountCard
                title="Residential Rent"
                count={0}
                bgColor="bg-[#1abc9c]"
              />
            </Link>
            <PropertyCountCard
              title="Residential Sell"
              count={0}
              bgColor="bg-[#27ae60]"
            />
            <PropertyCountCard
              title="Commercial Rent"
              count={0}
              bgColor="bg-[#f39c12]"
            />
            <PropertyCountCard
              title="Commercial Sell"
              count={0}
              bgColor="bg-[#e74c3c]"
            />
            <PropertyCountCard
              title="Total Property"
              count={0}
              bgColor="bg-[#95a5a6]"
            />
          </div>
        </div>

        <div className="bg-white shadow-sm p-5 rounded-md">
          <h2 className="text-xl lg:text-2xl font-medium text-gray-700 mb-3">
            Yesterday&apos;s Property
          </h2>
          <div className="grid grid-cols-5 gap-1">
            <PropertyCountCard
              title="Residential Rent"
              count={37}
              bgColor="bg-[#1abc9c]"
            />
            <PropertyCountCard
              title="Residential Sell"
              count={55}
              bgColor="bg-[#27ae60]"
            />
            <PropertyCountCard
              title="Commercial Rent"
              count={22}
              bgColor="bg-[#f39c12]"
            />
            <PropertyCountCard
              title="Commercial Sell"
              count={6}
              bgColor="bg-[#e74c3c]"
            />
            <PropertyCountCard
              title="Total"
              count={120}
              bgColor="bg-[#95a5a6]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8 mt-8">
        <div className="bg-white shadow-sm rounded-md">
          <h3 className="text-center py-4 text-white bg-[#1abc9c] text-lg lg:text-xl font-medium">
            Residential Rent Top 50 Area
          </h3>
          <AreaChart type="residential-rent" />
        </div>
        <div className="bg-white shadow-sm rounded-md">
          <h3 className="text-center py-4 text-white bg-[#27ae60] text-lg lg:text-xl font-medium">
            Residential Sell Top 50 Area
          </h3>
          <AreaChart type="residential-sell" />
        </div>
        <div className="bg-white shadow-sm rounded-md">
          <h3 className="text-center py-4 text-white bg-[#f39c12] text-lg lg:text-xl font-medium">
            Commercial Rent Top 50 Area
          </h3>
          <AreaChart type="commercial-rent" />
        </div>
        <div className="bg-white shadow-sm rounded-md">
          <h3 className="text-center py-4 text-white bg-[#e74c3c] text-lg lg:text-xl font-medium">
            Commercial Sell Top 50 Area
          </h3>
          <AreaChart type="commercial-sell" />
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
