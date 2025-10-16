import { Select } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';

interface ContextFormSelectFieldProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  data: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  description?: string;
}

export function ContextFormSelectField<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  data,
  placeholder,
  required,
  searchable = false,
  clearable = false,
  disabled,
  description
}: ContextFormSelectFieldProps<T, K>) {
  const { formData, updateField, errors, touched } = useFormContext<T>();
  const value = formData[source];
  const error = touched[source] ? errors[source] : undefined;

  const handleChange = (newValue: string | null) => {
    updateField(source, newValue as T[K], { validate: true });
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