import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthSimpleModule } from './health-simple/health-simple.module';
import { AuthMinimalModule } from './auth-minimal/auth-minimal.module';
import { PayPalFeeModule } from './payments/paypal-fee.module';
import { MatchModule } from './matches/match.module';
import { PropModule } from './props/prop.module';
import { TournamentModule } from './tournaments/tournament.module';
import { ChallengesModule } from './challenges/challenges.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['env.development', '.env'],
    }),
    HealthSimpleModule,
    AuthMinimalModule,
    PayPalFeeModule,
    MatchModule,
    PropModule,
    TournamentModule,
    ChallengesModule,
  ],
})
export class AppMinimalModule {}
