import React from 'react';
import { Text, Stack, Group } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { FieldProps } from './types';

export interface ReferenceDriverFieldOptimizedProps extends FieldProps {
  prefix?: 'eta' | 'etd';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  showPhone?: boolean;
  getDriver: (id: string | null | undefined) => any;
}

/**
 * Optimized driver field for grids with many rows
 * 
 * Instead of calling useDriver() for each row (which would be inefficient),
 * this component receives a getDriver function from a parent that batched
 * all the data fetching.
 * 
 * Usage in OrderGrid:
 * ```tsx
 * const { getDriver, loading } = useDriversMany();
 * 
 * <ReferenceDriverFieldOptimized
 *   record={record}
 *   getDriver={getDriver}
 * />
 * ```
 */
export const ReferenceDriverFieldOptimized: React.FC<ReferenceDriverFieldOptimizedProps> = ({
  record,
  source: _source,
  prefix,
  size = 'sm',
  showIcon = true,
  showPhone = true,
  getDriver,
  ...props
}) => {
  // Derive the field names
  const driverIdField = prefix ? `${prefix}_driver_id` : 'driver_id';
  const driverNameField = prefix ? `${prefix}_driver` : 'driver';
  const phoneField = prefix ? `${prefix}_driver_phone` : 'driver_phone';
  
  const driverId = record?.[driverIdField];
  const driverName = record?.[driverNameField];
  const phone = record?.[phoneField];
  
  // Get driver from lookup - no API call, instant!
  const driverRecord = getDriver(driverId);

  const displayName = driverName || driverRecord?.name;
  const displayPhone = phone || driverRecord?.phone;

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
