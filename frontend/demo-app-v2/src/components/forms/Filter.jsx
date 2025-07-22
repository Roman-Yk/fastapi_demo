import { useState, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { 
  Paper,
  Group,
  Button,
  Badge,
  ActionIcon,
  Text,
  Box,
  Menu,
  Flex,
  Divider
} from '@mantine/core';
import { 
  IconFilter, 
  IconFilterOff
} from '@tabler/icons-react';

export const Filter = ({ 
  children,
  filters, 
  onFiltersChange, 
  totalRecords, 
  filteredRecords 
}) => {
  const [visibleFilters, setVisibleFilters] = useState([]);

  // Generic filter change handler
  const handleFilterChange = (source, value) => {
    onFiltersChange({
      ...filters,
      [source]: value,
    });
  };

  // Get always-on and optional filter children
  const childrenArray = Children.toArray(children);
  const alwaysOnFilters = childrenArray.filter(child => child.props?.alwaysOn);
  const optionalFilters = childrenArray.filter(child => !child.props?.alwaysOn);

  // Add filter to visible list
  const addFilter = (filterIndex) => {
    if (!visibleFilters.includes(filterIndex)) {
      setVisibleFilters([...visibleFilters, filterIndex]);
    }
  };

  // Remove filter from visible list and clear its value
  const removeFilter = (filterIndex) => {
    const filter = optionalFilters[filterIndex];
    if (filter) {
      setVisibleFilters(visibleFilters.filter(i => i !== filterIndex));
      handleFilterChange(filter.props.source, null);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters = {};
    childrenArray.forEach(child => {
      if (child.props?.source) {
        clearedFilters[child.props.source] = child.props.alwaysOn ? 
          (child.props.defaultValue ?? null) : null;
      }
    });
    onFiltersChange(clearedFilters);
    setVisibleFilters([]);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Paper withBorder p="md">
      <Flex direction="column" gap="sm">
        {/* Header with counts and clear all */}
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Text size="sm" fw={500}>
              Showing {filteredRecords} of {totalRecords} records
            </Text>
            {hasActiveFilters && (
              <Badge variant="filled" color="blue" size="sm">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </Group>
          
          {hasActiveFilters && (
            <Button
              variant="subtle"
              color="red"
              size="sm"
              leftSection={<IconFilterOff size={14} />}
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </Group>

        <Divider />

        {/* Always-on filters */}
        {alwaysOnFilters.length > 0 && (
          <Group gap="md" wrap="wrap" align="end">
            {alwaysOnFilters.map((child, index) => 
              cloneElement(child, {
                key: `always-${index}`,
                value: filters[child.props.source],
                onChange: (value) => handleFilterChange(child.props.source, value),
              })
            )}
            
            {/* Add Filter dropdown */}
            {optionalFilters.length > 0 && (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button
                    variant="light"
                    color="gray"
                    size="sm"
                    leftSection={<IconFilter size={16} />}
                  >
                    Add Filter
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {optionalFilters.map((child, index) => (
                    <Menu.Item
                      key={index}
                      onClick={() => addFilter(index)}
                      disabled={visibleFilters.includes(index)}
                    >
                      {child.props.label || child.props.source}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        )}

        {/* Visible optional filters */}
        {visibleFilters.length > 0 && (
          <Group gap="md" wrap="wrap">
            {visibleFilters.map((filterIndex) => {
              const child = optionalFilters[filterIndex];
              return (
                <Group key={filterIndex} gap="xs" align="end">
                  {cloneElement(child, {
                    value: filters[child.props.source],
                    onChange: (value) => handleFilterChange(child.props.source, value),
                  })}
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => removeFilter(filterIndex)}
                    title="Remove filter"
                  >
                    ×
                  </ActionIcon>
                </Group>
              );
            })}
          </Group>
        )}

      </Flex>
    </Paper>
  );
};

Filter.propTypes = {
  children: PropTypes.node.isRequired,
  filters: PropTypes.object.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  totalRecords: PropTypes.number.isRequired,
  filteredRecords: PropTypes.number.isRequired,
};
