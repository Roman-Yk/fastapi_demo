import React from 'react';
import { Text } from '@mantine/core';
import { FieldProps } from './types';

export interface NumberFieldProps extends FieldProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: number;
  color?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  thousandSeparator?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({ 
  value, 
  record, 
  source,
  size = 'sm',
  weight,
  color,
  decimals,
  prefix = '',
  suffix = '',
  thousandSeparator = ',',
  ...props 
}) => {
  // If we have a record and source, get the value from record[source]
  const rawValue = value !== undefined ? value : record?.[source];
  
  if (rawValue == null) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  const numValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
  
  if (isNaN(numValue)) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  // Format the number
  let formattedValue = numValue.toString();
  
  // Handle decimals
  if (decimals !== undefined) {
    formattedValue = numValue.toFixed(decimals);
  }
  
  // Add thousand separator
  if (thousandSeparator) {
    const parts = formattedValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    formattedValue = parts.join('.');
  }
  
  // Add prefix and suffix
  const displayValue = `${prefix}${formattedValue}${suffix}`;
  
  return (
    <Text 
      size={size}
      fw={weight}
      c={color}
      {...props}
    >
      {displayValue}
    </Text>
  );
};