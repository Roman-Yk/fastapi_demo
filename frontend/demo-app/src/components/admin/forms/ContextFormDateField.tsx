import { DateInput } from '@mantine/dates';
import { useFormContext } from '../../../hooks/useFormContext';

interface ContextFormDateFieldProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  transform?: (value: any) => any;
}

export function ContextFormDateField<K extends string>({
  label,
  source,
  placeholder,
  required,
  transform
}: ContextFormDateFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const value = formData[source];

  const handleChange = (newValue: Date | null) => {
    updateField(source, newValue, transform);
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