import { Module } from '@nestjs/common';
import { MatcherWorker } from './matcher.worker';
import { LifecycleWorker } from './lifecycle.worker';
import { MatchModule } from '../match/match.module';
import { TrustModule } from '../trust/trust.module';
import { RedisModule } from '../common/redis.module';

@Module({
  imports: [MatchModule, TrustModule, RedisModule],
  providers: [MatcherWorker, LifecycleWorker],
})
export class WorkersModule {}

