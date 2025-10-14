/**
 * Optimized reference data hooks with ID filtering
 * 
 * Fetches only the specific records needed based on IDs provided.
 * Perfect for grids where you only need to fetch the visible data.
 * 
 * Features:
 * - Fetch only specific IDs (e.g., ?filter={"id":["1","2","3"]})
 * - No caching - fresh data on each grid render
 * - Automatic deduplication of IDs
 * - Optimized for grid usage
 */

import { useState, useEffect, useMemo } from 'react';
import { formatApiUrl } from '../utils/config';

interface ReferenceRecord {
  id: string;
  [key: string]: any;
}

/**
 * Generic hook for fetching reference data by IDs
 * Uses filter parameter to fetch only specific records
 */
function useReferenceResourceByIds<T extends ReferenceRecord>(
  resourceType: 'drivers' | 'terminals' | 'trucks' | 'trailers',
  ids: (string | null | undefined)[]
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Deduplicate and filter out null/undefined IDs
  const uniqueIds = useMemo(() => {
    const validIds = ids.filter((id): id is string => !!id);
    return [...new Set(validIds)];
  }, [ids]);

  // Fetch data whenever IDs change
  useEffect(() => {
    if (uniqueIds.length === 0) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Build ids parameter: ?ids=id1,id2,id3
        const idsParam = uniqueIds.join(',');
        const url = formatApiUrl(`/${resourceType}?ids=${idsParam}`);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${resourceType}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error(`Failed to fetch ${resourceType}:`, err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uniqueIds.join(','), resourceType]);

  return { data, loading, error };
}

/**
 * Hook for fetching all drivers (for forms/dropdowns)
 */
export function useDrivers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = formatApiUrl('/drivers');
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch drivers: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch drivers:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook for fetching all terminals (for forms/dropdowns)
 */
export function useTerminals() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = formatApiUrl('/terminals');
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch terminals: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch terminals:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook for fetching all trucks (for forms/dropdowns)
 */
export function useTrucks() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = formatApiUrl('/trucks');
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch trucks: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch trucks:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook for fetching all trailers (for forms/dropdowns)
 */
export function useTrailers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = formatApiUrl('/trailers');
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch trailers: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch trailers:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch specific drivers by IDs (for grids)
 */
export function useDriversByIds(ids: (string | null | undefined)[]) {
  return useReferenceResourceByIds<any>('drivers', ids);
}

/**
 * Hook to fetch specific terminals by IDs (for grids)
 */
export function useTerminalsByIds(ids: (string | null | undefined)[]) {
  return useReferenceResourceByIds<any>('terminals', ids);
}

/**
 * Hook to fetch specific trucks by IDs (for grids)
 */
export function useTrucksByIds(ids: (string | null | undefined)[]) {
  return useReferenceResourceByIds<any>('trucks', ids);
}

/**
 * Hook to fetch specific trailers by IDs (for grids)
 */
export function useTrailersByIds(ids: (string | null | undefined)[]) {
  return useReferenceResourceByIds<any>('trailers', ids);
}

/**
 * Helper hook to get a specific driver by ID
 * Uses the full list hook - better for single lookups
 */
export function useDriver(driverId: string | null | undefined) {
  const { data: drivers, loading } = useDrivers();
  
  const driver = useMemo(
    () => drivers.find((d: any) => d.id === driverId) || null,
    [drivers, driverId]
  );
  
  return { driver, loading };
}

/**
 * Helper hook to get a specific terminal by ID
 */
export function useTerminal(terminalId: string | null | undefined) {
  const { data: terminals, loading } = useTerminals();
  
  const terminal = useMemo(
    () => terminals.find((t: any) => t.id === terminalId) || null,
    [terminals, terminalId]
  );
  
  return { terminal, loading };
}

/**
 * Helper hook to get a specific truck by ID
 */
export function useTruck(truckId: string | null | undefined) {
  const { data: trucks, loading } = useTrucks();
  
  const truck = useMemo(
    () => trucks.find((t: any) => t.id === truckId) || null,
    [trucks, truckId]
  );
  
  return { truck, loading };
}

/**
 * Helper hook to get a specific trailer by ID
 */
export function useTrailer(trailerId: string | null | undefined) {
  const { data: trailers, loading } = useTrailers();
  
  const trailer = useMemo(
    () => trailers.find((t: any) => t.id === trailerId) || null,
    [trailers, trailerId]
  );
  
  return { trailer, loading };
}
