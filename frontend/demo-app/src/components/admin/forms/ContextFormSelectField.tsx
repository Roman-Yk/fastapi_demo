import { Select } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';

interface ContextFormSelectFieldProps<K extends string> {
  label: string;
  source: K;
  data: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  transform?: (value: any) => any;
}

export function ContextFormSelectField<K extends string>({
  label,
  source,
  data,
  placeholder,
  required,
  searchable = false,
  clearable = false,
  transform
}: ContextFormSelectFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const value = formData[source];

  const handleChange = (newValue: string | null) => {
    updateField(source, newValue, transform);
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