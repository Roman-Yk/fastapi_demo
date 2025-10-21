/**
 * Terminal API Service
 * Handles all terminal-related API operations
 */

import { BaseApiService } from '../../../services/baseApiService';
import { Terminal, CreateTerminalRequest, UpdateTerminalRequest } from '../types/terminal';

/**
 * Terminal API Service implementation
 */
class TerminalApiService extends BaseApiService<Terminal, CreateTerminalRequest, UpdateTerminalRequest> {
  protected endpoint = '/terminals';

  /**
   * Get terminals by IDs
   */
  async getByIds(ids: string[]): Promise<Terminal[]> {
    if (ids.length === 0) return [];
    const params = new URLSearchParams();
    params.append('ids', ids.join(','));
    return this.makeRequest<Terminal[]>(`?${params.toString()}`);
  }
}

// Export singleton instance
export const terminalApi = new TerminalApiService();
export default terminalApi;