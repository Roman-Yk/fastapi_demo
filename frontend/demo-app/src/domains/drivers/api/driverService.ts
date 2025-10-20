/**
 * Driver API Service
 * Handles all driver-related API operations
 */

import { BaseApiService } from '../../../services/baseApiService';
import { Driver, CreateDriverRequest, UpdateDriverRequest } from '../types/driver';

/**
 * Driver API Service implementation
 */
class DriverApiService extends BaseApiService<Driver, CreateDriverRequest, UpdateDriverRequest> {
  protected endpoint = '/drivers';

  /**
   * Get drivers by IDs
   */
  async getByIds(ids: string[]): Promise<Driver[]> {
    if (ids.length === 0) return [];
    const params = new URLSearchParams();
    params.append('ids', ids.join(','));
    return this.makeRequest<Driver[]>(`?${params.toString()}`);
  }
}

// Export singleton instance
export const driverApi = new DriverApiService();
export default driverApi;