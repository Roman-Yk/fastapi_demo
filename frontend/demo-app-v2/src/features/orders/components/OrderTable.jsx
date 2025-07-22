import React from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Chip, IconButton, Box } from '@mui/material'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { formatDate, formatCurrency } from '../../../lib/formatDate.js'
import { ORDER_STATUS_LABELS } from '../../../types/index.js'

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  }
  return colors[status] || 'default'
}

const OrderTable = ({ orders, loading, onDelete }) => {
  const navigate = useNavigate()

  const columns = [
    {
      field: 'id',
      headerName: 'Order ID',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {params.value.substring(0, 8)}...
        </Box>
      )
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Box sx={{ fontWeight: 500 }}>{params.value}</Box>
          <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
            {params.row.customerEmail}
          </Box>
        </Box>
      )
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 600, color: 'primary.main' }}>
          {formatCurrency(params.value)}
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={ORDER_STATUS_LABELS[params.value]}
          color={getStatusColor(params.value)}
          size="small"
          variant="filled"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 140,
      renderCell: (params) => formatDate(params.value)
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      width: 140,
      renderCell: (params) => formatDate(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => navigate(`/orders/${params.row.id}/edit`)}
            color="primary"
          >
            <IconEdit size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete && onDelete(params.row.id)}
            color="error"
          >
            <IconTrash size={16} />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#fafafa',
            borderBottom: '2px solid #e0e0e0',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f9f9f9',
          },
        }}
      />
    </Box>
  )
}

export default OrderTable
