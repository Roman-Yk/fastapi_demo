import React from 'react';
import { Select } from '@mantine/core';
import { FilterProps } from '../types';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectFilterProps extends FilterProps {
  options: SelectOption[] | Record<string | number, string>;
  placeholder?: string;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  width?: number;
  disabled?: boolean;
  clearable?: boolean;
}

export const SelectFilter: React.FC<SelectFilterProps> = ({
  source,
  label,
  value = null,
  onChange,
  options,
  placeholder,
  leftSection,
  rightSection,
  size = 'sm',
  width = 180,
  disabled = false,
  clearable = true,
  ...props
}) => {
  // Convert options to the format expected by Mantine Select
  const selectOptions = Array.isArray(options)
    ? options.map(opt => ({ 
        value: opt.value.toString(), 
        label: opt.label 
      }))
    : Object.entries(options).map(([key, label]) => ({ 
        value: key, 
        label 
      }));
  
  const handleChange = (selectedValue: string | null) => {
    onChange?.(selectedValue);
  };
  
  return (
    <Select
      placeholder={placeholder || `Select ${label || source}`}
      data={selectOptions}
      value={value?.toString() || null}
      onChange={handleChange}
      leftSection={leftSection}
      rightSection={rightSection}
      size={size}
      w={width}
      disabled={disabled}
      clearable={clearable}
      {...props}
    />
  );
};