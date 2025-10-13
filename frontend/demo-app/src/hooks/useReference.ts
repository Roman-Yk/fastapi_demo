import { useState, useEffect, useCallback } from 'react';

export interface ReferenceRecord {
  id: string;
  [key: string]: any;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface UseReferenceOptions {
  enabled?: boolean;
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
}

// Global cache for reference data with TTL support
const referenceCache: { 
  [resource: string]: { 
    [id: string]: CacheEntry<ReferenceRecord>;
  };
} = {};

// Cache for loaded lists
const listCache: { 
  [resource: string]: CacheEntry<ReferenceRecord[]>;
} = {};

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

// Utility function to check if cache entry is valid
function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < entry.ttl;
}

// Utility function to check if cache entry is stale but exists
function isCacheStale<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp >= entry.ttl;
}

export function useReference<T extends ReferenceRecord>(
  resource: string,
  id: string | null,
  fetchRecord: (id: string) => Promise<T>,
  options: UseReferenceOptions = {}
) {
  const { enabled = true, ttl = DEFAULT_TTL, staleWhileRevalidate = true } = options;
  const [record, setRecord] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecord = useCallback(async (recordId: string, forceRefresh = false) => {
    const cacheEntry = referenceCache[resource]?.[recordId];
    
    // Return valid cached data immediately
    if (!forceRefresh && isCacheValid(cacheEntry)) {
      setRecord(cacheEntry.data as T);
      return;
    }

    // If stale-while-revalidate is enabled and we have stale data, return it first
    if (staleWhileRevalidate && cacheEntry && isCacheStale(cacheEntry)) {
      setRecord(cacheEntry.data as T);
      // Continue to fetch fresh data in background
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const fetchedRecord = await fetchRecord(recordId);
      
      // Update cache
      if (!referenceCache[resource]) {
        referenceCache[resource] = {};
      }
      referenceCache[resource][recordId] = {
        data: fetchedRecord,
        timestamp: Date.now(),
        ttl,
      };
      
      setRecord(fetchedRecord);
    } catch (err) {
      // If we have stale data and this is a background refresh, don't show error
      if (!(staleWhileRevalidate && cacheEntry)) {
        setError(err instanceof Error ? err.message : 'Failed to fetch record');
        setRecord(null);
      }
    } finally {
      setLoading(false);
    }
  }, [resource, fetchRecord, ttl, staleWhileRevalidate]);

  useEffect(() => {
    if (enabled && id) {
      loadRecord(id);
    } else {
      setRecord(null);
      setError(null);
    }
  }, [id, enabled, loadRecord]);

  return { 
    record, 
    loading, 
    error, 
    refetch: id ? () => loadRecord(id, true) : undefined 
  };
}

export function useReferenceList<T extends ReferenceRecord>(
  resource: string,
  fetchList: () => Promise<T[]>,
  options: UseReferenceOptions = {}
) {
  const { enabled = true, ttl = DEFAULT_TTL, staleWhileRevalidate = true } = options;
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async (forceRefresh = false) => {
    const cacheEntry = listCache[resource];
    
    // Return valid cached data immediately
    if (!forceRefresh && isCacheValid(cacheEntry)) {
      setRecords(cacheEntry.data as T[]);
      return;
    }

    // If stale-while-revalidate is enabled and we have stale data, return it first
    if (staleWhileRevalidate && cacheEntry && isCacheStale(cacheEntry)) {
      setRecords(cacheEntry.data as T[]);
      // Continue to fetch fresh data in background
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const fetchedRecords = await fetchList();
      
      // Update list cache
      listCache[resource] = {
        data: fetchedRecords,
        timestamp: Date.now(),
        ttl,
      };
      
      // Update individual record cache
      if (!referenceCache[resource]) {
        referenceCache[resource] = {};
      }
      
      fetchedRecords.forEach(record => {
        referenceCache[resource][record.id] = {
          data: record,
          timestamp: Date.now(),
          ttl,
        };
      });
      
      setRecords(fetchedRecords);
    } catch (err) {
      // If we have stale data and this is a background refresh, don't show error
      if (!(staleWhileRevalidate && cacheEntry)) {
        setError(err instanceof Error ? err.message : 'Failed to fetch records');
        setRecords([]);
      }
    } finally {
      setLoading(false);
    }
  }, [resource, fetchList, ttl, staleWhileRevalidate]);

  useEffect(() => {
    if (enabled) {
      loadList();
    }
  }, [enabled, loadList]);

  return { 
    records, 
    loading, 
    error, 
    refetch: () => loadList(true) 
  };
}

// Utility to get cached record without triggering fetch
export function getCachedReference(resource: string, id: string): ReferenceRecord | null {
  const cacheEntry = referenceCache[resource]?.[id];
  return cacheEntry ? cacheEntry.data : null;
}

// Utility to clear cache for a resource
export function clearReferenceCache(resource?: string) {
  if (resource) {
    delete referenceCache[resource];
    delete listCache[resource];
  } else {
    Object.keys(referenceCache).forEach(key => delete referenceCache[key]);
    Object.keys(listCache).forEach(key => delete listCache[key]);
  }
}

// Utility to get cache statistics
export function getCacheStats() {
  const resourceCount = Object.keys(referenceCache).length;
  const totalRecords = Object.values(referenceCache).reduce(
    (total, resource) => total + Object.keys(resource).length,
    0
  );
  const listCount = Object.keys(listCache).length;
  
  return {
    resourceCount,
    totalRecords,
    listCount,
  };
}