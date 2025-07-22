import React from 'react';
import { 
  Badge,
  Group,
  Text,
  Chip,
  Stack,
  Tooltip,
  ActionIcon
} from '@mantine/core';
import { 
  IconUser, 
  IconTruck, 
  IconStar,
  IconEdit
} from '@tabler/icons-react';
import { 
  Order, 
  OrderServiceLabels, 
  CommodityLabels,
  OrderServiceShortLabels 
} from '../../../types/order';
import { DataGrid, DataGridColumn, GridRenderCellParams } from '../../common';

interface OrderGridProps {
  orders: Order[];
  loading?: boolean;
  onRefresh?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  onEdit?: (orderId: string) => void;
}

// Order grid column definitions
const createOrderColumns = (onEdit?: (orderId: string) => void): DataGridColumn<Order>[] => {
  const renderActions = (params: GridRenderCellParams<Order>) => {
    const order = params.row;
    return (
      <Group gap="xs">
        {onEdit && (
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            onClick={() => onEdit(order.reference)}
            title="Edit Order"
          >
            <IconEdit size={14} />
          </ActionIcon>
        )}
      </Group>
    );
  };

  const renderPriority = (params: GridRenderCellParams<Order>) => {
    const order = params.row;
    return order.priority ? (
      <Tooltip label="Priority Order">
        <IconStar size={16} color="orange" />
      </Tooltip>
    ) : null;
  };

  const renderService = (params: GridRenderCellParams<Order>) => {
    const order = params.row;
    return (
      <Tooltip label={OrderServiceLabels[order.service]}>
        <Badge variant="light" color="blue" size="sm">
          {OrderServiceShortLabels[order.service]}
        </Badge>
      </Tooltip>
    );
  };

  const renderCommodity = (params: GridRenderCellParams<Order>) => {
    const order = params.row;
    return order.commodity ? (
      <Badge variant="outline" color="green" size="sm">
        {CommodityLabels[order.commodity]}
      </Badge>
    ) : null;
  };

  const renderDateTime = (dateField: string, timeField: string) => (params: GridRenderCellParams<Order>) => {
    const order = params.row;
    const date = order[dateField as keyof Order] as string;
    const time = order[timeField as keyof Order] as string;
    
    if (!date) return null;
    
    return (
      <Stack gap={2}>
        <Text size="sm" fw={500}>
          {new Date(date).toLocaleDateString()}
        </Text>
        {time && (
          <Text size="xs" c="dimmed">
            {time.substring(0, 5)}
          </Text>
        )}
      </Stack>
    );
  };

  const renderDriver = (prefix: 'eta' | 'etd') => (params: GridRenderCellParams<Order>) => {
    const order = params.row;
    const driver = order[`${prefix}_driver` as keyof Order] as string;
    const phone = order[`${prefix}_driver_phone` as keyof Order] as string;
    
    if (!driver) return null;
    
    return (
      <Stack gap={2}>
        <Group gap="xs">
          <IconUser size={12} />
          <Text size="sm">{driver}</Text>
        </Group>
        {phone && (
          <Text size="xs" c="dimmed">
            {phone}
          </Text>
        )}
      </Stack>
    );
  };

  const renderVehicle = (prefix: 'eta' | 'etd') => (params: GridRenderCellParams<Order>) => {
    const order = params.row;
    const truck = order[`${prefix}_truck` as keyof Order] as string;
    const trailer = order[`${prefix}_trailer` as keyof Order] as string;
    
    return (
      <Stack gap={2}>
        {truck && (
          <Group gap="xs">
            <IconTruck size={12} />
            <Text size="sm">{truck}</Text>
          </Group>
        )}
        {trailer && (
          <Text size="xs" c="dimmed">
            {trailer}
          </Text>
        )}
      </Stack>
    );
  };

  return [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      renderCell: renderActions,
      sortable: false,
      filterable: false
    },
    {
      field: 'priority',
      headerName: '',
      width: 60,
      renderCell: renderPriority,
      sortable: false,
      filterable: false
    },
    {
      field: 'reference',
      headerName: 'Reference',
      width: 140,
    },
    {
      field: 'service',
      headerName: 'Service',
      width: 120,
      renderCell: renderService,
    },
    {
      field: 'eta_date',
      headerName: 'ETA',
      width: 140,
      renderCell: renderDateTime('eta_date', 'eta_time'),
    },
    {
      field: 'etd_date',
      headerName: 'ETD',
      width: 140,
      renderCell: renderDateTime('etd_date', 'etd_time'),
    },
    {
      field: 'commodity',
      headerName: 'Commodity',
      width: 150,
      renderCell: renderCommodity,
    },
    {
      field: 'eta_driver',
      headerName: 'ETA Driver',
      width: 160,
      renderCell: renderDriver('eta'),
    },
    {
      field: 'eta_vehicle',
      headerName: 'ETA Vehicle',
      width: 160,
      renderCell: renderVehicle('eta'),
      sortable: false,
      filterable: false
    },
    {
      field: 'etd_driver',
      headerName: 'ETD Driver',
      width: 160,
      renderCell: renderDriver('etd'),
    },
    {
      field: 'etd_vehicle',
      headerName: 'ETD Vehicle',
      width: 160,
      renderCell: renderVehicle('etd'),
      sortable: false,
      filterable: false
    },
    {
      field: 'notes',
      headerName: 'Notes',
      width: 250,
      flex: 1,
      renderCell: (params: GridRenderCellParams<Order>) => {
        const order = params.row;
        return order.notes ? (
          <Tooltip label={order.notes}>
            <Text size="sm" lineClamp={2}>
              {order.notes}
            </Text>
          </Tooltip>
        ) : null;
      },
    },
  ];
};

export const OrderGrid: React.FC<OrderGridProps> = ({ 
  orders, 
  loading = false, 
  onRefresh, 
  onImport, 
  onExport, 
  onCreate,
  onEdit
}) => {
  const columns = createOrderColumns(onEdit);
  
  return (
    <DataGrid<Order>
      data={orders}
      columns={columns}
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
    />
  );
}; 