'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '@/lib/supabase';

interface AreaData {
  area: string;
  count: number;
  percentage: number;
}

interface AreaWisePropertyChartProps {
  className?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: AreaData;
  }>;
  label?: string;
}

const COLORS = [
  '#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#84cc16', 
  '#f97316', '#6366f1', '#14b8a6', '#f472b6', '#a855f7', '#22d3ee', '#fbbf24', '#fb7185',
  '#34d399', '#60a5fa', '#c084fc', '#fde047', '#ff7d7d', '#4ade80', '#818cf8', '#fca5a5'
];

export default function AreaWisePropertyChart({ className = '' }: AreaWisePropertyChartProps) {
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [totalProperties, setTotalProperties] = useState(0);
  const [showAllAreas, setShowAllAreas] = useState(false);

  useEffect(() => {
    fetchAreaData();
  }, []);

  const fetchAreaData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Now count properties for each area using efficient aggregation
      const areaCounts: { [key: string]: number } = {};
      let total = 0;

      // Batch count all areas at once - using pagination to ensure we get ALL data
      let allData: { area: string }[] = [];
      let start = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: batchData, error: batchError } = await supabase
          .from('propertydata')
          .select('area')
          .not('area', 'is', null)
          .neq('area', '')
          .range(start, start + limit - 1);

        if (batchError) throw batchError;

        if (batchData && batchData.length > 0) {
          allData = [...allData, ...batchData];
          hasMore = batchData.length === limit;
          start += limit;
        } else {
          hasMore = false;
        }
      }

      console.log(`📊 Fetched ${allData.length} total property records`);

      allData.forEach((property) => {
        const area = property.area?.trim() || 'Unknown';
        areaCounts[area] = (areaCounts[area] || 0) + 1;
        total++;
      });

      // Convert to array and calculate percentages for ALL areas
      const processedData: AreaData[] = Object.entries(areaCounts)
        .map(([area, count]) => ({
          area,
          count,
          percentage: parseFloat(((count / total) * 100).toFixed(1))
        }))
        .sort((a, b) => b.count - a.count); // Sort by count, no limit

      console.log('🔍 Area Data Debug:', {
        totalRawData: allData.length,
        uniqueAreas: Object.keys(areaCounts).length,
        processedDataLength: processedData.length,
        first5Areas: processedData.slice(0, 5).map(a => a.area),
        totalProperties: total
      });

      setAreaData(processedData);
      setTotalProperties(total);
    } catch (err) {
      console.error('Error fetching area data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch area data');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const areaName = data?.area || label || 'Unknown';
      return (
        <div className="backdrop-blur-lg bg-white/95 border border-white/30 rounded-xl p-4 shadow-xl">
          <p className="text-gray-900 font-bold text-lg">{areaName}</p>
          <p className="text-blue-600 font-semibold">
            Properties: {payload[0].value?.toLocaleString()}
          </p>
          <p className="text-purple-600 font-semibold">
            Share: {data?.percentage || ((payload[0].value / totalProperties) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => {
    // Always show ALL areas in the legend without scrolling
    const legendData = areaData;
    return (
      <div className="mt-0 h-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 pb-1">
          {legendData.map((entry, index: number) => (
            <div key={index} className="flex items-center px-2 py-1 bg-white/8 rounded-md backdrop-blur-sm border border-white/15 hover:bg-white/12 transition-all duration-200">
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-white/90 text-xs font-medium truncate flex-1" title={entry.area}>
                {entry.area.length > 8 ? `${entry.area.substring(0, 8)}...` : entry.area}
              </span>
              <span className="text-white/50 text-xs">({entry.percentage}%)</span>
            </div>
          ))}
        </div>
        <div className="text-center text-white/50 text-xs pt-2 border-t border-white/10">
          Showing all {areaData.length} areas
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl ${className}`}>
        <div className="flex flex-col items-center justify-center py-16 px-6 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-cyan-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Loading Area Analytics</h3>
            <p className="text-white/70">Fetching property distribution data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card-hover-3d backdrop-blur-3d bg-white/10 border border-red-400/30 rounded-2xl ${className}`}>
        <div className="flex flex-col items-center justify-center py-16 px-6 space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-400/30">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-300 mb-2">Error Loading Data</h3>
            <p className="text-red-300/80 mb-4">{error}</p>
            <button 
              onClick={fetchAreaData}
              className="px-6 py-2 bg-red-500/20 border border-red-400/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-red-300 font-medium"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (areaData.length === 0) {
    return (
      <div className={`card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl ${className}`}>
        <div className="flex flex-col items-center justify-center py-16 px-6 space-y-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
            <p className="text-white/70">Add some properties to see the area breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  // Get display data for charts - show all areas, but handle large datasets intelligently
  const pieChartData = showAllAreas ? areaData : areaData.slice(0, 15); // Conditional limit for pie chart
  const barChartData = areaData; // Always show all in bar chart (bar chart handles many items better)

  return (
    <div className={`card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl overflow-hidden ${className}`}>
      {/* Header Section */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gradient-animate flex items-center gap-2">
              📍 Area Distribution Analytics
            </h3>
            <p className="text-white/70 text-sm mt-1">
              Showing <span className="text-cyan-400 font-semibold">{chartType === 'pie' ? pieChartData.length : barChartData.length}</span> of{' '}
              <span className="text-cyan-400 font-semibold">{areaData.length}</span> areas •{' '}
              <span className="text-green-400 font-semibold">{totalProperties.toLocaleString()}</span> total properties
            </p>
          </div>
          
          {/* Chart Type Toggle and View Options */}
          <div className="flex items-center gap-4">
            {/* Show All Toggle for Pie Chart */}
            {chartType === 'pie' && (
              <div className="flex items-center gap-2">
                <label className="text-white/70 text-sm">Show All:</label>
                <button
                  onClick={() => setShowAllAreas(!showAllAreas)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-300 ${
                    showAllAreas 
                      ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {showAllAreas ? '✓ All Areas' : 'Top 15'}
                </button>
              </div>
            )}
            
            {/* Chart Type Toggle */}
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setChartType('pie')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  chartType === 'pie' 
                    ? 'bg-blue-500/30 text-white border border-blue-400/50 shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                🥧 Pie Chart
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  chartType === 'bar' 
                    ? 'bg-purple-500/30 text-white border border-purple-400/50 shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                📊 Bar Chart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-4">
        <div className={`w-full mb-1 ${chartType === 'bar' || (chartType === 'pie' && showAllAreas) ? 'h-[400px]' : 'h-80'}`}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={showAllAreas && pieChartData.length > 15 ? 80 : 100}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="area"
                  paddingAngle={showAllAreas && pieChartData.length > 15 ? 1 : 2}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={1}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer drop-shadow-sm"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <BarChart 
                data={barChartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="area" 
                  tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 8 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tickFormatter={(value) => value.length > 6 ? `${value.substring(0, 6)}...` : value}
                />
                <YAxis 
                  tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                >
                  {barChartData.map((entry, index) => (
                    <Cell 
                      key={`bar-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <CustomLegend />
      </div>

      {/* Summary Stats Section */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-sm bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-3 text-center">
            <div className="text-cyan-400 text-2xl font-bold mb-1">
              {areaData.length}
            </div>
            <div className="text-white/70 text-sm font-medium">Total Areas</div>
          </div>
          
          <div className="backdrop-blur-sm bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-3 text-center">
            <div className="text-green-400 text-lg font-bold mb-1 break-words leading-tight" title={areaData[0]?.area}>
              {areaData[0]?.area || 'N/A'}
            </div>
            <div className="text-white/70 text-sm font-medium">Top Area</div>
          </div>
          
          <div className="backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-3 text-center">
            <div className="text-purple-400 text-2xl font-bold mb-1">
              {areaData[0]?.count?.toLocaleString() || 0}
            </div>
            <div className="text-white/70 text-sm font-medium">Max Properties</div>
          </div>
          
          <div className="backdrop-blur-sm bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-400/20 rounded-xl p-3 text-center">
            <div className="text-orange-400 text-2xl font-bold mb-1">
              {areaData[0]?.percentage || 0}%
            </div>
            <div className="text-white/70 text-sm font-medium">Top Share</div>
          </div>
        </div>
      </div>
    </div>
  );
}
