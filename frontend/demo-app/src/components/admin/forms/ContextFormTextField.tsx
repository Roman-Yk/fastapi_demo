import { TextInput, Textarea, NumberInput } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';

interface ContextFormTextFieldProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
  decimalScale?: number;
  disabled?: boolean;
  description?: string;
}

export function ContextFormTextField<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  placeholder,
  required,
  multiline,
  rows = 3,
  type = 'text',
  min,
  max,
  decimalScale,
  disabled,
  description
}: ContextFormTextFieldProps<T, K>) {
  const { formData, updateField, errors, touched } = useFormContext<T>();
  const value = formData[source];
  const error = touched[source] ? errors[source] : undefined;

  const handleChange = (newValue: string | number | undefined) => {
    updateField(source, newValue as T[K], { validate: true });
  };

  if (multiline) {
    return (
      <Textarea
        label={label}
        placeholder={placeholder}
        value={(value as string) || ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => {}}
        required={required}
        rows={rows}
        disabled={disabled}
        description={description}
        error={error}
      />
    );
  }

  if (type === 'number') {
    return (
      <NumberInput
        label={label}
        placeholder={placeholder}
        value={value as number}
        onChange={(val) => handleChange(val)}
        onBlur={() => {}}
        required={required}
        min={min}
        max={max}
        decimalScale={decimalScale}
        disabled={disabled}
        description={description}
        error={error}
      />
    );
  }

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={(value as string) || ''}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => {}}
      required={required}
      disabled={disabled}
      description={description}
      error={error}
    />
  );
}