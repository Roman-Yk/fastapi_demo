import React, { useState } from 'react';
import { Input, Popover, Stack, Group, Button } from '@mantine/core';
import { DatePicker as MantineDatePicker } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select date",
  required
}) => {
  const [opened, setOpened] = useState(false);
  const [tempValue, setTempValue] = useState<Date | null>(value);

  const handleAccept = () => {
    onChange(tempValue);
    setOpened(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(today);
    setOpened(false);
  };

  const handleClear = () => {
    onChange(null);
    setTempValue(null);
    setOpened(false);
  };

  const displayValue = value 
    ? value.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <Popover 
      width={340} 
      position="bottom-start" 
      withArrow 
      shadow="md" 
      opened={opened} 
      onChange={setOpened}
    >
      <Popover.Target>
        <Input.Wrapper label={label} required={required} withAsterisk={required}>
          <Input
            component="button"
            type="button"
            pointer
            onClick={() => setOpened(!opened)}
            rightSection={<IconCalendar size={16} />}
            style={{ 
              textAlign: 'left',
              backgroundColor: 'white',
              border: '1px solid var(--mantine-color-gray-4)',
              minHeight: 36
            }}
          >
            {displayValue || <span style={{ color: 'var(--mantine-color-placeholder)' }}>{placeholder}</span>}
          </Input>
        </Input.Wrapper>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="xs">
          <MantineDatePicker
            value={tempValue}
            onChange={setTempValue}
            size="sm"
          />
          
          <Group justify="flex-end" gap="xs" wrap="nowrap">
            <Button size="xs" color="red" onClick={handleClear}>
              Clear
            </Button>
            <Button size="xs" onClick={handleToday}>
              Today
            </Button>
            <Button size="xs" onClick={handleAccept}>
              OK
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
