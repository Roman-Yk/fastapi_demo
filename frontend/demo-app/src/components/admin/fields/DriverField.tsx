import React from 'react';
import { Text, Stack, Group } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { FieldProps } from './types';

export interface DriverFieldProps extends FieldProps {
  prefix?: 'eta' | 'etd';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
}

export const DriverField: React.FC<DriverFieldProps> = ({ 
  record,
  source,
  prefix,
  size = 'sm',
  showIcon = true,
  ...props 
}) => {
  // Derive the driver and phone field names
  const driverField = prefix ? `${prefix}_driver` : 'driver';
  const phoneField = prefix ? `${prefix}_driver_phone` : 'driver_phone';
  
  const driver = record?.[driverField];
  const phone = record?.[phoneField];
  
  if (!driver) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  return (
    <Stack gap={2}>
      <Group gap="xs">
        {showIcon && <IconUser size={12} />}
        <Text size={size} {...props}>
          {driver}
        </Text>
      </Group>
      {phone && (
        <Text size="xs" c="dimmed">
          {phone}
        </Text>
      )}
    </Stack>
  );
};