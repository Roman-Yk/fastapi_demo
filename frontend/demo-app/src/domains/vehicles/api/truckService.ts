/**
 * Truck API Service
 * Handles all truck-related API operations
 */

import { BaseApiService } from '../../../services/baseApiService';
import { Truck, CreateTruckRequest, UpdateTruckRequest } from '../types/truck';

/**
 * Truck API Service implementation
 */
class TruckApiService extends BaseApiService<Truck, CreateTruckRequest, UpdateTruckRequest> {
  protected endpoint = '/trucks';

  /**
   * Get trucks by IDs
   */
  async getByIds(ids: string[]): Promise<Truck[]> {
    if (ids.length === 0) return [];
    const params = new URLSearchParams();
    params.append('ids', ids.join(','));
    return this.makeRequest<Truck[]>(`?${params.toString()}`);
  }
}

// Export singleton instance
export const truckApi = new TruckApiService();
export default truckApi;