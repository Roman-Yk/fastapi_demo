import PropTypes from 'prop-types';
import { Stack, Group, Text } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

export const DriverField = ({ 
  source, 
  label,
  sortable = true,
  filterable = true,
  width = 160,
  phoneSource,
  showIcon = true
}) => {
  const renderCell = (params) => {
    const order = params.row;
    const driver = order[source];
    const phone = phoneSource ? order[phoneSource] : null;
    
    if (!driver) return null;
    
    return (
      <Stack gap={2}>
        <Group gap="xs">
          {showIcon && <IconUser size={12} />}
          <Text size="sm">{driver}</Text>
        </Group>
        {phone && (
          <Text size="xs" c="dimmed">
            {phone}
          </Text>
        )}
      </Stack>
    );
  };

  return {
    field: source,
    headerName: label || source,
    width,
    renderCell,
    sortable,
    filterable
  };
};

DriverField.propTypes = {
  source: PropTypes.string.isRequired,
  label: PropTypes.string,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  width: PropTypes.number,
  phoneSource: PropTypes.string,
  showIcon: PropTypes.bool,
};
