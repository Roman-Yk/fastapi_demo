import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GridSortModel } from '@mui/x-data-grid';
import { List } from "../../../shared/components/layout/List"
import { OrderFiltersForm } from "../components/OrderFiltersForm";
import { OrderGrid } from "../components/OrderGrid";
import { Order, OrderFilters, DateFilterOption } from "../types/order";
import { orderApi } from "../api/orderService";

const defaultFilters: OrderFilters = {
  date_range: DateFilterOption.TODAY,
  terminal_id: 'all',
  location: null,
  status: null,
  service: null,
  commodity: null,
  priority: null,
  search: '',
  in_terminal: null,
};

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>(defaultFilters);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Load orders from API with filters
  const fetchOrders = async (activeFilters: OrderFilters, activeSortModel: GridSortModel = []) => {
    setLoading(true);
    try {
      // Filter out null, empty, or 'all' values - field names already match backend
      const backendFilters: Record<string, any> = {};
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== null && value !== "" && value !== 'all') {
          backendFilters[key] = value;
        }
      });

      // Extract sort parameters from sortModel
      // Backend expects sort as JSON array: ["field", "ASC"] or ["field", "DESC"]
      let sortParam: string | undefined = undefined;
      
      if (activeSortModel.length > 0) {
        const sortItem = activeSortModel[0];
        const sortArray = [
          sortItem.field,
          sortItem.sort?.toUpperCase() || 'ASC'
        ];
        sortParam = JSON.stringify(sortArray);
      }

      console.log("Sending filters to backend:", backendFilters);
      console.log("Sending sort to backend:", sortParam);
      
      const ordersData = await orderApi.getAll(backendFilters, { sort: sortParam });
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filters, sortModel);
  }, [filters, sortModel, fetchOrders]);

  const handleFiltersChange = async (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  // Handle sort model changes
  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
  };

  // Toolbar action handlers
  const handleRefresh = async () => {
    fetchOrders(filters, sortModel);
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
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
      />
    </List>
  );
};
