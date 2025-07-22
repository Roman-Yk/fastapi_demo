import PropTypes from 'prop-types';
import { Group, Button, ActionIcon, Divider } from '@mantine/core';
import {
  IconRefresh,
  IconDownload,
  IconUpload,
  IconPlus,
} from '@tabler/icons-react';

export const DataGridToolbar = ({
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
  const hasBuiltInActions = onRefresh || onImport || onExport || onCreate;
  
  return (
    <Group justify="space-between" p="md">
      <Group gap="xs">
        {/* Built-in actions */}
        {onRefresh && (
          <ActionIcon
            variant="subtle"
            color="blue"
            loading={refreshing}
            onClick={onRefresh}
            title={refreshLabel}
          >
            <IconRefresh size={16} />
          </ActionIcon>
        )}
        
        {onImport && (
          <Button
            variant="light"
            color="green"
            size="sm"
            leftSection={<IconUpload size={16} />}
            loading={importing}
            onClick={onImport}
          >
            {importLabel}
          </Button>
        )}
        
        {onExport && (
          <Button
            variant="light"
            color="orange"
            size="sm"
            leftSection={<IconDownload size={16} />}
            loading={exporting}
            onClick={onExport}
          >
            {exportLabel}
          </Button>
        )}
        
        {hasBuiltInActions && actions.length > 0 && (
          <Divider orientation="vertical" />
        )}
        
        {/* Custom actions */}
        {actions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant || 'light'}
            color={action.color || 'blue'}
            size="sm"
            leftSection={action.icon && <action.icon size={16} />}
            loading={action.loading}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </Group>
      
      {/* Create action on the right */}
      {onCreate && (
        <Button
          variant="filled"
          color="blue"
          size="sm"
          leftSection={<IconPlus size={16} />}
          onClick={onCreate}
        >
          {createLabel}
        </Button>
      )}
    </Group>
  );
};

DataGridToolbar.propTypes = {
  actions: PropTypes.array,
  onRefresh: PropTypes.func,
  onImport: PropTypes.func,
  onExport: PropTypes.func,
  onCreate: PropTypes.func,
  refreshLabel: PropTypes.string,
  importLabel: PropTypes.string,
  exportLabel: PropTypes.string,
  createLabel: PropTypes.string,
  refreshing: PropTypes.bool,
  importing: PropTypes.bool,
  exporting: PropTypes.bool,
};
