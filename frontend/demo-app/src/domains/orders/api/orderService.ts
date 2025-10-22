/**
 * Order API Service
 * Handles all order-related API operations
 */

import { BaseApiService } from '../../../services/baseApiService';
import { Order } from '../types/order';
import { FilterOptions } from '../../../shared/types/common';

export interface CreateOrderRequest {
  reference: string;
  service: number;
  terminal_id: string;
  eta_date?: string;
  eta_time?: string;
  etd_date?: string;
  etd_time?: string;
  commodity?: string;
  pallets?: number;
  boxes?: number;
  kilos?: number;
  notes?: string;
  priority?: boolean;
  eta_driver_id?: string;
  eta_truck_id?: string;
  eta_trailer_id?: string;
  etd_driver_id?: string;
  etd_truck_id?: string;
  etd_trailer_id?: string;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {}

/**
 * Order API Service implementation
 */
class OrderApiService extends BaseApiService<Order, CreateOrderRequest, UpdateOrderRequest> {
  protected endpoint = '/orders';

  async getAll(filters?: FilterOptions, options?: {
    page?: number;
    perPage?: number;
    sort?: string;  // JSON-encoded array like '["field", "ASC"]'
  }) {
    // Build query params
    const params = new URLSearchParams();
    if (filters && Object.keys(filters).length > 0) {
      params.append('filter', JSON.stringify(filters));
    }
    if (options?.page !== undefined) params.append('page', String(options.page));
    if (options?.perPage !== undefined) params.append('perPage', String(options.perPage));
    if (options?.sort) params.append('sort', options.sort);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest<Order[]>(query);
  }
}

// Export singleton instance
export const orderApi = new OrderApiService();
export default orderApi;