import React from 'react';
import { Select } from '@mantine/core';
import { FilterProps } from '../types';

export type YesNoSelectValue = 'yes' | 'no' | null;

export interface SelectYesNoFilterProps extends FilterProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  placeholder?: string;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  value?: YesNoSelectValue;
  onChange?: (value: YesNoSelectValue) => void;
  width?: number;
}

export const SelectYesNoFilter: React.FC<SelectYesNoFilterProps> = ({
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
    // Convert string to YesNoSelectValue type
    if (newValue === 'yes' || newValue === 'no') {
      onChange?.(newValue);
    } else {
      onChange?.(null);
    }
  };

  // Convert null to empty string for Select component
  const displayValue = value || '';

  const data = [
    { value: '', label: 'All' },
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  return (
    <Select
      label={label || source}
      value={displayValue}
      onChange={handleChange}
      data={data}
      size={size}
      disabled={disabled}
      placeholder={placeholder}
      leftSection={leftSection}
      rightSection={rightSection}
      clearable={false}
      style={{ width: width || 'auto' }}
      {...props}
    />
  );
};