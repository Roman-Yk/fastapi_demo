/**
 * @deprecated This hook is deprecated in favor of useFormContext + Zod validation.
 *
 * Preferred pattern:
 * - Use `useFormContext` from hooks/useFormContext.tsx for form state management
 * - Use Zod schemas (from domains/.../schemas/) for type-safe validation
 * - See EditOrderPage.tsx and CreateOrderPage.tsx for examples
 *
 * This hook is kept for backward compatibility with existing code.
 * New forms should use the useFormContext + Zod pattern.
 */

import { useState, useCallback, useMemo } from 'react';

export interface FormField<T = any> {
  value: T;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

export interface FormValidationRule<T = any> {
  validator: (value: T) => boolean | string;
  message?: string;
}

export interface FormConfig<T extends Record<string, any>> {
  initialData: T;
  validationRules?: Record<string, FormValidationRule<any>[]>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * @deprecated Use useFormContext + Zod instead
 */
export function useFormData<T extends Record<string, any>>(config: FormConfig<T>) {
  const { 
    initialData, 
    validationRules = {}, 
    validateOnChange = false, 
    validateOnBlur = true 
  } = config;

  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  // Validate a single field
  const validateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ): string | undefined => {
    const rules = validationRules?.[String(field)] as FormValidationRule<T[K]>[] | undefined;
    if (!rules) return undefined;

    for (const rule of rules) {
      const result = rule.validator(value);
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || 'Invalid value';
      }
    }
    return undefined;
  }, [validationRules]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const field = key as keyof T;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // Update a single field
  const updateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K],
    options: {
      validate?: boolean;
      touch?: boolean;
    } = {}
  ) => {
    const { validate = validateOnChange, touch = true } = options;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (touch) {
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    }

    if (validate) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [validateField, validateOnChange]);

  // Handle field blur
  const handleBlur = useCallback(<K extends keyof T>(field: K) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    if (validateOnBlur) {
      const error = validateField(field, formData[field]);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  }, [formData, validateField, validateOnBlur]);

  // Bulk update form data
  const setForm = useCallback((updater: (prev: T) => T) => {
    setFormData(updater);
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  // Get field props for easy integration with inputs
  const getFieldProps = useCallback(<K extends keyof T>(field: K) => ({
    value: formData[field],
    error: touched[field] ? errors[field] : undefined,
    onChange: (value: T[K]) => updateField(field, value),
    onBlur: () => handleBlur(field),
  }), [formData, touched, errors, updateField, handleBlur]);

  // Check if form is valid by running validation on all fields
  const isValid = useMemo((): boolean => {
    // First check if there are any existing errors (with actual error messages, not undefined)
    const hasErrors = Object.values(errors).some(error => error !== undefined && error !== '');
    if (hasErrors) {
      console.log('Form has errors:', errors);
      return false;
    }

    // Then validate all fields that have validation rules
    let valid = true;
    const validationErrors: Record<string, string | undefined> = {};
    
    Object.keys(validationRules || {}).forEach((key) => {
      const field = key as keyof T;
      const error = validateField(field, formData[field]);
      validationErrors[key] = error;
      if (error) {
        valid = false;
      }
    });

    console.log('Validation check:', {
      validationRules: Object.keys(validationRules || {}),
      formData,
      validationErrors,
      valid
    });

    return valid;
  }, [errors, formData, validationRules, validateField]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  return {
    formData,
    errors,
    touched,
    isValid: isValid,
    isDirty,
    updateField,
    handleBlur,
    setForm,
    resetForm,
    validateField,
    validateAll,
    getFieldProps,
  };
}

// Common validation rules
export const validators = {
  required: <T>(value: T): boolean | string => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return true;
  },

  email: (value: string): boolean | string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Invalid email address';
  },

  minLength: (min: number) => (value: string): boolean | string => {
    return value.length >= min || `Minimum length is ${min} characters`;
  },

  maxLength: (max: number) => (value: string): boolean | string => {
    return value.length <= max || `Maximum length is ${max} characters`;
  },

  pattern: (regex: RegExp, message: string) => (value: string): boolean | string => {
    return regex.test(value) || message;
  },

  min: (minValue: number) => (value: number): boolean | string => {
    return value >= minValue || `Minimum value is ${minValue}`;
  },

  max: (maxValue: number) => (value: number): boolean | string => {
    return value <= maxValue || `Maximum value is ${maxValue}`;
  },

  custom: <T>(
    validatorFn: (value: T) => boolean,
    message: string
  ) => (value: T): boolean | string => {
    return validatorFn(value) || message;
  },
};