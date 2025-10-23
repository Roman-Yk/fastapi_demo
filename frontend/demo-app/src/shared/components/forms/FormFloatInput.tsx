import { NumberInput } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';

/**
 * Form input for decimal numbers (kilos, prices, measurements, etc.)
 * Automatically integrates with form context and returns number type
 */
interface FormFloatInputProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  decimalScale?: number;
  disabled?: boolean;
  description?: string;
}

export function FormFloatInput<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  placeholder,
  required,
  min = 0,
  max,
  decimalScale = 2,
  disabled,
  description
}: FormFloatInputProps<T, K>) {
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
      decimalScale={decimalScale}
      allowDecimal={true}
      allowNegative={false}
      disabled={disabled}
      description={description}
      error={error}
    />
  );
}
