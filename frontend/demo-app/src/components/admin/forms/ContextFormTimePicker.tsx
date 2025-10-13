import { useState } from 'react';
import { Input, Popover, Paper, Stack, Group, Text, Button } from '@mantine/core';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { IconClock } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import { useFormContext } from '../../../hooks/useFormContext';

interface ContextFormTimePickerProps<K extends string> {
  label: string;
  source: K;
  placeholder?: string;
  required?: boolean;
  transform?: (value: any) => any;
}

export function ContextFormTimePicker<K extends string>({
  label,
  source,
  placeholder = "Select time",
  required,
  transform
}: ContextFormTimePickerProps<K>) {
  const { formData, updateField } = useFormContext();
  const value = formData[source] as string;
  
  const [opened, setOpened] = useState(false);
  const [tempValue, setTempValue] = useState<Dayjs | null>(
    value ? dayjs(`2023-01-01T${value}`) : null
  );

  const handleAccept = () => {
    if (tempValue) {
      const timeString = tempValue.format('HH:mm');
      updateField(source, timeString, transform);
    }
    setOpened(false);
  };

  const handleCancel = () => {
    setTempValue(value ? dayjs(`2023-01-01T${value}`) : null);
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
            
            <Group justify="space-between" mt="sm">
              <Button variant="light" onClick={handleCancel}>
                Cancel
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
}