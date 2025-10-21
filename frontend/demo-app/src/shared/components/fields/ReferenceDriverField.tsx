import React from 'react';
import { Text, Stack, Group, Skeleton } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useDriver } from '../../../domains/drivers/hooks/useDrivers';
import { FieldProps } from './types';

export interface ReferenceDriverFieldProps extends FieldProps {
  prefix?: 'eta' | 'etd';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  showPhone?: boolean;
}

export const ReferenceDriverField: React.FC<ReferenceDriverFieldProps> = ({ 
  record,
  source,
  prefix,
  size = 'sm',
  showIcon = true,
  showPhone = true,
  ...props 
}) => {
  // Derive the field names
  const driverIdField = prefix ? `${prefix}_driver_id` : 'driver_id';
  const driverNameField = prefix ? `${prefix}_driver` : 'driver';
  const phoneField = prefix ? `${prefix}_driver_phone` : 'driver_phone';
  
  const driverId = record?.[driverIdField];
  const driverName = record?.[driverNameField];
  const phone = record?.[phoneField];
  
  // Use optimized hook - only fetches drivers data, with caching
  const { driver: driverRecord, loading } = useDriver(driverId);

  const displayName = driverName || driverRecord?.name;
  const displayPhone = phone || driverRecord?.phone;

  if (loading) {
    return <Skeleton height={20} width={100} />;
  }

  if (!displayName && !driverId) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  return (
    <Stack gap={2}>
      <Group gap="xs">
        {showIcon && <IconUser size={12} />}
        <Text size={size} {...props}>
          {displayName || `Driver ${driverId}`}
        </Text>
      </Group>
      {showPhone && displayPhone && (
        <Text size="xs" c="dimmed">
          {displayPhone}
        </Text>
      )}
    </Stack>
  );
};