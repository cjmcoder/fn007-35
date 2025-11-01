import { ApiProperty } from '@nestjs/swagger';

export class CreateDepositSessionResponseDto {
  @ApiProperty({ example: 'deposit_1234567890', description: 'Deposit session ID' })
  sessionId: string;

  @ApiProperty({ example: 'https://checkout.stripe.com/pay/cs_...', description: 'Checkout URL' })
  checkoutUrl: string;

  @ApiProperty({ example: 10000, description: 'Amount in cents' })
  amountCents: number;

  @ApiProperty({ example: 100.0, description: 'FC amount to be credited' })
  fcAmount: number;
}





