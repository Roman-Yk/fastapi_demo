import React from 'react';
import { Switch } from '@mantine/core';
import { FilterProps } from './types';

export interface BooleanFilterProps extends FilterProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  disabled?: boolean;
  thumbIcon?: React.ReactNode;
}

export const BooleanFilter: React.FC<BooleanFilterProps> = ({
  source,
  label,
  value = false,
  onChange,
  size = 'sm',
  color,
  disabled = false,
  thumbIcon,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.currentTarget.checked);
  };
  
  return (
    <Switch
      label={label || source}
      checked={value}
      onChange={handleChange}
      size={size}
      color={color}
      disabled={disabled}
      thumbIcon={thumbIcon}
      {...props}
    />
  );
};