import { useState, useMemo } from 'react';
import { Stack, Container, Title, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { OrderFilters, OrderGrid } from '../components/orders';
import { mockOrders, filterOrders } from '../utils/mockData';
import { DateFilterOption } from '../constants/orderConstants';

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    dateFilter: DateFilterOption.TODAY,
    locationFilter: null,
    statusFilter: null,
    serviceFilter: null,
    commodityFilter: null,
    priorityFilter: null,
    searchText: '',
    inTerminal: null,
  });

  const [loading, setLoading] = useState(false);

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return filterOrders(mockOrders, filters);
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setFilters(newFilters);
      setLoading(false);
    }, 300);
  };

  // Toolbar action handlers
  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh API call
    setTimeout(() => {
      setLoading(false);
      console.log('Orders refreshed');
    }, 1000);
  };

  const handleImport = () => {
    console.log('Import orders dialog would open here');
  };

  const handleExport = () => {
    console.log('Export orders with current filters:', filters);
  };

  const handleCreateOrder = () => {
    navigate('/orders/create');
  };

  const handleEditOrder = (orderId) => {
    navigate(`/orders/${orderId}/edit`);
  };

  return (
    <Container size="100%" px="xl" py="md">
      <Stack gap="lg">        
        <OrderFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalOrders={mockOrders.length}
          filteredOrders={filteredOrders.length}
        />
        
        <OrderGrid
          orders={filteredOrders}
          loading={loading}
          onRefresh={handleRefresh}
          onImport={handleImport}
          onExport={handleExport}
          onCreate={handleCreateOrder}
          onEdit={handleEditOrder}
        />
      </Stack>
    </Container>
  );
};
