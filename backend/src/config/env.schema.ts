import { z } from 'zod';

// Environment validation schema with fail-fast behavior
export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test', 'provision']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3001),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Redis
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_TOKEN_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRATION: z.string().default('7d'),
  
  // OAuth - Google
  OAUTH_GOOGLE_CLIENT_ID: z.string().min(1, 'OAUTH_GOOGLE_CLIENT_ID is required'),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string().min(1, 'OAUTH_GOOGLE_CLIENT_SECRET is required'),
  
  // OAuth - Twitch
  OAUTH_TWITCH_CLIENT_ID: z.string().min(1, 'OAUTH_TWITCH_CLIENT_ID is required'),
  OAUTH_TWITCH_CLIENT_SECRET: z.string().min(1, 'OAUTH_TWITCH_CLIENT_SECRET is required'),
  
  // OAuth - Discord
  OAUTH_DISCORD_CLIENT_ID: z.string().min(1, 'OAUTH_DISCORD_CLIENT_ID is required'),
  OAUTH_DISCORD_CLIENT_SECRET: z.string().min(1, 'OAUTH_DISCORD_CLIENT_SECRET is required'),
  
  // HMAC for server-trusted endpoints
  HMAC_SERVER_SECRET: z.string().min(32, 'HMAC_SERVER_SECRET must be at least 32 characters'),
  
  // Frontend URL for OAuth callbacks
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:8080'),
  
  // Rate limiting
  RATE_LIMIT_TTL: z.coerce.number().default(60000), // 1 minute
  RATE_LIMIT_MAX: z.coerce.number().default(100), // requests per window
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:8080'),
  
  // Session
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  
  // PayPal Configuration
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  
  // Optional: Sentry
  SENTRY_DSN: z.string().url().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Validate environment variables and fail fast
export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Please check your .env file and ensure all required variables are set.');
      process.exit(1);
    }
    throw error;
  }
}

// Export validated config
export const env = validateEnv();

// Helper function to check if we're in production
export const isProduction = () => env.NODE_ENV === 'production';
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isTest = () => env.NODE_ENV === 'test';
