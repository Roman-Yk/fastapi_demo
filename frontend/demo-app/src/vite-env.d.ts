/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT?: string;

  // App Configuration
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;

  // Feature Flags
  readonly VITE_DEBUG?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;

  // Built-in Vite/Node
  readonly NODE_ENV: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}