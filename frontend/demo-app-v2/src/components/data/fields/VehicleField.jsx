import PropTypes from 'prop-types';
import { Stack, Group, Text } from '@mantine/core';
import { IconTruck } from '@tabler/icons-react';

export const VehicleField = ({ 
  source, 
  label,
  sortable = true,
  filterable = true,
  width = 140,
  trailerSource,
  showIcon = true
}) => {
  const renderCell = (params) => {
    const order = params.row;
    const truck = order[source];
    const trailer = trailerSource ? order[trailerSource] : null;
    
    return (
      <Stack gap={2}>
        {truck && (
          <Group gap="xs">
            {showIcon && <IconTruck size={12} />}
            <Text size="sm">{truck}</Text>
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

  return {
    field: source,
    headerName: label || source,
    width,
    renderCell,
    sortable,
    filterable
  };
};

VehicleField.propTypes = {
  source: PropTypes.string.isRequired,
  label: PropTypes.string,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  width: PropTypes.number,
  trailerSource: PropTypes.string,
  showIcon: PropTypes.bool,
};
