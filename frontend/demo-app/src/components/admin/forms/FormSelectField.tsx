import { Select } from '@mantine/core';

interface FormSelectFieldProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  formData: T;
  updateField: (source: K, value: T[K], transform?: (value: any) => T[K]) => void;
  data: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  transform?: (value: any) => T[K];
}

export function FormSelectField<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  formData,
  updateField,
  data,
  placeholder,
  required,
  searchable = false,
  clearable = false,
  transform
}: FormSelectFieldProps<T, K>) {
  const value = formData[source];

  const handleChange = (newValue: string | null) => {
    updateField(source, newValue as T[K], transform);
  };

  return (
    <Select
      label={label}
      placeholder={placeholder}
      data={data}
      value={value?.toString() || ''}
      onChange={handleChange}
      required={required}
      searchable={searchable}
      clearable={clearable}
    />
  );
}