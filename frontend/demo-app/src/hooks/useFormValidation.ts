/**
 * Form validation hook using Zod schemas
 */

import { useState, useCallback } from 'react';
import { z, ZodSchema } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseFormValidationOptions<T> {
  schema: ZodSchema<T>;
  onValidationSuccess?: (data: T) => void;
  onValidationError?: (errors: ValidationError[]) => void;
}

export interface UseFormValidationReturn<T> {
  validate: (data: unknown) => T | null;
  validateField: (field: keyof T, value: unknown) => string | null;
  errors: ValidationError[];
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  isValid: boolean;
}

/**
 * Hook for form validation using Zod schemas
 *
 * @example
 * ```tsx
 * const { validate, errors, validateField } = useFormValidation({
 *   schema: createOrderSchema,
 *   onValidationSuccess: (data) => console.log('Valid:', data),
 *   onValidationError: (errors) => console.log('Errors:', errors),
 * });
 *
 * const handleSubmit = () => {
 *   const validData = validate(formData);
 *   if (validData) {
 *     // Submit the form
 *   }
 * };
 * ```
 */
export function useFormValidation<T>({
  schema,
  onValidationSuccess,
  onValidationError,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validate = useCallback(
    (data: unknown): T | null => {
      try {
        const validData = schema.parse(data);
        setErrors([]);
        onValidationSuccess?.(validData);
        return validData;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors: ValidationError[] = error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          }));
          setErrors(validationErrors);
          onValidationError?.(validationErrors);
        }
        return null;
      }
    },
    [schema, onValidationSuccess, onValidationError]
  );

  const validateField = useCallback(
    (field: keyof T, value: unknown): string | null => {
      try {
        // Create a partial schema for single field validation
        // For object schemas, we can use pick to get single field
        if ('shape' in schema && typeof schema.shape === 'object') {
          const fieldSchema = (schema as z.ZodObject<any>).shape[field as string];
          if (fieldSchema) {
            fieldSchema.parse(value);
            // Clear error for this field
            setErrors((prev) => prev.filter((e) => e.field !== field));
            return null;
          }
        }
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const message = error.issues[0]?.message || 'Validation error';
          // Update error for this field
          setErrors((prev) => {
            const filtered = prev.filter((e) => e.field !== field);
            return [...filtered, { field: String(field), message }];
          });
          return message;
        }
        return null;
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }, []);

  const isValid = errors.length === 0;

  return {
    validate,
    validateField,
    errors,
    clearErrors,
    clearFieldError,
    isValid,
  };
}
