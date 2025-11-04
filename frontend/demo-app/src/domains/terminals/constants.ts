/**
 * Terminal domain constants
 */

// Terminal API endpoints
export const TERMINAL_ENDPOINTS = {
  BASE: '/terminals',
  BY_ID: (id: string) => `/terminals/${id}`,
  SEARCH: '/terminals/search',
  BY_ACCOUNT_CODE: (code: string) => `/terminals/account/${code}`,
} as const;

// Terminal validation rules
export const TERMINAL_VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 255,
  MIN_CODE_LENGTH: 3,
  MAX_CODE_LENGTH: 50,
  ACCOUNT_CODE_PATTERN: /^[A-Z0-9\-]+$/,
  TIMEZONE_PATTERN: /^[A-Za-z_\/]+$/,
  MIN_ADDRESS_LENGTH: 10,
  MAX_ADDRESS_LENGTH: 500,
} as const;

// Terminal-specific messages
export const TERMINAL_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: 'Terminal added successfully.',
  UPDATE_SUCCESS: 'Terminal updated successfully.',
  DELETE_SUCCESS: 'Terminal removed successfully.',
  CACHE_REFRESH_SUCCESS: 'Terminal cache refreshed successfully.',

  // Error messages
  CREATE_ERROR: 'Failed to add terminal. Please try again.',
  UPDATE_ERROR: 'Failed to update terminal. Please try again.',
  DELETE_ERROR: 'Failed to remove terminal. Please try again.',
  NOT_FOUND: 'Terminal not found.',
  DUPLICATE_CODE: 'A terminal with this account code already exists.',
  INVALID_TIMEZONE: 'Please select a valid timezone.',
  NAME_REQUIRED: 'Terminal name is required.',
  ACCOUNT_CODE_REQUIRED: 'Account code is required.',
  CACHE_ERROR: 'Failed to load terminal data. Please refresh the page.',
} as const;

// Terminal UI configuration
export const TERMINAL_UI = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  TERMINAL_TYPES: {
    PORT: { label: 'Port', icon: 'ship', color: 'blue' },
    WAREHOUSE: { label: 'Warehouse', icon: 'building', color: 'gray' },
    DISTRIBUTION: { label: 'Distribution Center', icon: 'truck', color: 'green' },
    RAIL: { label: 'Rail Terminal', icon: 'train', color: 'purple' },
  },
  CAPACITY_INDICATORS: {
    LOW: { color: 'green', label: '< 50% capacity' },
    MEDIUM: { color: 'yellow', label: '50-80% capacity' },
    HIGH: { color: 'orange', label: '80-95% capacity' },
    FULL: { color: 'red', label: '> 95% capacity' },
  },
} as const;

// Terminal-specific storage keys
export const TERMINAL_STORAGE_KEYS = {
  RECENT_TERMINALS: 'recent-terminals',
  TERMINAL_PREFERENCES: 'terminal-preferences',
  CACHED_TERMINALS: 'cached-terminals',
} as const;