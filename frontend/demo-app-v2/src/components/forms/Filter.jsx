import { useState, Children, cloneElement, useEffect, useRef } from "react";
import PropTypes from "prop-types";
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
  Divider,
} from "@mantine/core";
import { IconFilter, IconFilterOff } from "@tabler/icons-react";

export const Filter = ({
  children,
  filters,
  onFiltersChange,
  totalRecords,
  filteredRecords,
}) => {
  const [visibleFilters, setVisibleFilters] = useState([]);

  // Capture default filters only once on mount to later not show wrong clear filters button
  const defaultFiltersRef = useRef(null);
  if (defaultFiltersRef.current === null) {
    defaultFiltersRef.current = { ...filters };
  }
  const defaultFilters = defaultFiltersRef.current;

  // Generic filter change handler
  const handleFilterChange = (source, value) => {
    onFiltersChange({
      ...filters,
      [source]: value,
    });
  };

  // Get always-on and optional filter children
  const childrenArray = Children.toArray(children);
  const alwaysOnFilters = childrenArray.filter(
    (child) => child.props?.alwaysOn
  );
  const optionalFilters = childrenArray.filter(
    (child) => !child.props?.alwaysOn
  );

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
      setVisibleFilters(visibleFilters.filter((i) => i !== filterIndex));
      handleFilterChange(filter.props.source, null);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters = {};
    childrenArray.forEach((child) => {
      if (child.props?.source) {
        clearedFilters[child.props.source] = child.props.alwaysOn
          ? child.props.defaultValue ?? null
          : null;
      }
    });
    onFiltersChange(clearedFilters);
    setVisibleFilters([]);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    for(const [key, value] of Object.entries(filters)) {
      if (defaultFilters && defaultFilters[key] === value) continue;
      if (value !== null && value !== undefined && value !== "") {
        count++;
      }
    }
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const hasActiveFilters = activeFiltersCount > 0;

  // Reset visible filters if no active filters (handles page refresh)
  useEffect(() => {
    if (!hasActiveFilters && visibleFilters.length > 0) {
      setVisibleFilters([]);
    }
  }, [hasActiveFilters, visibleFilters.length]);

  return (
    <Paper withBorder p="md">
      <Flex direction="column" gap="sm">
        {/* Always-on filters */}
        {alwaysOnFilters.length > 0 && (
          <Group gap="md" wrap="wrap" align="end">
            {alwaysOnFilters.map((child, index) =>
              cloneElement(child, {
                key: `always-${index}`,
                value: filters[child.props.source],
                onChange: (value) =>
                  handleFilterChange(child.props.source, value),
              })
            )}

            {/* Add Filter dropdown */}
            {optionalFilters.length > 0 && (
              <Menu shadow="md" width={200}>
                <Group>
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
                    onChange: (value) =>
                      handleFilterChange(child.props.source, value),
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
