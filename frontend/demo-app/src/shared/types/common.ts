/**
 * Common types used across the application
 */

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Form data types
export type FormFieldValue = string | number | boolean | Date | null | undefined;

export interface FormData {
  [key: string]: FormFieldValue;
}

// Common entity properties
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// API request options
export interface ApiRequestOptions {
  page?: number;
  perPage?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface FilterOptions extends Record<string, unknown> {
  search?: string;
}

// Callback types
export type SuccessCallback<T> = (data: T) => void;
export type ErrorCallback = (error: Error) => void;
export type VoidCallback = () => void;

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;
