import PropTypes from 'prop-types';
import { IconEdit } from '@tabler/icons-react';
import { Datagrid } from '../data/Datagrid';
import { 
  TextField,
  BadgeField,
  DateTimeField,
  DriverField,
  VehicleField,
  ActionsField,
  BooleanField
} from '../data/fields';
import { 
  OrderServiceLabels, 
  CommodityLabels,
  StatusFilterLabels,
} from '../../constants/orderConstants';

export const OrderGrid = ({
  orders = [],
  loading = false,
  onRefresh,
  onImport,
  onExport,
  onCreate,
  onEdit,
}) => {
  // Define action configurations
  const actions = onEdit ? [
    {
      icon: <IconEdit size={14} />,
      onClick: (row) => onEdit(row.reference),
      title: 'Edit Order',
      color: 'blue',
      variant: 'subtle'
    }
  ] : [];

  // Status colors mapping
  const statusColors = {
    pending: 'yellow',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red',
    on_hold: 'orange',
  };

  return (
    <Datagrid
      data={orders}
      loading={loading}
      getRowId={(row) => row.id}
      
      // Toolbar actions
      onRefresh={onRefresh}
      onImport={onImport}
      onExport={onExport}
      onCreate={onCreate}
      
      // Labels
      createLabel="Create Order"
      refreshLabel="Refresh Orders"
      importLabel="Import Orders"
      exportLabel="Export Orders"
      
      // Empty state
      emptyStateTitle="No orders found"
      emptyStateDescription="No orders match your current filters"
      
      // Grid configuration
      height={600}
      pageable={true}
      sortable={true}
      filterable={true}
    >
      {/* Field definitions - react-admin style */}
      <ActionsField 
        source="actions"
        label="Actions"
        width={80}
        actions={actions}
      />

      <BooleanField 
        source="priority"
        label=""
        width={60}
        trueTooltip="Priority Order"
      />

      <TextField 
        source="reference"
        label="Reference"
        width={140}
        fontWeight={500}
      />

      <BadgeField 
        source="service"
        label="Service"
        width={120}
        variant="light"
        color="blue"
        choices={OrderServiceLabels}
      />

      <BadgeField 
        source="status"
        label="Status"
        width={120}
        variant="filled"
        choices={StatusFilterLabels}
        colors={statusColors}
      />

      <DateTimeField 
        source="eta_date"
        label="ETA"
        width={140}
        timeSource="eta_time"
      />

      <DateTimeField 
        source="etd_date"
        label="ETD"
        width={140}
        timeSource="etd_time"
      />

      <BadgeField 
        source="commodity"
        label="Commodity"
        width={150}
        variant="outline"
        color="green"
        choices={CommodityLabels}
      />

      <DriverField 
        source="eta_driver"
        label="ETA Driver"
        width={160}
        phoneSource="eta_driver_phone"
      />

      <VehicleField 
        source="eta_truck"
        label="ETA Vehicle"
        width={140}
        trailerSource="eta_trailer"
      />

      <DriverField 
        source="etd_driver"
        label="ETD Driver"
        width={160}
        phoneSource="etd_driver_phone"
      />

      <VehicleField 
        source="etd_truck"
        label="ETD Vehicle"
        width={140}
        trailerSource="etd_trailer"
      />
    </Datagrid>
  );
};

OrderGrid.propTypes = {
  orders: PropTypes.array,
  loading: PropTypes.bool,
  onRefresh: PropTypes.func,
  onImport: PropTypes.func,
  onExport: PropTypes.func,
  onCreate: PropTypes.func,
  onEdit: PropTypes.func,
};
