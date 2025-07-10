import { 
  Paper,
  Group,
  Button,
  Badge,
  Switch,
  ActionIcon,
  Text,
  Box,
  TextInput,
  Menu,
  Select,
  Flex,
  Divider
} from '@mantine/core';
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
import { useState, useEffect } from 'react';
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
    if (!filters.dateFilter) {
      onFiltersChange({
        ...filters,
        dateFilter: DateFilterOption.TODAY,
        locationFilter: null,
        statusFilter: null,
        inTerminal: false
      });
    }
  }, []);

  const handleDateFilterChange = (option: DateFilterOption) => {
    onFiltersChange({
      ...filters,
      dateFilter: option
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
      priorityFilter: checked ? true : null
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
    if (!activeFilters.includes(filterType)) {
      setActiveFilters([...activeFilters, filterType]);
    }
  };

  const removeFilter = (filterType: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filterType));
    // Clear the filter value when removing
    switch (filterType) {
      case 'location':
        handleLocationFilterChange(null);
        break;
      case 'status':
        handleStatusFilterChange(null);
        break;
      case 'service':
        handleServiceChange(null);
        break;
      case 'commodity':
        handleCommodityChange(null);
        break;
      case 'priority':
        handlePriorityChange(false);
        break;
      case 'terminal':
        handleInTerminalChange(false);
        break;
      case 'search':
        handleSearchChange('');
        break;
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      dateFilter: DateFilterOption.TODAY,
      locationFilter: null,
      statusFilter: null,
      serviceFilter: null,
      commodityFilter: null,
      priorityFilter: null,
      searchText: '',
      inTerminal: false
    });
    setActiveFilters([]);
  };

  const availableFilters = [
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

  return (
    <Box>
      {/* Main Filter Bar */}
      <Paper p="sm" radius="md" withBorder mb="sm">
        <Flex gap="md" align="center" wrap="wrap">
          {/* Date Filter Pills */}
          <Group gap="xs">
            <Text size="sm" fw={500} c="dimmed">ETA Date:</Text>
            {Object.entries(DateFilterLabels).map(([value, label]) => (
              <Button
                key={value}
                variant={filters.dateFilter === value ? "filled" : "light"}
                onClick={() => handleDateFilterChange(value as DateFilterOption)}
                size="sm"
                radius="xl"
                color={filters.dateFilter === value ? 
                  (value === DateFilterOption.TODAY ? "green" : "blue") : "gray"}
              >
                {label}
              </Button>
            ))}
          </Group>

          <Divider orientation="vertical" />

          {/* Add Filter Menu */}
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
              {availableFilters.map((filter) => (
                <Menu.Item
                  key={filter.value}
                  leftSection={<filter.icon size={16} />}
                  onClick={() => addFilter(filter.value)}
                >
                  {filter.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>

          {/* Quick Actions */}
          <Group gap="xs" ml="auto">
            <Badge variant="light" color="blue" size="lg">
              {filteredOrders} of {totalOrders} orders
            </Badge>
            
            {hasActiveFilters && (
              <Button
                variant="subtle"
                leftSection={<IconFilterOff size={16} />}
                onClick={clearFilters}
                size="sm"
                color="red"
              >
                Clear All
              </Button>
            )}
          </Group>
        </Flex>
      </Paper>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Paper p="sm" radius="md" withBorder mb="sm">
          <Group gap="md">
            <Text size="sm" fw={500} c="dimmed">Active Filters:</Text>
            
            {activeFilters.includes('location') && (
              <Group gap="xs">
                <Select
                  placeholder="Select Location"
                  data={locationOptions}
                  value={filters.locationFilter || null}
                  onChange={handleLocationFilterChange}
                  leftSection={<IconMapPin size={16} />}
                  clearable
                  size="sm"
                  w={180}
                />
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeFilter('location')}
                >
                  <IconFilterOff size={14} />
                </ActionIcon>
              </Group>
            )}

            {activeFilters.includes('status') && (
              <Group gap="xs">
                <Select
                  placeholder="Select Status"
                  data={statusOptions}
                  value={filters.statusFilter || null}
                  onChange={handleStatusFilterChange}
                  leftSection={<IconStatusChange size={16} />}
                  clearable
                  size="sm"
                  w={180}
                />
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeFilter('status')}
                >
                  <IconFilterOff size={14} />
                </ActionIcon>
              </Group>
            )}

            {activeFilters.includes('service') && (
              <Group gap="xs">
                <Select
                  placeholder="Service Type"
                  data={serviceOptions}
                  value={filters.serviceFilter?.toString() || null}
                  onChange={handleServiceChange}
                  leftSection={<IconTruck size={16} />}
                  clearable
                  size="sm"
                  w={180}
                />
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeFilter('service')}
                >
                  <IconFilterOff size={14} />
                </ActionIcon>
              </Group>
            )}

            {activeFilters.includes('commodity') && (
              <Group gap="xs">
                <Select
                  placeholder="Commodity"
                  data={commodityOptions}
                  value={filters.commodityFilter || null}
                  onChange={handleCommodityChange}
                  leftSection={<IconBox size={16} />}
                  clearable
                  size="sm"
                  w={180}
                />
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeFilter('commodity')}
                >
                  <IconFilterOff size={14} />
                </ActionIcon>
              </Group>
            )}

            {activeFilters.includes('priority') && (
              <Group gap="xs">
                <Switch
                  label="Priority Orders Only"
                  checked={filters.priorityFilter === true}
                  onChange={(event) => handlePriorityChange(event.currentTarget.checked)}
                  color="orange"
                  size="sm"
                  thumbIcon={
                    filters.priorityFilter === true ? (
                      <IconStar size={10} />
                    ) : null
                  }
                />
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeFilter('priority')}
                >
                  <IconFilterOff size={14} />
                </ActionIcon>
              </Group>
            )}

            {activeFilters.includes('terminal') && (
              <Group gap="xs">
                <Switch
                  label="In Terminal"
                  checked={filters.inTerminal}
                  onChange={(event) => handleInTerminalChange(event.currentTarget.checked)}
                  color="green"
                  size="sm"
                />
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeFilter('terminal')}
                >
                  <IconFilterOff size={14} />
                </ActionIcon>
              </Group>
            )}

            {activeFilters.includes('search') && (
              <Group gap="xs">
                <TextInput
                  placeholder="Search orders..."
                  value={filters.searchText}
                  onChange={(event) => handleSearchChange(event.currentTarget.value)}
                  leftSection={<IconSearch size={16} />}
                  size="sm"
                  w={250}
                />
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => removeFilter('search')}
                >
                  <IconFilterOff size={14} />
                </ActionIcon>
              </Group>
            )}
          </Group>
        </Paper>
      )}
    </Box>
  );
}; 