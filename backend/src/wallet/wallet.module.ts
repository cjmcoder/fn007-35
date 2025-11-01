import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { StripeService } from './services/stripe.service';
import { PayPalService } from './services/paypal.service';
import { CryptoService } from './services/crypto.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RedisModule } from '../common/redis/redis.module';
import { KafkaModule } from '../common/kafka/kafka.module';
import { MetricsModule } from '../common/metrics/metrics.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    KafkaModule,
    MetricsModule,
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    StripeService,
    PayPalService,
    CryptoService,
  ],
  exports: [WalletService],
})
export class WalletModule {}





