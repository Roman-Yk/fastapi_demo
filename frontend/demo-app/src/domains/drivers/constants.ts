/**
 * Driver domain constants
 */

// Driver API endpoints
export const DRIVER_ENDPOINTS = {
  BASE: '/drivers',
  BY_ID: (id: string) => `/drivers/${id}`,
  SEARCH: '/drivers/search',
  ACTIVE: '/drivers/active',
} as const;

// Driver validation rules
export const DRIVER_VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 255,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 20,
  PHONE_PATTERN: /^[\d\s+\-()]+$/,
  LICENSE_NUMBER_PATTERN: /^[A-Z0-9]+$/,
} as const;

// Driver-specific messages
export const DRIVER_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: 'Driver added successfully.',
  UPDATE_SUCCESS: 'Driver updated successfully.',
  DELETE_SUCCESS: 'Driver removed successfully.',
  ASSIGN_SUCCESS: 'Driver assigned to order successfully.',

  // Error messages
  CREATE_ERROR: 'Failed to add driver. Please try again.',
  UPDATE_ERROR: 'Failed to update driver. Please try again.',
  DELETE_ERROR: 'Failed to remove driver. Please try again.',
  NOT_FOUND: 'Driver not found.',
  DUPLICATE_LICENSE: 'A driver with this license number already exists.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  NAME_REQUIRED: 'Driver name is required.',
  ALREADY_ASSIGNED: 'This driver is already assigned to another active order.',
} as const;

// Driver UI configuration
export const DRIVER_UI = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50],
  STATUS_BADGES: {
    AVAILABLE: { color: 'green', label: 'Available' },
    BUSY: { color: 'yellow', label: 'On Trip' },
    OFF_DUTY: { color: 'gray', label: 'Off Duty' },
  },
} as const;

// Driver-specific storage keys
export const DRIVER_STORAGE_KEYS = {
  RECENT_DRIVERS: 'recent-drivers',
  DRIVER_PREFERENCES: 'driver-preferences',
} as const;