import React from 'react';
import { 
  DataGrid as MuiDataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridToolbarContainer,
  GridRowsProp,
  GridSortModel,
  GridFilterModel,
  GridRowParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { Paper, Stack, Text, Box } from '@mantine/core';
import { DataGridToolbar } from './DataGridToolbar';

export interface DataGridColumn<T extends GridValidRowModel = GridValidRowModel> extends Omit<GridColDef, 'renderCell'> {
  renderCell?: (params: GridRenderCellParams<T>) => React.ReactNode;
}

export interface DataGridToolbarAction {
  key: string;
  label: string;
  icon: React.FC<any>;
  variant?: 'filled' | 'light' | 'outline' | 'default' | 'subtle';
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface DataGridProps<T extends GridValidRowModel = GridValidRowModel> {
  // Data
  data: T[];
  columns: DataGridColumn<T>[];
  loading?: boolean;
  
  // Identification
  getRowId?: (row: T) => string | number;
  
  // Toolbar
  showToolbar?: boolean;
  toolbarActions?: DataGridToolbarAction[];
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

export const DataGrid = <T extends GridValidRowModel = GridValidRowModel>({
  data,
  columns,
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
}: DataGridProps<T>) => {
  
  // Convert data to GridRowsProp format
  const rows: GridRowsProp = data.map((item, index) => ({
    id: getRowId ? getRowId(item) : index,
    ...item
  }));
  
  // Build toolbar component
  const CustomToolbar = showToolbar ? () => (
    <DataGridToolbar
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
        <Stack align="center" justify="center" style={{ height: '100%' }} gap="md">
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
  
  return (
    <Paper withBorder style={{ height, minHeight, maxHeight }}>
      <MuiDataGrid
        rows={rows}
        columns={columns as GridColDef[]}
        loading={loading}
        
        // Toolbar
        slots={{
          toolbar: CustomToolbar
        }}
        
        // Features
        sortingMode={sortable ? 'client' : 'server'}
        filterMode={filterable ? 'client' : 'server'}
        disableColumnFilter={!filterable}
        disableColumnSelector={!sortable}
        disableDensitySelector={false}
        disableColumnMenu={true}
        disableRowSelectionOnClick={!selectable}
        sortingOrder={['asc', 'desc']}
        
        // Pagination
        pagination={pageable}
        page={page}
        pageSize={pageSize}
        rowCount={rowCount || data.length}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
        
        // Sorting & Filtering
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        filterModel={filterModel}
        onFilterModelChange={onFilterModelChange}
        
        // Row interactions
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        
        // Styling
        sx={{
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
        }}
      />
    </Paper>
  );
};

// Export types for use in other components
export type { GridRenderCellParams } from '@mui/x-data-grid'; 