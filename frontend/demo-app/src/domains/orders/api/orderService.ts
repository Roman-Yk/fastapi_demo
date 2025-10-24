/**
 * Order API Service
 * Handles all order-related API operations
 */

import { BaseApiService } from '../../../services/baseApiService';
import { Order } from '../types/order';
import { OrderDocument } from '../types/document';
import { FilterOptions } from '../../../shared/types/common';
import { formatApiUrl } from '../../../utils/config';

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

export interface DocumentMetadata {
  title: string;
  type: string;
}

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

  // Alias for compatibility
  async getOrder(id: string): Promise<Order> {
    return this.getById(id);
  }

  // Alias for compatibility
  async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
    return this.update(id, data);
  }

  // Order Documents methods
  async getOrderDocuments(orderId: string): Promise<OrderDocument[]> {
    return this.customRequest<OrderDocument[]>(`/${orderId}/documents/`);
  }

  async uploadOrderDocuments(
    orderId: string,
    files: File[],
    metadata: DocumentMetadata[]
  ): Promise<{ created: number; documents: OrderDocument[] }> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    metadata.forEach((meta) => {
      formData.append('types', meta.type);
    });

    const url = formatApiUrl(`${this.endpoint}/${orderId}/documents/batch`);
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload documents: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteOrderDocument(orderId: string, documentId: string): Promise<void> {
    return this.customRequest<void>(`/${orderId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async updateOrderDocument(
    orderId: string,
    documentId: string,
    data: Partial<OrderDocument>
  ): Promise<OrderDocument> {
    return this.customRequest<OrderDocument>(`/${orderId}/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async downloadOrderDocument(orderId: string, documentId: string): Promise<void> {
    const url = formatApiUrl(`${this.endpoint}/${orderId}/documents/${documentId}/download`);
    window.open(url, '_blank');
  }

  viewOrderDocument(orderId: string, documentId: string): void {
    const url = formatApiUrl(`${this.endpoint}/${orderId}/documents/${documentId}/view`);
    window.open(url, '_blank');
  }
}

// Export singleton instance
export const orderApi = new OrderApiService();
export default orderApi;