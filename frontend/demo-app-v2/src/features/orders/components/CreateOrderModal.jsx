import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Divider
} from '@mui/material'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '../../../types/index.js'
import { createOrderDTO } from '../types.js'
import { validateOrderForm } from '../../../lib/validators/index.js'
import { orderApi } from '../api/orderApi.js'

const CreateOrderModal = ({ open, onClose, onOrderCreated }) => {
  const form = useForm({
    initialValues: createOrderDTO(),
    validate: validateOrderForm
  })

  const handleSubmit = async (values) => {
    try {
      const newOrder = await orderApi.createOrder(values)
      
      notifications.show({
        title: 'Success',
        message: 'Order created successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      })
      
      onOrderCreated(newOrder)
      onClose()
      form.reset()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create order',
        color: 'red',
        icon: <IconX size={16} />
      })
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <DialogTitle>Create New Order</DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
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
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Create Order
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateOrderModal
