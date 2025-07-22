import PropTypes from 'prop-types';
import { 
  DataGrid as MuiDataGrid,
} from '@mui/x-data-grid';
import { Paper, Stack, Text, Box } from '@mantine/core';
import { DataGridToolbar } from './DataGridToolbar';

const EmptyState = ({ title, description, action }) => (
  <Box 
    style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center'
    }}
  >
    <Text size="lg" fw={500} mb="sm">
      {title || 'No data available'}
    </Text>
    {description && (
      <Text size="sm" c="dimmed" mb="lg">
        {description}
      </Text>
    )}
    {action}
  </Box>
);

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
};

/**
 * FastaGrid - A powerful, reusable data grid component
 * Inspired by react-admin's Datagrid with enhanced functionality
 */
export const FastaGrid = ({
  // Data
  data = [],
  columns = [],
  loading = false,
  
  // Identification
  getRowId,
  
  // Toolbar
  showToolbar = true,
  toolbarActions = [],
  onRefresh,
  onImport,
  onExport,
  onCreate,
  
  // Toolbar labels
  refreshLabel = 'Refresh',
  importLabel = 'Import',
  exportLabel = 'Export',
  createLabel = 'Create',
  
  // Toolbar loading states
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
  minHeight,
  maxHeight,
  
  // Empty state
  emptyStateTitle = 'No data available',
  emptyStateDescription = 'There are no items to display',
  emptyStateAction,
  
  // Additional props
  ...otherProps
}) => {
  // Transform columns to ensure proper field mapping
  const transformedColumns = columns.map(col => ({
    ...col,
    sortable: col.sortable !== false && sortable,
    filterable: col.filterable !== false && filterable,
  }));

  // Custom toolbar component
  const CustomToolbar = () => {
    if (!showToolbar) return null;
    
    return (
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
    );
  };

  // Empty state component when no data
  if (!loading && data.length === 0) {
    return (
      <Paper withBorder p="md" style={{ minHeight }}>
        <Stack>
          {showToolbar && <CustomToolbar />}
          <EmptyState 
            title={emptyStateTitle}
            description={emptyStateDescription}
            action={emptyStateAction}
          />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper withBorder style={{ height, minHeight, maxHeight }}>
      <Stack gap={0}>
        {/* Custom toolbar outside the DataGrid */}
        {showToolbar && <CustomToolbar />}
        
        <Box style={{ 
          height: showToolbar ? `calc(${typeof height === 'number' ? height + 'px' : height} - 73px)` : height,
          minHeight: showToolbar && minHeight ? `calc(${typeof minHeight === 'number' ? minHeight + 'px' : minHeight} - 73px)` : minHeight,
          maxHeight: showToolbar && maxHeight ? `calc(${typeof maxHeight === 'number' ? maxHeight + 'px' : maxHeight} - 73px)` : maxHeight,
        }}>
          <MuiDataGrid
            rows={data}
            columns={transformedColumns}
            loading={loading}
            getRowId={getRowId}
            
            // Pagination
            pagination={pageable}
            page={page}
            pageSize={pageSize}
            rowCount={rowCount || data.length}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 25, 50, 100]}
            
            // Sorting
            sortingMode="client"
            sortModel={sortModel}
            onSortModelChange={onSortModelChange}
            
            // Filtering
            filterMode="client"
            filterModel={filterModel}
            onFilterModelChange={onFilterModelChange}
            
            // Selection
            checkboxSelection={selectable}
            disableRowSelectionOnClick={!selectable}
            
            // Row interactions
            onRowClick={onRowClick}
            onRowDoubleClick={onRowDoubleClick}
            
            // Styling
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: 'var(--mantine-color-gray-2)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--mantine-color-gray-0)',
                borderColor: 'var(--mantine-color-gray-2)',
              },
              '& .MuiDataGrid-footerContainer': {
                borderColor: 'var(--mantine-color-gray-2)',
              },
            }}
            
            {...otherProps}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

FastaGrid.propTypes = {
  // Data
  data: PropTypes.array,
  columns: PropTypes.array,
  loading: PropTypes.bool,
  
  // Identification
  getRowId: PropTypes.func,
  
  // Toolbar
  showToolbar: PropTypes.bool,
  toolbarActions: PropTypes.array,
  onRefresh: PropTypes.func,
  onImport: PropTypes.func,
  onExport: PropTypes.func,
  onCreate: PropTypes.func,
  
  // Toolbar labels
  refreshLabel: PropTypes.string,
  importLabel: PropTypes.string,
  exportLabel: PropTypes.string,
  createLabel: PropTypes.string,
  
  // Toolbar loading states
  refreshing: PropTypes.bool,
  importing: PropTypes.bool,
  exporting: PropTypes.bool,
  
  // Grid features
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  pageable: PropTypes.bool,
  selectable: PropTypes.bool,
  
  // Pagination
  page: PropTypes.number,
  pageSize: PropTypes.number,
  rowCount: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  
  // Sorting & Filtering
  sortModel: PropTypes.array,
  onSortModelChange: PropTypes.func,
  filterModel: PropTypes.object,
  onFilterModelChange: PropTypes.func,
  
  // Row interactions
  onRowClick: PropTypes.func,
  onRowDoubleClick: PropTypes.func,
  
  // Styling
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  
  // Empty state
  emptyStateTitle: PropTypes.string,
  emptyStateDescription: PropTypes.string,
  emptyStateAction: PropTypes.node,
};
