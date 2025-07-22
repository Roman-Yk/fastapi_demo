import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { ORDER_STATUS } from '../../../types/index.js'

// Mock data
const mockOrders = [
  {
    id: uuidv4(),
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    total: 299.99,
    status: ORDER_STATUS.DELIVERED,
    createdAt: dayjs().subtract(5, 'days').toISOString(),
    updatedAt: dayjs().subtract(2, 'days').toISOString(),
    items: [
      { id: 1, name: 'Laptop', quantity: 1, price: 299.99 }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    id: uuidv4(),
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    total: 149.99,
    status: ORDER_STATUS.PROCESSING,
    createdAt: dayjs().subtract(3, 'days').toISOString(),
    updatedAt: dayjs().subtract(1, 'day').toISOString(),
    items: [
      { id: 2, name: 'Headphones', quantity: 1, price: 149.99 }
    ],
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    }
  },
  {
    id: uuidv4(),
    customerName: 'Bob Johnson',
    customerEmail: 'bob.johnson@example.com',
    total: 79.99,
    status: ORDER_STATUS.SHIPPED,
    createdAt: dayjs().subtract(2, 'days').toISOString(),
    updatedAt: dayjs().subtract(1, 'hour').toISOString(),
    items: [
      { id: 3, name: 'Mouse', quantity: 1, price: 79.99 }
    ],
    shippingAddress: {
      street: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    }
  },
  {
    id: uuidv4(),
    customerName: 'Alice Brown',
    customerEmail: 'alice.brown@example.com',
    total: 199.99,
    status: ORDER_STATUS.PENDING,
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    updatedAt: dayjs().subtract(1, 'day').toISOString(),
    items: [
      { id: 4, name: 'Keyboard', quantity: 1, price: 199.99 }
    ],
    shippingAddress: {
      street: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    }
  },
  {
    id: uuidv4(),
    customerName: 'Charlie Wilson',
    customerEmail: 'charlie.wilson@example.com',
    total: 89.99,
    status: ORDER_STATUS.CANCELLED,
    createdAt: dayjs().subtract(7, 'days').toISOString(),
    updatedAt: dayjs().subtract(6, 'days').toISOString(),
    items: [
      { id: 5, name: 'Webcam', quantity: 1, price: 89.99 }
    ],
    shippingAddress: {
      street: '654 Maple Dr',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    }
  }
]

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const orderApi = {
  // Get all orders with filtering
  getOrders: async (filters = {}) => {
    await delay(300) // Simulate network delay
    
    let filteredOrders = [...mockOrders]
    
    // Apply filters
    if (filters.status) {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status)
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredOrders = filteredOrders.filter(order => 
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerEmail.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.dateFrom) {
      filteredOrders = filteredOrders.filter(order => 
        dayjs(order.createdAt).isAfter(dayjs(filters.dateFrom))
      )
    }
    
    if (filters.dateTo) {
      filteredOrders = filteredOrders.filter(order => 
        dayjs(order.createdAt).isBefore(dayjs(filters.dateTo))
      )
    }
    
    return {
      data: filteredOrders,
      total: filteredOrders.length
    }
  },

  // Get single order by ID
  getOrderById: async (id) => {
    await delay(200)
    const order = mockOrders.find(order => order.id === id)
    if (!order) {
      throw new Error('Order not found')
    }
    return order
  },

  // Create new order
  createOrder: async (orderData) => {
    await delay(500)
    const newOrder = {
      ...orderData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockOrders.unshift(newOrder)
    return newOrder
  },

  // Update existing order
  updateOrder: async (id, orderData) => {
    await delay(500)
    const orderIndex = mockOrders.findIndex(order => order.id === id)
    if (orderIndex === -1) {
      throw new Error('Order not found')
    }
    
    const updatedOrder = {
      ...mockOrders[orderIndex],
      ...orderData,
      updatedAt: new Date().toISOString()
    }
    
    mockOrders[orderIndex] = updatedOrder
    return updatedOrder
  },

  // Delete order
  deleteOrder: async (id) => {
    await delay(300)
    const orderIndex = mockOrders.findIndex(order => order.id === id)
    if (orderIndex === -1) {
      throw new Error('Order not found')
    }
    
    mockOrders.splice(orderIndex, 1)
    return { success: true }
  }
}
