/**
 * Datagrid Component
 *
 * A reusable data grid component built on top of MUI DataGrid with consistent styling
 * and field-based rendering similar to react-admin.
 *
 * @example
 * ```tsx
 * <Datagrid
 *   data={orders}
 *   loading={loading}
 *   onRefresh={() => refetch()}
 *   onCreate={() => navigate('/orders/create')}
 *   onRowClick={({ row }) => navigate(`/orders/${row.id}/edit`)}
 * >
 *   <TextField source="reference" label="Reference" />
 *   <BadgeField source="status" label="Status" />
 *   <DateTimeField source="created_at" label="Created" />
 * </Datagrid>
 * ```
 */
import React from 'react';
import {
  DataGrid as MuiDataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
  GridSortModel,
  GridFilterModel,
  GridRowParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { Paper, Stack, Text } from '@mantine/core';
import { DatagridToolbar, ToolbarAction } from './DatagridToolbar';
import { FieldProps } from '../fields';

export interface DatagridToolbarAction extends ToolbarAction {}

/**
 * Props for the Datagrid component
 * @template T - The type of data rows
 */
export interface DatagridProps<T extends GridValidRowModel = GridValidRowModel> {
  // Data
  data: T[];
  loading?: boolean;
  
  // Children - field components
  children: React.ReactElement<FieldProps>[];
  
  // Identification
  getRowId?: (row: T) => string | number;
  
  // Toolbar
  showToolbar?: boolean;
  toolbarActions?: DatagridToolbarAction[];
  onRefresh?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  
  // Toolbar labels
  refreshLabel?: string;
  importLabel?: string;
  exportLabel?: string;
  createLabel?: string;
  
  // Toolbar loading states
  refreshing?: boolean;
  importing?: boolean;
  exporting?: boolean;
  
  // Grid features
  sortable?: boolean;
  filterable?: boolean;
  pageable?: boolean;
  selectable?: boolean;
  
  // Pagination
  page?: number;
  pageSize?: number;
  rowCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  
  // Sorting & Filtering
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  
  // Row interactions
  onRowClick?: (params: GridRowParams<T>) => void;
  onRowDoubleClick?: (params: GridRowParams<T>) => void;
  
  // Styling
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  
  // Empty state
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: React.ReactNode;
}

export const Datagrid = <T extends GridValidRowModel = GridValidRowModel>({
  data,
  children,
  loading = false,
  getRowId,
  
  // Toolbar props
  showToolbar = true,
  toolbarActions = [],
  onRefresh,
  onImport,
  onExport,
  onCreate,
  refreshLabel = 'Refresh',
  importLabel = 'Import', 
  exportLabel = 'Export',
  createLabel = 'Create',
  refreshing = false,
  importing = false,
  exporting = false,
  
  // Grid features
  sortable = true,
  filterable = true,
  pageable = true,
  selectable = false,
  
  // Pagination
  page = 0,
  pageSize = 25,
  rowCount,
  onPageChange,
  onPageSizeChange,
  
  // Sorting & Filtering
  sortModel,
  onSortModelChange,
  filterModel,
  onFilterModelChange,
  
  // Row interactions
  onRowClick,
  onRowDoubleClick,
  
  // Styling
  height = 600,
  minHeight = 400,
  maxHeight = 800,
  
  // Empty state
  emptyStateTitle = 'No data found',
  emptyStateDescription = 'There are no items to display.',
  emptyStateAction
}: DatagridProps<T>) => {
  
  // Convert children (field components) to grid columns
  const columns: GridColDef[] = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement<FieldProps>(child)) return null;
      
      const { source, label, width, sortable: fieldSortable, filterable: fieldFilterable } = child.props;
      
      // Get the renderCell function from the field component
      const renderCell = (params: GridRenderCellParams<T>) => {
        // Clone the child with the record data
        return React.cloneElement(child, {
          ...child.props,
          record: params.row,
          value: params.row[source as keyof T]
        });
      };
      
      return {
        field: source,
        headerName: label || source,
        width: width || 150,
        sortable: fieldSortable !== false && sortable,
        filterable: fieldFilterable !== false && filterable,
        renderCell
      } as GridColDef;
    }).filter(Boolean) as GridColDef[];
  }, [children, sortable, filterable]);
  
  // Convert data to GridRowsProp format
  const rows: GridRowsProp = data.map((item, index) => ({
    id: getRowId ? getRowId(item) : index,
    ...item
  }));
  
  // Build toolbar component
  const CustomToolbar = showToolbar ? () => (
    <DatagridToolbar
      actions={toolbarActions}
      onRefresh={onRefresh}
      onImport={onImport}
      onExport={onExport}
      onCreate={onCreate}
      refreshLabel={refreshLabel}
      importLabel={importLabel}
      exportLabel={exportLabel}
      createLabel={createLabel}
      refreshing={refreshing}
      importing={importing}
      exporting={exporting}
    />
  ) : undefined;
  
  // Handle empty state
  if (!loading && data.length === 0) {
    return (
      <Paper withBorder style={{ height, minHeight, maxHeight }}>
        {/* Show toolbar even in empty state */}
        {showToolbar && CustomToolbar && <CustomToolbar />}
        <Stack align="center" justify="center" style={{ height: showToolbar ? 'calc(100% - 64px)' : '100%' }} gap="md">
          <Text size="lg" fw={600} c="dimmed">
            {emptyStateTitle}
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {emptyStateDescription}
          </Text>
          {emptyStateAction}
        </Stack>
      </Paper>
    );
  }
  
  const gridProps = {
    rows,
    columns,
    loading,
    
    // Toolbar
    slots: {
      toolbar: CustomToolbar
    },
    
    // Features
    // Use server-side sorting if onSortModelChange is provided
    sortingMode: (sortable && onSortModelChange) ? 'server' as const : 'client' as const,
    filterMode: filterable ? 'client' as const : 'server' as const,
    disableColumnFilter: !filterable,
    disableColumnSelector: !sortable,
    disableDensitySelector: false,
    disableColumnMenu: true,
    disableRowSelectionOnClick: !selectable,
    sortingOrder: ['asc', 'desc'] as const,
    
    // Pagination - only add if pageable is true
    ...(pageable && {
      pagination: true as const,
      page,
      pageSize,
      rowCount: rowCount || data.length,
      onPageChange,
      onPageSizeChange,
      rowsPerPageOptions: [10, 25, 50, 100]
    }),
    
    // Sorting & Filtering
    sortModel,
    onSortModelChange,
    filterModel,
    onFilterModelChange,
    
    // Row interactions
    onRowClick,
    onRowDoubleClick,
    
    // Styling
    sx: {
      border: 0,
      '& .MuiDataGrid-main': {
        border: 0,
      },
      '& .MuiDataGrid-cell': {
        borderBottom: '1px solid var(--mantine-color-gray-2)',
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: 'var(--mantine-color-gray-0)',
        borderBottom: '2px solid var(--mantine-color-gray-3)',
      },
      '& .MuiDataGrid-footerContainer': {
        borderTop: '1px solid var(--mantine-color-gray-3)',
      }
    }
  };
  
  return (
    <Paper withBorder style={{ height, minHeight, maxHeight }}>
      <MuiDataGrid {...gridProps} />
    </Paper>
  );
};

// Export types for use in other components
export type { GridRenderCellParams } from '@mui/x-data-grid';