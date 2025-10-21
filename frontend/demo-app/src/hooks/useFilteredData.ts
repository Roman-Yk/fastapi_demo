/**
 * Hook for filtering and transforming data with memoization
 * Demonstrates useMemo for expensive computations
 */

import { useMemo } from 'react';

export interface FilterOptions<T> {
  searchText?: string;
  searchFields?: (keyof T)[];
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  filterFn?: (item: T) => boolean;
}

/**
 * Hook to filter and sort data with memoization to avoid unnecessary recalculations
 *
 * @example
 * ```tsx
 * const filteredOrders = useFilteredData(orders, {
 *   searchText: searchQuery,
 *   searchFields: ['reference', 'notes'],
 *   sortBy: 'created_at',
 *   sortOrder: 'desc',
 *   filterFn: (order) => order.priority === true,
 * });
 * ```
 */
export function useFilteredData<T extends Record<string, unknown>>(
  data: T[],
  options: FilterOptions<T> = {}
): T[] {
  const {
    searchText = '',
    searchFields = [],
    sortBy,
    sortOrder = 'asc',
    filterFn,
  } = options;

  // Memoize filtered and sorted data to avoid recalculation on every render
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply custom filter function
    if (filterFn) {
      result = result.filter(filterFn);
    }

    // Apply text search
    if (searchText && searchFields.length > 0) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(lowerSearchText);
        })
      );
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchText, searchFields, sortBy, sortOrder, filterFn]);

  return filteredData;
}

/**
 * Hook to transform data with memoization
 *
 * @example
 * ```tsx
 * const transformedData = useTransformedData(rawData, (item) => ({
 *   ...item,
 *   fullName: `${item.firstName} ${item.lastName}`,
 *   formattedDate: new Date(item.date).toLocaleDateString(),
 * }));
 * ```
 */
export function useTransformedData<T, R>(
  data: T[],
  transformFn: (item: T, index: number) => R
): R[] {
  return useMemo(() => data.map(transformFn), [data, transformFn]);
}

/**
 * Hook to group data by a key with memoization
 *
 * @example
 * ```tsx
 * const ordersByStatus = useGroupedData(orders, 'status');
 * // Result: { active: [...], completed: [...], cancelled: [...] }
 * ```
 */
export function useGroupedData<T extends Record<string, unknown>>(
  data: T[],
  groupByKey: keyof T
): Record<string, T[]> {
  return useMemo(() => {
    return data.reduce((acc, item) => {
      const key = String(item[groupByKey]);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }, [data, groupByKey]);
}
