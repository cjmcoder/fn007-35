import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServerProvisionWorker } from './server-provision.worker';
import { StreamHealthWorker } from './stream-health.worker';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';
import { KafkaModule } from '../../common/kafka/kafka.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    KafkaModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    ServerProvisionWorker,
    StreamHealthWorker,
  ],
  exports: [
    ServerProvisionWorker,
    StreamHealthWorker,
  ],
})
export class WorkersModule {}





