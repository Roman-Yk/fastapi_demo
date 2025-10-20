/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  ORDERS: '/orders',
  DRIVERS: '/drivers',
  TERMINALS: '/terminals',
  TRUCKS: '/trucks',
  TRAILERS: '/trailers',
  ORDER_DOCUMENTS: (orderId: string) => `/orders/${orderId}/documents`,
  ORDER_DOCUMENT: (orderId: string, documentId: string) =>
    `/orders/${orderId}/documents/${documentId}`,
  ORDER_DOCUMENT_VIEW: (orderId: string, documentId: string) =>
    `/orders/${orderId}/documents/${documentId}/view`,
  ORDER_DOCUMENT_DOWNLOAD: (orderId: string, documentId: string) =>
    `/orders/${orderId}/documents/${documentId}/download`,
  ORDER_DOCUMENTS_BATCH: (orderId: string) =>
    `/orders/${orderId}/documents/batch`,
} as const;

// UI Configuration
export const UI_CONFIG = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  DEBOUNCE_DELAY: 300, // milliseconds
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'mantine-color-scheme',
  ORDER_FILTERS: 'order-filters',
  USER_PREFERENCES: 'user-preferences',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Form Validation
export const VALIDATION = {
  MIN_REFERENCE_LENGTH: 1,
  MAX_REFERENCE_LENGTH: 100,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 255,
  MAX_NOTES_LENGTH: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UPLOAD_ERROR: 'Failed to upload file. Please try again.',
  DELETE_ERROR: 'Failed to delete item. Please try again.',
  GENERIC_ERROR: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Order created successfully.',
  ORDER_UPDATED: 'Order updated successfully.',
  ORDER_DELETED: 'Order deleted successfully.',
  DOCUMENT_UPLOADED: 'Document uploaded successfully.',
  DOCUMENT_DELETED: 'Document deleted successfully.',
  CHANGES_SAVED: 'Changes saved successfully.',
} as const;
