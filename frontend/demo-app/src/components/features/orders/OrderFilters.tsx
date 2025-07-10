import React, { useState, useEffect } from 'react';
import { Group, Text } from '@mantine/core';
import { 
  IconFilter, 
  IconMapPin, 
  IconStatusChange, 
  IconTruck, 
  IconBox, 
  IconStar, 
  IconSearch, 
  IconFilterOff,
  IconWorld,
  IconBuilding
} from '@tabler/icons-react';
import { 
  OrderFilters, 
  DateFilterOption, 
  DateFilterLabels, 
  LocationFilter, 
  LocationFilterLabels,
  StatusFilter, 
  StatusFilterLabels,
  OrderService, 
  OrderServiceLabels,
  CommodityType, 
  CommodityLabels 
} from '../../../types/order';
import { FilterBar } from '../../common/FilterBar';
import { FilterOption } from '../../common/FilterDropdown';
import { FormField } from '../../common/FormField';

interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  totalOrders: number;
  filteredOrders: number;
}

export const OrderFiltersComponent = ({ 
  filters, 
  onFiltersChange, 
  totalOrders, 
  filteredOrders 
}: OrderFiltersProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const active = [];
    if (filters.locationFilter !== null) active.push('location');
    if (filters.statusFilter !== null) active.push('status');
    if (filters.serviceFilter !== null) active.push('service');
    if (filters.commodityFilter !== null) active.push('commodity');
    if (filters.priorityFilter !== null) active.push('priority');
    if (filters.searchText !== '') active.push('search');
    if (filters.inTerminal) active.push('terminal');
    setActiveFilters(active);
  }, [filters]);

  const handleDateFilterChange = (option: string) => {
    onFiltersChange({
      ...filters,
      dateFilter: option as DateFilterOption
    });
  };

  const handleLocationFilterChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      locationFilter: value as LocationFilter | null
    });
  };

  const handleStatusFilterChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      statusFilter: value as StatusFilter | null
    });
  };

  const handleServiceChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      serviceFilter: value ? parseInt(value) as OrderService : null
    });
  };

  const handleCommodityChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      commodityFilter: value as CommodityType | null
    });
  };

  const handlePriorityChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      priorityFilter: checked
    });
  };

  const handleInTerminalChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      inTerminal: checked
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchText: value
    });
  };

  const addFilter = (filterType: string) => {
    setActiveFilters([...activeFilters, filterType]);
  };

  const removeFilter = (filterType: string) => {
    const newActiveFilters = activeFilters.filter(f => f !== filterType);
    setActiveFilters(newActiveFilters);
    
    // Reset the filter value
    const updatedFilters = { ...filters };
    switch (filterType) {
      case 'location':
        updatedFilters.locationFilter = null;
        break;
      case 'status':
        updatedFilters.statusFilter = null;
        break;
      case 'service':
        updatedFilters.serviceFilter = null;
        break;
      case 'commodity':
        updatedFilters.commodityFilter = null;
        break;
      case 'priority':
        updatedFilters.priorityFilter = null;
        break;
      case 'terminal':
        updatedFilters.inTerminal = false;
        break;
      case 'search':
        updatedFilters.searchText = '';
        break;
    }
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setActiveFilters([]);
    onFiltersChange({
      ...filters,
      locationFilter: null,
      statusFilter: null,
      serviceFilter: null,
      commodityFilter: null,
      priorityFilter: null,
      searchText: '',
      inTerminal: false,
    });
  };

  // Convert date filter options to common format
  const dateFilterOptions: CommonDateFilterOption[] = Object.entries(DateFilterLabels).map(([value, label]) => ({
    value,
    label,
    color: 'blue'
  }));

  // Available filter options
  const availableFilters: FilterOption[] = [
    { value: 'location', label: 'Location', icon: IconMapPin },
    { value: 'status', label: 'Status', icon: IconStatusChange },
    { value: 'service', label: 'Service Type', icon: IconTruck },
    { value: 'commodity', label: 'Commodity', icon: IconBox },
    { value: 'priority', label: 'Priority Orders', icon: IconStar },
    { value: 'terminal', label: 'In Terminal', icon: IconWorld },
    { value: 'search', label: 'Search', icon: IconSearch },
  ].filter(filter => !activeFilters.includes(filter.value));

  const serviceOptions = Object.entries(OrderServiceLabels).map(([value, label]) => ({
    value: value,
    label: label
  }));

  const commodityOptions = Object.entries(CommodityLabels).map(([value, label]) => ({
    value: value,
    label: label
  }));

  const locationOptions = Object.entries(LocationFilterLabels).map(([value, label]) => ({
    value: value,
    label: label
  }));

  const statusOptions = Object.entries(StatusFilterLabels).map(([value, label]) => ({
    value: value,
    label: label
  }));

  const hasActiveFilters = filters.locationFilter !== null || 
                          filters.statusFilter !== null ||
                          filters.serviceFilter !== null || 
                          filters.commodityFilter !== null || 
                          filters.priorityFilter !== null || 
                          filters.searchText !== '' ||
                          filters.inTerminal ||
                          activeFilters.length > 0;

  // Active filters content
  const activeFiltersContent = activeFilters.length > 0 ? (
    <Group gap="md">
      <Text size="sm" fw={500} c="dimmed">Active Filters:</Text>
      
      {activeFilters.includes('location') && (
        <FormField
          type="select"
          value={filters.locationFilter}
          onChange={handleLocationFilterChange}
          data={locationOptions}
          placeholder="Select Location"
          leftSection={<IconMapPin size={16} />}
          clearable
          width={180}
          onRemove={() => removeFilter('location')}
          showRemove
        />
      )}

      {activeFilters.includes('status') && (
        <FormField
          type="select"
          value={filters.statusFilter}
          onChange={handleStatusFilterChange}
          data={statusOptions}
          placeholder="Select Status"
          leftSection={<IconStatusChange size={16} />}
          clearable
          width={180}
          onRemove={() => removeFilter('status')}
          showRemove
        />
      )}

      {activeFilters.includes('service') && (
        <FormField
          type="select"
          value={filters.serviceFilter?.toString() || null}
          onChange={handleServiceChange}
          data={serviceOptions}
          placeholder="Service Type"
          leftSection={<IconTruck size={16} />}
          clearable
          width={180}
          onRemove={() => removeFilter('service')}
          showRemove
        />
      )}

      {activeFilters.includes('commodity') && (
        <FormField
          type="select"
          value={filters.commodityFilter}
          onChange={handleCommodityChange}
          data={commodityOptions}
          placeholder="Commodity"
          leftSection={<IconBox size={16} />}
          clearable
          width={180}
          onRemove={() => removeFilter('commodity')}
          showRemove
        />
      )}

      {activeFilters.includes('priority') && (
        <FormField
          type="switch"
          checked={filters.priorityFilter === true}
          onChange={handlePriorityChange}
          label="Priority Orders Only"
          color="orange"
          thumbIcon={filters.priorityFilter === true ? <IconStar size={10} /> : null}
          onRemove={() => removeFilter('priority')}
          showRemove
        />
      )}

      {activeFilters.includes('terminal') && (
        <FormField
          type="switch"
          checked={filters.inTerminal}
          onChange={handleInTerminalChange}
          label="In Terminal"
          color="green"
          onRemove={() => removeFilter('terminal')}
          showRemove
        />
      )}

      {activeFilters.includes('search') && (
        <FormField
          type="text"
          value={filters.searchText}
          onChange={handleSearchChange}
          placeholder="Search orders..."
          leftSection={<IconSearch size={16} />}
          width={250}
          onRemove={() => removeFilter('search')}
          showRemove
        />
      )}
    </Group>
  ) : undefined;

  return (
    <FilterBar
      dateFilter={{
        label: "ETA Date:",
        options: dateFilterOptions,
        value: filters.dateFilter,
        onChange: handleDateFilterChange,
        todayValue: DateFilterOption.TODAY
      }}
      additionalFilters={{
        label: "Add Filter",
        options: availableFilters,
        onAdd: addFilter
      }}
      activeFilters={activeFiltersContent}
      summary={{
        filtered: filteredOrders,
        total: totalOrders,
        label: "orders"
      }}
      onClearAll={clearFilters}
      showClearAll={hasActiveFilters}
    />
  );
}; 