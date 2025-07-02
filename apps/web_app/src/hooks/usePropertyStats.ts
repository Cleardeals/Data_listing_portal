'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PropertyData, supabaseHelpers } from '@/lib/dummyProperties';

interface PropertyStats {
  total: number;
  residential_rent: number;
  residential_sell: number;
  commercial_rent: number;
  commercial_sell: number;
  today: {
    total: number;
    residential_rent: number;
    residential_sell: number;
    commercial_rent: number;
    commercial_sell: number;
  };
  yesterday: {
    total: number;
    residential_rent: number;
    residential_sell: number;
    commercial_rent: number;
    commercial_sell: number;
  };
  areas: Array<{
    area: string;
    count: number;
    percentage: number;
  }>;
  totalValue: number;
  averagePrice: number;
}

// Cache for property stats with timestamp
interface CacheEntry {
  data: PropertyStats;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let globalCache: CacheEntry | null = null;

// Helper function to check if cache is valid
const isCacheValid = (): boolean => {
  if (!globalCache) return false;
  return Date.now() - globalCache.timestamp < CACHE_DURATION;
};

// Helper function to set cache
const setCache = (data: PropertyStats): void => {
  globalCache = {
    data,
    timestamp: Date.now()
  };
};

export const usePropertyStats = () => {
  const [stats, setStats] = useState<PropertyStats>({
    total: 0,
    residential_rent: 0,
    residential_sell: 0,
    commercial_rent: 0,
    commercial_sell: 0,
    today: {
      total: 0,
      residential_rent: 0,
      residential_sell: 0,
      commercial_rent: 0,
      commercial_sell: 0,
    },
    yesterday: {
      total: 0,
      residential_rent: 0,
      residential_sell: 0,
      commercial_rent: 0,
      commercial_sell: 0,
    },
    areas: [],
    totalValue: 0,
    averagePrice: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = useCallback((data: PropertyData[]) => {
    const today = supabaseHelpers.getTodayDate();
    const yesterday = supabaseHelpers.getYesterdayDate();

    const baseStats = {
      total: 0,
      residential_rent: 0,
      residential_sell: 0,
      commercial_rent: 0,
      commercial_sell: 0,
    };

    const todayStats = { ...baseStats };
    const yesterdayStats = { ...baseStats };
    const areaCounts: { [key: string]: number } = {};
    let totalValue = 0;
    let validPrices = 0;

    data.forEach((property) => {
      // Count by property type using the exact categorization from search page
      const propertyType = property.property_type?.trim() || '';
      
      let category = '';
      // Match exactly with search page dropdown options: Res_resale, Res_rental, Com_resale, Com_rental
      if (propertyType === 'Res_rental') {
        category = 'residential_rent';
      } else if (propertyType === 'Res_resale') {
        category = 'residential_sell';
      } else if (propertyType === 'Com_rental') {
        category = 'commercial_rent';
      } else if (propertyType === 'Com_resale') {
        category = 'commercial_sell';
      }

      // Always count towards total, even if uncategorized
      baseStats.total++;

      if (category) {
        baseStats[category as keyof typeof baseStats]++;

        // Date-based filtering
        const propertyDate = supabaseHelpers.formatDateForComparison(property.date_stamp);
        if (propertyDate === today) {
          todayStats[category as keyof typeof todayStats]++;
          todayStats.total++;
        } else if (propertyDate === yesterday) {
          yesterdayStats[category as keyof typeof yesterdayStats]++;
          yesterdayStats.total++;
        }
      } else {
        // Count uncategorized properties in today/yesterday stats as well
        const propertyDate = supabaseHelpers.formatDateForComparison(property.date_stamp);
        if (propertyDate === today) {
          todayStats.total++;
        } else if (propertyDate === yesterday) {
          yesterdayStats.total++;
        }
      }

      // Area counting
      const area = property.area?.trim() || 'Unknown';
      areaCounts[area] = (areaCounts[area] || 0) + 1;

      // Price calculation
      if (property.rent_or_sell_price) {
        const price = parseFloat(property.rent_or_sell_price.replace(/[^\d.]/g, ''));
        if (!isNaN(price)) {
          totalValue += price;
          validPrices++;
        }
      }
    });

    // Process areas
    const totalAreaProperties = Object.values(areaCounts).reduce((sum, count) => sum + count, 0);
    const areas = Object.entries(areaCounts)
      .map(([area, count]) => ({
        area,
        count,
        percentage: parseFloat(((count / totalAreaProperties) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      ...baseStats,
      today: todayStats,
      yesterday: yesterdayStats,
      areas,
      totalValue,
      averagePrice: validPrices > 0 ? totalValue / validPrices : 0,
    };
  }, []);

  const fetchPropertyStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (isCacheValid() && globalCache) {

        setStats(globalCache.data);
        setLoading(false);
        return;
      }



      // Check authentication first
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: Please log in again');
      }

      if (!session) {
        console.warn('No active session found');
        throw new Error('No active session found');
      }

      // Fetch all records using pagination to avoid Supabase limits
      let allData: PropertyData[] = [];
      let hasMore = true;
      let offset = 0;
      const batchSize = 1000;

      while (hasMore) {
        const { data, error: supabaseError } = await supabase
          .from('propertydata')
          .select('*')
          .eq('visibility', true) // Only fetch visible properties for stats
          .range(offset, offset + batchSize - 1); // Fetch in batches

        if (supabaseError) {
          console.error('Supabase query error:', supabaseError);
          throw supabaseError;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          offset += batchSize;
          hasMore = data.length === batchSize; // If we got less than batchSize, we're done
        } else {
          hasMore = false;
        }
      }


      const calculatedStats = calculateStats(allData);

      // Cache the results
      setCache(calculatedStats);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching property stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch property statistics');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    // Add a small delay to avoid multiple rapid calls
    const timeoutId = setTimeout(() => {
      fetchPropertyStats();
    }, 100);

    // Set up real-time subscription with debouncing
    const channel = supabase
      .channel('property-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'propertydata'
        },
        () => {
          // Invalidate cache and refetch stats when data changes
          globalCache = null;
          // Debounce the refetch to avoid excessive calls
          setTimeout(() => {
            fetchPropertyStats();
          }, 1000);
        }
      )
      .subscribe(() => {

      });

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [fetchPropertyStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchPropertyStats,
    clearCache: () => {
      globalCache = null;
      fetchPropertyStats();
    }
  };
};
