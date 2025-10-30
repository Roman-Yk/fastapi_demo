/**
 * Truck types
 */

import { BaseEntity } from '../../../shared/types/common';

export interface Truck extends BaseEntity {
  name: string;
  license_plate: string;
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