import { Module } from '@nestjs/common';
import { PayPalFeeController } from './paypal-fee.controller';
import { PayPalFeeService } from './paypal-fee.service';
import { FeeCalculatorService } from './fee-calculator.service';

@Module({
  controllers: [PayPalFeeController],
  providers: [PayPalFeeService, FeeCalculatorService],
  exports: [PayPalFeeService, FeeCalculatorService],
})
export class PayPalFeeModule {}





