import { Children } from 'react';
import PropTypes from 'prop-types';
import { FastaGrid } from './FastaGrid';

export const Datagrid = ({ 
  children,
  data = [],
  loading = false,
  getRowId,
  
  // Toolbar props
  onRefresh,
  onImport,
  onExport,
  onCreate,
  
  // Labels
  createLabel = 'Create',
  refreshLabel = 'Refresh',
  importLabel = 'Import',
  exportLabel = 'Export',
  
  // Empty state
  emptyStateTitle = 'No data found',
  emptyStateDescription = 'No items match your current filters',
  
  // Grid configuration
  height = 600,
  pageable = true,
  sortable = true,
  filterable = true,
  
  ...otherProps
}) => {
  // Convert field children to column definitions
  const columns = Children.map(children, (child) => {
    if (!child || !child.type) return null;
    
    // Call the field component function to get column definition
    const columnDef = child.type(child.props);
    
    return columnDef;
  }).filter(Boolean);

  return (
    <FastaGrid
      data={data}
      columns={columns}
      loading={loading}
      getRowId={getRowId}
      
      // Toolbar actions
      onRefresh={onRefresh}
      onImport={onImport}
      onExport={onExport}
      onCreate={onCreate}
      
      // Labels
      createLabel={createLabel}
      refreshLabel={refreshLabel}
      importLabel={importLabel}
      exportLabel={exportLabel}
      
      // Empty state
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
      
      // Grid configuration
      height={height}
      pageable={pageable}
      sortable={sortable}
      filterable={filterable}
      
      {...otherProps}
    />
  );
};

Datagrid.propTypes = {
  children: PropTypes.node.isRequired,
  data: PropTypes.array,
  loading: PropTypes.bool,
  getRowId: PropTypes.func,
  
  // Toolbar props
  onRefresh: PropTypes.func,
  onImport: PropTypes.func,
  onExport: PropTypes.func,
  onCreate: PropTypes.func,
  
  // Labels
  createLabel: PropTypes.string,
  refreshLabel: PropTypes.string,
  importLabel: PropTypes.string,
  exportLabel: PropTypes.string,
  
  // Empty state
  emptyStateTitle: PropTypes.string,
  emptyStateDescription: PropTypes.string,
  
  // Grid configuration
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pageable: PropTypes.bool,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
};
