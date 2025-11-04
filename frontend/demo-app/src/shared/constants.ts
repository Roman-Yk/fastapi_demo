/**
 * Shared application-wide constants
 * Only constants used across multiple domains should be here.
 * Domain-specific constants should be in their respective domain folders.
 */

// API Configuration - Used by all domains
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Global UI Configuration - Used across all domains
export const UI_CONFIG = {
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  DEBOUNCE_DELAY: 300, // milliseconds for search inputs
  TOAST_DURATION: 5000, // 5 seconds for notifications
} as const;

// Global Storage Keys - App-wide preferences
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user-preferences',
  AUTH_TOKEN: 'auth-token',
  APP_SETTINGS: 'app-settings',
} as const;

// HTTP Status Codes - Used for API response handling
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Generic Error Messages - Used when domain-specific messages don't apply
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  GENERIC_ERROR: 'An unexpected error occurred.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
} as const;

// Generic Success Messages - Used for common actions
export const SUCCESS_MESSAGES = {
  CHANGES_SAVED: 'Changes saved successfully.',
  DATA_LOADED: 'Data loaded successfully.',
  ACTION_COMPLETED: 'Action completed successfully.',
} as const;

// Common File Validation - Used across domains that handle files
export const FILE_VALIDATION = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB default
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  IMAGE_MIME_TYPES: {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  },
} as const;
