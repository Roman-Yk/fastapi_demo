/**
 * Vehicle types (Trucks and Trailers)
 */

import { BaseEntity, Nullable } from '../../../shared/types/common';

export interface Truck extends BaseEntity {
  truck_number: string;
  make: Nullable<string>;
  model: Nullable<string>;
  year: Nullable<number>;
  license_plate: Nullable<string>;
}

export interface Trailer extends BaseEntity {
  license_plate: string;
  type: Nullable<string>;
  capacity: Nullable<number>;
}

export type CreateTruckRequest = Omit<Truck, keyof BaseEntity>;
export type UpdateTruckRequest = Partial<CreateTruckRequest>;

export type CreateTrailerRequest = Omit<Trailer, keyof BaseEntity>;
export type UpdateTrailerRequest = Partial<CreateTrailerRequest>;
