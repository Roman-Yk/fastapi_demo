/**
 * Trailer API Service
 * Handles all trailer-related API operations
 */

import { BaseApiService } from '../../../services/baseApiService';
import { Trailer, CreateTrailerRequest, UpdateTrailerRequest } from '../types/vehicle';

/**
 * Trailer API Service implementation
 */
class TrailerApiService extends BaseApiService<Trailer, CreateTrailerRequest, UpdateTrailerRequest> {
  protected endpoint = '/trailers';

  /**
   * Get trailers by IDs
   */
  async getByIds(ids: string[]): Promise<Trailer[]> {
    if (ids.length === 0) return [];
    const params = new URLSearchParams();
    params.append('ids', ids.join(','));
    return this.makeRequest<Trailer[]>(`?${params.toString()}`);
  }
}

// Export singleton instance
export const trailerApi = new TrailerApiService();
export default trailerApi;