import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  API_PREFIX: Joi.string().default('api/v1'),

  // Database
  DATABASE_URL: Joi.string().required(),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(26257),
  DB_NAME: Joi.string().default('flocknode'),
  DB_USER: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().required(),
  DB_SSL: Joi.boolean().default(true),

  // Redis
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_KEY_PREFIX: Joi.string().default('flocknode:'),

  // Kafka
  KAFKA_CLIENT_ID: Joi.string().default('flocknode-backend'),
  KAFKA_BROKERS: Joi.string().default('localhost:9092'),
  KAFKA_SSL: Joi.boolean().default(false),
  KAFKA_SASL_USERNAME: Joi.string().optional(),
  KAFKA_SASL_PASSWORD: Joi.string().optional(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().optional(),
  TWITCH_CLIENT_ID: Joi.string().required(),
  TWITCH_CLIENT_SECRET: Joi.string().required(),
  TWITCH_CALLBACK_URL: Joi.string().optional(),
  DISCORD_CLIENT_ID: Joi.string().required(),
  DISCORD_CLIENT_SECRET: Joi.string().required(),
  DISCORD_CALLBACK_URL: Joi.string().optional(),

  // Stripe
  STRIPE_PUBLIC_KEY: Joi.string().required(),
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  STRIPE_FC_PER_DOLLAR: Joi.number().default(100),

  // PayPal
  PAYPAL_CLIENT_ID: Joi.string().optional(),
  PAYPAL_CLIENT_SECRET: Joi.string().optional(),
  PAYPAL_ENVIRONMENT: Joi.string().valid('sandbox', 'live').default('sandbox'),
  PAYPAL_FC_PER_DOLLAR: Joi.number().default(100),

  // Crypto
  BASE_RPC_URL: Joi.string().optional(),
  POLYGON_RPC_URL: Joi.string().optional(),
  SOLANA_RPC_URL: Joi.string().optional(),
  CRYPTO_PRIVATE_KEY: Joi.string().optional(),
  USDC_CONTRACT_ADDRESS: Joi.string().optional(),

  // Rate limiting
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // Security
  BCRYPT_ROUNDS: Joi.number().default(12),
  CSRF_SECRET: Joi.string().required(),
  HMAC_SECRET: Joi.string().required(),
  OVERLAY_IP_WHITELIST: Joi.string().optional(),

  // Monitoring
  PROMETHEUS_PORT: Joi.number().default(9090),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),
  SENTRY_DSN: Joi.string().optional(),

  // Frontend
  FRONTEND_URL: Joi.string().default('https://flocknode.com'),
  API_URL: Joi.string().default('https://api.flocknode.com'),
});





