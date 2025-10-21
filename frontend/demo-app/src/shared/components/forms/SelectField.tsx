import React from 'react';
import { Select } from '@mantine/core';

interface SelectFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  data: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  data,
  placeholder,
  required,
  searchable = false,
  clearable = false
}) => {
  return (
    <Select
      label={label}
      placeholder={placeholder}
      data={data}
      value={value}
      onChange={onChange}
      required={required}
      searchable={searchable}
      clearable={clearable}
    />
  );
};