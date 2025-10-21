/**
 * Driver-specific hooks
 */

import { useState, useEffect, useMemo } from 'react';
import { driverApi } from '../api/driverService';
import { Driver } from '../types/driver';

/**
 * Hook for fetching all drivers (for forms/dropdowns)
 */
export function useDrivers() {
  const [data, setData] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await driverApi.getAll();
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
 * Hook to fetch specific drivers by IDs (for grids)
 */
export function useDriversByIds(ids: (string | null | undefined)[]) {
  const [data, setData] = useState<Driver[]>([]);
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
        const result = await driverApi.getByIds(uniqueIds);
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
  }, [uniqueIds.join(',')]);

  return { data, loading, error };
}

/**
 * Helper hook to get a specific driver by ID
 * Uses the full list hook - better for single lookups
 */
export function useDriver(driverId: string | null | undefined) {
  const { data: drivers, loading } = useDrivers();

  const driver = useMemo(
    () => drivers.find((d: Driver) => d.id === driverId) || null,
    [drivers, driverId]
  );

  return { driver, loading };
}