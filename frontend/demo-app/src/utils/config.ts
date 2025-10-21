/**
 * Application configuration management
 * Centralizes all configuration in one place with environment-specific overrides
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface CacheConfig {
  defaultTtl: number;
  maxCacheSize: number;
  staleWhileRevalidate: boolean;
}

export interface UiConfig {
  defaultPageSize: number;
  maxPageSize: number;
  theme: {
    primaryColor: string;
    borderRadius: string;
  };
  dateFormat: string;
  timeFormat: string;
}

export interface AppConfig {
  api: ApiConfig;
  cache: CacheConfig;
  ui: UiConfig;
  debug: boolean;
}

// Default configuration
const defaultConfig: AppConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  cache: {
    defaultTtl: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 1000, // Max number of cached items
    staleWhileRevalidate: true,
  },
  ui: {
    defaultPageSize: 25,
    maxPageSize: 100,
    theme: {
      primaryColor: 'customBlue',
      borderRadius: 'md',
    },
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
  debug: import.meta.env.NODE_ENV === 'development',
};

// Environment-specific overrides
const environmentConfig: Partial<AppConfig> = {
  // Override debug mode from environment variable
  ...(import.meta.env.VITE_DEBUG && {
    debug: import.meta.env.VITE_DEBUG === 'true',
  }),
};

// Merge configurations
const config: AppConfig = {
  ...defaultConfig,
  ...environmentConfig,
  api: {
    ...defaultConfig.api,
    ...environmentConfig.api,
  },
  cache: {
    ...defaultConfig.cache,
    ...environmentConfig.cache,
  },
  ui: {
    ...defaultConfig.ui,
    ...environmentConfig.ui,
    theme: {
      ...defaultConfig.ui.theme,
      ...environmentConfig.ui?.theme,
    },
  },
};

// Configuration access functions
export const getConfig = (): AppConfig => config;

export const getApiConfig = (): ApiConfig => config.api;

export const getCacheConfig = (): CacheConfig => config.cache;

export const getUiConfig = (): UiConfig => config.ui;

export const isDebugMode = (): boolean => config.debug;

// Utility function to format URLs
export const formatApiUrl = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${formattedEndpoint}`;
};

export default config;