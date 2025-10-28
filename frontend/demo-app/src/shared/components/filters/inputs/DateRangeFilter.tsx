import React from 'react';
import { SegmentedControl } from '@mantine/core';
import { FilterProps } from '../types';

export interface DateRangeOption {
  value: string;
  label: string;
  color?: string;
}

export interface DateRangeFilterProps extends FilterProps {
  options: DateRangeOption[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  fullWidth?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  source: _source,
  label: _label,
  value,
  onChange,
  options,
  size = 'md',
  radius = 'lg',
  color = 'blue',
  fullWidth = false,
  orientation = 'horizontal',
  ...props
}) => {
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  // Convert options to SegmentedControl data format
  const data = options.map(option => ({
    value: option.value,
    label: option.label
  }));

  return (
    <SegmentedControl
      value={value}
      onChange={handleChange}
      data={data}
      size={size}
      radius={radius}
      color={color}
      fullWidth={fullWidth}
      orientation={orientation}
      transitionDuration={200}
      transitionTimingFunction="ease"
      {...props}
    />
  );
};