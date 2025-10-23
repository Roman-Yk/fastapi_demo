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
    // Skip empty strings and undefined if configured, but keep null values
    if (skipEmpty && (value === '' || value === undefined)) {
      return acc;
    }

    // Explicitly include null values (to clear fields in API)
    if (value === null) {
      acc[key] = null;
    }
    // Handle Date objects
    else if (value instanceof Date) {
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
 * Note: numericFields no longer needed since FormNumberInput/FormFloatInput
 * components automatically return proper number types
 */
export const ORDER_FORM_CONFIG: FieldTransformConfig = {
  skipEmpty: true
};

/**
 * Populate form data from API response (react-admin style)
 * 
 * Automatically handles:
 * - String date fields → Date objects
 * - Null/undefined values → appropriate defaults
 * 
 * @param apiData - The API response data
 * @param dateFields - Fields that should be converted from ISO strings to Date objects
 * @returns Form data ready for FormProvider
 * 
 * @example
 * ```ts
 * const formData = populateFormFromApi(orderData, ['eta_date', 'etd_date']);
 * setForm(() => formData);
 * ```
 */
export function populateFormFromApi<T = any>(
  apiData: Record<string, any>,
  dateFields: string[] = []
): T {
  return Object.entries(apiData).reduce((acc, [key, value]) => {
    // Convert ISO date strings to Date objects
    if (dateFields.includes(key) && value) {
      acc[key] = new Date(value);
    }
    // Keep null as null (don't convert to empty string)
    // This allows us to distinguish between "no value from API" and "user cleared field"
    else if (value === null) {
      acc[key] = null;
    }
    // Convert undefined to null for consistency
    else if (value === undefined) {
      acc[key] = null;
    }
    // Pass through all other values
    else {
      acc[key] = value;
    }
    
    return acc;
  }, {} as any) as T;
}

/**
 * Date fields for order forms
 */
export const ORDER_DATE_FIELDS = ['eta_date', 'etd_date'];
