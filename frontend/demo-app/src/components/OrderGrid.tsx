import React from 'react';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton
} from '@mui/x-data-grid';
import { 
  Paper,
  Badge,
  Group,
  Text,
  Title,
  Box,
  Chip,
  Stack,
  Tooltip,
  Button,
  ActionIcon,
  Divider
} from '@mantine/core';
import { 
  IconUser, 
  IconTruck, 
  IconStar, 
  IconRefresh, 
  IconFileImport, 
  IconFileExport, 
  IconPlus 
} from '@tabler/icons-react';
import { 
  Order, 
  OrderServiceLabels, 
  CommodityLabels,
  OrderServiceShortLabels 
} from '../types/order';

interface OrderGridProps {
  orders: Order[];
  loading?: boolean;
}

// Custom toolbar component
const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <Group justify="space-between" align="center" w="100%" px="md" py="sm">
        <Group gap="sm">
          <GridToolbarColumnsButton />
          <GridToolbarDensitySelector />
        </Group>
        
        <Group gap="sm">
          <Button variant="default" size="sm" leftSection={<IconRefresh size={16} />}>
            Refresh
          </Button>
          <Button variant="default" size="sm" leftSection={<IconFileImport size={16} />}>
            Import
          </Button>
          <Button variant="default" size="sm" leftSection={<IconFileExport size={16} />}>
            Export
          </Button>
          <Button variant="filled" size="sm" leftSection={<IconPlus size={16} />}>
            New Order
          </Button>
        </Group>
      </Group>
    </GridToolbarContainer>
  );
};

export const OrderGrid: React.FC<OrderGridProps> = ({ orders, loading = false }) => {
  
  // Custom cell renderers
  const renderPriority = (params: GridRenderCellParams) => {
    const order = params.row as Order;
    return order.priority ? (
      <Tooltip label="Priority Order">
        <IconStar size={16} color="orange" />
      </Tooltip>
    ) : null;
  };

  const renderService = (params: GridRenderCellParams) => {
    const order = params.row as Order;
    return (
      <Tooltip label={OrderServiceLabels[order.service]}>
        <Badge variant="light" color="blue" size="sm">
          {OrderServiceShortLabels[order.service]}
        </Badge>
      </Tooltip>
    );
  };

  const renderCommodity = (params: GridRenderCellParams) => {
    const order = params.row as Order;
    return order.commodity ? (
      <Badge variant="outline" color="green" size="sm">
        {CommodityLabels[order.commodity]}
      </Badge>
    ) : null;
  };

  const renderDateTime = (params: GridRenderCellParams, dateField: string, timeField: string) => {
    const order = params.row as Order;
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

  const renderQuantities = (params: GridRenderCellParams) => {
    const order = params.row as Order;
    return (
      <Group gap="xs">
        {order.pallets && (
          <Tooltip label="Pallets">
            <Chip size="xs" variant="outline" color="blue">
              {order.pallets}P
            </Chip>
          </Tooltip>
        )}
        {order.boxes && (
          <Tooltip label="Boxes">
            <Chip size="xs" variant="outline" color="green">
              {order.boxes}B
            </Chip>
          </Tooltip>
        )}
        {order.kilos && (
          <Tooltip label="Kilos">
            <Chip size="xs" variant="outline" color="orange">
              {order.kilos}kg
            </Chip>
          </Tooltip>
        )}
      </Group>
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
    <Box style={{ height: 'calc(100vh - 240px)', width: '100%', minHeight: 600 }}>
      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 50,
            },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            border: 'none',
            color: 'var(--mantine-color-text)',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'var(--mantine-color-body)',
            borderBottom: '1px solid var(--mantine-color-default-border)',
            color: 'var(--mantine-color-text)',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: 'var(--mantine-color-body)',
            color: 'var(--mantine-color-text)',
            '&:hover': {
              backgroundColor: 'var(--mantine-color-default-hover)',
            },
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: 0,
            borderBottom: '1px solid var(--mantine-color-default-border)',
            backgroundColor: 'var(--mantine-color-body)',
            color: 'var(--mantine-color-text)',
          },
          '& .MuiDataGrid-root': {
            backgroundColor: 'var(--mantine-color-body)',
            color: 'var(--mantine-color-text)',
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: 'var(--mantine-color-body)',
            borderTop: '1px solid var(--mantine-color-default-border)',
          },
          '& .MuiDataGrid-selectedRowCount': {
            color: 'var(--mantine-color-text)',
          },
          '& .MuiTablePagination-root': {
            color: 'var(--mantine-color-text)',
          },
          '& .MuiDataGrid-columnSeparator': {
            color: 'var(--mantine-color-default-border)',
          },
          '& .MuiDataGrid-iconSeparator': {
            color: 'var(--mantine-color-text)',
          },
          '& .MuiDataGrid-sortIcon': {
            color: 'var(--mantine-color-text)',
          },
          '& .MuiDataGrid-filterIcon': {
            color: 'var(--mantine-color-text)',
          },
          '& .MuiDataGrid-menuIcon': {
            color: 'var(--mantine-color-text)',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'var(--mantine-color-text)',
          },
        }}
      />
    </Box>
  );
}; 