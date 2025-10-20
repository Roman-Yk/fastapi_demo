/**
 * Driver types
 */

import { BaseEntity, Nullable } from '../../../shared/types/common';

export interface Driver extends BaseEntity {
  name: string;
  email: Nullable<string>;
  phone: Nullable<string>;
  license_number: Nullable<string>;
  license_expiry: Nullable<string>;
}

export type CreateDriverRequest = Omit<Driver, keyof BaseEntity>;
export type UpdateDriverRequest = Partial<CreateDriverRequest>;
