import { NumberInput } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';

/**
 * Form input for integer numbers (pallets, boxes, etc.)
 * Automatically integrates with form context and returns number type
 */
interface FormNumberInputProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
  description?: string;
}

export function FormNumberInput<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  placeholder,
  required,
  min = 0,
  max,
  disabled,
  description
}: FormNumberInputProps<T, K>) {
  const { formData, updateField, errors, touched } = useFormContext<T>();
  const value = formData[source];
  const error = touched[source] ? errors[source] : undefined;

  const handleChange = (newValue: number | string) => {
    updateField(source, newValue as T[K], { validate: true });
  };

  return (
    <NumberInput
      label={label}
      placeholder={placeholder}
      value={value as number}
      onChange={handleChange}
      onBlur={() => {}}
      required={required}
      min={min}
      max={max}
      decimalScale={0}
      allowDecimal={false}
      allowNegative={false}
      disabled={disabled}
      description={description}
      error={error}
    />
  );
}
