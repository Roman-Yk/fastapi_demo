import React, { useState, useEffect } from 'react'
import { Button, Box } from '@mui/material'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconCheck, IconX } from '@tabler/icons-react'
import PageHeader from '../../../components/PageHeader.jsx'
import OrderTable from '../components/OrderTable.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import CreateOrderModal from '../components/CreateOrderModal.jsx'
import { orderApi } from '../api/orderApi.js'
import { createOrderFilter } from '../types.js'
import { useDebounce } from '../../../hooks/useDebounce.js'

const OrderList = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    ...createOrderFilter(),
    selectedDateRange: 'today' // Default to 'today'
  })
  const [createModalOpen, setCreateModalOpen] = useState(false)
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.search, 300)

  // Load orders when filters change
  useEffect(() => {
    loadOrders()
  }, [debouncedSearch, filters.status, filters.dateFrom, filters.dateTo])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await orderApi.getOrders({
        ...filters,
        search: debouncedSearch
      })
      setOrders(response.data)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load orders',
        color: 'red',
        icon: <IconX size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      ...createOrderFilter(),
      selectedDateRange: 'all'
    })
  }

  const handleOrderCreated = (newOrder) => {
    setOrders(prev => [newOrder, ...prev])
  }

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderApi.deleteOrder(orderId)
        setOrders(prev => prev.filter(order => order.id !== orderId))
        
        notifications.show({
          title: 'Success',
          message: 'Order deleted successfully',
          color: 'green',
          icon: <IconCheck size={16} />
        })
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete order',
          color: 'red',
          icon: <IconX size={16} />
        })
      }
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', path: '/' },
    { label: 'Orders' }
  ]

  const headerActions = (
    <Button
      variant="contained"
      startIcon={<IconPlus size={20} />}
      onClick={() => setCreateModalOpen(true)}
    >
      Create Order
    </Button>
  )

  return (
    <>
      <PageHeader
        title="Orders"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        ordersCount={orders.length}
        totalOrders={50}
      />

      <OrderTable
        orders={orders}
        loading={loading}
        onDelete={handleDeleteOrder}
      />

      <CreateOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </>
  )
}

export default OrderList
