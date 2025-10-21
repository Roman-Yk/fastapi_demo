/**
 * Terminal types
 */

import { BaseEntity, Nullable } from '../../../shared/types/common';

export interface Terminal extends BaseEntity {
  name: string;
  code: string;
  address: Nullable<string>;
  phone: Nullable<string>;
  email: Nullable<string>;
  timezone?: string;
  account_code?: string;
}

export type CreateTerminalRequest = Omit<Terminal, keyof BaseEntity>;
export type UpdateTerminalRequest = Partial<CreateTerminalRequest>;
