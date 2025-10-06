import React from 'react';
import { Text } from '@mantine/core';
import { FieldProps } from './types';

export interface TextFieldProps extends FieldProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: number;
  color?: string;
  lineClamp?: number;
  transform?: 'capitalize' | 'lowercase' | 'uppercase' | 'none';
}

export const TextField: React.FC<TextFieldProps> = ({ 
  value, 
  record, 
  source,
  size = 'sm',
  weight,
  color,
  lineClamp,
  transform,
  ...props 
}) => {
  // If we have a record and source, get the value from record[source]
  const displayValue = value !== undefined ? value : record?.[source];
  
  if (displayValue == null) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  return (
    <Text 
      size={size}
      fw={weight}
      c={color}
      lineClamp={lineClamp}
      tt={transform}
      {...props}
    >
      {displayValue}
    </Text>
  );
};