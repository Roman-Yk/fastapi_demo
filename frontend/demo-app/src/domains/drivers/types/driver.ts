/**
 * Driver types
 */

import { BaseEntity } from '../../../shared/types/common';

export interface Driver extends BaseEntity {
  name: string;
  phone: string;
}

export type CreateDriverRequest = Omit<Driver, keyof BaseEntity>;
export type UpdateDriverRequest = Partial<CreateDriverRequest>;

// Query parameters for driver list endpoint
export interface DriverQueryParams {
  ids?: string;  // Comma-separated list of IDs for batch fetching
  search?: string;
  available?: boolean;
  date?: string;
  limit?: number;
  offset?: number;
}
