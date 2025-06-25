import { supabase } from './supabase';
import { useState, useEffect, useCallback } from 'react';

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

      // Helper function to ensure unique values with N/A first if not already present
      const ensureUniqueWithNA = (values: string[]): string[] => {
        const uniqueValues = [...new Set(values.filter(v => v && v.trim() !== ''))];
        return uniqueValues.includes('N/A') ? uniqueValues : ['N/A', ...uniqueValues];
      };

      const options: DynamicOptions = {
        propertyTypes: ensureUniqueWithNA(propertyTypes),
        areas: ensureUniqueWithNA(areas),
        subPropertyTypes: ensureUniqueWithNA(subPropertyTypes),
        furnishingStatuses: ensureUniqueWithNA(furnishingStatuses),
        tenantPreferences: ensureUniqueWithNA(tenantPreferences),
        availabilities: ensureUniqueWithNA(availabilities),
        floors: ensureUniqueWithNA(floors),
        ages: ensureUniqueWithNA(ages)
      };

      // Cache the results
      setCache(options);
      return options;
    } catch {
      return {
        propertyTypes: ['N/A'],
        areas: ['N/A'],
        subPropertyTypes: ['N/A'],
        furnishingStatuses: ['N/A'],
        tenantPreferences: ['N/A'],
        availabilities: ['N/A'],
        floors: ['N/A'],
        ages: ['N/A']
      };
    }
  }
}

// Custom hook for using dynamic options with real-time updates
export const useDynamicOptions = (enableRealtime: boolean = false) => {
  const [options, setOptions] = useState<DynamicOptions>({
    propertyTypes: ['N/A'],
    areas: ['N/A'],
    subPropertyTypes: ['N/A'],
    furnishingStatuses: ['N/A'],
    tenantPreferences: ['N/A'],
    availabilities: ['N/A'],
    floors: ['N/A'],
    ages: ['N/A']
  });
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

// Fallback options (used as defaults or when database is unavailable)
export const fallbackOptions: DynamicOptions = {
  propertyTypes: ['N/A', 'Res_resale', 'Res_rental', 'Com_resale', 'Com_rental'],
  areas: [
    'N/A', 'Aundh', 'Balewadi', 'Baner', 'Bavdhan', 'Bhosari', 'Bibwewadi', 'Budhwar Peth',
    'Chakan', 'Dhanori', 'Dhanraj Road', 'Deccan Gymkhana', 'Dhayari', 'Hadapsar',
    'Hinjewadi', 'Kalyani Nagar', 'Karve Nagar', 'Katraj', 'Kharadi', 'Kondhwa',
    'Koregaon Park', 'Kothrud', 'Lohegaon', 'Lullanagar', 'Magarpatta', 'Marunji',
    'Model Colony', 'Mohammedwadi', 'Moshi', 'Mundhwa', 'NIBM Road', 'Narayan Peth',
    'Pashan', 'Pimple Saudagar', 'Pimple Gurav', 'Pimple Nilakh', 'Pimpri Chinchwad',
    'Ravet', 'Sadashiv Peth', 'Sahakar Nagar', 'Shaniwar Peth', 'Shivajinagar',
    'Sinhagad Road', 'Swargate', 'Talegaon', 'Tathawade', 'Undri', 'Uruli Kanchan',
    'Viman Nagar', 'Vishrantwadi', 'Wagholi', 'Wakad', 'Wanwadi', 'Warje',
    'Wadgaon Sheri', 'Yerawada', 'Chinchwad', 'Sus', 'Kate Wasti', 'Nigdi',
    'Susgav', 'Suisgaon', 'Rahatani', 'Akurdi', 'Punawale'
  ],
  subPropertyTypes: [
    'N/A', '1 BHK', '1.5 BHK', '1 Rk', '1RK', '1 RK', '1BHK',
    '2 BHK', '2.5 BHK', '2.5BHK', '2 BHk', '2BHK',
    '3 BHK', '3.5 BHK', '3BHK',
    '4 BHK', '4.5 BHK',
    '5 BHK', '6 BHK', '8 BHK', '10 BHK'
  ],
  furnishingStatuses: ['N/A', 'Furnished', 'Unfurnished', 'Semi-Furnished'],
  tenantPreferences: [
    'N/A', 'All', 'Bachelors (Men Only)', 'Bachelors (Men/Women)', 
    'Bachelors (Women Only)', 'Both', 'Family Only'
  ],
  availabilities: ['N/A', 'Available', 'Occupied', 'Under Maintenance'],
  floors: ['N/A', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor+'],
  ages: ['N/A', '0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years']
};
