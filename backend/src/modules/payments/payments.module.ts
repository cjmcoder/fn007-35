import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PayPalPublicService } from './paypal-public.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { WalletModule } from '../wallet/wallet.module';
import { KafkaModule } from '../../common/kafka/kafka.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    WalletModule,
    KafkaModule,
  ],
  controllers: [PaymentsController],
  providers: [PayPalPublicService],
  exports: [PayPalPublicService],
})
export class PaymentsModule {}
