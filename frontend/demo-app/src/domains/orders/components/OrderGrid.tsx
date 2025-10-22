import React from 'react';
import { IconEdit } from '@tabler/icons-react';
import { GridSortModel } from '@mui/x-data-grid';
import {
  Datagrid,
  TextField,
  LinkField,
  BadgeField,
  ActionField,
  CombinedDateTimeField,
  PriorityField,
  TooltipField,
  ReferenceDriverFieldOptimized,
  ReferenceVehicleFieldOptimized
} from '../../../shared/components';
import { useReferenceDataForGrid } from '../hooks/useReferenceDataForGrid';
import {
  Order,
  CommodityLabels,
  OrderServiceShortLabels,
  OrderServiceLabels
} from '../types/order';

interface OrderGridProps {
  orders: Order[];
  loading?: boolean;
  onRefresh?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  onEdit?: (orderId: string) => void;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
}

export const OrderGrid: React.FC<OrderGridProps> = ({ 
  orders, 
  loading = false, 
  onRefresh, 
  onImport, 
  onExport, 
  onCreate,
  onEdit,
  sortModel,
  onSortModelChange
}) => {
  // Fetch only the reference data needed for the current orders
  // This will automatically collect IDs and fetch with filter parameter
  const { getDriver, getTruck, getTrailer, loading: loadingReferenceData } = useReferenceDataForGrid(orders);
  
  return (
    <Datagrid
      data={orders}
      loading={loading || loadingReferenceData}
      getRowId={(row) => row.id}
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
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
    >
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
            onClick: (record) => onEdit?.(record.id)
          }
        ]}
      />
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
        to="/orders/{id}/edit"
        width={140}
      />
      
      {/* Service with tooltip showing full service name */}
      <TooltipField
        source="service"
        label="Service"
        width={80}
        size="sm"
        weight={500}
        color="blue"
        maxWidth={70}
        alwaysShowTooltip={true}
        valueMap={Object.fromEntries(
          Object.entries(OrderServiceShortLabels).map(([key, shortLabel]) => [
            key, 
            { 
              label: shortLabel,
              tooltip: OrderServiceLabels[key as unknown as keyof typeof OrderServiceLabels],
              color: 'blue'
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
      <ReferenceDriverFieldOptimized
        source="eta_driver"
        label="ETA Driver"
        prefix="eta"
        width={160}
        getDriver={getDriver}
      />
      
      {/* ETA Vehicle */}
      <ReferenceVehicleFieldOptimized
        source="eta_vehicle"
        label="ETA Vehicle"
        prefix="eta"
        width={160}
        sortable={false}
        filterable={false}
        getTruck={getTruck}
        getTrailer={getTrailer}
      />
      
      {/* ETD Driver */}
      <ReferenceDriverFieldOptimized
        source="etd_driver"
        label="ETD Driver"
        prefix="etd"
        width={160}
        getDriver={getDriver}
      />
      
      {/* ETD Vehicle */}
      <ReferenceVehicleFieldOptimized
        source="etd_vehicle"
        label="ETD Vehicle"
        prefix="etd"
        width={160}
        sortable={false}
        filterable={false}
        getTruck={getTruck}
        getTrailer={getTrailer}
      />
      
      {/* Notes */}
      <TextField
        source="notes"
        label="Notes"
        width={250}
        lineClamp={2}
      />
      
    </Datagrid>
  );
}; 