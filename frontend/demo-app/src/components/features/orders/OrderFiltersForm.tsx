import React from 'react';
import { 
  IconMapPin, 
  IconStatusChange, 
  IconTruck, 
  IconBox, 
  IconStar, 
  IconSearch
} from '@tabler/icons-react';
import { 
  ListFilters,
  DateRangeFilter,
  SelectFilter,
  BooleanFilter,
  TextFilter
} from '../../admin';
import { 
  OrderFilters,
  DateFilterOption,
  DateFilterLabels,
  LocationFilterLabels,
  StatusFilterLabels,
  OrderServiceLabels,
  CommodityLabels
} from '../../../types/order';

interface OrderFiltersFormProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  totalOrders: number;
  filteredOrders: number;
}

export const OrderFiltersForm: React.FC<OrderFiltersFormProps> = ({ 
  filters, 
  onFiltersChange, 
  totalOrders, 
  filteredOrders 
}) => {
  
  const handleFiltersChange = (newFilters: Record<string, any>) => {
    // Create a proper OrderFilters object with default values
    const updatedFilters: OrderFilters = {
      dateFilter: newFilters.dateFilter || DateFilterOption.ALL,
      locationFilter: newFilters.locationFilter || null,
      statusFilter: newFilters.statusFilter || null,
      serviceFilter: newFilters.serviceFilter || null,
      commodityFilter: newFilters.commodityFilter || null,
      priorityFilter: newFilters.priorityFilter || null,
      searchText: newFilters.searchText || '',
      inTerminal: newFilters.inTerminal || false
    };
    onFiltersChange(updatedFilters);
  };
  
  // Convert current filters to simple key-value format
  const currentFilters: Record<string, any> = {
    dateFilter: filters.dateFilter,
    ...(filters.locationFilter && { locationFilter: filters.locationFilter }),
    ...(filters.statusFilter && { statusFilter: filters.statusFilter }),
    ...(filters.serviceFilter && { serviceFilter: filters.serviceFilter }),
    ...(filters.commodityFilter && { commodityFilter: filters.commodityFilter }),
    ...(filters.priorityFilter && { priorityFilter: filters.priorityFilter }),
    ...(filters.searchText && { searchText: filters.searchText }),
    ...(filters.inTerminal && { inTerminal: filters.inTerminal })
  };
  
  return (
    <ListFilters
      filters={currentFilters}
      onFiltersChange={handleFiltersChange}
      totalCount={totalOrders}
      filteredCount={filteredOrders}
    >
      {/* Always-on date filter - wrapped as a proper filter component */}
      <DateRangeFilter
        source="dateFilter"
        label="ETA Date"
        alwaysOn
        options={Object.entries(DateFilterLabels).map(([value, label]) => ({
          value,
          label,
          color: value === DateFilterOption.TODAY ? 'green' : 'blue'
        }))}
      />

      {/* Optional filters - these can be added/removed dynamically */}
      <TextFilter
        source="searchText"
        label="Search"
        placeholder="Search orders..."
        width={250}
        leftSection={<IconSearch size={16} />}
      />
      
      <SelectFilter
        source="locationFilter"
        label="Location"
        options={LocationFilterLabels}
        leftSection={<IconMapPin size={16} />}
      />
      
      <SelectFilter
        source="statusFilter"
        label="Status"
        options={StatusFilterLabels}
        leftSection={<IconStatusChange size={16} />}
      />
      
      <SelectFilter
        source="serviceFilter"
        label="Service"
        options={OrderServiceLabels}
        leftSection={<IconTruck size={16} />}
      />
      
      <SelectFilter
        source="commodityFilter"
        label="Commodity"
        options={CommodityLabels}
        leftSection={<IconBox size={16} />}
      />
      
      <BooleanFilter
        source="priorityFilter"
        label="Priority Orders Only"
        color="orange"
        thumbIcon={<IconStar size={10} />}
      />
      
      <BooleanFilter
        source="inTerminal"
        label="In Terminal"
        color="green"
      />
    </ListFilters>
  );
};