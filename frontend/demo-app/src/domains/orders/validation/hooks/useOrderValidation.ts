/**
 * Order validation hook
 * Provides validation methods for create and edit order forms
 */

import { useState, useCallback } from 'react';
import { notify } from '../../../../shared/services/notificationService';
import { dateValidators } from '../../../../shared/validation/commonValidators';
import { orderValidators } from '../orderValidators';
import { CreateOrderFormData, EditOrderFormData } from '../../schemas/orderSchemas';

export function useOrderValidation() {
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validates create order form data
   * Checks:
   * - Dates are not in the past
   * - Service-specific date requirements
   * - Reference uniqueness for terminal
   */
  const validateCreateOrder = useCallback(async (
    formData: CreateOrderFormData
  ): Promise<boolean> => {
    setIsValidating(true);

    try {
      // Validate ETA date not in past
      if (formData.eta_date) {
        const etaResult = dateValidators.notInPast('ETA Date')(formData.eta_date);
        if (!etaResult.valid) {
          notify.validationError('ETA Date', etaResult.error!);
          return false;
        }
      }

      // Validate ETD date not in past
      if (formData.etd_date) {
        const etdResult = dateValidators.notInPast('ETD Date')(formData.etd_date);
        if (!etdResult.valid) {
          notify.validationError('ETD Date', etdResult.error!);
          return false;
        }
      }

      // Validate service-specific date requirements
      const serviceDatesResult = orderValidators.validateServiceDates(
        formData.eta_date,
        formData.etd_date,
        formData.service
      );
      if (!serviceDatesResult.valid) {
        notify.error(serviceDatesResult.error!);
        return false;
      }

      // Validate reference uniqueness
      if (formData.reference && formData.terminal_id) {
        const referenceResult = await orderValidators.uniqueReference(
          formData.reference,
          formData.terminal_id
        );
        if (!referenceResult.valid) {
          notify.error(referenceResult.error!);
          return false;
        }
      }

      return true;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Validates edit order form data
   * Checks:
   * - Dates are not in the past (if being changed)
   * - Service-specific date requirements
   * - Reference uniqueness for terminal (excluding current order)
   */
  const validateEditOrder = useCallback(async (
    formData: EditOrderFormData,
    orderId: string,
    terminalId: string
  ): Promise<boolean> => {
    setIsValidating(true);

    try {
      // Validate ETA date not in past
      if (formData.eta_date) {
        const etaResult = dateValidators.notInPast('ETA Date')(formData.eta_date);
        if (!etaResult.valid) {
          notify.validationError('ETA Date', etaResult.error!);
          return false;
        }
      }

      // Validate ETD date not in past
      if (formData.etd_date) {
        const etdResult = dateValidators.notInPast('ETD Date')(formData.etd_date);
        if (!etdResult.valid) {
          notify.validationError('ETD Date', etdResult.error!);
          return false;
        }
      }

      // Validate service-specific date requirements
      if (formData.service) {
        const serviceDatesResult = orderValidators.validateServiceDates(
          formData.eta_date,
          formData.etd_date,
          formData.service
        );
        if (!serviceDatesResult.valid) {
          notify.error(serviceDatesResult.error!);
          return false;
        }
      }

      // Validate reference uniqueness
      // Check if reference conflicts with other orders (excluding current order)
      if (formData.reference && terminalId) {
        const referenceResult = await orderValidators.uniqueReference(
          formData.reference,
          terminalId,
          orderId // Exclude current order from duplicate check
        );
        if (!referenceResult.valid) {
          notify.error(referenceResult.error!);
          return false;
        }
      }

      return true;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return {
    validateCreateOrder,
    validateEditOrder,
    isValidating
  };
}
