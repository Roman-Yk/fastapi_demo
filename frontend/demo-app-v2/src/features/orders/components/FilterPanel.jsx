import React, { useState } from 'react'
import { 
  Paper, 
  Box, 
  Chip, 
  Button, 
  Menu, 
  MenuItem, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Typography
} from '@mui/material'
import { DatePicker } from '@mantine/dates'
import { IconFilter, IconPlus, IconCalendar } from '@tabler/icons-react'
import { ORDER_STATUS_LABELS } from '../../../types/index.js'
import dayjs from 'dayjs'

const FilterPanel = ({ filters, onFiltersChange, onClearFilters, ordersCount = 0, totalOrders = 50 }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  
  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    })
  }

  const handleDateRangeSelect = (range) => {
    const today = dayjs()
    let dateFrom = null
    let dateTo = null

    switch (range) {
      case 'today':
        dateFrom = today.startOf('day').toDate()
        dateTo = today.endOf('day').toDate()
        break
      case 'yesterday':
        dateFrom = today.subtract(1, 'day').startOf('day').toDate()
        dateTo = today.subtract(1, 'day').endOf('day').toDate()
        break
      case 'tomorrow':
        dateFrom = today.add(1, 'day').startOf('day').toDate()
        dateTo = today.add(1, 'day').endOf('day').toDate()
        break
      case 'thisWeek':
        dateFrom = today.startOf('week').toDate()
        dateTo = today.endOf('week').toDate()
        break
      case 'thisMonth':
        dateFrom = today.startOf('month').toDate()
        dateTo = today.endOf('month').toDate()
        break
      case 'lastWeek':
        dateFrom = today.subtract(1, 'week').startOf('week').toDate()
        dateTo = today.subtract(1, 'week').endOf('week').toDate()
        break
      case 'all':
        dateFrom = null
        dateTo = null
        break
    }

    onFiltersChange({
      ...filters,
      dateFrom,
      dateTo,
      selectedDateRange: range
    })
  }

  const getActiveDateRange = () => {
    if (filters.selectedDateRange) return filters.selectedDateRange
    if (!filters.dateFrom && !filters.dateTo) return 'all'
    return 'custom'
  }

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'all', label: 'All' },
  ]

  const activeFilters = []
  if (filters.search) activeFilters.push({ key: 'search', label: `Search: ${filters.search}` })
  if (filters.status) activeFilters.push({ key: 'status', label: `Status: ${ORDER_STATUS_LABELS[filters.status]}` })

  const handleAddFilterClick = (event) => {
    setAnchorEl(event.currentTarget)
    setFilterMenuOpen(true)
  }

  const handleFilterMenuClose = () => {
    setAnchorEl(null)
    setFilterMenuOpen(false)
  }

  const removeFilter = (filterKey) => {
    onFiltersChange({
      ...filters,
      [filterKey]: filterKey === 'status' ? '' : ''
    })
  }

  return (
    <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {/* ETA Date Label */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
          ETA Date:
        </Typography>

        {/* Date Range Pills */}
        {dateRangeOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            clickable
            onClick={() => handleDateRangeSelect(option.value)}
            color={getActiveDateRange() === option.value ? 'primary' : 'default'}
            variant={getActiveDateRange() === option.value ? 'filled' : 'outlined'}
            sx={{
              borderRadius: '16px',
              height: '32px',
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: getActiveDateRange() === option.value ? 'primary.main' : 'action.hover',
              },
            }}
          />
        ))}

        {/* Add Filter Button */}
        <Button
          variant="outlined"
          startIcon={<IconFilter size={16} />}
          onClick={handleAddFilterClick}
          sx={{
            borderRadius: '16px',
            height: '32px',
            textTransform: 'none',
            fontSize: '0.875rem',
            ml: 1,
          }}
        >
          Add Filter
        </Button>

        {/* Active Filter Chips */}
        {activeFilters.map((filter) => (
          <Chip
            key={filter.key}
            label={filter.label}
            onDelete={() => removeFilter(filter.key)}
            color="secondary"
            variant="filled"
            sx={{
              borderRadius: '16px',
              height: '32px',
              fontSize: '0.875rem',
            }}
          />
        ))}

        {/* Orders Count */}
        <Box sx={{ ml: 'auto', color: 'primary.main', fontWeight: 600, fontSize: '0.875rem' }}>
          {ordersCount} OF {totalOrders} ORDERS
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={filterMenuOpen}
        onClose={handleFilterMenuClose}
        PaperProps={{
          sx: {
            width: 300,
            p: 2,
          },
        }}
      >
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Search"
            placeholder="Customer name, email, or order ID"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Custom Date Range
          </Typography>
          
          <DatePicker
            label="Date From"
            placeholder="Select start date"
            value={filters.dateFrom}
            onChange={(date) => {
              handleFilterChange('dateFrom', date)
              handleFilterChange('selectedDateRange', 'custom')
            }}
            clearable
            size="sm"
            style={{ width: '100%', marginBottom: '8px' }}
          />
          
          <DatePicker
            label="Date To"
            placeholder="Select end date"
            value={filters.dateTo}
            onChange={(date) => {
              handleFilterChange('dateTo', date)
              handleFilterChange('selectedDateRange', 'custom')
            }}
            clearable
            size="sm"
            style={{ width: '100%' }}
          />
        </Box>
        
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            onClearFilters()
            handleFilterMenuClose()
          }}
        >
          Clear All Filters
        </Button>
      </Menu>
    </Paper>
  )
}

export default FilterPanel
