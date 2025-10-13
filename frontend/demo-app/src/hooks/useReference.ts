import { useState, useEffect, useCallback } from 'react';

export interface ReferenceRecord {
  id: string;
  [key: string]: any;
}

export interface ReferenceCache {
  [resource: string]: {
    [id: string]: ReferenceRecord;
  };
}

interface UseReferenceOptions {
  enabled?: boolean;
}

// Global cache for reference data
const referenceCache: ReferenceCache = {};

// Cache for loaded lists to avoid refetching
const listCache: { [resource: string]: ReferenceRecord[] } = {};

export function useReference<T extends ReferenceRecord>(
  resource: string,
  id: string | null,
  fetchRecord: (id: string) => Promise<T>,
  options: UseReferenceOptions = {}
) {
  const { enabled = true } = options;
  const [record, setRecord] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecord = useCallback(async (recordId: string) => {
    // Check cache first
    if (referenceCache[resource]?.[recordId]) {
      setRecord(referenceCache[resource][recordId] as T);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedRecord = await fetchRecord(recordId);
      
      // Update cache
      if (!referenceCache[resource]) {
        referenceCache[resource] = {};
      }
      referenceCache[resource][recordId] = fetchedRecord;
      
      setRecord(fetchedRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch record');
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [resource, fetchRecord]);

  useEffect(() => {
    if (enabled && id) {
      loadRecord(id);
    } else {
      setRecord(null);
      setError(null);
    }
  }, [id, enabled, loadRecord]);

  return { record, loading, error, refetch: id ? () => loadRecord(id) : undefined };
}

export function useReferenceList<T extends ReferenceRecord>(
  resource: string,
  fetchList: () => Promise<T[]>,
  options: UseReferenceOptions = {}
) {
  const { enabled = true } = options;
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    // Check cache first
    if (listCache[resource]) {
      setRecords(listCache[resource] as T[]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedRecords = await fetchList();
      
      // Update both list cache and individual record cache
      listCache[resource] = fetchedRecords;
      if (!referenceCache[resource]) {
        referenceCache[resource] = {};
      }
      
      fetchedRecords.forEach(record => {
        referenceCache[resource][record.id] = record;
      });
      
      setRecords(fetchedRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [resource, fetchList]);

  useEffect(() => {
    if (enabled) {
      loadList();
    }
  }, [enabled, loadList]);

  return { records, loading, error, refetch: loadList };
}

// Utility to get cached record without triggering fetch
export function getCachedReference(resource: string, id: string): ReferenceRecord | null {
  return referenceCache[resource]?.[id] || null;
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