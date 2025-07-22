import PropTypes from 'prop-types';
import { Text } from '@mantine/core';

export const TextField = ({ 
  source, 
  label,
  sortable = true,
  filterable = true,
  width = 120,
  textSize = 'sm',
  fontWeight = 400
}) => {
  const renderCell = (params) => {
    const value = params.row[source];
    return value ? (
      <Text size={textSize} fw={fontWeight}>
        {value}
      </Text>
    ) : null;
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

TextField.propTypes = {
  source: PropTypes.string.isRequired,
  label: PropTypes.string,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  width: PropTypes.number,
  textSize: PropTypes.string,
  fontWeight: PropTypes.number,
};
