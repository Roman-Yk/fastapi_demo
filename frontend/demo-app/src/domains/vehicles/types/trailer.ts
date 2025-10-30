/**
 * Trailer types
 */

import { BaseEntity } from '../../../shared/types/common';

export interface Trailer extends BaseEntity {
  name: string;
  license_plate: string;
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