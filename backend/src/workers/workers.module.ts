import { Module } from '@nestjs/common';
import { AutoResolveWorker } from './auto-resolve.worker';
import { ServerProvisionWorker } from './server-provision.worker';
import { StreamHealthWorker } from './stream-health.worker';
import { PrismaModule } from '../common/prisma/prisma.module';
import { KafkaModule } from '../common/kafka/kafka.module';
import { WalletModule } from '../modules/wallet/wallet.module';

@Module({
  imports: [PrismaModule, KafkaModule, WalletModule],
  providers: [AutoResolveWorker, ServerProvisionWorker, StreamHealthWorker],
  exports: [AutoResolveWorker, ServerProvisionWorker, StreamHealthWorker],
})
export class WorkersModule {}





