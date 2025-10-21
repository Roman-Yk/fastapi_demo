import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { List } from "../../../shared/components/layout/List"
import { OrderFiltersForm } from "../components/OrderFiltersForm";
import { OrderGrid } from "../components/OrderGrid";
import { Order, OrderFilters, DateFilterOption } from "../types/order";
import { orderApi } from "../api/orderService";

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

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>(defaultFilters);

  // Load orders from API with filters
  const fetchOrders = async (activeFilters: OrderFilters) => {
    setLoading(true);
    try {
      // Automatically map frontend filters to backend filter fields
      const backendFilters: Record<string, any> = {};
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== null && value !== "" && value !== false) {
          // Rename fields if needed
          if (key === "dateFilter") {
            backendFilters["date_range"] = value;
          } else {
            backendFilters[key.replace(/Filter$/, "")] = value;
          }
        }
      });

      console.log("Sending filters to backend:", backendFilters);
      const ordersData = await orderApi.getAll(backendFilters);
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFiltersChange = async (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  // Toolbar action handlers
  const handleRefresh = async () => {
    fetchOrders(filters);
  };

  const handleImport = () => {
    console.log("Import orders dialog would open here");
  };

  const handleExport = () => {
    console.log("Export orders with current filters:", filters);
  };

  const handleCreateOrder = () => {
    navigate("/orders/create");
  };

  const handleEditOrder = (orderId: string) => {
    navigate(`/orders/${orderId}/edit`);
  };

  return (
    <List
      filters={
        <OrderFiltersForm
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalOrders={orders.length}
          filteredOrders={orders.length}
        />
      }
    >
      <OrderGrid
        orders={orders}
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
