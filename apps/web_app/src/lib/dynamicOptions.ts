import { supabase } from './supabase';
import { useState, useEffect, useCallback } from 'react';
import { fallbackOptions } from './propertyConstants';
export { fallbackOptions };

// Types for dynamic options
export interface DynamicOptions {
  propertyTypes: string[];
  areas: string[];
  subPropertyTypes: string[];
  furnishingStatuses: string[];
  tenantPreferences: string[];
  availabilities: string[];
  floors: string[];
  ages: string[];
}

// Cache for dynamic options
interface CacheEntry {
  data: DynamicOptions;
  timestamp: number;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
let globalOptionsCache: CacheEntry | null = null;

// Helper functions for cache management
const isCacheValid = (): boolean => {
  if (!globalOptionsCache) return false;
  return Date.now() - globalOptionsCache.timestamp < CACHE_DURATION;
};

const setCache = (data: DynamicOptions): void => {
  globalOptionsCache = {
    data,
    timestamp: Date.now()
  };
};

// Service class for fetching dynamic options from Supabase
export class DynamicOptionsService {
  private static instance: DynamicOptionsService;
  
  private constructor() {}
  
  public static getInstance(): DynamicOptionsService {
    if (!DynamicOptionsService.instance) {
      DynamicOptionsService.instance = new DynamicOptionsService();
    }
    return DynamicOptionsService.instance;
  }

  // Fetch distinct values for a specific column
  async getDistinctValues(column: string): Promise<string[]> {
    try {
      // Try to use the RPC function first for better performance
      let data: unknown = null;
      let error: unknown = null;
      
      try {
        const result = await supabase.rpc('get_distinct_values', { 
          column_name: column, 
          table_name: 'propertydata' 
        });
        
        data = result.data;
        error = result.error;
        
        if (!error && data && Array.isArray(data)) {
          // RPC function returns data in format [{ value: "string" }, ...]
          const values = data
            .map((item: { value: string }) => item.value)
            .filter((value: string) => value && value.trim() !== '')
            .map((value: string) => value.trim());
          
          const uniqueValues = [...new Set(values)].sort();
          return uniqueValues;
        }
      } catch {
        // RPC function failed, fall back to regular query
      }
      
      // Fallback to regular query if RPC function fails or doesn't exist
      const fallbackResult = await supabase
        .from('propertydata')
        .select(column)
        .not(column, 'is', null)
        .neq(column, '')
        .order(column);
      
      if (fallbackResult.error) {
        return [];
      }
      
      data = fallbackResult.data;
      error = null;

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Extract unique values and filter out nulls/empty strings
      const values: string[] = [];
      data.forEach((item: Record<string, unknown>) => {
        const value = item[column];
        if (typeof value === 'string' && value.trim() !== '') {
          values.push(value.trim());
        }
      });

      const uniqueValues = [...new Set(values)].sort();
      return uniqueValues;
    } catch {
      return [];
    }
  }

  // Fetch all dynamic options at once with caching
  async getAllOptions(): Promise<DynamicOptions> {
    try {
      // Check cache first
      if (isCacheValid() && globalOptionsCache) {

        return globalOptionsCache.data;
      }



      const [
        propertyTypes,
        areas,
        subPropertyTypes,
        furnishingStatuses,
        tenantPreferences,
        availabilities,
        floors,
        ages
      ] = await Promise.all([
        this.getDistinctValues('property_type'),
        this.getDistinctValues('area'),
        this.getDistinctValues('sub_property_type'),
        this.getDistinctValues('furnishing_status'),
        this.getDistinctValues('tenant_preference'),
        this.getDistinctValues('availability'),
        this.getDistinctValues('floor'),
        this.getDistinctValues('age')
      ]);

      // Remove N/A, Other, and empty values from filter options
      const cleanOptions = (values: string[]): string[] => {
        return [...new Set(
          values.filter(v => {
            if (!v || v.trim() === '') return false;
            const lower = v.trim().toLowerCase();
            return lower !== 'n/a' && lower !== 'other';
          })
        )].sort();
      };

      // Standard BHK whitelist for sub_property_type filter
      const BHK_WHITELIST = ['1 RK', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '5 BHK', '6 BHK'];
      const cleanSubPropertyTypes = (values: string[]): string[] => {
        const cleaned = cleanOptions(values);
        // Keep only values that match a standard BHK pattern
        return BHK_WHITELIST.filter(standard =>
          cleaned.some(v => v.toLowerCase().replace(/\s/g, '') === standard.toLowerCase().replace(/\s/g, ''))
            ? true
            : false
        );
      };

      const options: DynamicOptions = {
        propertyTypes: cleanOptions(propertyTypes),
        areas: cleanOptions(areas),
        subPropertyTypes: cleanSubPropertyTypes(subPropertyTypes),
        furnishingStatuses: cleanOptions(furnishingStatuses),
        tenantPreferences: cleanOptions(tenantPreferences),
        availabilities: cleanOptions(availabilities),
        floors: cleanOptions(floors),
        ages: cleanOptions(ages)
      };

      // Cache the results
      setCache(options);
      return options;
    } catch {
      return fallbackOptions;
    }
  }
}

// Custom hook for using dynamic options with real-time updates
export const useDynamicOptions = (enableRealtime: boolean = false) => {
  const [options, setOptions] = useState<DynamicOptions>(fallbackOptions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dynamicOptionsService = DynamicOptionsService.getInstance();

  // Fetch options function
  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newOptions = await dynamicOptionsService.getAllOptions();
      setOptions(newOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch options');
    } finally {
      setLoading(false);
    }
  }, [dynamicOptionsService]);

  useEffect(() => {
    fetchOptions();

    // Setup real-time subscription if enabled
    if (enableRealtime) {
      const channel = supabase
        .channel('dynamic-options-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'propertydata'
          },
          () => {
            // Debounce the refresh to avoid too many calls
            setTimeout(() => {
              fetchOptions();
            }, 1000);
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [enableRealtime, fetchOptions]);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions
  };
};

