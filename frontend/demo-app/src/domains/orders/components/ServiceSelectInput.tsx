import { FormSelectInput } from '../../../shared/components';
import { OrderServiceLabels } from '../types/order';

interface ServiceSelectInputProps<T extends Record<string, any>, K extends keyof T> {
  source: K;
  label?: string;
  placeholder?: string;
  required?: boolean;
  nullable?: boolean; // Whether the field can be null (for edit mode)
}

/**
 * Service type select input
 * Automatically converts string values to numbers and provides OrderService options
 */
export function ServiceSelectInput<T extends Record<string, any>, K extends keyof T>({
  source,
  label = 'Service Type',
  placeholder = 'Select service',
  required = false,
  nullable = false
}: ServiceSelectInputProps<T, K>) {
  const serviceOptions = Object.entries(OrderServiceLabels).map(([value, label]) => ({
    value,
    label
  }));

  return (
    <FormSelectInput<T, K>
      label={label}
      source={source}
      placeholder={placeholder}
      required={required}
      data={serviceOptions}
      parseValue={(value) => {
        if (!value) return (nullable ? null : 0) as T[K];
        return parseInt(value, 10) as T[K];
      }}
    />
  );
}
