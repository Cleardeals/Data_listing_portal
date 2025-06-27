import { useRef } from 'react';

interface PerformanceMetrics {
  cacheHitRate: number;
  averageLoadTime: number;
  totalRequests: number;
  backgroundRefreshes: number;
}

export function usePerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics>({
    cacheHitRate: 0,
    averageLoadTime: 0,
    totalRequests: 0,
    backgroundRefreshes: 0,
  });

  const requestStartTimes = useRef<Map<string, number>>(new Map());

  const startTiming = (requestId: string) => {
    requestStartTimes.current.set(requestId, performance.now());
  };

  const endTiming = (requestId: string, fromCache: boolean = false) => {
    const startTime = requestStartTimes.current.get(requestId);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    requestStartTimes.current.delete(requestId);

    const metrics = metricsRef.current;
    metrics.totalRequests++;
    
    if (fromCache) {
      metrics.cacheHitRate = (metrics.cacheHitRate * (metrics.totalRequests - 1) + 1) / metrics.totalRequests;
    } else {
      metrics.cacheHitRate = (metrics.cacheHitRate * (metrics.totalRequests - 1)) / metrics.totalRequests;
    }

    // Update average load time (only for network requests)
    if (!fromCache) {
      const totalTime = metrics.averageLoadTime * (metrics.totalRequests - 1) + duration;
      metrics.averageLoadTime = totalTime / metrics.totalRequests;
    }
  };

  const incrementBackgroundRefresh = () => {
    metricsRef.current.backgroundRefreshes++;
  };

  const getMetrics = (): PerformanceMetrics => ({ ...metricsRef.current });

  const resetMetrics = () => {
    metricsRef.current = {
      cacheHitRate: 0,
      averageLoadTime: 0,
      totalRequests: 0,
      backgroundRefreshes: 0,
    };
    requestStartTimes.current.clear();
  };

  return {
    startTiming,
    endTiming,
    incrementBackgroundRefresh,
    getMetrics,
    resetMetrics,
  };
}
