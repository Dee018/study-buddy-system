/**
 * Cache Manager for Performance Optimization
 * Implements in-memory caching with TTL and localStorage caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class CacheManager {
  private static memoryCache: Map<string, CacheEntry<any>> = new Map();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get data from cache
   */
  static get<T>(key: string): T | null {
    try {
      // Check memory cache first
      const cached = this.memoryCache.get(key);
      if (cached) {
        const now = Date.now();
        if (now - cached.timestamp < cached.ttl) {
          return cached.data as T;
        } else {
          // Expired, remove from cache
          this.memoryCache.delete(key);
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      this.memoryCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });

      // Limit cache size (keep last 100 entries)
      if (this.memoryCache.size > 100) {
        const firstKey = this.memoryCache.keys().next().value;
        this.memoryCache.delete(firstKey);
      }
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Clear specific cache entry
   */
  static clear(key: string): void {
    this.memoryCache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  static clearAll(): void {
    this.memoryCache.clear();
  }

  /**
   * Invalidate cache by prefix
   */
  static invalidateByPrefix(prefix: string): void {
    const keys = Array.from(this.memoryCache.keys());
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    });
  }

  /**
   * Get or compute - if not in cache, compute and cache the result
   */
  static async getOrCompute<T>(
    key: string,
    computeFn: () => T | Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute and cache
    const result = await computeFn();
    this.set(key, result, ttl);
    return result;
  }

  /**
   * Memoize a function with caching
   */
  static memoize<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    keyFn?: (...args: TArgs) => string,
    ttl?: number
  ): (...args: TArgs) => TReturn {
    return (...args: TArgs) => {
      const key = keyFn ? keyFn(...args) : `memoized_${JSON.stringify(args)}`;
      const cached = this.get<TReturn>(key);
      
      if (cached !== null) {
        return cached;
      }

      const result = fn(...args);
      this.set(key, result, ttl);
      return result;
    };
  }

  /**
   * Debounce with caching
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number;
    keys: string[];
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.memoryCache.entries());
    const timestamps = entries.map(([_, entry]) => entry.timestamp);

    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null
    };
  }
}

/**
 * Persistent Cache using localStorage
 * SUPABASE NOTE: Use memory-only caching or Redis for production
 * localStorage persistence disabled for Supabase migration
 */
export class PersistentCache {
  private static readonly CACHE_PREFIX = 'cache_';

  /**
   * Get from localStorage with memory caching
   * SUPABASE TODO: Use Redis or memory-only cache
   */
  static get<T>(key: string): T | null {
    try {
      // Check memory cache first
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const memCached = CacheManager.get<T>(cacheKey);
      if (memCached !== null) {
        return memCached;
      }

      // DISABLED FOR SUPABASE MIGRATION
      // // Check localStorage
      // if (typeof window === 'undefined') return null;
      // const stored = localStorage.getItem(cacheKey);
      // if (!stored) return null;

      // const parsed = JSON.parse(stored);
      
      // // Cache in memory for faster subsequent access
      // CacheManager.set(cacheKey, parsed.data, 60000); // 1 minute TTL
      
      // return parsed.data as T;
      return null;
    } catch (error) {
      console.error('Error getting from persistent cache:', error);
      return null;
    }
  }

  /**
   * Set in localStorage and memory cache
   * SUPABASE TODO: Use Redis or memory-only cache
   */
  static set<T>(key: string, data: T): void {
    try {
      if (typeof window === 'undefined') return;
      
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      // const entry = {
      //   data,
      //   timestamp: Date.now()
      // };

      // DISABLED FOR SUPABASE MIGRATION
      // localStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Keep memory cache active
      CacheManager.set(cacheKey, data, 60000);
    } catch (error) {
      console.error('Error setting persistent cache:', error);
    }
  }

  /**
   * Remove from cache
   * SUPABASE TODO: Use Redis or memory-only cache
   */
  static remove(key: string): void {
    try {
      if (typeof window === 'undefined') return;
      
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      // DISABLED FOR SUPABASE MIGRATION
      // localStorage.removeItem(cacheKey);
      CacheManager.clear(cacheKey);
    } catch (error) {
      console.error('Error removing from persistent cache:', error);
    }
  }

  /**
   * Clear all cached items
   * SUPABASE TODO: Use Redis or memory-only cache
   */
  static clearAll(): void {
    try {
      if (typeof window === 'undefined') return;
      
      // DISABLED FOR SUPABASE MIGRATION
      // const keys = Object.keys(localStorage);
      // keys.forEach(key => {
      //   if (key.startsWith(this.CACHE_PREFIX)) {
      //     localStorage.removeItem(key);
      //   }
      // });
      
      CacheManager.invalidateByPrefix(this.CACHE_PREFIX);
    } catch (error) {
      console.error('Error clearing persistent cache:', error);
    }
  }
}