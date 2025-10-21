import React from 'react';
import { Loader, Alert, Stack, Text, Button, Center } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { BaseApiError } from '../../services/baseApiService';

interface DataLoaderProps {
  loading: boolean;
  error: BaseApiError | Error | null;
  children: React.ReactNode;

  // Optional customization
  loadingMessage?: string;
  errorTitle?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  minHeight?: number | string;

  // Empty state
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

/**
 * DataLoader component for handling loading, error, and empty states consistently
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useApi(() => orderApi.getAll(), []);
 *
 * return (
 *   <DataLoader loading={loading} error={error} onRetry={refetch} isEmpty={!data?.length}>
 *     <OrderGrid data={data} />
 *   </DataLoader>
 * );
 * ```
 */
export const DataLoader: React.FC<DataLoaderProps> = ({
  loading,
  error,
  children,
  loadingMessage = 'Loading...',
  errorTitle = 'Error',
  showRetry = true,
  onRetry,
  minHeight = 200,
  isEmpty = false,
  emptyTitle = 'No data',
  emptyMessage = 'No items found.',
  emptyAction,
}) => {
  // Loading state
  if (loading) {
    return (
      <Center style={{ minHeight }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">
            {loadingMessage}
          </Text>
        </Stack>
      </Center>
    );
  }

  // Error state
  if (error) {
    const errorMessage = error instanceof BaseApiError
      ? error.message
      : error.message || 'An unexpected error occurred';

    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={errorTitle}
        color="red"
        variant="light"
        style={{ minHeight }}
      >
        <Stack gap="sm">
          <Text size="sm">{errorMessage}</Text>
          {showRetry && onRetry && (
            <Button
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
        </Stack>
      </Alert>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <Center style={{ minHeight }}>
        <Stack align="center" gap="md">
          <Text size="lg" fw={500} c="dimmed">
            {emptyTitle}
          </Text>
          <Text size="sm" c="dimmed">
            {emptyMessage}
          </Text>
          {emptyAction}
        </Stack>
      </Center>
    );
  }

  // Success state - render children
  return <>{children}</>;
};

export default DataLoader;
