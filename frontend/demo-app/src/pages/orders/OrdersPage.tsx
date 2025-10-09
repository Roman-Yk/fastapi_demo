import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from '../../components/admin';
import { OrderFiltersComponent, OrderGrid } from '../../components/features/orders';
import { filterOrders } from '../../utils/mockData';
import { OrderFilters, DateFilterOption } from '../../types/order';
import { Order } from '../../types/order';
import ApiService from '../../services/apiService';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await ApiService.getOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load orders:', error);
        // Show error notification here if needed
        // Fallback to empty array on error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return filterOrders(orders, filters);
  }, [orders, filters]);

  const handleFiltersChange = async (newFilters: OrderFilters) => {
    setLoading(true);
    
    // Apply filters immediately for client-side filtering
    // In production, you might want to send filter parameters to the API
    setFilters(newFilters);
    setLoading(false);
  };

  // Toolbar action handlers
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const ordersData = await ApiService.getOrders();
      setOrders(ordersData);
      console.log('Orders refreshed');
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      // Fallback to empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
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
          totalOrders={orders.length}
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