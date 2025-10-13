import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Debounce hook that delays the execution of a function
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number>();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Throttle hook that limits the execution rate of a function
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<number>();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callbackRef.current(...args);
        lastRun.current = Date.now();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRun.current = Date.now();
        }, delay - (Date.now() - lastRun.current));
      }
    }) as T,
    [delay]
  );
}

/**
 * Hook to detect if component is mounted (useful for async operations)
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

/**
 * Hook for lazy loading components or data
 */
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  deps: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  load: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useIsMounted();

  const load = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loadFn();
      if (isMounted()) {
        setData(result);
      }
    } catch (err) {
      if (isMounted()) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [loadFn, loading, isMounted, ...deps]);

  return { data, loading, error, load };
}

/**
 * Hook for infinite scrolling
 */
export function useInfiniteScroll(
  hasNextPage: boolean,
  fetchNextPage: () => void,
  threshold = 100
) {
  const containerRef = useRef<HTMLElement>();

  const handleScroll = useThrottle(() => {
    const container = containerRef.current;
    if (!container || !hasNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      fetchNextPage();
    }
  }, 100);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return containerRef;
}

// Performance measurement utilities
export const perf = {
  /**
   * Measure execution time of a function
   */
  measure: <T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (import.meta.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  },

  /**
   * Measure async function execution time
   */
  measureAsync: <T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T
  ): T => {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      if (import.meta.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  },

  /**
   * Mark a performance point
   */
  mark: (name: string) => {
    if (import.meta.env.NODE_ENV === 'development') {
      performance.mark(name);
    }
  },

  /**
   * Measure between two marks
   */
  measureBetween: (startMark: string, endMark: string, measureName?: string) => {
    if (import.meta.env.NODE_ENV === 'development') {
      const name = measureName || `${startMark} to ${endMark}`;
      performance.measure(name, startMark, endMark);
      
      const measure = performance.getEntriesByName(name)[0];
      console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
    }
  }
};

export default {
  useDebounce,
  useThrottle,
  useIsMounted,
  useLazyLoad,
  useInfiniteScroll,
  perf,
};