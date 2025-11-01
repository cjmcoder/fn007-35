import { Module } from '@nestjs/common';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { FeeCalculatorService } from '../payments/fee-calculator.service';

@Module({
  controllers: [TournamentController],
  providers: [TournamentService, FeeCalculatorService],
  exports: [TournamentService],
})
export class TournamentModule {}





