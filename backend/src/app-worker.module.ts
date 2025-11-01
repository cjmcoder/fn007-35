import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Core modules
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { KafkaModule } from './common/kafka/kafka.module';
import { MetricsModule } from './common/metrics/metrics.module';

// Worker modules
import { PaymentsWorkerModule } from './modules/payments/payments-worker.module';
import { AuditModule } from './modules/audit/audit.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { HealthModule } from './health/health.module';

// Configuration
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL', 60000),
            limit: configService.get<number>('THROTTLE_LIMIT', 1000),
          },
        ],
        ignoreUserAgents: [/googlebot/gi, /bingbot/gi],
      }),
      inject: [ConfigService],
    }),

    // Event system
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Core infrastructure
    PrismaModule,
    RedisModule,
    KafkaModule,
    MetricsModule,

    // Worker modules
    PaymentsWorkerModule,
    AuditModule,
    WalletModule,
    HealthModule,
  ],
})
export class AppWorkerModule {}





