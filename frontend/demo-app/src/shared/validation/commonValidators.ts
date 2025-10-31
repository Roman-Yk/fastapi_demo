/**
 * Common reusable validators
 * Can be used across all domains in the application
 */

import dayjs from 'dayjs';
import { ValidationResult } from './types';

/**
 * Date validators
 */
export const dateValidators = {
  /**
   * Validates that a date is not in the past
   */
  notInPast: (fieldName: string) => {
    return (value: Date | string | null): ValidationResult => {
      if (!value) return { valid: true };

      const date = typeof value === 'string' ? dayjs(value) : dayjs(value);
      const today = dayjs().startOf('day');

      if (date.isBefore(today)) {
        return {
          valid: false,
          error: `${fieldName} cannot be in the past`
        };
      }

      return { valid: true };
    };
  },

  /**
   * Validates that a date is within a specified range
   */
  dateRange: (min?: Date, max?: Date) => {
    return (value: Date | string | null): ValidationResult => {
      if (!value) return { valid: true };

      const date = typeof value === 'string' ? dayjs(value) : dayjs(value);

      if (min && date.isBefore(dayjs(min))) {
        return {
          valid: false,
          error: `Date must be after ${dayjs(min).format('MM/DD/YYYY')}`
        };
      }

      if (max && date.isAfter(dayjs(max))) {
        return {
          valid: false,
          error: `Date must be before ${dayjs(max).format('MM/DD/YYYY')}`
        };
      }

      return { valid: true };
    };
  },

  /**
   * Validates that a date is in the future
   */
  inFuture: (fieldName: string) => {
    return (value: Date | string | null): ValidationResult => {
      if (!value) return { valid: true };

      const date = typeof value === 'string' ? dayjs(value) : dayjs(value);
      const today = dayjs().startOf('day');

      if (date.isBefore(today) || date.isSame(today)) {
        return {
          valid: false,
          error: `${fieldName} must be in the future`
        };
      }

      return { valid: true };
    };
  }
};

/**
 * String validators
 */
export const stringValidators = {
  /**
   * Validates that a string is not empty
   */
  required: (value: string): ValidationResult => {
    if (!value || value.trim() === '') {
      return { valid: false, error: 'This field is required' };
    }
    return { valid: true };
  },

  /**
   * Validates minimum string length
   */
  minLength: (min: number) => {
    return (value: string): ValidationResult => {
      if (value.length < min) {
        return {
          valid: false,
          error: `Minimum length is ${min} characters`
        };
      }
      return { valid: true };
    };
  },

  /**
   * Validates maximum string length
   */
  maxLength: (max: number) => {
    return (value: string): ValidationResult => {
      if (value.length > max) {
        return {
          valid: false,
          error: `Maximum length is ${max} characters`
        };
      }
      return { valid: true };
    };
  },

  /**
   * Validates string pattern using regex
   */
  pattern: (regex: RegExp, message: string) => {
    return (value: string): ValidationResult => {
      if (!regex.test(value)) {
        return { valid: false, error: message };
      }
      return { valid: true };
    };
  },

  /**
   * Validates email format
   */
  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, error: 'Invalid email address' };
    }
    return { valid: true };
  }
};

/**
 * Number validators
 */
export const numberValidators = {
  /**
   * Validates minimum value
   */
  min: (minValue: number) => {
    return (value: number): ValidationResult => {
      if (value < minValue) {
        return {
          valid: false,
          error: `Minimum value is ${minValue}`
        };
      }
      return { valid: true };
    };
  },

  /**
   * Validates maximum value
   */
  max: (maxValue: number) => {
    return (value: number): ValidationResult => {
      if (value > maxValue) {
        return {
          valid: false,
          error: `Maximum value is ${maxValue}`
        };
      }
      return { valid: true };
    };
  },

  /**
   * Validates that value is within a range
   */
  range: (min: number, max: number) => {
    return (value: number): ValidationResult => {
      if (value < min || value > max) {
        return {
          valid: false,
          error: `Value must be between ${min} and ${max}`
        };
      }
      return { valid: true };
    };
  }
};
