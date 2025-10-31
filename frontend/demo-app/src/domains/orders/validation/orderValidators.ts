/**
 * Order-specific validation logic
 * Business rules that belong to the Order domain
 */

import { ValidationResult } from '../../../shared/validation/types';
import { orderApi } from '../api/orderService';
import { OrderService } from '../types/order';

/**
 * Cache for reference validation to reduce API calls
 * TTL: 5 minutes
 */
const referenceCache = new Map<string, {
  result: boolean;
  timestamp: number;
}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Order-specific validators
 */
export const orderValidators = {
  /**
   * Validates that an order reference is unique within a terminal
   * Uses caching to reduce API calls
   *
   * @param reference - Order reference to validate
   * @param terminalId - Terminal ID
   * @param excludeOrderId - Optional: Order ID to exclude from check (for edit mode)
   */
  uniqueReference: async (
    reference: string,
    terminalId: string,
    excludeOrderId?: string
  ): Promise<ValidationResult> => {
    if (!reference || !terminalId) {
      console.log('[Reference Validation] Skipped - missing reference or terminal');
      return { valid: true };
    }

    console.log('[Reference Validation] Checking:', { reference, terminalId, excludeOrderId });

    // Check cache first
    const cacheKey = `${reference}-${terminalId}-${excludeOrderId || ''}`;
    const cached = referenceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[Reference Validation] Using cached result:', cached.result);
      return {
        valid: cached.result,
        error: cached.result
          ? undefined
          : `Reference "${reference}" already exists for this terminal`
      };
    }

    try {
      // Query API for existing orders with same reference and terminal
      const filters = { reference, terminal_id: terminalId };
      console.log('[Reference Validation] API call with filters:', filters);
      const existingOrders = await orderApi.getAll(filters);
      console.log('[Reference Validation] Found existing orders:', existingOrders.length, existingOrders);

      // Filter out current order if in edit mode
      const duplicates = excludeOrderId
        ? existingOrders.filter(order => order.id !== excludeOrderId)
        : existingOrders;

      const isUnique = duplicates.length === 0;
      console.log('[Reference Validation] Result:', { isUnique, duplicates: duplicates.length });

      // Cache the result
      referenceCache.set(cacheKey, {
        result: isUnique,
        timestamp: Date.now()
      });

      return {
        valid: isUnique,
        error: isUnique
          ? undefined
          : `Reference "${reference}" already exists for this terminal`
      };
    } catch (error) {
      console.error('[Reference Validation] Failed to validate reference:', error);
      // Don't block on network errors - allow the form to proceed
      return { valid: true };
    }
  },

  /**
   * Validates ETA/ETD dates based on service type
   * Business rule: Different services have different date requirements
   *
   * @param etaDate - ETA date
   * @param etdDate - ETD date
   * @param service - Service type
   */
  validateServiceDates: (
    etaDate: Date | null,
    etdDate: Date | null,
    service: number
  ): ValidationResult => {
    const isPlukk = service === OrderService.INTO_PLUKK_STORAGE;

    if (isPlukk) {
      // Plukk service: requires exactly ONE date (either ETA or ETD, not both)
      const hasEta = !!etaDate;
      const hasEtd = !!etdDate;

      if (!hasEta && !hasEtd) {
        return {
          valid: false,
          error: 'Plukk service requires either ETA date OR ETD date'
        };
      }

      if (hasEta && hasEtd) {
        return {
          valid: false,
          error: 'Plukk service can only have ONE section (ETA OR ETD, not both)'
        };
      }
    } else if (service && service !== 0) {
      // Non-Plukk services: require BOTH dates
      if (!etaDate || !etdDate) {
        return {
          valid: false,
          error: 'This service requires both ETA date AND ETD date'
        };
      }
    }

    return { valid: true };
  },

  /**
   * Clear reference cache
   * Useful after successful save or when terminal changes
   */
  clearReferenceCache: () => {
    referenceCache.clear();
  },

  /**
   * Clear specific reference from cache
   */
  clearReferenceCacheFor: (reference: string, terminalId: string) => {
    const keysToDelete: string[] = [];
    referenceCache.forEach((_, key) => {
      if (key.startsWith(`${reference}-${terminalId}`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => referenceCache.delete(key));
  }
};
