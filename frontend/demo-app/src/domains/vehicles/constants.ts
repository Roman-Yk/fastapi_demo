/**
 * Vehicle domain constants (Trucks and Trailers)
 */

// Vehicle API endpoints
export const VEHICLE_ENDPOINTS = {
  TRUCKS: {
    BASE: '/trucks',
    BY_ID: (id: string) => `/trucks/${id}`,
    SEARCH: '/trucks/search',
    AVAILABLE: '/trucks/available',
  },
  TRAILERS: {
    BASE: '/trailers',
    BY_ID: (id: string) => `/trailers/${id}`,
    SEARCH: '/trailers/search',
    AVAILABLE: '/trailers/available',
  },
} as const;

// Vehicle validation rules
export const VEHICLE_VALIDATION = {
  MIN_PLATE_LENGTH: 2,
  MAX_PLATE_LENGTH: 20,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  PLATE_PATTERN: /^[A-Z0-9\-\s]+$/i,
  VIN_LENGTH: 17,
  YEAR_MIN: 1990,
  YEAR_MAX: new Date().getFullYear() + 1,
} as const;

// Vehicle-specific messages
export const VEHICLE_MESSAGES = {
  // Success messages - Trucks
  TRUCK_CREATE_SUCCESS: 'Truck added successfully.',
  TRUCK_UPDATE_SUCCESS: 'Truck updated successfully.',
  TRUCK_DELETE_SUCCESS: 'Truck removed successfully.',
  TRUCK_ASSIGN_SUCCESS: 'Truck assigned to order successfully.',

  // Success messages - Trailers
  TRAILER_CREATE_SUCCESS: 'Trailer added successfully.',
  TRAILER_UPDATE_SUCCESS: 'Trailer updated successfully.',
  TRAILER_DELETE_SUCCESS: 'Trailer removed successfully.',
  TRAILER_ASSIGN_SUCCESS: 'Trailer assigned to order successfully.',

  // Error messages
  CREATE_ERROR: 'Failed to add vehicle. Please try again.',
  UPDATE_ERROR: 'Failed to update vehicle. Please try again.',
  DELETE_ERROR: 'Failed to remove vehicle. Please try again.',
  NOT_FOUND: 'Vehicle not found.',
  DUPLICATE_PLATE: 'A vehicle with this license plate already exists.',
  INVALID_PLATE: 'Please enter a valid license plate.',
  ALREADY_ASSIGNED: 'This vehicle is already assigned to another active order.',
  MAINTENANCE_REQUIRED: 'This vehicle is due for maintenance.',
} as const;

// Vehicle UI configuration
export const VEHICLE_UI = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50],
  STATUS_INDICATORS: {
    AVAILABLE: { color: 'green', icon: 'check' },
    IN_USE: { color: 'blue', icon: 'truck' },
    MAINTENANCE: { color: 'orange', icon: 'tool' },
    OUT_OF_SERVICE: { color: 'red', icon: 'x' },
  },
  VEHICLE_TYPES: {
    TRUCK: 'Truck',
    TRAILER: 'Trailer',
  },
} as const;

// Vehicle-specific storage keys
export const VEHICLE_STORAGE_KEYS = {
  RECENT_TRUCKS: 'recent-trucks',
  RECENT_TRAILERS: 'recent-trailers',
  VEHICLE_PREFERENCES: 'vehicle-preferences',
} as const;