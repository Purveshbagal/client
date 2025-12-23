// Frontend environment configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
};

export const AUTH_CONFIG = {
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  userKey: 'user',
};

export const APP_CONFIG = {
  appName: 'Swadhan Eats',
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
};

export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
};

export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
};
