import { TextInput, Textarea, NumberInput } from '@mantine/core';
import { useFormContext } from '../../../hooks/useFormContext';

interface ContextFormTextFieldProps<K extends string> {
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
  transform?: (value: any) => any;
}

export function ContextFormTextField<K extends string>({
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
  transform
}: ContextFormTextFieldProps<K>) {
  const { formData, updateField } = useFormContext();
  const value = formData[source];

  const handleChange = (newValue: string | number) => {
    updateField(source, newValue, transform);
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