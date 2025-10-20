import React from 'react';
import { Text, Stack, Group, Skeleton } from '@mantine/core';
import { IconTruck } from '@tabler/icons-react';
import { useTruck } from '../../../domains/vehicles/hooks/useTrucks';
import { useTrailer } from '../../../domains/vehicles/hooks/useTrailers';
import { FieldProps } from './types';

export interface ReferenceVehicleFieldProps extends FieldProps {
  prefix?: 'eta' | 'etd';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
}

export const ReferenceVehicleField: React.FC<ReferenceVehicleFieldProps> = ({ 
  record,
  source,
  prefix,
  size = 'sm',
  showIcon = true,
  ...props 
}) => {
  // Derive the field names
  const truckIdField = prefix ? `${prefix}_truck_id` : 'truck_id';
  const trailerIdField = prefix ? `${prefix}_trailer_id` : 'trailer_id';
  
  const truckId = record?.[truckIdField];
  const trailerId = record?.[trailerIdField];
  
  // Use optimized hooks - only fetch what's needed, with caching
  const { truck: truckRecord, loading: loadingTruck } = useTruck(truckId);
  const { trailer: trailerRecord, loading: loadingTrailer } = useTrailer(trailerId);

  const displayTruck = truckRecord?.license_plate;
  const displayTrailer = trailerRecord?.license_plate;

  if (loadingTruck || loadingTrailer) {
    return <Skeleton height={20} width={100} />;
  }

  if (!displayTruck && !displayTrailer && !truckId && !trailerId) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  return (
    <Stack gap={2}>
      {(displayTruck || truckId) && (
        <Group gap="xs">
          {showIcon && <IconTruck size={12} />}
          <Text size={size} {...props}>
            {displayTruck }
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