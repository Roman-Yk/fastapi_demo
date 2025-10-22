import React from 'react';
import { SegmentedControl, Center, Box } from '@mantine/core';
import { FilterProps } from '../types';

export interface AnimatedDateRangeOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface AnimatedDateRangeFilterProps extends FilterProps {
  options: AnimatedDateRangeOption[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  fullWidth?: boolean;
  orientation?: 'horizontal' | 'vertical';
  withItemsBorders?: boolean;
}

export const AnimatedDateRangeFilter: React.FC<AnimatedDateRangeFilterProps> = ({
  source,
  label,
  value,
  onChange,
  options,
  size = 'sm',
  radius = 'md',
  color = 'blue',
  fullWidth = false,
  orientation = 'horizontal',
  withItemsBorders = false,
  ...props
}) => {
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  // Convert options to SegmentedControl data format with icons
  const data = options.map(option => ({
    value: option.value,
    label: option.icon ? (
      <Center style={{ gap: 4 }}>
        <Box component="span" style={{ display: 'flex', alignItems: 'center' }}>
          {option.icon}
        </Box>
        <span>{option.label}</span>
      </Center>
    ) : option.label
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
      withItemsBorders={withItemsBorders}
      transitionDuration={250}
      transitionTimingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
      styles={{
        root: {
          backgroundColor: 'var(--mantine-color-gray-0)',
          padding: 3,
        },
        indicator: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        },
        label: {
          fontWeight: 500,
        },
        control: {
          '&:not(:first-of-type)': {
            borderLeft: withItemsBorders ? '1px solid var(--mantine-color-gray-3)' : 'none',
          },
        },
      }}
      {...props}
    />
  );
};