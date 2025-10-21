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
  IconFilterOff,
  IconMapPin, 
  IconStatusChange, 
  IconTruck, 
  IconBox, 
  IconStar, 
  IconWorld,
  IconSearch
} from '@tabler/icons-react';
import { FilterProps } from '../types';
import { getFilterDefinitions } from './Filter';

export interface ListFiltersProps {
  children: React.ReactElement<FilterProps>[];
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  totalCount?: number;
  filteredCount?: number;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// Icon mapping for different filter types/sources
const getIconForSource = (source: string): React.ComponentType<{ size?: number }> | undefined => {
  const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
    search: IconSearch,
    searchText: IconSearch,
    location: IconMapPin,
    locationFilter: IconMapPin,
    status: IconStatusChange,
    statusFilter: IconStatusChange,
    service: IconTruck,
    serviceFilter: IconTruck,
    commodity: IconBox,
    commodityFilter: IconBox,
    priority: IconStar,
    priorityFilter: IconStar,
    terminal: IconWorld,
    inTerminal: IconWorld,
  };
  
  return iconMap[source];
};

export const ListFilters: React.FC<ListFiltersProps> = ({
  children,
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  gap = 'md'
}) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const { alwaysOnFilters, availableFilters } = getFilterDefinitions(children);
  
  // Add icons to available filters
  const availableFiltersWithIcons = availableFilters.map(filter => ({
    ...filter,
    icon: getIconForSource(filter.key) || IconFilter
  }));
  
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
    const filterConfig = availableFiltersWithIcons.find(f => f.key === filterKey);
    if (filterConfig) {
      // Instead of setting to null, remove the filter entirely
      const newFilters = { ...filters };
      delete newFilters[filterConfig.filter.props.source];
      onFiltersChange(newFilters);
    }
  };
  
  const clearAllFilters = () => {
    setActiveFilters([]);
    // Only clear optional filters, keep always-on filters with their default values
    const clearedFilters: Record<string, any> = {};
    alwaysOnFilters.forEach(filter => {
      // Keep always-on filters but reset to their default values
      const source = filter.props.source;
      if (source === 'dateFilter') {
        clearedFilters[source] = 'All'; // DateFilterOption.ALL
      }
      // Other always-on filters can be added here with their defaults
    });
    onFiltersChange(clearedFilters);
  };
  
  const availableFiltersList = availableFiltersWithIcons.filter(
    filter => !activeFilters.includes(filter.key)
  );
  
  const hasActiveFilters = activeFilters.length > 0 || 
    Object.keys(filters).some(key => {
      // Don't count always-on filters unless they have non-default values
      const isAlwaysOn = alwaysOnFilters.some(f => f.props.source === key);
      if (isAlwaysOn) {
        // For date filter, only count as active if it's not 'All'
        if (key === 'dateFilter') {
          return filters[key] !== 'All';
        }
        return false; // Other always-on filters don't count towards "hasActiveFilters"
      }
      // Count optional filters that have values
      return filters[key] !== null && filters[key] !== undefined && filters[key] !== '';
    });
  
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
        
        {alwaysOnFilters.length > 0 && availableFiltersWithIcons.length > 0 && (
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
                  leftSection={<filter.icon size={16} />}
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
            const filterConfig = availableFiltersWithIcons.find(f => f.key === filterKey);
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