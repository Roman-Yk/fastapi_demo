import React from 'react';
import { Group, Button, Box } from '@mantine/core';
import { IconEdit, IconList } from '@tabler/icons-react';
import { FormTextField, TrailerReferenceInput } from '../../../shared/components';

interface ToggleTrailerInputProps {
  label: string;
  trailerName: string | null;
  trailerIdSource: string;
  isManualMode: boolean;
  onToggleMode: () => void;
  onTrailerNameChange: (value: string | null) => void;
}

export const ToggleTrailerInput: React.FC<ToggleTrailerInputProps> = ({
  label,
  trailerName,
  trailerIdSource,
  isManualMode,
  onToggleMode,
  onTrailerNameChange,
}) => {
  return (
    <Group gap="xs" wrap="nowrap">
      <Box style={{ flex: 1 }}>
        {!isManualMode ? (
          <TrailerReferenceInput
            label={label}
            source={trailerIdSource as any}
            placeholder="Select trailer"
          />
        ) : (
          <FormTextField
            label={label}
            placeholder="Enter trailer name"
            value={trailerName || ''}
            onChange={onTrailerNameChange}
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
