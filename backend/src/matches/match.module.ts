import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { FeeCalculatorService } from '../payments/fee-calculator.service';

@Module({
  controllers: [MatchController],
  providers: [MatchService, FeeCalculatorService],
  exports: [MatchService],
})
export class MatchModule {}





