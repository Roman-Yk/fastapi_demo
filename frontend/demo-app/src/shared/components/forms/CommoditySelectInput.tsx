import { Select } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';
import { CommodityLabels } from '../../../domains/orders/types/order';

interface CommoditySelectInputProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  description?: string;
}

export function CommoditySelectInput<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  placeholder = 'Select commodity',
  required = false,
  searchable = true,
  disabled,
  description
}: CommoditySelectInputProps<T, K>) {
  const { formData, updateField, errors, touched } = useFormContext<T>();

  const value = formData[source];
  const error = touched[source] ? errors[source] : undefined;

  const options = [
    { value: '', label: '-- Select Commodity --' },
    ...Object.entries(CommodityLabels).map(([key, label]) => ({
      value: key,
      label: label,
    }))
  ];

  const handleChange = (newValue: string | null) => {
    // If cleared (null, empty string, or '-- Select --'), set to null
    // Otherwise set the enum value
    const fieldValue = newValue && newValue !== '' ? newValue : null;
    updateField(source, fieldValue as T[K], { validate: true });
  };

  return (
    <Select
      label={label}
      placeholder={placeholder}
      data={options}
      value={value ? value.toString() : ''}
      onChange={handleChange}
      onBlur={() => {}}
      required={required}
      searchable={searchable}
      clearable={false}
      disabled={disabled}
      maxDropdownHeight={200}
      description={description}
      error={error}
    />
  );
}
