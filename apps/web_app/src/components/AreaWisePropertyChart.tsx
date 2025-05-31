'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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

interface LegendProps {
  payload?: Array<{
    value: string;
    color: string;
    payload?: AreaData;
  }>;
}

const COLORS = [
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
];

export default function AreaWisePropertyChart({ className = '' }: AreaWisePropertyChartProps) {
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [totalProperties, setTotalProperties] = useState(0);

  useEffect(() => {
    fetchAreaData();
  }, []);

  const fetchAreaData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('propertydata')
        .select('area')
        .not('area', 'is', null)
        .not('area', 'eq', '');

      if (supabaseError) {
        throw supabaseError;
      }

      // Process the data to count properties by area
      const areaCounts: { [key: string]: number } = {};
      let total = 0;

      data.forEach((property) => {
        const area = property.area?.trim() || 'Unknown';
        areaCounts[area] = (areaCounts[area] || 0) + 1;
        total++;
      });

      // Convert to array and calculate percentages
      const processedData: AreaData[] = Object.entries(areaCounts)
        .map(([area, count]) => ({
          area,
          count,
          percentage: parseFloat(((count / total) * 100).toFixed(1))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 areas

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
      return (
        <div className="backdrop-blur-3d bg-white/90 border border-white/20 rounded-xl p-4 shadow-lg">
          <p className="text-gray-900 font-semibold">{`${label}`}</p>
          <p className="text-blue-600 font-medium">
            Properties: {payload[0].value}
          </p>
          <p className="text-purple-600 font-medium">
            Percentage: {((payload[0].value / totalProperties) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: LegendProps) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4 max-h-32 overflow-y-auto">
        {payload?.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/90 text-sm font-medium">
              {entry.value} ({entry.payload?.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="modern-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-white/70">Loading area data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-300">
            <div className="text-4xl mb-4">⚠️</div>
            <p>Error loading area data</p>
            <p className="text-sm mt-2">{error}</p>
            <button 
              onClick={fetchAreaData}
              className="mt-4 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (areaData.length === 0) {
    return (
      <div className={`card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-white/70">
            <div className="text-4xl mb-4">📊</div>
            <p>No property data available</p>
            <p className="text-sm mt-2">Add some properties to see the area breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-hover-3d backdrop-blur-3d bg-white/10 border border-white/20 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gradient-animate mb-2">
            📍 Area-wise Property Distribution
          </h3>
          <p className="text-white/70 text-sm">
            Total Properties: <span className="text-cyan-400 font-semibold">{totalProperties}</span>
          </p>
        </div>
        
        {/* Chart Type Toggle */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              chartType === 'pie' 
                ? 'bg-blue-500/30 text-white border border-blue-400/50' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            🥧 Pie
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              chartType === 'bar' 
                ? 'bg-purple-500/30 text-white border border-purple-400/50' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            📊 Bar
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={areaData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="area"
                label={({ area, percentage }) => `${area}: ${percentage}%`}
                labelLine={false}
                fontSize={12}
              >
                {areaData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          ) : (
            <BarChart data={areaData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="area" 
                tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              >
                {areaData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-cyan-400 text-2xl font-bold">
            {areaData.length}
          </div>
          <div className="text-white/70 text-sm">Areas</div>
        </div>
        <div className="backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-green-400 text-2xl font-bold">
            {areaData[0]?.area.substring(0, 8)}...
          </div>
          <div className="text-white/70 text-sm">Top Area</div>
        </div>
        <div className="backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-purple-400 text-2xl font-bold">
            {areaData[0]?.count || 0}
          </div>
          <div className="text-white/70 text-sm">Max Properties</div>
        </div>
        <div className="backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-orange-400 text-2xl font-bold">
            {areaData[0]?.percentage || 0}%
          </div>
          <div className="text-white/70 text-sm">Top Share</div>
        </div>
      </div>
    </div>
  );
}
