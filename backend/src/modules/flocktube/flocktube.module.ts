import { Module } from '@nestjs/common';
import { FlockTubeController } from './flocktube.controller';
import { FlockTubeStreamService } from './flocktube-stream.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';
import { KafkaModule } from '../../common/kafka/kafka.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    KafkaModule,
  ],
  controllers: [FlockTubeController],
  providers: [FlockTubeStreamService],
  exports: [FlockTubeStreamService],
})
export class FlockTubeModule {}





