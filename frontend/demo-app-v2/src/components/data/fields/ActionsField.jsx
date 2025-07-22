import PropTypes from 'prop-types';
import { Group, ActionIcon } from '@mantine/core';

export const ActionsField = ({ 
  source = 'actions', 
  label = 'Actions',
  sortable = false,
  filterable = false,
  width = 80,
  actions = []
}) => {
  const renderCell = (params) => {
    const row = params.row;
    
    return (
      <Group gap="xs">
        {actions.map((action, index) => (
          <ActionIcon
            key={index}
            variant={action.variant || 'subtle'}
            color={action.color || 'blue'}
            size={action.size || 'sm'}
            onClick={() => action.onClick && action.onClick(row)}
            title={action.title}
            disabled={action.disabled && action.disabled(row)}
          >
            {action.icon}
          </ActionIcon>
        ))}
      </Group>
    );
  };

  return {
    field: source,
    headerName: label,
    width,
    renderCell,
    sortable,
    filterable
  };
};

ActionsField.propTypes = {
  source: PropTypes.string,
  label: PropTypes.string,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  width: PropTypes.number,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func,
      variant: PropTypes.string,
      color: PropTypes.string,
      size: PropTypes.string,
      title: PropTypes.string,
      disabled: PropTypes.func,
    })
  ),
};
