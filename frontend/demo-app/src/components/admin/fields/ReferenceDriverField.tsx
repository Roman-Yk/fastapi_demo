import React from 'react';
import { Text, Stack, Group, Skeleton } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useReferenceData } from '../../../context/ReferenceDataContext';
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
  
  // Use context-based reference data
  const { drivers, loading } = useReferenceData();

  const driverRecord = drivers?.find((d) => d.id === driverId) || null;
  const displayName = driverName || driverRecord?.name;
  const displayPhone = phone || driverRecord?.phone;

  if (loading.drivers) {
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