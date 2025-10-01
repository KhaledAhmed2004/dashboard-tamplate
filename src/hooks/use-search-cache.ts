import { useState, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseSearchCacheOptions {
  maxAge?: number; // Cache expiry time in milliseconds
  maxSize?: number; // Maximum cache entries
}

export function useSearchCache<T>(options: UseSearchCacheOptions = {}) {
  const { maxAge = 5 * 60 * 1000, maxSize = 100 } = options; // Default: 5 minutes, 100 entries
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  const get = (key: string): T | null => {
    const entry = cache.current.get(key);
    
    if (!entry) {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > maxAge) {
      cache.current.delete(key);
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return entry.data;
  };

  const set = (key: string, data: T): void => {
    // Remove oldest entries if cache is full
    if (cache.current.size >= maxSize) {
      const firstKey = cache.current.keys().next().value;
      if (firstKey) {
        cache.current.delete(firstKey);
      }
    }

    cache.current.set(key, {
      data,
      timestamp: Date.now()
    });
  };

  const clear = (): void => {
    cache.current.clear();
    setCacheStats({ hits: 0, misses: 0 });
  };

  const has = (key: string): boolean => {
    const entry = cache.current.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > maxAge) {
      cache.current.delete(key);
      return false;
    }
    
    return true;
  };

  return {
    get,
    set,
    clear,
    has,
    cacheStats,
    size: cache.current.size
  };
}