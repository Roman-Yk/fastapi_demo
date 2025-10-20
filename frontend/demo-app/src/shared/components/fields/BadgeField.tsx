import React from 'react';
import { Badge } from '@mantine/core';
import { FieldProps } from './types';

export interface BadgeFieldProps extends FieldProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'filled' | 'outline' | 'dot' | 'default';
  color?: string;
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  // Mapping from value to display options
  valueMap?: Record<any, { label?: string; color?: string; variant?: string }>;
}

export const BadgeField: React.FC<BadgeFieldProps> = ({ 
  value, 
  record, 
  source,
  size = 'sm',
  variant = 'light',
  color = 'blue',
  radius,
  valueMap,
  ...props 
}) => {
  // If we have a record and source, get the value from record[source]
  const rawValue = value !== undefined ? value : record?.[source];
  
  if (rawValue == null) {
    return null;
  }
  
  // Check if we have a mapping for this value
  const mapping = valueMap?.[rawValue];
  
  const displayLabel = mapping?.label || rawValue.toString();
  const badgeColor = mapping?.color || color;
  const badgeVariant = mapping?.variant || variant;
  
  return (
    <Badge 
      size={size}
      variant={badgeVariant as any}
      color={badgeColor}
      radius={radius}
      {...props}
    >
      {displayLabel}
    </Badge>
  );
};