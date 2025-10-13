import { DateInput } from '@mantine/dates';

interface FormDateFieldProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  formData: T;
  updateField: (source: K, value: T[K], transform?: (value: any) => T[K]) => void;
  placeholder?: string;
  required?: boolean;
  transform?: (value: any) => T[K];
}

export function FormDateField<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  formData,
  updateField,
  placeholder,
  required,
  transform
}: FormDateFieldProps<T, K>) {
  const value = formData[source];

  const handleChange = (newValue: Date | null) => {
    updateField(source, newValue as T[K], transform);
  };

  return (
    <DateInput
      label={label}
      placeholder={placeholder}
      value={value as Date | null}
      onChange={handleChange}
      required={required}
    />
  );
}