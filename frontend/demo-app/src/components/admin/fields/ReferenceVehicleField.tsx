import React from 'react';
import { Text, Stack, Group, Skeleton } from '@mantine/core';
import { IconTruck } from '@tabler/icons-react';
import { useReferenceData } from '../../../context/ReferenceDataContext';
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
  
  // Use context-based reference data
  const { trucks, trailers, loading } = useReferenceData();

  const truckRecord = trucks?.find((t) => t.id === truckId) || null;
  const trailerRecord = trailers?.find((t) => t.id === trailerId) || null;

  const displayTruck = truckRecord?.license_plate;
  const displayTrailer = trailerRecord?.license_plate;

  if (loading.trucks || loading.trailers) {
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