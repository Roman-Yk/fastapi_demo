import React from 'react';
import { TextInput, Textarea, NumberInput } from '@mantine/core';

interface TextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
  decimalScale?: number;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  multiline,
  rows = 3,
  type = 'text',
  min,
  max,
  decimalScale
}) => {
  if (multiline) {
    return (
      <Textarea
        label={label}
        placeholder={placeholder}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
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
        value={value}
        onChange={(val) => onChange(val?.toString() || '')}
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
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  );
};