import React from 'react';
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import { Group } from '@mantine/core';
import { ActionButton } from './ActionButton';
import { 
  IconRefresh, 
  IconFileImport, 
  IconFileExport, 
  IconPlus 
} from '@tabler/icons-react';

interface ToolbarAction {
  key: string;
  label: string;
  icon: React.FC<any>;
  variant?: 'filled' | 'light' | 'outline' | 'default' | 'subtle';
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface DataGridToolbarProps {
  // Standard toolbar options
  showColumnsButton?: boolean;
  showDensitySelector?: boolean;
  
  // Custom actions
  actions?: ToolbarAction[];
  
  // Quick action shortcuts
  onRefresh?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  
  // Loading states
  refreshing?: boolean;
  importing?: boolean;
  exporting?: boolean;
  
  // Labels for default actions
  refreshLabel?: string;
  importLabel?: string;
  exportLabel?: string;
  createLabel?: string;
}

export const DataGridToolbar: React.FC<DataGridToolbarProps> = ({
  showColumnsButton = true,
  showDensitySelector = true,
  actions = [],
  onRefresh,
  onImport,
  onExport,
  onCreate,
  refreshing = false,
  importing = false,
  exporting = false,
  refreshLabel = 'Refresh',
  importLabel = 'Import',
  exportLabel = 'Export',
  createLabel = 'Create'
}) => {
  
  // Build default actions based on provided handlers
  const defaultActions: ToolbarAction[] = [];
  
  if (onRefresh) {
    defaultActions.push({
      key: 'refresh',
      label: refreshLabel,
      icon: IconRefresh,
      variant: 'default',
      onClick: onRefresh,
      loading: refreshing
    });
  }
  
  if (onImport) {
    defaultActions.push({
      key: 'import',
      label: importLabel,
      icon: IconFileImport,
      variant: 'default',
      onClick: onImport,
      loading: importing
    });
  }
  
  if (onExport) {
    defaultActions.push({
      key: 'export',
      label: exportLabel,
      icon: IconFileExport,
      variant: 'default',
      onClick: onExport,
      loading: exporting
    });
  }
  
  if (onCreate) {
    defaultActions.push({
      key: 'create',
      label: createLabel,
      icon: IconPlus,
      variant: 'filled',
      color: 'green',
      onClick: onCreate
    });
  }
  
  // Combine default actions with custom actions
  const allActions = [...defaultActions, ...actions];
  
  return (
    <GridToolbarContainer>
      <Group justify="space-between" align="center" w="100%" px="md" py="sm">
        {/* Standard Grid Controls */}
        <Group gap="sm">
          {showColumnsButton && <GridToolbarColumnsButton />}
          {showDensitySelector && <GridToolbarDensitySelector />}
        </Group>
        
        {/* Custom Actions */}
        {allActions.length > 0 && (
          <Group gap="sm">
            {allActions.map((action) => (
              <ActionButton
                key={action.key}
                type="button"
                variant={action.variant || 'default'}
                color={action.color}
                size="sm"
                label={action.label}
                icon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                loading={action.loading}
              />
            ))}
          </Group>
        )}
      </Group>
    </GridToolbarContainer>
  );
};



export const SimpleToolbar: React.FC<Pick<DataGridToolbarProps, 'onRefresh' | 'onExport' | 'refreshing' | 'exporting'>> = (props) => (
  <DataGridToolbar 
    {...props}
    showColumnsButton={false}
    showDensitySelector={false}
  />
); 