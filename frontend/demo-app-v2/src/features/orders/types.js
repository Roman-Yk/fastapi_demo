import { ORDER_STATUS } from '../../types/index.js'

// Order data structure
export const createOrderDTO = () => ({
  id: '',
  customerName: '',
  customerEmail: '',
  total: 0,
  status: ORDER_STATUS.PENDING,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [],
  shippingAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  }
})

// Order filter structure
export const createOrderFilter = () => ({
  status: '',
  dateFrom: null,
  dateTo: null,
  search: '',
  selectedDateRange: 'all'
})
