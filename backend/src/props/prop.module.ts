import { Module } from '@nestjs/common';
import { PropController } from './prop.controller';
import { PropService } from './prop.service';
import { FeeCalculatorService } from '../payments/fee-calculator.service';

@Module({
  controllers: [PropController],
  providers: [PropService, FeeCalculatorService],
  exports: [PropService],
})
export class PropModule {}





