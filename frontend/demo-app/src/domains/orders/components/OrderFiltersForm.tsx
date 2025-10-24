import React from 'react';
import {
  IconMapPin,
  IconStatusChange,
  IconTruck,
  IconBox,
  IconStar,
  IconSearch,
  IconBuildingWarehouse
} from '@tabler/icons-react';
import {
  ListFilters,
  DateRangeFilter,
  TerminalFilter,
  SelectFilter,
  BooleanSelectFilter,
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
        source="date_range"
        label="ETA Date"
        alwaysOn
        defaultValue={DateFilterOption.ALL}
        size="md"
        radius="lg"
        options={Object.entries(DateFilterLabels).map(([value, label]) => ({
          value,
          label,
          color: value === DateFilterOption.TODAY ? 'green' : 'blue'
        }))}
      />

      {/* Always-on terminal filter */}
      <TerminalFilter
        source="terminal_id"
        label="Terminal"
        alwaysOn
        defaultValue="all"
        size="md"
        radius="lg"
      />

      <SelectFilter
        source="status"
        label="Status"
        options={StatusFilterLabels}
        leftSection={<IconStatusChange size={16} />}
      />

      <SelectFilter
        source="service"
        label="Service"
        options={OrderServiceLabels}
        leftSection={<IconTruck size={16} />}
      />

      <SelectFilter
        source="commodity"
        label="Commodity"
        options={CommodityLabels}
        leftSection={<IconBox size={16} />}
      />

      <BooleanSelectFilter
        source="priority"
        leftSection={<IconStar size={16} />}
        placeholder="Priority"
        width={150}
      />

      <BooleanSelectFilter
        source="in_terminal"
        leftSection={<IconBuildingWarehouse size={16} />}
        placeholder="In Terminal"
        width={160}
      />
    </ListFilters>
  );
};