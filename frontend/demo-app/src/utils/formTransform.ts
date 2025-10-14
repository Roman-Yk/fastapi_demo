/**
 * Configuration for transforming form data fields
 */
interface FieldTransformConfig {
  /** Fields that should be converted from Date objects to ISO date strings */
  dateFields?: string[];
  /** Fields that should be converted from strings to numbers */
  numericFields?: string[];
  /** Fields that should be excluded from the output if empty */
  skipEmpty?: boolean;
}

/**
 * Transform form data to API-ready format
 * 
 * Automatically handles:
 * - Date objects → ISO date strings (YYYY-MM-DD)
 * - Numeric string fields → numbers
 * - Empty strings and null values → excluded from output
 * 
 * @param formData - The raw form data object
 * @param config - Optional configuration for field transformations
 * @returns Transformed data ready for API submission
 * 
 * @example
 * ```ts
 * const apiData = transformFormData(formData, {
 *   numericFields: ['pallets', 'boxes', 'kilos']
 * });
 * ```
 */
export function transformFormData<T = any>(
  formData: Record<string, any>,
  config: FieldTransformConfig = {}
): T {
  const {
    dateFields = [],
    numericFields = [],
    skipEmpty = true
  } = config;

  return Object.entries(formData).reduce((acc, [key, value]) => {
    // Skip empty values if configured
    if (skipEmpty && (value === '' || value === null || value === undefined)) {
      return acc;
    }

    // Handle Date objects
    if (value instanceof Date) {
      acc[key] = value.toISOString().split('T')[0];
    }
    // Handle configured date fields
    else if (dateFields.includes(key) && value instanceof Date) {
      acc[key] = value.toISOString().split('T')[0];
    }
    // Handle configured numeric fields
    else if (numericFields.includes(key) && value) {
      acc[key] = typeof value === 'number' ? value : parseFloat(value.toString());
    }
    // All other non-empty values pass through
    else if (!skipEmpty || value !== '') {
      acc[key] = value;
    }

    return acc;
  }, {} as any) as T;
}

/**
 * Preset configuration for order forms
 */
export const ORDER_FORM_CONFIG: FieldTransformConfig = {
  numericFields: ['pallets', 'boxes', 'kilos'],
  skipEmpty: true
};
