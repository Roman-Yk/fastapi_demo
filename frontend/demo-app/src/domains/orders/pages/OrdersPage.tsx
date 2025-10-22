import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GridSortModel } from '@mui/x-data-grid';
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
  inTerminal: null,
  hasEtaDate: null,
  hasEtdDate: null,
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
      // Automatically map frontend filters to backend filter fields
      const backendFilters: Record<string, any> = {};
      Object.entries(activeFilters).forEach(([key, value]) => {
        // Special handling for Yes/No filters
        const yesNoFilters = ["priorityFilter", "hasEtaDate", "hasEtdDate", "inTerminal"];
        if (yesNoFilters.includes(key) && value !== null) {
          // Handle Yes/No filter
          // 'yes' -> true
          // 'no' -> false
          // null -> no filter (don't send to backend)
          if (value === 'yes' || value === 'no') {
            const boolValue = value === 'yes';
            // Map filter names to backend fields
            switch(key) {
              case "priorityFilter":
                backendFilters["priority"] = boolValue;
                break;
              case "hasEtaDate":
                backendFilters["has_eta_date"] = boolValue;
                break;
              case "hasEtdDate":
                backendFilters["has_etd_date"] = boolValue;
                break;
              case "inTerminal":
                backendFilters["in_terminal"] = boolValue;
                break;
            }
          }
        } else if (value !== null && value !== "" && value !== false) {
          // Rename fields if needed
          if (key === "dateFilter") {
            backendFilters["date_range"] = value;
          } else {
            backendFilters[key.replace(/Filter$/, "")] = value;
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortModel]);

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
