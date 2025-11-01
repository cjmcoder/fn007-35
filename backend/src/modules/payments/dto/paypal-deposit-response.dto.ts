import { ApiProperty } from '@nestjs/swagger';

export class PayPalDepositResponseDto {
  @ApiProperty({ 
    example: 'deposit_1704067200000_abc123def456', 
    description: 'Unique deposit session ID' 
  })
  sessionId: string;

  @ApiProperty({ 
    example: 'https://www.sandbox.paypal.com/checkoutnow?token=EC-1234567890', 
    description: 'PayPal checkout URL' 
  })
  checkoutUrl: string;

  @ApiProperty({ 
    example: 10000, 
    description: 'Amount in cents' 
  })
  amountCents: number;

  @ApiProperty({ 
    example: 10000, 
    description: 'FC amount to be credited (1 cent = 1 FC)' 
  })
  fcAmount: number;
}





