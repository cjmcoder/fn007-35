import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { TrustModule } from '../trust/trust.module';
import { FlockTubeModule } from '../flocktube/flocktube.module';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [TrustModule, FlockTubeModule, RedisModule],
  controllers: [MatchController],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}