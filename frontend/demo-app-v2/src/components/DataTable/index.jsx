import React from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Paper } from '@mui/material'

const DataTable = ({ 
  rows, 
  columns, 
  loading = false, 
  height = 600,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  ...props 
}) => {
  return (
    <Paper sx={{ height, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={pageSizeOptions}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize,
            },
          },
        }}
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#fafafa',
            borderBottom: '2px solid #e0e0e0',
            fontWeight: 600,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f9f9f9',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #e0e0e0',
          },
        }}
        {...props}
      />
    </Paper>
  )
}

export default DataTable
