import React from 'react';
import { Text, Stack } from '@mantine/core';
import { FieldProps } from './types';

export interface CombinedDateTimeFieldProps extends FieldProps {
  dateSource?: string;
  timeSource?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: number;
  color?: string;
}

export const CombinedDateTimeField: React.FC<CombinedDateTimeFieldProps> = ({ 
  record,
  source,
  dateSource,
  timeSource,
  size = 'sm',
  weight,
  color,
  ...props 
}) => {
  // Use either the provided dateSource/timeSource or derive from the main source
  const dateSrc = dateSource || source;
  const timeSrc = timeSource || source?.replace('_date', '_time');
  
  const date = record?.[dateSrc];
  const time = record?.[timeSrc];
  
  if (!date) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  return (
    <Stack gap={2}>
      <Text 
        size={size}
        fw={weight || 500}
        c={color}
        {...props}
      >
        {new Date(date).toLocaleDateString()}
      </Text>
      {time && (
        <Text size="xs" c="dimmed">
          {time.substring(0, 5)} {/* Show HH:MM */}
        </Text>
      )}
    </Stack>
  );
};