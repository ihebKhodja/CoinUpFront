/**
 * Backend API Configuration
 * Uses environment variables from .env file
 */

declare global {
  interface Window {
    __env?: Record<string, string | undefined>;
  }
}

// Helper function to get environment variables (with fallback defaults)
function getEnv(key: string, defaultValue: string): string {
  // Runtime config injected via public/env.js (generated from .env)
  if (typeof window !== 'undefined' && window.__env && window.__env[key]) {
    return window.__env[key] as string;
  }

  return defaultValue;
}

export const BACKEND_CONFIG = {
  // Base URL for the API (from .env file)
  baseUrl: getEnv('BACKEND_URL', 'http://localhost:5269/api'),
  
  // API version (from .env file)
  // version: getEnv('API_VERSION', 'v1'),
  
  // Timeout for HTTP requests (in milliseconds) (from .env file)
  timeout: parseInt(getEnv('REQUEST_TIMEOUT', '30000'), 10),
  
  // Retry configuration (from .env file)
  retry: {
    count: parseInt(getEnv('RETRY_COUNT', '3'), 10),
    delay: parseInt(getEnv('RETRY_DELAY', '1000'), 10)
  }
};

/**
 * Build full API URL from module name
 * @example
 * buildApiUrl('coins') => 'http://localhost:3000/api/v1/coins'
 * buildApiUrl('users', 'v2') => 'http://localhost:3000/api/v2/users'
 */
export function buildApiUrl(moduleName: string, version?: string): string {
  const baseUrl = BACKEND_CONFIG.baseUrl;
  // const apiVersion = version || BACKEND_CONFIG.version;
  
  // if (apiVersion) {
  //   return `${baseUrl}/${apiVersion}/${moduleName}`;
  // }
  
  return `${baseUrl}/${moduleName}`;
}
