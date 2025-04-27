"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Chart.js
const Chart = dynamic(() => import("react-chartjs-2").then(mod => mod.Bar), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[300px]">Loading chart...</div>
});

// We'll register Chart.js components on the client side only
let chartRegistered = false;

type AreaChartProps = {
  type: 'residential-rent' | 'residential-sell' | 'commercial-rent' | 'commercial-sell';
  className?: string;
};

const mockData = {
  'residential-rent': [
    { area: 'Gandhinagar', count: 145 },
    { area: 'Vaishno Devi', count: 132 },
    { area: 'SG Highway', count: 128 },
    { area: 'Chandkheda', count: 115 },
    { area: 'Sargasan', count: 112 },
    { area: 'Ranip', count: 108 },
    { area: 'Gota', count: 105 },
    { area: 'Jagatpur', count: 102 },
    { area: 'Bopal', count: 98 },
    { area: 'South Bopal', count: 95 },
    { area: 'Sanand', count: 92 },
    { area: 'Zundal', count: 88 },
    { area: 'Kudasan', count: 85 },
    { area: 'Raysan', count: 82 },
    { area: 'Adalaj', count: 78 },
    { area: 'Koba', count: 75 },
    { area: 'Tragad', count: 72 },
    { area: 'Vaishnodevi Circle', count: 68 },
    { area: 'Infocity', count: 65 },
    { area: 'GIFT City', count: 62 },
  ],
  'residential-sell': [
    { area: 'Chandkheda', count: 152 },
    { area: 'Sargasan', count: 148 },
    { area: 'Gandhinagar', count: 145 },
    { area: 'Gota', count: 142 },
    { area: 'Ranip', count: 138 },
    { area: 'Jagatpur', count: 135 },
    { area: 'Vaishno Devi', count: 132 },
    { area: 'Bopal', count: 128 },
    { area: 'South Bopal', count: 125 },
    { area: 'Sanand', count: 122 },
    { area: 'Zundal', count: 118 },
    { area: 'Kudasan', count: 115 },
    { area: 'Raysan', count: 112 },
    { area: 'Adalaj', count: 108 },
    { area: 'Koba', count: 105 },
    { area: 'Tragad', count: 102 },
    { area: 'Vaishnodevi Circle', count: 98 },
    { area: 'Infocity', count: 95 },
    { area: 'GIFT City', count: 92 },
    { area: 'Shela', count: 88 },
  ],
  'commercial-rent': [
    { area: 'Gandhinagar', count: 140 },
    { area: 'Navrangpura', count: 138 },
    { area: 'Ashram Road', count: 135 },
    { area: 'CG Road', count: 132 },
    { area: 'Chandkheda', count: 130 },
    { area: 'Makarba', count: 128 },
    { area: 'Prahlad Nagar', count: 125 },
    { area: 'Satellite', count: 122 },
    { area: 'Bodakdev', count: 118 },
    { area: 'Ambawadi', count: 115 },
    { area: 'Vastrapur', count: 112 },
    { area: 'Ellisbridge', count: 108 },
    { area: 'Paldi', count: 105 },
    { area: 'Naranpura', count: 102 },
    { area: 'Thaltej', count: 98 },
    { area: 'Motera', count: 95 },
    { area: 'Sabarmati', count: 92 },
    { area: 'Ghatlodia', count: 88 },
    { area: 'Science City', count: 85 },
    { area: 'GIFT City', count: 82 },
  ],
  'commercial-sell': [
    { area: 'Navrangpura', count: 148 },
    { area: 'CG Road', count: 145 },
    { area: 'Ashram Road', count: 142 },
    { area: 'Bodakdev', count: 138 },
    { area: 'South Bopal', count: 135 },
    { area: 'Chandkheda', count: 132 },
    { area: 'Prahlad Nagar', count: 128 },
    { area: 'Satellite', count: 125 },
    { area: 'Ambawadi', count: 122 },
    { area: 'Vastrapur', count: 118 },
    { area: 'Ellisbridge', count: 115 },
    { area: 'Paldi', count: 112 },
    { area: 'Naranpura', count: 108 },
    { area: 'Thaltej', count: 105 },
    { area: 'Motera', count: 102 },
    { area: 'Sabarmati', count: 98 },
    { area: 'Ghatlodia', count: 95 },
    { area: 'Science City', count: 92 },
    { area: '100 Feet Road', count: 88 },
    { area: 'GIFT City', count: 85 },
  ]
};

const getChartColor = (type: AreaChartProps['type']) => {
  switch (type) {
    case 'residential-rent':
      return { bg: 'rgba(26, 188, 156, 0.8)', border: 'rgb(26, 188, 156)' };
    case 'residential-sell':
      return { bg: 'rgba(39, 174, 96, 0.8)', border: 'rgb(39, 174, 96)' };
    case 'commercial-rent':
      return { bg: 'rgba(243, 156, 18, 0.8)', border: 'rgb(243, 156, 18)' };
    case 'commercial-sell':
      return { bg: 'rgba(231, 76, 60, 0.8)', border: 'rgb(231, 76, 60)' };
    default:
      return { bg: 'rgba(149, 165, 166, 0.8)', border: 'rgb(149, 165, 166)' };
  }
};

export const AreaChart = ({ type, className }: AreaChartProps) => {
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);
  // Memoize colors to prevent recreation on each render
  const colors = useMemo(() => getChartColor(type), [type]);
  
  // Register Chart.js components on the client side only - outside of any state updates
  useEffect(() => {
    if (typeof window !== 'undefined' && !chartRegistered) {
      import('chart.js').then((ChartModule) => {
        const { 
          Chart, 
          CategoryScale, 
          LinearScale, 
          BarElement, 
          Title, 
          Tooltip, 
          Legend 
        } = ChartModule;
        
        Chart.register(
          CategoryScale,
          LinearScale,
          BarElement,
          Title,
          Tooltip,
          Legend
        );
        
        chartRegistered = true;
      });
    }
  }, []);
  
  // Memoize chart options to prevent recreation on each render
  const chartOptionsConfig = useMemo(() => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: {
            size: 16,
          },
          color: '#4a5568',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items: any) => {
            return items[0].label;
          },
          label: (context: any) => {
            return `Property Count: ${context.raw}`;
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
          color: '#4a5568',
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
          color: '#4a5568',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  }), []);
  
  // Separate useEffect for data processing and state updates
  useEffect(() => {
    const data = mockData[type];
    
    // Sort data by count in descending order
    const sortedData = [...data].sort((a, b) => b.count - a.count);
    
    // Take only the top 12 areas for better visualization
    const topAreas = sortedData.slice(0, 12);
    
    setChartData({
      labels: topAreas.map(item => item.area),
      datasets: [
        {
          label: 'Property Count',
          data: topAreas.map(item => item.count),
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
      {chartData && chartOptions && (
        <Chart data={chartData} options={chartOptions} />
      )}
    </div>
  );
};
