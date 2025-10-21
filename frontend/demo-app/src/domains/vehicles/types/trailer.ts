/**
 * Trailer types
 */

import { BaseEntity, Nullable } from '../../../shared/types/common';

export interface Trailer extends BaseEntity {
  license_plate: string;
  type: Nullable<string>;
  capacity: Nullable<number>;
}

export type CreateTrailerRequest = Omit<Trailer, keyof BaseEntity>;
export type UpdateTrailerRequest = Partial<CreateTrailerRequest>;

// Query parameters for trailer list endpoint
export interface TrailerQueryParams {
  ids?: string;  // Comma-separated list of IDs for batch fetching
  search?: string;
  available?: boolean;
  date?: string;
  limit?: number;
  offset?: number;
}