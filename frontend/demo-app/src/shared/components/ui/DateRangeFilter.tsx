import React from 'react';
import { Group, Button } from '@mantine/core';
import { FilterProps } from './types';

export interface DateRangeOption {
  value: string;
  label: string;
  color?: string;
}

export interface DateRangeFilterProps extends FilterProps {
  options: DateRangeOption[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  source,
  label,
  value,
  onChange,
  options,
  size = 'sm',
  radius = 'xl',
  gap = 'xs',
  ...props
}) => {
  const handleOptionClick = (optionValue: string) => {
    onChange?.(optionValue);
  };
  
  return (
    <Group gap={gap} {...props}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "filled" : "light"}
          onClick={() => handleOptionClick(option.value)}
          size={size}
          radius={radius}
          color={value === option.value ? 
            (option.color || "blue") : "gray"}
        >
          {option.label}
        </Button>
      ))}
    </Group>
  );
};