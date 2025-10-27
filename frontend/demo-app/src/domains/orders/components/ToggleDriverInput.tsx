import React from 'react';
import { Group, Button } from '@mantine/core';
import { IconEdit, IconList } from '@tabler/icons-react';
import { FormTextField, PhoneNumberInput, DriverReferenceInput } from '../../../shared/components';

interface ToggleDriverInputProps {
  label: string;
  driverName: string | null;
  driverPhone: string | null;
  driverIdSource: string;
  isManualMode: boolean;
  onToggleMode: () => void;
  onDriverNameChange: (value: string | null) => void;
  onDriverPhoneChange: (value: string | null) => void;
}

export const ToggleDriverInput: React.FC<ToggleDriverInputProps> = ({
  label,
  driverName,
  driverPhone,
  driverIdSource,
  isManualMode,
  onToggleMode,
  onDriverNameChange,
  onDriverPhoneChange,
}) => {
  return (
    <>
      <Group gap="xs">
        {!isManualMode ? (
          <DriverReferenceInput
            label={label}
            source={driverIdSource as any}
            placeholder="Select driver"
          />
        ) : (
          <FormTextField
            label={label}
            placeholder="Enter driver name"
            value={driverName || ''}
            onChange={onDriverNameChange}
          />
        )}
        <Button
          variant="light"
          size="sm"
          onClick={onToggleMode}
          style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
        >
          {isManualMode ? <IconList size={16} /> : <IconEdit size={16} />}
        </Button>
      </Group>
      
      <PhoneNumberInput
        label={`${label} phone`}
        placeholder="+47 XXX XX XXX"
        value={driverPhone || ''}
        onChange={(value) => onDriverPhoneChange(value || null)}
        defaultCountry="NO"
      />
    </>
  );
};
