import { useCallback } from 'react';
import { FilterState } from '@/components/PropertyFiltersPanel';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  filters: FilterState;
}

// Simple cache implementation
const globalCache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const usePropertyCache = () => {
  const generateCacheKey = useCallback((filters: FilterState, page: number, pageSize: number) => {
    return JSON.stringify({ filters, page, pageSize });
  }, []);

  const getFromCache = useCallback((filters: FilterState, page: number, pageSize: number) => {
    const key = generateCacheKey(filters, page, pageSize);
    const entry = globalCache.get(key);
    
    if (!entry) return null;
    
    // Check if cache is still valid
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      globalCache.delete(key);
      return null;
    }
    
    return entry.data;
  }, [generateCacheKey]);

  const setInCache = useCallback((filters: FilterState, page: number, pageSize: number, data: unknown) => {
    const key = generateCacheKey(filters, page, pageSize);
    globalCache.set(key, {
      data,
      timestamp: Date.now(),
      filters,
    });
  }, [generateCacheKey]);

  const clearCache = useCallback(() => {
    globalCache.clear();
  }, []);

  const invalidateCache = useCallback((filters?: FilterState) => {
    if (!filters) {
      clearCache();
      return;
    }
    
    // Remove entries that match the filters
    for (const [key, entry] of globalCache.entries()) {
      if (JSON.stringify(entry.filters) === JSON.stringify(filters)) {
        globalCache.delete(key);
      }
    }
  }, [clearCache]);

  return {
    getFromCache,
    setInCache,
    clearCache,
    invalidateCache,
  };
};
