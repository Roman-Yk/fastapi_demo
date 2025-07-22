import PropTypes from 'prop-types';
import { Stack, Text } from '@mantine/core';

export const DateTimeField = ({ 
  source, 
  label,
  sortable = true,
  filterable = true,
  width = 140,
  timeSource,
  dateFormat = 'toLocaleDateString',
  showTime = true
}) => {
  const renderCell = (params) => {
    const order = params.row;
    const date = order[source];
    const time = timeSource ? order[timeSource] : null;
    
    if (!date) return null;
    
    return (
      <Stack gap={2}>
        <Text size="sm" fw={500}>
          {new Date(date)[dateFormat]()}
        </Text>
        {showTime && time && (
          <Text size="xs" c="dimmed">
            {time.substring(0, 5)}
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

DateTimeField.propTypes = {
  source: PropTypes.string.isRequired,
  label: PropTypes.string,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  width: PropTypes.number,
  timeSource: PropTypes.string,
  dateFormat: PropTypes.string,
  showTime: PropTypes.bool,
};
