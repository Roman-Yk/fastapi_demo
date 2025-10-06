import React from 'react';
import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { FilterProps } from './types';

export interface TextFilterProps extends FilterProps {
  placeholder?: string;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  width?: number;
  disabled?: boolean;
}

export const TextFilter: React.FC<TextFilterProps> = ({
  source,
  label,
  value = '',
  onChange,
  placeholder,
  leftSection = <IconSearch size={16} />,
  rightSection,
  size = 'sm',
  width = 250,
  disabled = false,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.currentTarget.value);
  };
  
  return (
    <TextInput
      placeholder={placeholder || `Search ${label || source}...`}
      value={value}
      onChange={handleChange}
      leftSection={leftSection}
      rightSection={rightSection}
      size={size}
      w={width}
      disabled={disabled}
      {...props}
    />
  );
};