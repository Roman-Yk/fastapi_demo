/**
 * Shared validation types and interfaces
 * Used across all domain validation logic
 */

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validator function that takes a value and returns validation result
 * Can be synchronous or asynchronous
 */
export type ValidatorFn<T = any> = (
  value: T,
  context?: any
) => ValidationResult | Promise<ValidationResult>;

/**
 * Validation rule configuration
 */
export interface ValidationRule<T = any> {
  validator: ValidatorFn<T>;
  message?: string;
  debounceMs?: number; // For async validators
}

/**
 * Async validation result with loading state
 */
export interface AsyncValidationResult extends ValidationResult {
  loading?: boolean;
}
