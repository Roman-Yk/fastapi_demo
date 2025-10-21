/**
 * Truck-specific hooks
 */

import { useState, useEffect, useMemo } from 'react';
import { truckApi } from '../api/truckService';
import { Truck } from '../types/truck';

/**
 * Hook for fetching all trucks (for forms/dropdowns)
 */
export function useTrucks() {
  const [data, setData] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await truckApi.getAll();
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
 * Hook to fetch specific trucks by IDs (for grids)
 */
export function useTrucksByIds(ids: (string | null | undefined)[]) {
  const [data, setData] = useState<Truck[]>([]);
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
        const result = await truckApi.getByIds(uniqueIds);
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
  }, [uniqueIds.join(',')]);

  return { data, loading, error };
}

/**
 * Helper hook to get a specific truck by ID
 * Uses the full list hook - better for single lookups
 */
export function useTruck(truckId: string | null | undefined) {
  const { data: trucks, loading } = useTrucks();

  const truck = useMemo(
    () => trucks.find((t: Truck) => t.id === truckId) || null,
    [trucks, truckId]
  );

  return { truck, loading };
}