import React from 'react';
import { IconEdit } from '@tabler/icons-react';
import { 
  Datagrid,
  TextField,
  LinkField,
  BadgeField,
  ActionField,
  CombinedDateTimeField,
  DriverField,
  VehicleField,
  PriorityField
} from '../../admin';
import { 
  Order, 
  CommodityLabels,
  OrderServiceShortLabels 
} from '../../../types/order';

interface OrderGridProps {
  orders: Order[];
  loading?: boolean;
  onRefresh?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  onEdit?: (orderId: string) => void;
}

export const OrderGrid: React.FC<OrderGridProps> = ({ 
  orders, 
  loading = false, 
  onRefresh, 
  onImport, 
  onExport, 
  onCreate,
  onEdit
}) => {
  return (
    <Datagrid
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
      {/* Priority indicator */}
      <PriorityField 
        source="priority" 
        label="" 
        width={60}
        sortable={false}
        filterable={false}
      />
      
      {/* Order reference as a link */}
      <LinkField 
        source="reference" 
        label="Reference" 
        to="/orders/{reference}/edit"
        width={140}
      />
      
      {/* Service with custom badge rendering */}
      <BadgeField
        source="service"
        label="Service"
        width={120}
        variant="light"
        color="blue"
        size="sm"
        valueMap={Object.fromEntries(
          Object.entries(OrderServiceShortLabels).map(([key, label]) => [
            key, 
            { 
              label, 
              color: 'blue',
              variant: 'light'
            }
          ])
        )}
      />
      
      {/* ETA Date & Time combined */}
      <CombinedDateTimeField
        source="eta_date"
        label="ETA"
        timeSource="eta_time"
        width={140}
      />
      
      {/* ETD Date & Time combined */}
      <CombinedDateTimeField
        source="etd_date"
        label="ETD"
        timeSource="etd_time"
        width={140}
      />
      
      {/* Commodity badge */}
      <BadgeField
        source="commodity"
        label="Commodity"
        width={150}
        variant="outline"
        color="green"
        size="sm"
        valueMap={Object.fromEntries(
          Object.entries(CommodityLabels).map(([key, label]) => [
            key, 
            { 
              label, 
              color: 'green',
              variant: 'outline'
            }
          ])
        )}
      />
      
      {/* ETA Driver */}
      <DriverField
        source="eta_driver"
        label="ETA Driver"
        prefix="eta"
        width={160}
      />
      
      {/* ETA Vehicle */}
      <VehicleField
        source="eta_vehicle"
        label="ETA Vehicle"
        prefix="eta"
        width={160}
        sortable={false}
        filterable={false}
      />
      
      {/* ETD Driver */}
      <DriverField
        source="etd_driver"
        label="ETD Driver"
        prefix="etd"
        width={160}
      />
      
      {/* ETD Vehicle */}
      <VehicleField
        source="etd_vehicle"
        label="ETD Vehicle"
        prefix="etd"
        width={160}
        sortable={false}
        filterable={false}
      />
      
      {/* Notes */}
      <TextField
        source="notes"
        label="Notes"
        width={250}
        lineClamp={2}
      />
      
      {/* Actions */}
      <ActionField
        source="actions"
        label="Actions"
        width={80}
        sortable={false}
        filterable={false}
        actions={[
          {
            key: 'edit',
            icon: IconEdit,
            color: 'blue',
            variant: 'subtle',
            tooltip: 'Edit Order',
            onClick: (record) => onEdit?.(record.reference)
          }
        ]}
      />
    </Datagrid>
  );
}; 