import React from 'react';
import { Text, Stack, Group } from '@mantine/core';
import { IconTruck } from '@tabler/icons-react';
import { FieldProps } from './types';

export interface VehicleFieldProps extends FieldProps {
  prefix?: 'eta' | 'etd';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
}

export const VehicleField: React.FC<VehicleFieldProps> = ({ 
  record,
  source,
  prefix,
  size = 'sm',
  showIcon = true,
  ...props 
}) => {
  // Derive the truck and trailer field names
  const truckField = prefix ? `${prefix}_truck` : 'truck';
  const trailerField = prefix ? `${prefix}_trailer` : 'trailer';
  
  const truck = record?.[truckField];
  const trailer = record?.[trailerField];
  
  if (!truck && !trailer) {
    return <Text size={size} c="dimmed">-</Text>;
  }
  
  return (
    <Stack gap={2}>
      {truck && (
        <Group gap="xs">
          {showIcon && <IconTruck size={12} />}
          <Text size={size} {...props}>
            {truck}
          </Text>
        </Group>
      )}
      {trailer && (
        <Text size="xs" c="dimmed">
          {trailer}
        </Text>
      )}
    </Stack>
  );
};