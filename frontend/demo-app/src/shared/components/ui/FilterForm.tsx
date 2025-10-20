import React, { useState } from 'react';
import { 
  Paper, 
  Group, 
  Button, 
  ActionIcon, 
  Menu,
  Text,
  Flex,
  Divider,
  Badge
} from '@mantine/core';
import { 
  IconFilter, 
  IconFilterOff 
} from '@tabler/icons-react';
import { FilterProps } from './types';

export interface FilterFormProps {
  // Always-on filters (rendered immediately)
  alwaysOnFilters?: React.ReactElement<FilterProps>[];
  
  // Optional filters (can be added/removed)
  availableFilters?: {
    key: string;
    label: string;
    icon?: React.ComponentType<{ size?: number }>;
    filter: React.ReactElement<FilterProps>;
  }[];
  
  // Current filter values
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  
  // Optional counts display
  totalCount?: number;
  filteredCount?: number;
  
  // Styling
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const FilterForm: React.FC<FilterFormProps> = ({
  alwaysOnFilters = [],
  availableFilters = [],
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  gap = 'md'
}) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const handleFilterChange = (source: string, value: any) => {
    const newFilters = { ...filters };
    if (value === null || value === undefined || value === '') {
      delete newFilters[source];
    } else {
      newFilters[source] = value;
    }
    onFiltersChange(newFilters);
  };
  
  const addFilter = (filterKey: string) => {
    if (!activeFilters.includes(filterKey)) {
      setActiveFilters([...activeFilters, filterKey]);
    }
  };
  
  const removeFilter = (filterKey: string) => {
    setActiveFilters(activeFilters.filter(k => k !== filterKey));
    const filterConfig = availableFilters.find(f => f.key === filterKey);
    if (filterConfig) {
      handleFilterChange(filterConfig.filter.props.source, null);
    }
  };
  
  const clearAllFilters = () => {
    setActiveFilters([]);
    onFiltersChange({});
  };
  
  const availableFiltersList = availableFilters.filter(
    filter => !activeFilters.includes(filter.key)
  );
  
  const hasActiveFilters = Object.keys(filters).length > 0 || activeFilters.length > 0;
  
  return (
    <Paper p="sm" radius="md" withBorder mb="sm">
      <Flex gap={gap} align="center" wrap="wrap">
        {/* Always-on filters */}
        {alwaysOnFilters.map((filter, index) => 
          React.cloneElement(filter, {
            key: `always-${index}`,
            value: filters[filter.props.source] || '',
            onChange: (value: any) => handleFilterChange(filter.props.source, value)
          })
        )}
        
        {alwaysOnFilters.length > 0 && availableFilters.length > 0 && (
          <Divider orientation="vertical" />
        )}
        
        {/* Add Filter Menu */}
        {availableFiltersList.length > 0 && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                variant="light"
                leftSection={<IconFilter size={16} />}
                size="sm"
                color="gray"
              >
                Add Filter
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {availableFiltersList.map((filter) => (
                <Menu.Item
                  key={filter.key}
                  leftSection={filter.icon ? <filter.icon size={16} /> : undefined}
                  onClick={() => addFilter(filter.key)}
                >
                  {filter.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}
        
        {/* Quick Actions */}
        <Group gap="xs" ml="auto">
          {totalCount !== undefined && filteredCount !== undefined && (
            <Badge variant="light" color="blue" size="lg">
              {filteredCount} of {totalCount} items
            </Badge>
          )}
          
          {hasActiveFilters && (
            <Button
              variant="subtle"
              leftSection={<IconFilterOff size={16} />}
              onClick={clearAllFilters}
              size="sm"
              color="red"
            >
              Clear All
            </Button>
          )}
        </Group>
      </Flex>
      
      {/* Active Optional Filters */}
      {activeFilters.length > 0 && (
        <Group gap={gap} mt="sm">
          <Text size="sm" fw={500} c="dimmed">Active Filters:</Text>
          
          {activeFilters.map((filterKey) => {
            const filterConfig = availableFilters.find(f => f.key === filterKey);
            if (!filterConfig) return null;
            
            return (
              <Group gap="xs" key={filterKey}>
                {React.cloneElement(filterConfig.filter, {
                  value: filters[filterConfig.filter.props.source] || null,
                  onChange: (value: any) => handleFilterChange(filterConfig.filter.props.source, value)
                })}
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeFilter(filterKey)}
                >
                  <IconFilterOff size={14} />
                </ActionIcon>
              </Group>
            );
          })}
        </Group>
      )}
    </Paper>
  );
};