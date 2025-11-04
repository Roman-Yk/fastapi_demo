/**
 * Order domain constants
 */

// Order API endpoints
export const ORDER_ENDPOINTS = {
  BASE: '/orders',
  BY_ID: (id: string) => `/orders/${id}`,
  DOCUMENTS: (orderId: string) => `/orders/${orderId}/documents`,
  DOCUMENT: (orderId: string, documentId: string) =>
    `/orders/${orderId}/documents/${documentId}`,
  DOCUMENT_VIEW: (orderId: string, documentId: string) =>
    `/orders/${orderId}/documents/${documentId}/view`,
  DOCUMENT_DOWNLOAD: (orderId: string, documentId: string) =>
    `/orders/${orderId}/documents/${documentId}/download`,
  DOCUMENTS_BATCH: (orderId: string) =>
    `/orders/${orderId}/documents/batch`,
} as const;

// Order validation rules
export const ORDER_VALIDATION = {
  MIN_REFERENCE_LENGTH: 1,
  MAX_REFERENCE_LENGTH: 100,
  MAX_NOTES_LENGTH: 1000,
  MIN_QUANTITY: 0,
  MAX_QUANTITY: 99999,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ],
} as const;

// Order-specific messages
export const ORDER_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: 'Order created successfully.',
  UPDATE_SUCCESS: 'Order updated successfully.',
  DELETE_SUCCESS: 'Order deleted successfully.',
  DOCUMENT_UPLOAD_SUCCESS: 'Document uploaded successfully.',
  DOCUMENT_DELETE_SUCCESS: 'Document deleted successfully.',

  // Error messages
  CREATE_ERROR: 'Failed to create order. Please try again.',
  UPDATE_ERROR: 'Failed to update order. Please try again.',
  DELETE_ERROR: 'Failed to delete order. Please try again.',
  DOCUMENT_UPLOAD_ERROR: 'Failed to upload document. Please try again.',
  DOCUMENT_DELETE_ERROR: 'Failed to delete document. Please try again.',
  DUPLICATE_REFERENCE: 'An order with this reference already exists.',
  INVALID_DATES: 'ETD must be after or equal to ETA.',
  REFERENCE_REQUIRED: 'Order reference is required.',
  TERMINAL_REQUIRED: 'Terminal is required.',
} as const;

// Order UI configuration
export const ORDER_UI = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  PRIORITY_LEVELS: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  },
  STATUS_COLORS: {
    PENDING: 'yellow',
    IN_TRANSIT: 'blue',
    DELIVERED: 'green',
    CANCELLED: 'red',
  },
} as const;

// Order-specific storage keys
export const ORDER_STORAGE_KEYS = {
  FILTERS: 'order-filters',
  COLUMN_VISIBILITY: 'order-column-visibility',
  SORT_PREFERENCES: 'order-sort-preferences',
} as const;