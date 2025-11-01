import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RedisModule } from '../common/redis/redis.module';
import { KafkaModule } from '../common/kafka/kafka.module';

@Module({
  imports: [
    TerminusModule,
    PrismaModule,
    RedisModule,
    KafkaModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}





