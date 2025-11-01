import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
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
  providers: [ServerService],
  controllers: [ServerController],
  exports: [ServerService],
})
export class ServerModule {}