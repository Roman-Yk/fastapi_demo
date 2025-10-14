/**
 * Optimized hook for grids with many rows
 * 
 * This hook implements ID-based filtering:
 * 1. Collects all IDs that need to be fetched from the grid data
 * 2. Fetches only those specific records with filter parameter
 * 3. Returns lookup functions for instant access
 * 
 * Usage in a grid:
 * ```tsx
 * const { getDriver, getTruck, getTrailer, loading } = useReferenceDataForGrid(orders);
 * 
 * // In each row:
 * const driver = getDriver(record.driver_id);
 * ```
 */

import { useMemo } from 'react';
import { 
  useDriversByIds, 
  useTerminalsByIds, 
  useTrucksByIds, 
  useTrailersByIds 
} from './useReferenceData';

/**
 * Hook to get all reference data needed for a grid
 * Automatically collects IDs from records and fetches only what's needed
 */
export function useReferenceDataForGrid(records: any[]) {
  // Collect all unique IDs from the records
  const driverIds = useMemo(
    () => [...new Set(records.flatMap(r => [r.eta_driver_id, r.etd_driver_id]).filter(Boolean))],
    [records]
  );
  
  const terminalIds = useMemo(
    () => [...new Set(records.map(r => r.terminal_id).filter(Boolean))],
    [records]
  );
  
  const truckIds = useMemo(
    () => [...new Set(records.flatMap(r => [r.eta_truck_id, r.etd_truck_id]).filter(Boolean))],
    [records]
  );
  
  const trailerIds = useMemo(
    () => [...new Set(records.flatMap(r => [r.eta_trailer_id, r.etd_trailer_id]).filter(Boolean))],
    [records]
  );

  // Fetch only the specific IDs needed
  const { data: drivers, loading: loadingDrivers } = useDriversByIds(driverIds);
  const { data: terminals, loading: loadingTerminals } = useTerminalsByIds(terminalIds);
  const { data: trucks, loading: loadingTrucks } = useTrucksByIds(truckIds);
  const { data: trailers, loading: loadingTrailers } = useTrailersByIds(trailerIds);

  // Create lookup maps for O(1) access
  const driverMap = useMemo(() => {
    const map = new Map();
    drivers.forEach((driver: any) => map.set(driver.id, driver));
    return map;
  }, [drivers]);

  const terminalMap = useMemo(() => {
    const map = new Map();
    terminals.forEach((terminal: any) => map.set(terminal.id, terminal));
    return map;
  }, [terminals]);

  const truckMap = useMemo(() => {
    const map = new Map();
    trucks.forEach((truck: any) => map.set(truck.id, truck));
    return map;
  }, [trucks]);

  const trailerMap = useMemo(() => {
    const map = new Map();
    trailers.forEach((trailer: any) => map.set(trailer.id, trailer));
    return map;
  }, [trailers]);

  // Create lookup functions
  const getDriver = useMemo(() => {
    return (id: string | null | undefined) => {
      if (!id) return null;
      return driverMap.get(id) || null;
    };
  }, [driverMap]);

  const getTerminal = useMemo(() => {
    return (id: string | null | undefined) => {
      if (!id) return null;
      return terminalMap.get(id) || null;
    };
  }, [terminalMap]);

  const getTruck = useMemo(() => {
    return (id: string | null | undefined) => {
      if (!id) return null;
      return truckMap.get(id) || null;
    };
  }, [truckMap]);

  const getTrailer = useMemo(() => {
    return (id: string | null | undefined) => {
      if (!id) return null;
      return trailerMap.get(id) || null;
    };
  }, [trailerMap]);

  const loading = loadingDrivers || loadingTerminals || loadingTrucks || loadingTrailers;

  return {
    getDriver,
    getTerminal,
    getTruck,
    getTrailer,
    loading,
  };
}

// For backwards compatibility
export const useReferenceDataMany = useReferenceDataForGrid;
