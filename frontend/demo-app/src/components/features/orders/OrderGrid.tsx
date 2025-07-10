import React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Chip, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconUser, IconTruck, IconStar } from '@tabler/icons-react';
import { Order, OrderService, CommodityType, OrderServiceShortLabels } from '../../../types/order';
import { DataGrid } from '../../common/DataGrid';

interface OrderGridProps {
  orders: Order[];
  loading?: boolean;
  onRefresh?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
}

export const OrderGrid: React.FC<OrderGridProps> = ({ 
  orders, 
  loading = false,
  onRefresh,
  onImport,
  onExport,
  onCreate
}) => {
  const renderPriority = (params: GridRenderCellParams) => {
    const order = params.row as Order;
    return order.priority ? (
      <IconStar size={16} color="orange" fill="orange" />
    ) : null;
  };

  const renderService = (params: GridRenderCellParams) => {
    const order = params.row as Order;
    const getServiceColor = (service: OrderService) => {
      switch (service) {
        case OrderService.INTO_PLUKK_STORAGE: return 'blue';
        case OrderService.RELOAD_CAR_CAR: return 'green';
        case OrderService.RELOAD_CAR_TERMINAL_CAR: return 'orange';
        default: return 'gray';
      }
    };

    return (
      <Chip size="xs" variant="light" color={getServiceColor(order.service)}>
        {OrderServiceShortLabels[order.service]}
      </Chip>
    );
  };

  const renderCommodity = (params: GridRenderCellParams) => {
    const order = params.row as Order;
    return order.commodity ? (
      <Chip size="xs" variant="outline" color="teal">
        {order.commodity}
      </Chip>
    ) : null;
  };

  const renderDateTime = (params: GridRenderCellParams, dateField: string, timeField: string) => {
    const order = params.row as Order;
    const date = order[dateField as keyof Order] as string;
    const time = order[timeField as keyof Order] as string;
    
    if (!date) return null;
    
    return (
      <Stack gap={2}>
        <Text size="sm">{date}</Text>
        {time && (
          <Text size="xs" c="dimmed">
            {time}
          </Text>
        )}
      </Stack>
    );
  };

  const renderDriver = (params: GridRenderCellParams, prefix: 'eta' | 'etd') => {
    const order = params.row as Order;
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

  const renderVehicle = (params: GridRenderCellParams, prefix: 'eta' | 'etd') => {
    const order = params.row as Order;
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

  const columns: GridColDef[] = [
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
      renderCell: (params) => renderDateTime(params, 'eta_date', 'eta_time'),
    },
    {
      field: 'etd_date',
      headerName: 'ETD',
      width: 140,
      renderCell: (params) => renderDateTime(params, 'etd_date', 'etd_time'),
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
      renderCell: (params) => renderDriver(params, 'eta'),
    },
    {
      field: 'eta_vehicle',
      headerName: 'ETA Vehicle',
      width: 160,
      renderCell: (params) => renderVehicle(params, 'eta'),
      sortable: false,
      filterable: false
    },
    {
      field: 'etd_driver',
      headerName: 'ETD Driver',
      width: 160,
      renderCell: (params) => renderDriver(params, 'etd'),
    },
    {
      field: 'etd_vehicle',
      headerName: 'ETD Vehicle',
      width: 160,
      renderCell: (params) => renderVehicle(params, 'etd'),
      sortable: false,
      filterable: false
    },
    {
      field: 'notes',
      headerName: 'Notes',
      width: 250,
      flex: 1,
      renderCell: (params) => {
        const order = params.row as Order;
        return order.notes ? (
          <Tooltip label={order.notes}>
            <Text size="sm" lineClamp={2}>
              {order.notes}
            </Text>
          </Tooltip>
        ) : null;
      }
    }
  ];

  return (
    <DataGrid
      rows={orders}
      columns={columns}
      loading={loading}
      onRefresh={onRefresh}
      onImport={onImport}
      onExport={onExport}
      onCreate={onCreate}
      createLabel="New Order"
    />
  );
}; 