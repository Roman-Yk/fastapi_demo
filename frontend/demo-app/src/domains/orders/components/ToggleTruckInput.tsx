import React from 'react';
import { Group, Button, Box } from '@mantine/core';
import { IconEdit, IconList } from '@tabler/icons-react';
import { FormTextField, TruckReferenceInput } from '../../../shared/components';

interface ToggleTruckInputProps {
  label: string;
  truckName: string | null;
  truckIdSource: string;
  isManualMode: boolean;
  onToggleMode: () => void;
  onTruckNameChange: (value: string | null) => void;
}

export const ToggleTruckInput: React.FC<ToggleTruckInputProps> = ({
  label,
  truckName,
  truckIdSource,
  isManualMode,
  onToggleMode,
  onTruckNameChange,
}) => {
  return (
    <Group gap="xs" wrap="nowrap">
      <Box style={{ flex: 1 }}>
        {!isManualMode ? (
          <TruckReferenceInput
            label={label}
            source={truckIdSource as any}
            placeholder="Select truck"
          />
        ) : (
          <FormTextField
            label={label}
            placeholder="Enter truck name"
            value={truckName || ''}
            onChange={onTruckNameChange}
          />
        )}
      </Box>
      <Button
        variant="light"
        size="sm"
        onClick={onToggleMode}
        style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
      >
        {isManualMode ? <IconList size={16} /> : <IconEdit size={16} />}
      </Button>
    </Group>
  );
};
