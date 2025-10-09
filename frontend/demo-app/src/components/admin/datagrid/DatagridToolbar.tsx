import React from 'react';
import { 
  Group, 
  Button, 
  ActionIcon,
  Divider,
  Flex
} from '@mantine/core';
import { 
  IconRefresh, 
  IconPlus, 
  IconDownload, 
  IconUpload 
} from '@tabler/icons-react';

export interface ToolbarAction {
  key: string;
  label: string;
  icon: React.FC<any>;
  variant?: 'filled' | 'light' | 'outline' | 'default' | 'subtle';
  color?: string;
  onClick: () => void;
  loading?: boolean;
}

interface DatagridToolbarProps {
  actions?: ToolbarAction[];
  onRefresh?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  refreshLabel?: string;
  importLabel?: string;
  exportLabel?: string;
  createLabel?: string;
  refreshing?: boolean;
  importing?: boolean;
  exporting?: boolean;
}

export const DatagridToolbar: React.FC<DatagridToolbarProps> = ({
  actions = [],
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
}) => {
  return (
    <Flex 
      justify="space-between" 
      align="center" 
      p="sm" 
      style={{ 
        borderBottom: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-gray-0)'
      }}
    >
      <Group gap="xs">
        {/* Standard actions */}
        {onRefresh && (
          <ActionIcon
            variant="subtle"
            loading={refreshing}
            onClick={onRefresh}
            title={refreshLabel}
          >
            <IconRefresh size={16} />
          </ActionIcon>
        )}
        
        {(onImport || onExport) && <Divider orientation="vertical" />}
        
        {onImport && (
          <Button
            variant="light"
            leftSection={<IconUpload size={16} />}
            loading={importing}
            onClick={onImport}
            size="sm"
          >
            {importLabel}
          </Button>
        )}
        
        {onExport && (
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            loading={exporting}
            onClick={onExport}
            size="sm"
          >
            {exportLabel}
          </Button>
        )}
        
        {/* Custom actions */}
        {actions.length > 0 && <Divider orientation="vertical" />}
        {actions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant || 'light'}
            color={action.color}
            leftSection={<action.icon size={16} />}
            onClick={action.onClick}
            loading={action.loading}
            size="sm"
          >
            {action.label}
          </Button>
        ))}
      </Group>

      <Group gap="xs">
        {onCreate && (
          <Button
            variant="filled"
            leftSection={<IconPlus size={16} />}
            onClick={onCreate}
            size="sm"
          >
            {createLabel}
          </Button>
        )}
      </Group>
    </Flex>
  );
};