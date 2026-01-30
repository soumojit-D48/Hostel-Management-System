export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000',
} as const;

export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}/${cleanEndpoint}`;
};

// Test function 
export const testApiConfig = () => {
  console.log('API Config:', API_CONFIG);
  console.log('Test URL:', buildApiUrl('/auth/login'));
};