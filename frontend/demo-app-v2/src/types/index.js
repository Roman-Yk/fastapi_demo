// Global type definitions

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing', 
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped', 
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
}

// User type structure
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager'
}

// Pagination structure
export const DEFAULT_PAGINATION = {
  page: 0,
  pageSize: 10,
  total: 0
}
