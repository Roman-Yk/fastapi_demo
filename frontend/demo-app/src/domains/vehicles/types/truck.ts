/**
 * Truck types
 */

import { BaseEntity, Nullable } from '../../../shared/types/common';

export interface Truck extends BaseEntity {
  truck_number: string;
  make: Nullable<string>;
  model: Nullable<string>;
  year: Nullable<number>;
  license_plate: Nullable<string>;
}

export type CreateTruckRequest = Omit<Truck, keyof BaseEntity>;
export type UpdateTruckRequest = Partial<CreateTruckRequest>;

// Query parameters for truck list endpoint
export interface TruckQueryParams {
  ids?: string;  // Comma-separated list of IDs for batch fetching
  search?: string;
  available?: boolean;
  date?: string;
  limit?: number;
  offset?: number;
}