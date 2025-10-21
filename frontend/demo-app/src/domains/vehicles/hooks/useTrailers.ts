/**
 * Trailer-specific hooks
 */

import { useState, useEffect, useMemo } from 'react';
import { trailerApi } from '../api/trailerService';
import { Trailer } from '../types/trailer';

/**
 * Hook for fetching all trailers (for forms/dropdowns)
 */
export function useTrailers() {
  const [data, setData] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await trailerApi.getAll();
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
 * Hook to fetch specific trailers by IDs (for grids)
 */
export function useTrailersByIds(ids: (string | null | undefined)[]) {
  const [data, setData] = useState<Trailer[]>([]);
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
        const result = await trailerApi.getByIds(uniqueIds);
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
  }, [uniqueIds.join(',')]);

  return { data, loading, error };
}

/**
 * Helper hook to get a specific trailer by ID
 * Uses the full list hook - better for single lookups
 */
export function useTrailer(trailerId: string | null | undefined) {
  const { data: trailers, loading } = useTrailers();

  const trailer = useMemo(
    () => trailers.find((t: Trailer) => t.id === trailerId) || null,
    [trailers, trailerId]
  );

  return { trailer, loading };
}