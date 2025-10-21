import React from 'react';
import { Text, Stack, Group } from '@mantine/core';
import { IconTruck } from '@tabler/icons-react';
import { FieldProps } from './types';

export interface ReferenceVehicleFieldOptimizedProps extends FieldProps {
  prefix?: 'eta' | 'etd';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  getTruck: (id: string | null | undefined) => any;
  getTrailer: (id: string | null | undefined) => any;
}

/**
 * Optimized vehicle field for grids with many rows
 * 
 * Instead of calling useTruck()/useTrailer() for each row (which would be inefficient),
 * this component receives lookup functions from a parent that batched all the data fetching.
 * 
 * Usage in OrderGrid:
 * ```tsx
 * const { getTruck, getTrailer, loading } = useReferenceDataMany();
 * 
 * <ReferenceVehicleFieldOptimized
 *   record={record}
 *   getTruck={getTruck}
 *   getTrailer={getTrailer}
 * />
 * ```
 */
export const ReferenceVehicleFieldOptimized: React.FC<ReferenceVehicleFieldOptimizedProps> = ({ 
  record,
  source,
  prefix,
  size = 'sm',
  showIcon = true,
  getTruck,
  getTrailer,
  ...props 
}) => {
  // Derive the field names
  const truckIdField = prefix ? `${prefix}_truck_id` : 'truck_id';
  const trailerIdField = prefix ? `${prefix}_trailer_id` : 'trailer_id';
  
  const truckId = record?.[truckIdField];
  const trailerId = record?.[trailerIdField];
  
  // Get records from lookup - no API calls, instant!
  const truckRecord = getTruck(truckId);
  const trailerRecord = getTrailer(trailerId);

  const displayTruck = truckRecord?.license_plate;
  const displayTrailer = trailerRecord?.license_plate;

  if (!displayTruck && !displayTrailer && !truckId && !trailerId) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  return (
    <Stack gap={2}>
      {(displayTruck || truckId) && (
        <Group gap="xs">
          {showIcon && <IconTruck size={12} />}
          <Text size={size} {...props}>
            {displayTruck}
          </Text>
        </Group>
      )}
      {(displayTrailer || trailerId) && (
        <Text size="xs" c="dimmed">
          {displayTrailer}
        </Text>
      )}
    </Stack>
  );
};
