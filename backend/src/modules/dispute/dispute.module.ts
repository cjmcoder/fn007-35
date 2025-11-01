import { Module } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { DisputeController } from './dispute.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';
import { KafkaModule } from '../../common/kafka/kafka.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [PrismaModule, RedisModule, KafkaModule, WalletModule],
  providers: [DisputeService],
  controllers: [DisputeController],
  exports: [DisputeService],
})
export class DisputeModule {}





