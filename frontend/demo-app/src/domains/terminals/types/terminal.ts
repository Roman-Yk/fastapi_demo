/**
 * Terminal types
 */

import { BaseEntity, Nullable } from '../../../shared/types/common';

export interface Terminal extends BaseEntity {
  name: string;
  address: Nullable<string>;
  time_zone: string;
  short_name: Nullable<string>;
  account_code: Nullable<string>;
}

export type CreateTerminalRequest = Omit<Terminal, keyof BaseEntity>;
export type UpdateTerminalRequest = Partial<CreateTerminalRequest>;
