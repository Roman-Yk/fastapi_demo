/**
 * Terminal-specific hooks
 */

import { useState, useEffect, useMemo } from 'react';
import { terminalApi } from '../api/terminalService';
import { Terminal } from '../types/terminal';

/**
 * Hook for fetching all terminals (for forms/dropdowns)
 */
export function useTerminals() {
  const [data, setData] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await terminalApi.getAll();
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
 * Hook to fetch specific terminals by IDs (for grids)
 */
export function useTerminalsByIds(ids: (string | null | undefined)[]) {
  const [data, setData] = useState<Terminal[]>([]);
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
        const result = await terminalApi.getByIds(uniqueIds);
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
  }, [uniqueIds.join(',')]);

  return { data, loading, error };
}

/**
 * Helper hook to get a specific terminal by ID
 * Uses the full list hook - better for single lookups
 */
export function useTerminal(terminalId: string | null | undefined) {
  const { data: terminals, loading } = useTerminals();

  const terminal = useMemo(
    () => terminals.find((t: Terminal) => t.id === terminalId) || null,
    [terminals, terminalId]
  );

  return { terminal, loading };
}