import PropTypes from 'prop-types';
import { Tooltip } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

export const BooleanField = ({ 
  source, 
  label,
  sortable = false,
  filterable = false,
  width = 60,
  trueIcon = <IconStar size={16} color="orange" />,
  falseIcon = null,
  tooltip,
  trueTooltip,
  falseTooltip
}) => {
  const renderCell = (params) => {
    const value = params.row[source];
    const icon = value ? trueIcon : falseIcon;
    const tooltipText = value ? (trueTooltip || tooltip) : (falseTooltip || tooltip);
    
    if (!icon) return null;
    
    return tooltipText ? (
      <Tooltip label={tooltipText}>
        {icon}
      </Tooltip>
    ) : icon;
  };

  return {
    field: source,
    headerName: label || '',
    width,
    renderCell,
    sortable,
    filterable
  };
};

BooleanField.propTypes = {
  source: PropTypes.string.isRequired,
  label: PropTypes.string,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  width: PropTypes.number,
  trueIcon: PropTypes.node,
  falseIcon: PropTypes.node,
  tooltip: PropTypes.string,
  trueTooltip: PropTypes.string,
  falseTooltip: PropTypes.string,
};
