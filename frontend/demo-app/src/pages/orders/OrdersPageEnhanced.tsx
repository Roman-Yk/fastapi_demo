import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { List } from '../../components/admin';
import { OrderFiltersComponent, OrderGrid } from '../../components/features/orders';
import { filterOrders } from '../../utils/mockData';
import { OrderFilters, DateFilterOption } from '../../types/order';
import { orderApi } from '../../services/apiServices';
import { useApi } from '../../hooks/useApi';
import { useFormData } from '../../hooks/useFormData';

import { ErrorBoundary } from '../../components/common/ErrorBoundary';

// Default filters configuration
const defaultFilters: OrderFilters = {
  dateFilter: DateFilterOption.TODAY,
  locationFilter: null,
  statusFilter: null,
  serviceFilter: null,
  commodityFilter: null,
  priorityFilter: null,
  searchText: '',
  inTerminal: false,
};

// Orders page component with improved error handling and performance
export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();

  // Use our enhanced form hook for filters
  const {
    formData: filters,
    updateField: updateFilter,
  } = useFormData({
    initialData: defaultFilters,
    validateOnChange: false, // Don't validate filters
  });

  // Use our enhanced API hook with proper error handling
  const {
    data: orders,
    loading,
    error,
    refetch: refreshOrders,
  } = useApi(
    () => orderApi.getAll(),
    [], // No dependencies - load once on mount
    {
      onSuccess: (data) => {
        if (import.meta.env.NODE_ENV === 'development') {
          console.log(`✅ Loaded ${data.length} orders`);
        }
      },
      onError: (error) => {
        notifications.show({
          title: 'Error Loading Orders',
          message: error.message,
          color: 'red',
        });
      },
    }
  );

  // Memoized filtered orders to avoid unnecessary recalculations
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return filterOrders(orders, filters);
  }, [orders, filters]);

  // Performance tracking for filtering (development only)
  const filteredOrdersWithPerf = useMemo(() => {
    if (import.meta.env.NODE_ENV === 'development') {
      const start = performance.now();
      const result = filteredOrders;
      const end = performance.now();
      console.log(`🔍 Filtering ${orders?.length || 0} orders took ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return filteredOrders;
  }, [filteredOrders, orders]);

  // Enhanced filter change handler
  const handleFiltersChange = async (newFilters: OrderFilters) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      updateFilter(key as keyof OrderFilters, value);
    });
  };

  // Enhanced handlers with better error handling
  const handleRefresh = async () => {
    try {
      await refreshOrders();
      notifications.show({
        title: 'Success',
        message: 'Orders refreshed successfully',
        color: 'green',
      });
    } catch (error) {
      // Error is already handled by the useApi hook
      console.error('Failed to refresh orders:', error);
    }
  };

  const handleImport = () => {
    notifications.show({
      title: 'Feature Coming Soon',
      message: 'Import functionality will be available soon',
      color: 'blue',
    });
  };

  const handleExport = () => {
    try {
      // In a real app, this would generate and download a file
      const dataToExport = {
        orders: filteredOrdersWithPerf,
        filters,
        exportedAt: new Date().toISOString(),
        totalCount: orders?.length || 0,
        filteredCount: filteredOrdersWithPerf.length,
      };
      
      console.log('📊 Export data:', dataToExport);
      
      notifications.show({
        title: 'Export Started',
        message: `Exporting ${filteredOrdersWithPerf.length} orders...`,
        color: 'blue',
      });
    } catch (error) {
      notifications.show({
        title: 'Export Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        color: 'red',
      });
    }
  };

  const handleCreateOrder = () => {
    navigate('/orders/create');
  };

  const handleEditOrder = (orderId: string) => {
    navigate(`/orders/${orderId}/edit`);
  };

  // Show error state if there's an API error
  if (error) {
    return (
      <div>
        <p>Error loading orders: {error.message}</p>
        <button onClick={handleRefresh}>Try Again</button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('OrdersPage Error:', error, errorInfo);
        notifications.show({
          title: 'Unexpected Error',
          message: 'Something went wrong on the orders page',
          color: 'red',
        });
      }}
    >
      <List
        filters={
          <OrderFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalOrders={orders?.length || 0}
            filteredOrders={filteredOrdersWithPerf.length}

          />
        }
      >
        <OrderGrid
          orders={filteredOrdersWithPerf}
          loading={loading}
          onRefresh={handleRefresh}
          onImport={handleImport}
          onExport={handleExport}
          onCreate={handleCreateOrder}
          onEdit={handleEditOrder}
        />
      </List>
    </ErrorBoundary>
  );
};