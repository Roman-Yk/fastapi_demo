import React from 'react';
import { IconEdit } from '@tabler/icons-react';
import { Order, CommodityLabels, OrderServiceShortLabels } from '../../../types/order';
import { 
  Datagrid,
  TextField,
  BadgeField,
  CombinedDateTimeField,
  DriverField,
  VehicleField,
  PriorityField,
  ActionField,
  ActionButtonConfig
} from '../../admin';

interface OrderDataGridProps {
  orders: Order[];
  loading?: boolean;
  onRefresh?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  onEdit?: (orderId: string) => void;
}

export const OrderDataGrid: React.FC<OrderDataGridProps> = ({ 
  orders, 
  loading = false, 
  onRefresh, 
  onImport, 
  onExport, 
  onCreate,
  onEdit
}) => {
  // Define action buttons for each row
  const actionButtons: ActionButtonConfig[] = [];
  
  if (onEdit) {
    actionButtons.push({
      key: 'edit',
      icon: IconEdit,
      onClick: (record: Order) => onEdit(record.reference),
      tooltip: 'Edit Order',
      color: 'blue',
      variant: 'subtle'
    });
  }
  
  return (
    <Datagrid<Order>
      data={orders}
      loading={loading}
      getRowId={(row) => row.reference}
      onRefresh={onRefresh}
      onImport={onImport}
      onExport={onExport}
      onCreate={onCreate}
      createLabel="New Order"
      refreshLabel="Refresh Orders"
      importLabel="Import Orders"
      exportLabel="Export Orders"
      emptyStateTitle="No orders found"
      emptyStateDescription="There are no orders to display with the current filters."
      height={600}
      pageSize={25}
    >
      {/* Actions Column */}
      <ActionField source="actions" width={80} actions={actionButtons} sortable={false} filterable={false} />
      
      {/* Priority Column */}
      <PriorityField source="priority" label="" width={60} sortable={false} filterable={false} />
      
      {/* Reference Column */}
      <TextField source="reference" label="Reference" width={140} />
      
      {/* Service Column */}
      <BadgeField 
        source="service" 
        label="Service" 
        width={120}
        valueMap={{
          [1]: { label: OrderServiceShortLabels[1], color: 'blue' },
          [2]: { label: OrderServiceShortLabels[2], color: 'blue' },
          [3]: { label: OrderServiceShortLabels[3], color: 'blue' }
        }}
        variant="light"
      />
      
      {/* ETA Date/Time */}
      <CombinedDateTimeField 
        source="eta_date" 
        label="ETA" 
        width={140}
        dateSource="eta_date"
        timeSource="eta_time"
      />
      
      {/* ETD Date/Time */}
      <CombinedDateTimeField 
        source="etd_date" 
        label="ETD" 
        width={140}
        dateSource="etd_date"
        timeSource="etd_time"
      />
      
      {/* Commodity Column */}
      <BadgeField 
        source="commodity" 
        label="Commodity" 
        width={150}
        valueMap={Object.fromEntries(
          Object.entries(CommodityLabels).map(([key, label]) => [
            key, 
            { label, color: 'green', variant: 'outline' }
          ])
        )}
      />
      
      {/* ETA Driver */}
      <DriverField 
        source="eta_driver" 
        label="ETA Driver" 
        width={160}
        prefix="eta"
      />
      
      {/* ETA Vehicle */}
      <VehicleField 
        source="eta_vehicle" 
        label="ETA Vehicle" 
        width={160}
        prefix="eta"
        sortable={false}
        filterable={false}
      />
      
      {/* ETD Driver */}
      <DriverField 
        source="etd_driver" 
        label="ETD Driver" 
        width={160}
        prefix="etd"
      />
      
      {/* ETD Vehicle */}
      <VehicleField 
        source="etd_vehicle" 
        label="ETD Vehicle" 
        width={160}
        prefix="etd"
        sortable={false}
        filterable={false}
      />
      
      {/* Notes Column */}
      <TextField 
        source="notes" 
        label="Notes" 
        width={250}
        lineClamp={2}
      />
    </Datagrid>
  );
};