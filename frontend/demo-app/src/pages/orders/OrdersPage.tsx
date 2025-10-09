import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from '../../components/admin';
import { OrderFiltersComponent, OrderGrid } from '../../components/features/orders';
import { mockOrders, filterOrders } from '../../utils/mockData';
import { OrderFilters, DateFilterOption } from '../../types/order';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OrderFilters>({
    dateFilter: DateFilterOption.TODAY,
    locationFilter: null,
    statusFilter: null,
    serviceFilter: null,
    commodityFilter: null,
    priorityFilter: null,
    searchText: '',
    inTerminal: false,
  });

  const [loading, setLoading] = useState(false);

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return filterOrders(mockOrders, filters);
  }, [filters]);

  const handleFiltersChange = (newFilters: OrderFilters) => {
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

  const handleEditOrder = (orderId: string) => {
    navigate(`/orders/${orderId}/edit`);
  };

  return (
    <List
      filters={
        <OrderFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalOrders={mockOrders.length}
          filteredOrders={filteredOrders.length}
        />
      }
    >
      <OrderGrid
        orders={filteredOrders}
        loading={loading}
        onRefresh={handleRefresh}
        onImport={handleImport}
        onExport={handleExport}
        onCreate={handleCreateOrder}
        onEdit={handleEditOrder}
      />
    </List>
  );
}; 