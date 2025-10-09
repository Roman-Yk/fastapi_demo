import React, { useState, ReactNode } from 'react';
import { 
  Stack, 
  Group, 
  Text, 
  Paper, 
  Badge, 
  Pagination,
  Flex
} from '@mantine/core';
import { CreateButton, ExportButton, RefreshButton } from './ActionButton';
import { TablerIconsProps } from '@tabler/icons-react';

interface DataListProps<T> {
  data: T[];
  title?: string;
  loading?: boolean;
  
  // Actions
  onRefresh?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  
  // Search and filter
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  
  // Rendering
  renderItem: (item: T, index: number) => ReactNode;
  renderFilters?: () => ReactNode;
  renderActions?: () => ReactNode;
  
  // Styling
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  itemProps?: any;
}

export const DataList = <T,>({
  data,
  title,
  loading = false,
  onRefresh,
  onExport,
  onCreate,
  searchable = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  page = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 25,
  renderItem,
  renderFilters,
  renderActions,
  spacing = 'md',
  itemProps,
}: DataListProps<T>) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  
  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
    onSearchChange?.(value);
  };

  return (
    <Stack gap={spacing}>
      {/* Header */}
      <Paper p="md" withBorder>
        <Group justify="space-between" align="center">
          {title && (
            <Text size="xl" fw={700} c="dark.8">
              {title}
            </Text>
          )}
          
          <Group gap="sm">
            {onRefresh && (
              <RefreshButton 
                onClick={onRefresh} 
                loading={loading}
                disabled={loading}
              />
            )}
            {onExport && (
              <ExportButton onClick={onExport} />
            )}
            {onCreate && (
              <CreateButton onClick={onCreate} />
            )}
            {renderActions?.()}
          </Group>
        </Group>
      </Paper>

      {/* Filters and Search */}
      <Paper p="md" withBorder>
        <Flex gap="md" align="center" wrap="wrap">
          
          
          {renderFilters?.()}
          
          <Group gap="xs" ml="auto">
            <Badge variant="light" color="blue" size="lg">
              {data.length} items
            </Badge>
          </Group>
        </Flex>
      </Paper>

      {/* Data List */}
      <Stack gap={spacing}>
        {loading ? (
          <Paper p="md" withBorder>
            <Text ta="center" c="dimmed">Loading...</Text>
          </Paper>
        ) : data.length === 0 ? (
          <Paper p="md" withBorder>
            <Text ta="center" c="dimmed">No items found</Text>
          </Paper>
        ) : (
          data.map((item, index) => (
            <Paper key={index} p="md" withBorder {...itemProps}>
              {renderItem(item, index)}
            </Paper>
          ))
        )}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.length)} of {data.length} items
          </Text>
          
          <Pagination
            value={page}
            onChange={onPageChange}
            total={totalPages}
            size="sm"
          />
        </Group>
      )}
    </Stack>
  );
};

// Specialized components for common use cases
interface SimpleListItemProps {
  title: string;
  subtitle?: string;
  badge?: { text: string; color?: string };
  actions?: ReactNode;
  icon?: React.FC<TablerIconsProps>;
}

export const SimpleListItem: React.FC<SimpleListItemProps> = ({
  title,
  subtitle,
  badge,
  actions,
  icon: Icon,
}) => (
  <Group justify="space-between" align="center">
    <Group gap="md">
      {Icon && <Icon size={20} color="var(--mantine-color-blue-6)" />}
      <div>
        <Text fw={500}>{title}</Text>
        {subtitle && <Text size="sm" c="dimmed">{subtitle}</Text>}
      </div>
    </Group>
    
    <Group gap="sm">
      {badge && (
        <Badge variant="light" color={badge.color || 'blue'}>
          {badge.text}
        </Badge>
      )}
      {actions}
    </Group>
  </Group>
);

export default DataList; 