import { TextInput, Textarea, NumberInput } from '@mantine/core';

interface FormTextFieldProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  formData: T;
  updateField: (source: K, value: T[K], transform?: (value: any) => T[K]) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
  decimalScale?: number;
  transform?: (value: any) => T[K];
}

export function FormTextField<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  formData,
  updateField,
  placeholder,
  required,
  multiline,
  rows = 3,
  type = 'text',
  min,
  max,
  decimalScale,
  transform
}: FormTextFieldProps<T, K>) {
  const value = formData[source];

  const handleChange = (newValue: string | number) => {
    updateField(source, newValue as T[K], transform);
  };

  if (multiline) {
    return (
      <Textarea
        label={label}
        placeholder={placeholder}
        value={value as string || ''}
        onChange={(e) => handleChange(e.target.value)}
        required={required}
        rows={rows}
      />
    );
  }

  if (type === 'number') {
    return (
      <NumberInput
        label={label}
        placeholder={placeholder}
        value={value as number}
        onChange={(val) => handleChange(val?.toString() || '')}
        required={required}
        min={min}
        max={max}
        decimalScale={decimalScale}
      />
    );
  }

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={value as string || ''}
      onChange={(e) => handleChange(e.target.value)}
      required={required}
    />
  );
}