import React from 'react';
import { SegmentedControl } from '@mantine/core';
import { FilterProps } from '../types';

export type YesNoValue = 'yes' | 'no' | 'all';

export interface YesNoFilterProps extends FilterProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  disabled?: boolean;
  value?: YesNoValue | null;
  onChange?: (value: YesNoValue | null) => void;
}

export const YesNoFilter: React.FC<YesNoFilterProps> = ({
  source,
  label,
  value = null,
  onChange,
  size = 'sm',
  color = 'blue',
  disabled = false,
  ...props
}) => {
  const handleChange = (newValue: string) => {
    // Convert 'all' to null for consistency with filter logic
    onChange?.(newValue === 'all' ? null : newValue as YesNoValue);
  };

  // Convert null to 'all' for display
  const displayValue = value === null ? 'all' : value;

  return (
    <SegmentedControl
      value={displayValue}
      onChange={handleChange}
      data={[
        { label: 'All', value: 'all' },
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
      ]}
      size={size}
      color={color}
      disabled={disabled}
      {...props}
    />
  );
};