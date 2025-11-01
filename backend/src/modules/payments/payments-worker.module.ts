import { Module } from '@nestjs/common';
import { PayPalPayoutWorkerService } from './paypal-payout-worker.service';
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
  providers: [PayPalPayoutWorkerService],
  exports: [PayPalPayoutWorkerService],
})
export class PaymentsWorkerModule {}





