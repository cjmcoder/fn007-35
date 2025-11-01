import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { KafkaModule } from './common/kafka/kafka.module';
import { AuthMinimalModule } from './auth-minimal/auth-minimal.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { MatchModule } from './modules/match/match.module';
import { StreamModule } from './modules/stream/stream.module';
import { ServerModule } from './modules/server/server.module';
import { OverlayModule } from './modules/overlay/overlay.module';
import { ProofModule } from './modules/proof/proof.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { FlockTubeModule } from './modules/flocktube/flocktube.module';
import { WorkersModule } from './workers/workers.module';
// New Matching v1 modules
import { MatchModule as MatchV1Module } from './match/match.module';
import { ChallengesModule } from './challenges/challenges.module';
import { TrustModule } from './trust/trust.module';
import { FlockTubeModule as FlockTubeV1Module } from './flocktube/flocktube.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    KafkaModule,
    AuthMinimalModule,
    WalletModule,
    MatchModule, // Old match module (keep for backward compatibility)
    MatchV1Module, // New Matching v1 system
    ChallengesModule, // Challenge board
    TrustModule, // Trust score system
    FlockTubeV1Module, // FlockTube integration for v1
    StreamModule,
    ServerModule,
    OverlayModule,
    ProofModule,
    DisputeModule,
    FlockTubeModule, // Old FlockTube module (keep for backward compatibility)
    WorkersModule,
  ],
})
export class AppModule {}