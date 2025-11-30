/**
 * Centralized configuration for environment variables
 * All environment variables should be accessed through this file
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
} as const;

// Stripe Configuration
export const STRIPE_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY || '', // Only for server-side
} as const;

// CockroachDB Configuration
export const COCKROACHDB_CONFIG = {
  URL: import.meta.env.VITE_DATABASE_URL || '',
  HOST: import.meta.env.VITE_DB_HOST || 'localhost',
  PORT: import.meta.env.VITE_DB_PORT || '26257',
  DATABASE: import.meta.env.VITE_DB_NAME || 'flocknode',
  USER: import.meta.env.VITE_DB_USER || 'root',
  PASSWORD: import.meta.env.VITE_DB_PASSWORD || '',
  SSL: import.meta.env.VITE_DB_SSL === 'true',
} as const;

// Redis Configuration
export const REDIS_CONFIG = {
  URL: import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379',
} as const;

// AWS S3 Configuration
export const S3_CONFIG = {
  BUCKET: import.meta.env.VITE_S3_BUCKET || '',
  REGION: import.meta.env.VITE_S3_REGION || 'us-east-1',
  ACCESS_KEY_ID: import.meta.env.VITE_S3_ACCESS_KEY_ID || '',
  SECRET_ACCESS_KEY: import.meta.env.VITE_S3_SECRET_ACCESS_KEY || '',
} as const;

// CDN Configuration
export const CDN_CONFIG = {
  BASE_URL: import.meta.env.VITE_CDN_BASE_URL || '',
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  SECRET: import.meta.env.VITE_JWT_SECRET || '',
} as const;

// Third-party API Configuration
export const THIRD_PARTY_CONFIG = {
  TWITCH_CLIENT_ID: import.meta.env.VITE_TWITCH_CLIENT_ID || '',
  TWITCH_CLIENT_SECRET: import.meta.env.VITE_TWITCH_CLIENT_SECRET || '',
  YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY || '',
} as const;

// Email Configuration
export const EMAIL_CONFIG = {
  SMTP_HOST: import.meta.env.VITE_SMTP_HOST || '',
  SMTP_PORT: import.meta.env.VITE_SMTP_PORT || '587',
  SMTP_USER: import.meta.env.VITE_SMTP_USER || '',
  SMTP_PASS: import.meta.env.VITE_SMTP_PASS || '',
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  URL: import.meta.env.VITE_DATABASE_URL || '',
} as const;

// Environment
export const ENV = {
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;

// Validation helper
export const validateConfig = () => {
  const requiredVars = {
    // Add required environment variables here
    // 'VITE_DATABASE_URL': COCKROACHDB_CONFIG.URL,
    // 'VITE_DB_HOST': COCKROACHDB_CONFIG.HOST,
  };

  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return missing.length === 0;
};

// Call validation in development
if (ENV.IS_DEVELOPMENT) {
  validateConfig();
}