import React from 'react';
import { Text, Stack } from '@mantine/core';
import dayjs from 'dayjs';
import { FieldProps } from './types';

export interface DateTimeFieldProps extends FieldProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: number;
  color?: string;
  dateFormat?: string;
  timeFormat?: string;
  showTime?: boolean;
  showDate?: boolean;
}

export const DateTimeField: React.FC<DateTimeFieldProps> = ({ 
  value, 
  record, 
  source,
  size = 'sm',
  weight,
  color,
  dateFormat = 'MMM D, YYYY',
  timeFormat = 'HH:mm',
  showTime = true,
  showDate = true,
  ...props 
}) => {
  // If we have a record and source, get the value from record[source]
  const rawValue = value !== undefined ? value : record?.[source];
  
  if (!rawValue) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  const date = dayjs(rawValue);
  
  if (!date.isValid()) {
    return <Text size={size} c="dimmed">Invalid Date</Text>;
  }
  
  return (
    <Stack gap={2}>
      {showDate && (
        <Text 
          size={size}
          fw={weight || 500}
          c={color}
          {...props}
        >
          {date.format(dateFormat)}
        </Text>
      )}
      {showTime && (
        <Text 
          size="xs" 
          c="dimmed"
        >
          {date.format(timeFormat)}
        </Text>
      )}
    </Stack>
  );
};

// Convenience component for date only
export const DateField: React.FC<DateTimeFieldProps> = (props) => (
  <DateTimeField {...props} showTime={false} />
);

// Convenience component for time only
export const TimeField: React.FC<DateTimeFieldProps> = (props) => (
  <DateTimeField {...props} showDate={false} />
);