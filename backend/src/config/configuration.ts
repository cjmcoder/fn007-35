import { registerAs } from '@nestjs/config';

export const configuration = registerAs('config', () => ({
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 26257,
    name: process.env.DB_NAME || 'flocknode',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'flocknode:',
  },

  // Kafka
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'flocknode-backend',
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    ssl: process.env.KAFKA_SSL === 'true',
    sasl: process.env.KAFKA_SASL_USERNAME ? {
      mechanism: 'plain',
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    } : undefined,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/oauth/google/callback',
    },
    twitch: {
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      callbackUrl: process.env.TWITCH_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/oauth/twitch/callback',
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackUrl: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/oauth/discord/callback',
    },
  },

  // Stripe
  stripe: {
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    fcPerDollar: parseFloat(process.env.STRIPE_FC_PER_DOLLAR) || 100,
  },

  // PayPal
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
    fcPerDollar: parseFloat(process.env.PAYPAL_FC_PER_DOLLAR) || 100,
  },

  // Crypto
  crypto: {
    baseRpcUrl: process.env.BASE_RPC_URL,
    polygonRpcUrl: process.env.POLYGON_RPC_URL,
    solanaRpcUrl: process.env.SOLANA_RPC_URL,
    privateKey: process.env.CRYPTO_PRIVATE_KEY,
    usdcContract: process.env.USDC_CONTRACT_ADDRESS,
  },

  // Rate limiting
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    csrfSecret: process.env.CSRF_SECRET,
    hmacSecret: process.env.HMAC_SECRET,
    overlayIpWhitelist: process.env.OVERLAY_IP_WHITELIST?.split(',') || [],
  },

  // Monitoring
  monitoring: {
    prometheusPort: parseInt(process.env.PROMETHEUS_PORT, 10) || 9090,
    logLevel: process.env.LOG_LEVEL || 'info',
    sentryDsn: process.env.SENTRY_DSN,
  },

  // Frontend URLs
  frontend: {
    url: process.env.FRONTEND_URL || 'https://flocknode.com',
    apiUrl: process.env.API_URL || 'https://api.flocknode.com',
  },
}));





