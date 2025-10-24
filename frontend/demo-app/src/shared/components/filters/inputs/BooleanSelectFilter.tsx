import React from 'react';
import { Select } from '@mantine/core';
import { FilterProps } from '../types';

export interface BooleanSelectFilterProps extends FilterProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  placeholder?: string;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  value?: boolean | null;
  onChange?: (value: boolean | null) => void;
  width?: number;
}

export const BooleanSelectFilter: React.FC<BooleanSelectFilterProps> = ({
  source,
  label,
  value = null,
  onChange,
  size = 'sm',
  disabled = false,
  placeholder = 'Select option',
  leftSection,
  rightSection,
  width,
  ...props
}) => {
  const handleChange = (newValue: string | null) => {
    // Convert string to boolean type
    if (newValue === 'true') {
      onChange?.(true);
    } else if (newValue === 'false') {
      onChange?.(false);
    } else {
      onChange?.(null);
    }
  };

  // Convert boolean to string for Select component
  const displayValue = value === null ? null : String(value);

  const data = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  return (
    <Select
      label={label}
      value={displayValue}
      onChange={handleChange}
      data={data}
      size={size}
      disabled={disabled}
      placeholder={placeholder}
      leftSection={leftSection}
      rightSection={rightSection}
      clearable
      style={{ width: width || 'auto' }}
      {...props}
    />
  );
};
