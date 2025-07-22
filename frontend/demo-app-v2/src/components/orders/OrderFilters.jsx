import PropTypes from 'prop-types';
import { Filter } from '../forms/Filter';
import { 
  DateFilterField, 
  LocationFilterField, 
  StatusFilterField, 
  ServiceFilterField, 
  TextFilterField, 
  SwitchFilterField 
} from '../forms/filters';

export const OrderFilters = ({
  filters,
  onFiltersChange,
  totalOrders,
  filteredOrders,
}) => {
  return (
    <Filter
      filters={filters}
      onFiltersChange={onFiltersChange}
      totalRecords={totalOrders}
      filteredRecords={filteredOrders}
    >
      {/* Always-on filters */}
      <DateFilterField 
        source="dateFilter" 
        alwaysOn 
        label="ETA Date"
      />

      {/* Optional filters that can be added/removed */}
      <LocationFilterField 
        source="locationFilter" 
        label="Location"
        
      />

      <StatusFilterField 
        source="statusFilter" 
        label="Status"
      />

      <ServiceFilterField 
        source="serviceFilter" 
        label="Service Type"
      />

      <TextFilterField 
        source="searchText" 
        label="Search"
        placeholder="Search by reference, driver, truck..."
        alwaysOn
      />

      <SwitchFilterField 
        source="priorityFilter" 
        label="Priority Orders"
        color="orange"
      />

      <SwitchFilterField 
        source="inTerminal" 
        label="In Terminal"
        color="blue"
      />
    </Filter>
  );
};

OrderFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  totalOrders: PropTypes.number.isRequired,
  filteredOrders: PropTypes.number.isRequired,
};
