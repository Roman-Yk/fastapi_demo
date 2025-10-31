import { Select } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';

interface FormSelectInputProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  data: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  description?: string;
  parseValue?: (value: string | null) => T[K]; // Optional function to transform the value
}

export function FormSelectInput<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  data,
  placeholder,
  required,
  searchable = false,
  clearable = false,
  disabled,
  description,
  parseValue
}: FormSelectInputProps<T, K>) {
  const { formData, updateField, errors, touched } = useFormContext<T>();
  const value = formData[source];
  const error = touched[source] ? errors[source] : undefined;

  const handleChange = (newValue: string | null) => {
    const parsedValue = parseValue ? parseValue(newValue) : (newValue as T[K]);
    updateField(source, parsedValue, { validate: true });
  };

  return (
    <Select
      label={label}
      placeholder={placeholder}
      data={data}
      value={value?.toString() || null}
      onChange={handleChange}
      onBlur={() => {}}
      required={required}
      searchable={searchable}
      clearable={clearable}
      disabled={disabled}
      description={description}
      error={error}
    />
  );
}