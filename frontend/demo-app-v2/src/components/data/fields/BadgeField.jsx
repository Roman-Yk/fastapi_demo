import PropTypes from 'prop-types';
import { Badge } from '@mantine/core';

export const BadgeField = ({ 
  source, 
  label,
  sortable = true,
  filterable = true,
  width = 120,
  variant = 'filled',
  color = 'blue',
  size = 'sm',
  choices = {},
  colors = {}
}) => {
  const renderCell = (params) => {
    const value = params.row[source];
    if (!value) return null;
    
    const displayValue = choices[value] || value;
    const badgeColor = colors[value] || color;
    
    return (
      <Badge variant={variant} color={badgeColor} size={size}>
        {displayValue}
      </Badge>
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

BadgeField.propTypes = {
  source: PropTypes.string.isRequired,
  label: PropTypes.string,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  width: PropTypes.number,
  variant: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  choices: PropTypes.object,
  colors: PropTypes.object,
};
