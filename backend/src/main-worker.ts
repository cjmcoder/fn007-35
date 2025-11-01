import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppWorkerModule } from './app-worker.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { env } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppWorkerModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('WorkerBootstrap');

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Compression
  app.use(compression());

  // CORS (minimal for worker)
  app.enableCors({
    origin: false, // No public access
    credentials: false,
    methods: ['GET', 'POST'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
    ],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new MetricsInterceptor(),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation (minimal for worker)
  const config = new DocumentBuilder()
    .setTitle('FLOCKNODE Worker API')
    .setDescription('Private worker endpoints for FLOCKNODE')
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for internal services',
      },
      'api-key',
    )
    .addTag('health', 'Health checks and monitoring')
    .addTag('worker', 'Worker status and management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  const port = env.PORT;
  const nodeEnv = env.NODE_ENV;

  await app.listen(port);

  logger.log(`🔧 FLOCKNODE Worker running on port ${port}`);
  logger.log(`📚 Worker Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`🔒 Security: Helmet, CORS, API Key auth enabled`);
  logger.log(`📊 Observability: Prometheus metrics, structured logs, request tracing`);
  logger.log(`💳 PayPal Payout Worker: Active`);
  logger.log(`🔄 Kafka Consumer: Active`);
}

bootstrap().catch((error) => {
  console.error('Failed to start worker application:', error);
  process.exit(1);
});





