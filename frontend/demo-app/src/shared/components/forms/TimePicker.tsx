import React, { useState } from 'react';
import { Input, Popover, Paper, Stack, Group, Text, Button } from '@mantine/core';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { IconClock } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select time",
  required
}) => {
  const [opened, setOpened] = useState(false);
  const [tempValue, setTempValue] = useState<Dayjs | null>(
    value ? dayjs(`2023-01-01T${value}`) : null
  );

  const handleAccept = () => {
    if (tempValue) {
      const timeString = tempValue.format('HH:mm');
      onChange(timeString);
    }
    setOpened(false);
  };

  const displayValue = value ? value : '';

  return (
    <Popover 
      width={320} 
      position="bottom" 
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
            rightSection={<IconClock size={16} />}
            style={{ 
              textAlign: 'left',
              backgroundColor: 'transparent',
              border: '1px solid var(--mantine-color-gray-4)',
              minHeight: 36
            }}
          >
            {displayValue || <Text c="placeholder" size="sm">{placeholder}</Text>}
          </Input>
        </Input.Wrapper>
      </Popover.Target>

      <Popover.Dropdown>
        <Paper p="md">
          <Stack gap="md">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StaticTimePicker
                value={tempValue}
                onChange={(newValue) => setTempValue(newValue)}
                ampm={false}
                orientation="portrait"
                sx={{
                  '& .MuiPickersLayout-root': {
                    minHeight: 'auto',
                  },
                  '& .MuiTimeClock-root': {
                    maxHeight: 280,
                  },
                  '& .MuiPickersLayout-actionBar': {
                    display: 'none',
                  }
                }}
              />
            </LocalizationProvider>
            
            <Group justify="flex-end" gap="xs" wrap="nowrap" mt="sm">
              <Button 
                variant="light" 
                color="red"
                onClick={() => {
                  setTempValue(null);
                  onChange('');
                  setOpened(false);
                }}
              >
                Clear
              </Button>
              <Button 
                variant="light" 
                onClick={() => {
                  const now = dayjs();
                  setTempValue(now);
                  const timeString = now.format('HH:mm');
                  onChange(timeString);
                  setOpened(false);
                }}
              >
                Now
              </Button>
              <Button onClick={handleAccept} disabled={!tempValue}>
                OK
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Popover.Dropdown>
    </Popover>
  );
};