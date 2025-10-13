/**
 * Base API Service with generic CRUD operations
 * Eliminates code duplication and provides consistent error handling
 */

import { formatApiUrl, getApiConfig } from '../utils/config';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export class BaseApiError extends Error implements ApiError {
  constructor(
    public message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'BaseApiError';
  }
}

/**
 * Generic base API service class with CRUD operations
 */
export abstract class BaseApiService<T, CreateT = Omit<T, 'id'>, UpdateT = Partial<CreateT>> {
  protected abstract endpoint: string;

  protected async makeRequest<R>(
    path: string,
    options: RequestInit = {}
  ): Promise<R> {
    const url = formatApiUrl(`${this.endpoint}${path}`);
    const config = getApiConfig();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const requestConfig: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      // Add timeout support
      signal: AbortSignal.timeout(config.timeout),
    };

    let lastError: BaseApiError;
    
    // Retry logic
    for (let attempt = 0; attempt <= config.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, requestConfig);
        
        if (!response.ok) {
          let errorDetails;
          try {
            errorDetails = await response.json();
          } catch {
            errorDetails = await response.text();
          }
          
          const apiError = new BaseApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorDetails
          );

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw apiError;
          }

          lastError = apiError;
          
          // If this is the last attempt, throw the error
          if (attempt === config.retryAttempts) {
            throw apiError;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, config.retryDelay * (attempt + 1)));
          continue;
        }
        
        // Handle empty responses (like DELETE)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          return undefined as R;
        }
        
        return await response.json();
      } catch (error) {
        if (error instanceof BaseApiError) {
          lastError = error;
          
          // Don't retry on client errors
          if (error.status >= 400 && error.status < 500) {
            throw error;
          }
        } else {
          // Network or other errors
          lastError = new BaseApiError(
            error instanceof Error ? error.message : 'An unknown error occurred',
            0,
            error
          );
        }

        // If this is the last attempt, throw the error
        if (attempt === config.retryAttempts) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, config.retryDelay * (attempt + 1)));
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError!;
  }

  // CRUD Operations
  async getAll(): Promise<T[]> {
    return this.makeRequest<T[]>('');
  }

  async getById(id: string): Promise<T> {
    return this.makeRequest<T>(`/${id}`);
  }

  async create(data: CreateT): Promise<T> {
    return this.makeRequest<T>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateT): Promise<T> {
    return this.makeRequest<T>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    return this.makeRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Utility methods for custom queries
  protected async customRequest<R>(
    path: string,
    options: RequestInit = {}
  ): Promise<R> {
    return this.makeRequest<R>(path, options);
  }
}