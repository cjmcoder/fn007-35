import { Module } from '@nestjs/common';
import { OverlayService } from './overlay.service';
import { OverlayController } from './overlay.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';
import { KafkaModule } from '../../common/kafka/kafka.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    KafkaModule,
  ],
  providers: [OverlayService],
  controllers: [OverlayController],
  exports: [OverlayService],
})
export class OverlayModule {}