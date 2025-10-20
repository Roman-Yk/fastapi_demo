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
} from '../../../shared/components';
import { 
  OrderFilters,
  DateFilterOption,
  DateFilterLabels,
  LocationFilterLabels,
  StatusFilterLabels,
  OrderServiceLabels,
  CommodityLabels
} from '../types/order';

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
  
  // Accept Record<string, any> and cast to OrderFilters
  const handleFiltersChange = (newFilters: Record<string, any>) => {
    onFiltersChange(newFilters as OrderFilters);
  };

  // Use filters object directly
  const currentFilters = filters;
  
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
        thumbIcon={<IconStar size={10} />}
      />
    </ListFilters>
  );
};