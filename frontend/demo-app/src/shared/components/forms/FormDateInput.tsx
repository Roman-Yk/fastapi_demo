import { DateInput } from '@mantine/dates';
import { useFormContext } from '../../../hooks/useFormContext';

interface FormDateInputProps<T extends Record<string, any>, K extends keyof T> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function FormDateInput<T extends Record<string, any>, K extends keyof T>({
  label,
  source,
  placeholder,
  required,
  disabled,
  description,
  minDate,
  maxDate
}: FormDateInputProps<T, K>) {
  const { formData, updateField, errors, touched } = useFormContext<T>();
  const value = formData[source];
  const error = touched[source] ? errors[source] : undefined;

  const handleChange = (newValue: Date | null) => {
    updateField(source, newValue as T[K], { validate: true });
  };

  return (
    <DateInput
      label={label}
      placeholder={placeholder}
      value={value as Date | null}
      onChange={handleChange}
      onBlur={() => {}}
      required={required}
      disabled={disabled}
      description={description}
      error={error}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
}