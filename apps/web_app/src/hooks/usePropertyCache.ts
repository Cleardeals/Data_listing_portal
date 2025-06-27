import { useCallback, useRef } from 'react';
import { PropertyData } from '@/lib/dummyProperties';

// Filter state interface
interface FilterState {
  propertyType: string[];
  condition: string[];
  area: string[];
  availability: string[];
  availabilityType: string[];
  budgetMin: string;
  budgetMax: string;
  sqftFrom: string;
  sqftTo: string;
  premise: string;
}

// Cache entry structure
interface CacheEntry {
  data: PropertyData[];
  totalCount: number;
  timestamp: number;
  isStale: boolean;
}

// Cache statistics for monitoring
interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  hitRate: number;
}

// Maximum cache size to prevent memory issues
const MAX_CACHE_SIZE = 50;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

export function usePropertyCache() {
  // In-memory cache using Map for O(1) access
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const statsRef = useRef<CacheStats>({
    hits: 0,
    misses: 0,
    entries: 0,
    hitRate: 0
  });

  // Generate unique cache key from filters and pagination
  const generateCacheKey = useCallback((
    filters: FilterState,
    page: number,
    pageSize: number
  ): string => {
    const filterKey = JSON.stringify({
      propertyType: filters.propertyType.sort(),
      condition: filters.condition.sort(),
      area: filters.area.sort(),
      availability: filters.availability.sort(),
      availabilityType: filters.availabilityType.sort(),
      budgetMin: filters.budgetMin,
      budgetMax: filters.budgetMax,
      sqftFrom: filters.sqftFrom,
      sqftTo: filters.sqftTo,
      premise: filters.premise
    });
    return `${filterKey}_p${page}_s${pageSize}`;
  }, []);

  // Check if cache entry is valid (not expired)
  const isCacheValid = useCallback((entry: CacheEntry): boolean => {
    const now = Date.now();
    return !entry.isStale && (now - entry.timestamp) < CACHE_EXPIRY_TIME;
  }, []);

  // Get data from cache
  const getCachedData = useCallback((
    filters: FilterState,
    page: number,
    pageSize: number
  ): CacheEntry | null => {
    const key = generateCacheKey(filters, page, pageSize);
    const entry = cacheRef.current.get(key);
    
    if (entry && isCacheValid(entry)) {
      statsRef.current.hits++;
      statsRef.current.hitRate = statsRef.current.hits / (statsRef.current.hits + statsRef.current.misses);
      return entry;
    }
    
    if (entry) {
      // Remove expired entry
      cacheRef.current.delete(key);
      statsRef.current.entries = cacheRef.current.size;
    }
    
    statsRef.current.misses++;
    statsRef.current.hitRate = statsRef.current.hits / (statsRef.current.hits + statsRef.current.misses);
    return null;
  }, [generateCacheKey, isCacheValid]);

  // Set data in cache with LRU eviction
  const setCachedData = useCallback((
    filters: FilterState,
    page: number,
    pageSize: number,
    data: PropertyData[],
    totalCount: number
  ): void => {
    const key = generateCacheKey(filters, page, pageSize);
    
    // Implement LRU eviction if cache is full
    if (cacheRef.current.size >= MAX_CACHE_SIZE && !cacheRef.current.has(key)) {
      // Remove oldest entry (first in Map)
      const firstKey = cacheRef.current.keys().next().value;
      if (firstKey) {
        cacheRef.current.delete(firstKey);
      }
    }
    
    // Delete and re-add to maintain LRU order
    if (cacheRef.current.has(key)) {
      cacheRef.current.delete(key);
    }
    
    const entry: CacheEntry = {
      data,
      totalCount,
      timestamp: Date.now(),
      isStale: false
    };
    
    cacheRef.current.set(key, entry);
    statsRef.current.entries = cacheRef.current.size;
  }, [generateCacheKey]);

  // Invalidate specific cache entries
  const invalidateCache = useCallback((
    filters?: FilterState,
    page?: number,
    pageSize?: number
  ): void => {
    if (filters && page !== undefined && pageSize !== undefined) {
      // Invalidate specific entry
      const key = generateCacheKey(filters, page, pageSize);
      cacheRef.current.delete(key);
    } else {
      // Invalidate all entries
      cacheRef.current.clear();
    }
    statsRef.current.entries = cacheRef.current.size;
  }, [generateCacheKey]);

  // Mark cache entries as stale (for background refresh)
  const markStale = useCallback((
    filters?: FilterState,
    page?: number,
    pageSize?: number
  ): void => {
    if (filters && page !== undefined && pageSize !== undefined) {
      // Mark specific entry as stale
      const key = generateCacheKey(filters, page, pageSize);
      const entry = cacheRef.current.get(key);
      if (entry) {
        entry.isStale = true;
      }
    } else {
      // Mark all entries as stale
      cacheRef.current.forEach(entry => {
        entry.isStale = true;
      });
    }
  }, [generateCacheKey]);

  // Preload adjacent pages for faster navigation
  const preloadAdjacentPages = useCallback((
    filters: FilterState,
    currentPage: number,
    pageSize: number,
    totalCount: number,
    fetchFunction: (page: number) => Promise<{ data: PropertyData[], count: number }>
  ): void => {
    const totalPages = Math.ceil(totalCount / pageSize);
    const pagesToPreload = [];
    
    // Preload previous page
    if (currentPage > 1) {
      pagesToPreload.push(currentPage - 1);
    }
    
    // Preload next page
    if (currentPage < totalPages) {
      pagesToPreload.push(currentPage + 1);
    }
    
    // Execute preloading in background
    pagesToPreload.forEach(async (page) => {
      const key = generateCacheKey(filters, page, pageSize);
      if (!cacheRef.current.has(key)) {
        try {
          const result = await fetchFunction(page);
          setCachedData(filters, page, pageSize, result.data, result.count);
        } catch (error) {
          console.warn(`Failed to preload page ${page}:`, error);
        }
      }
    });
  }, [generateCacheKey, setCachedData]);

  // Get cache statistics
  const getCacheStats = useCallback((): CacheStats => {
    return { ...statsRef.current };
  }, []);

  // Clear all cache and reset stats
  const clearCache = useCallback((): void => {
    cacheRef.current.clear();
    statsRef.current = {
      hits: 0,
      misses: 0,
      entries: 0,
      hitRate: 0
    };
  }, []);

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    markStale,
    preloadAdjacentPages,
    getCacheStats,
    clearCache
  };
}
