import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Paper,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Divider,
  Skeleton
} from '@mui/material'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX, IconArrowLeft } from '@tabler/icons-react'
import PageHeader from '../../../components/PageHeader.jsx'
import { ORDER_STATUS_LABELS } from '../../../types/index.js'
import { validateOrderForm } from '../../../lib/validators/index.js'
import { orderApi } from '../api/orderApi.js'

const OrderEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm({
    initialValues: {
      customerName: '',
      customerEmail: '',
      total: 0,
      status: '',
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    validate: validateOrderForm
  })

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    try {
      const order = await orderApi.getOrderById(id)
      form.setValues(order)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load order',
        color: 'red',
        icon: <IconX size={16} />
      })
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setSaving(true)
    try {
      await orderApi.updateOrder(id, values)
      
      notifications.show({
        title: 'Success',
        message: 'Order updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      })
      
      navigate('/orders')
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update order',
        color: 'red',
        icon: <IconX size={16} />
      })
    } finally {
      setSaving(false)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', path: '/' },
    { label: 'Orders', path: '/orders' },
    { label: 'Edit Order' }
  ]

  const headerActions = (
    <Button
      variant="outlined"
      startIcon={<IconArrowLeft size={20} />}
      onClick={() => navigate('/orders')}
    >
      Back to Orders
    </Button>
  )

  if (loading) {
    return (
      <>
        <PageHeader
          title="Edit Order"
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Skeleton variant="rectangular" height={56} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Edit Order"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      <Paper sx={{ p: 3 }}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12}>
              <Box sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Customer Information
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                {...form.getInputProps('customerName')}
                error={!!form.errors.customerName}
                helperText={form.errors.customerName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Email"
                type="email"
                {...form.getInputProps('customerEmail')}
                error={!!form.errors.customerEmail}
                helperText={form.errors.customerEmail}
              />
            </Grid>

            {/* Order Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Order Information
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                {...form.getInputProps('total')}
                error={!!form.errors.total}
                helperText={form.errors.total}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  {...form.getInputProps('status')}
                  error={!!form.errors.status}
                >
                  {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Shipping Address */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Shipping Address
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                {...form.getInputProps('shippingAddress.street')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                {...form.getInputProps('shippingAddress.city')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                {...form.getInputProps('shippingAddress.state')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zip Code"
                {...form.getInputProps('shippingAddress.zipCode')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                {...form.getInputProps('shippingAddress.country')}
              />
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/orders')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  loading={saving}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}

export default OrderEdit
